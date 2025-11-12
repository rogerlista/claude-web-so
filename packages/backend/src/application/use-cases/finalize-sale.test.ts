import { ResultUtils } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { createCustomerId } from '../../domain/customer/customer-id'
import { createPrice } from '../../domain/product/price'
import { createProductId } from '../../domain/product/product-id'
import { createPaymentMethod } from '../../domain/sale/payment-method'
import { createSale } from '../../domain/sale/sale'
import { createSaleId } from '../../domain/sale/sale-id'
import { createSaleItem } from '../../domain/sale/sale-item'
import { createSalePayment } from '../../domain/sale/sale-payment'
import type { SaleRepository } from '../ports/sale-repository'
import { createFinalizeSaleUseCase } from './finalize-sale'

describe('FinalizeSale Use Case', () => {
  it('should finalize a fully paid sale', async () => {
    // Setup
    const saleIdResult = createSaleId('sale-123')
    const customerIdResult = createCustomerId('customer-456')
    const productIdResult = createProductId('product-1')
    const priceResult = createPrice(100.0)
    const paymentMethodResult = createPaymentMethod('01')

    if (
      !saleIdResult.ok ||
      !customerIdResult.ok ||
      !productIdResult.ok ||
      !priceResult.ok ||
      !paymentMethodResult.ok
    ) {
      throw new Error('Setup failed')
    }

    const itemResult = createSaleItem({
      productId: productIdResult.value,
      quantity: 1,
      unitPrice: priceResult.value,
    })

    const paymentResult = createSalePayment({
      paymentMethod: paymentMethodResult.value,
      amount: 100.0,
    })

    if (!itemResult.ok || !paymentResult.ok) {
      throw new Error('Setup failed')
    }

    const existingSaleResult = createSale({
      id: saleIdResult.value,
      customerId: customerIdResult.value,
      items: [itemResult.value],
      payments: [paymentResult.value],
    })

    if (!existingSaleResult.ok) {
      throw new Error('Setup failed')
    }

    const mockRepository: SaleRepository = {
      findById: () => Promise.resolve(ResultUtils.ok(existingSaleResult.value)),
      save: (sale) => Promise.resolve(ResultUtils.ok(sale)),
      findAll: () => Promise.resolve(ResultUtils.ok([])),
      delete: () => Promise.resolve(ResultUtils.ok(undefined)),
      findByCustomerId: () => Promise.resolve(ResultUtils.ok([])),
      findByStatus: () => Promise.resolve(ResultUtils.ok([])),
    }

    // Execute
    const useCase = createFinalizeSaleUseCase(mockRepository)
    const result = await useCase({ saleId: 'sale-123' })

    // Assert
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.status).toBe('COMPLETED')
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

    const useCase = createFinalizeSaleUseCase(mockRepository)
    const result = await useCase({ saleId: 'sale-999' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.type).toBe('SALE_NOT_FOUND')
    }
  })

  it('should fail if sale has no items', async () => {
    const saleIdResult = createSaleId('sale-123')
    const customerIdResult = createCustomerId('customer-456')

    if (!saleIdResult.ok || !customerIdResult.ok) {
      throw new Error('Setup failed')
    }

    const saleResult = createSale({
      id: saleIdResult.value,
      customerId: customerIdResult.value,
      items: [], // No items
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

    const useCase = createFinalizeSaleUseCase(mockRepository)
    const result = await useCase({ saleId: 'sale-123' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.type).toBe('VALIDATION_ERROR')
    }
  })

  it('should fail if sale is not fully paid', async () => {
    const saleIdResult = createSaleId('sale-123')
    const customerIdResult = createCustomerId('customer-456')
    const productIdResult = createProductId('product-1')
    const priceResult = createPrice(100.0)

    if (!saleIdResult.ok || !customerIdResult.ok || !productIdResult.ok || !priceResult.ok) {
      throw new Error('Setup failed')
    }

    const itemResult = createSaleItem({
      productId: productIdResult.value,
      quantity: 1,
      unitPrice: priceResult.value,
    })

    if (!itemResult.ok) {
      throw new Error('Setup failed')
    }

    const saleResult = createSale({
      id: saleIdResult.value,
      customerId: customerIdResult.value,
      items: [itemResult.value],
      payments: [], // No payments
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

    const useCase = createFinalizeSaleUseCase(mockRepository)
    const result = await useCase({ saleId: 'sale-123' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.type).toBe('VALIDATION_ERROR')
    }
  })
})
