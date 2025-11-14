import { ResultUtils } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { createCustomerId } from '../../domain/customer/customer-id'
import { createPrice } from '../../domain/product/price'
import { createProductId } from '../../domain/product/product-id'
import { createSale } from '../../domain/sale/sale'
import { createSaleId } from '../../domain/sale/sale-id'
import { createSaleItem } from '../../domain/sale/sale-item'
import type { SaleRepository } from '../ports/sale-repository'
import { createRemoveSaleItemUseCase } from './remove-sale-item'

describe('RemoveSaleItem Use Case', () => {
  it('should remove an item from a sale', async () => {
    // Setup
    const saleIdResult = createSaleId('sale-123')
    const customerIdResult = createCustomerId('customer-456')
    const productId1Result = createProductId('product-1')
    const productId2Result = createProductId('product-2')
    const price1Result = createPrice(10.0)
    const price2Result = createPrice(20.0)

    if (
      !saleIdResult.ok ||
      !customerIdResult.ok ||
      !productId1Result.ok ||
      !productId2Result.ok ||
      !price1Result.ok ||
      !price2Result.ok
    ) {
      throw new Error('Setup failed')
    }

    const item1Result = createSaleItem({
      productId: productId1Result.value,
      quantity: 1,
      unitPrice: price1Result.value,
    })

    const item2Result = createSaleItem({
      productId: productId2Result.value,
      quantity: 2,
      unitPrice: price2Result.value,
    })

    if (!item1Result.ok || !item2Result.ok) {
      throw new Error('Setup failed')
    }

    const existingSaleResult = createSale({
      id: saleIdResult.value,
      customerId: customerIdResult.value,
      items: [item1Result.value, item2Result.value],
    })

    if (!existingSaleResult.ok) {
      throw new Error('Setup failed')
    }

    const existingSale = existingSaleResult.value

    // Mock repository
    const mockRepository: SaleRepository = {
      findById: (id) => {
        if (id === saleIdResult.value) {
          return Promise.resolve(ResultUtils.ok(existingSale))
        }
        return Promise.resolve(ResultUtils.err({ type: 'NOT_FOUND', id: id as string }))
      },
      save: (sale) => Promise.resolve(ResultUtils.ok(sale)),
      findAll: () => Promise.resolve(ResultUtils.ok([])),
      delete: () => Promise.resolve(ResultUtils.ok(undefined)),
      findByCustomerId: () => Promise.resolve(ResultUtils.ok([])),
      findByStatus: () => Promise.resolve(ResultUtils.ok([])),
    }

    // Execute
    const useCase = createRemoveSaleItemUseCase(mockRepository)
    const result = await useCase({
      saleId: 'sale-123',
      productId: 'product-1',
    })

    // Assert
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.items).toHaveLength(1)
      expect(result.value.items[0]?.productId).toBe('product-2')
      expect(result.value.grossTotal).toBe(40.0) // Only product-2 remaining: 2 * 20
    }
  })

  it('should fail if sale not found', async () => {
    const mockRepository: SaleRepository = {
      findById: () => Promise.resolve(ResultUtils.err({ type: 'NOT_FOUND', id: 'sale-999' })),
      save: (sale) => Promise.resolve(ResultUtils.ok(sale)),
      findAll: () => Promise.resolve(ResultUtils.ok([])),
      delete: () => Promise.resolve(ResultUtils.ok(undefined)),
      findByCustomerId: () => Promise.resolve(ResultUtils.ok([])),
      findByStatus: () => Promise.resolve(ResultUtils.ok([])),
    }

    const useCase = createRemoveSaleItemUseCase(mockRepository)
    const result = await useCase({
      saleId: 'sale-999',
      productId: 'product-1',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.type).toBe('SALE_NOT_FOUND')
    }
  })

  it('should succeed even if product not found (filter behavior)', async () => {
    const saleIdResult = createSaleId('sale-123')
    const customerIdResult = createCustomerId('customer-456')
    const productId1Result = createProductId('product-1')
    const price1Result = createPrice(10.0)

    if (!saleIdResult.ok || !customerIdResult.ok || !productId1Result.ok || !price1Result.ok) {
      throw new Error('Setup failed')
    }

    const item1Result = createSaleItem({
      productId: productId1Result.value,
      quantity: 1,
      unitPrice: price1Result.value,
    })

    if (!item1Result.ok) {
      throw new Error('Setup failed')
    }

    const saleResult = createSale({
      id: saleIdResult.value,
      customerId: customerIdResult.value,
      items: [item1Result.value],
    })

    if (!saleResult.ok) {
      throw new Error('Setup failed')
    }

    const mockRepository: SaleRepository = {
      findById: () => Promise.resolve(ResultUtils.ok(saleResult.value)),
      save: (sale) => Promise.resolve(ResultUtils.ok(sale)),
      findAll: () => Promise.resolve(ResultUtils.ok([])),
      delete: () => Promise.resolve(ResultUtils.ok(undefined)),
      findByCustomerId: () => Promise.resolve(ResultUtils.ok([])),
      findByStatus: () => Promise.resolve(ResultUtils.ok([])),
    }

    const useCase = createRemoveSaleItemUseCase(mockRepository)
    const result = await useCase({
      saleId: 'sale-123',
      productId: 'product-999', // Not in sale
    })

    // Domain allows this (filter behavior) - removing non-existent item returns unchanged sale
    expect(result.ok).toBe(true)
    if (result.ok) {
      // Sale remains unchanged
      expect(result.value.items).toHaveLength(1)
      expect(result.value.items[0]?.productId).toBe('product-1')
    }
  })
})
