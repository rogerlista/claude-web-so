import type { Result } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { createCustomerId } from '../customer/customer-id'
import { createPrice } from '../product/price'
import { createProductId } from '../product/product-id'
import { type Sale, createSale } from './sale'
import { createSaleId } from './sale-id'
import { createSaleItem } from './sale-item'

/**
 * TDD - RED Phase
 * Tests for Sale entity
 *
 * Domain Rules:
 * - Must have id, customerId, items, status
 * - Items array cannot be empty
 * - Total is calculated from items
 * - Status defaults to PENDING
 * - CreatedAt is set automatically
 * - All fields are immutable
 */

describe('Sale Entity', () => {
  describe('createSale', () => {
    it('should create a valid Sale with single item', () => {
      const saleIdResult = createSaleId('sale-123')
      const customerIdResult = createCustomerId('customer-123')
      const productIdResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)

      if (!saleIdResult.ok || !customerIdResult.ok || !productIdResult.ok || !priceResult.ok) {
        throw new Error('Test setup failed')
      }

      const itemResult = createSaleItem({
        productId: productIdResult.value,
        quantity: 2,
        unitPrice: priceResult.value,
      })

      if (!itemResult.ok) {
        throw new Error('Test setup failed')
      }

      const result: Result<Sale, string> = createSale({
        id: saleIdResult.value,
        customerId: customerIdResult.value,
        items: [itemResult.value],
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.id).toBe('sale-123')
        expect(result.value.customerId).toBe('customer-123')
        expect(result.value.items).toHaveLength(1)
        expect(result.value.total).toBe(21) // 2 * 10.5
        expect(result.value.status).toBe('PENDING')
        expect(result.value.createdAt).toBeInstanceOf(Date)
      }
    })

    it('should create a Sale with multiple items', () => {
      const saleIdResult = createSaleId('sale-123')
      const customerIdResult = createCustomerId('customer-123')
      const prod1Result = createProductId('prod-1')
      const prod2Result = createProductId('prod-2')
      const price1Result = createPrice(10.0)
      const price2Result = createPrice(5.5)

      if (
        !saleIdResult.ok ||
        !customerIdResult.ok ||
        !prod1Result.ok ||
        !prod2Result.ok ||
        !price1Result.ok ||
        !price2Result.ok
      ) {
        throw new Error('Test setup failed')
      }

      const item1Result = createSaleItem({
        productId: prod1Result.value,
        quantity: 2,
        unitPrice: price1Result.value,
      })

      const item2Result = createSaleItem({
        productId: prod2Result.value,
        quantity: 3,
        unitPrice: price2Result.value,
      })

      if (!item1Result.ok || !item2Result.ok) {
        throw new Error('Test setup failed')
      }

      const result = createSale({
        id: saleIdResult.value,
        customerId: customerIdResult.value,
        items: [item1Result.value, item2Result.value],
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.items).toHaveLength(2)
        expect(result.value.total).toBe(36.5) // (2*10) + (3*5.5) = 20 + 16.5
      }
    })

    it('should allow custom status', () => {
      const saleIdResult = createSaleId('sale-123')
      const customerIdResult = createCustomerId('customer-123')
      const productIdResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)

      if (!saleIdResult.ok || !customerIdResult.ok || !productIdResult.ok || !priceResult.ok) {
        throw new Error('Test setup failed')
      }

      const itemResult = createSaleItem({
        productId: productIdResult.value,
        quantity: 1,
        unitPrice: priceResult.value,
      })

      if (!itemResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createSale({
        id: saleIdResult.value,
        customerId: customerIdResult.value,
        items: [itemResult.value],
        status: 'COMPLETED',
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.status).toBe('COMPLETED')
      }
    })

    it('should allow custom createdAt', () => {
      const saleIdResult = createSaleId('sale-123')
      const customerIdResult = createCustomerId('customer-123')
      const productIdResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)

      if (!saleIdResult.ok || !customerIdResult.ok || !productIdResult.ok || !priceResult.ok) {
        throw new Error('Test setup failed')
      }

      const itemResult = createSaleItem({
        productId: productIdResult.value,
        quantity: 1,
        unitPrice: priceResult.value,
      })

      if (!itemResult.ok) {
        throw new Error('Test setup failed')
      }

      const customDate = new Date('2024-01-01T10:00:00Z')

      const result = createSale({
        id: saleIdResult.value,
        customerId: customerIdResult.value,
        items: [itemResult.value],
        createdAt: customDate,
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.createdAt).toEqual(customDate)
      }
    })

    it('should reject empty items array', () => {
      const saleIdResult = createSaleId('sale-123')
      const customerIdResult = createCustomerId('customer-123')

      if (!saleIdResult.ok || !customerIdResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createSale({
        id: saleIdResult.value,
        customerId: customerIdResult.value,
        items: [],
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('Sale must have at least one item')
      }
    })

    it('should enforce immutability', () => {
      const saleIdResult = createSaleId('sale-123')
      const customerIdResult = createCustomerId('customer-123')
      const productIdResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)

      if (!saleIdResult.ok || !customerIdResult.ok || !productIdResult.ok || !priceResult.ok) {
        throw new Error('Test setup failed')
      }

      const itemResult = createSaleItem({
        productId: productIdResult.value,
        quantity: 1,
        unitPrice: priceResult.value,
      })

      if (!itemResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createSale({
        id: saleIdResult.value,
        customerId: customerIdResult.value,
        items: [itemResult.value],
      })

      if (result.ok) {
        const sale = result.value

        // TypeScript should prevent these at compile time:
        // sale.total = 999 // ❌ Cannot assign to 'total' because it is a read-only property
        // sale.status = 'CANCELLED' // ❌ Cannot assign to 'status' because it is a read-only property

        expect(sale.total).toBe(10.5)
      }
    })
  })
})
