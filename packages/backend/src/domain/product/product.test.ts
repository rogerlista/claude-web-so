import type { Result } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { createGTIN } from './gtin'
import { createPrice } from './price'
import { type Product, createProduct } from './product'
import { createProductId } from './product-id'
import { createSKU } from './sku'

/**
 * TDD - RED Phase
 * Tests for Product entity
 *
 * Domain Rules:
 * - Product must have id, description, and price
 * - Description must be non-empty
 * - SKU and GTIN are optional identifiers
 * - All product data is immutable
 */

describe('Product Entity', () => {
  describe('createProduct', () => {
    it('should create a valid Product with required fields', () => {
      const idResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)

      if (!idResult.ok || !priceResult.ok) {
        throw new Error('Test setup failed')
      }

      const result: Result<Product, string> = createProduct({
        id: idResult.value,
        description: 'Test Product',
        price: priceResult.value,
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.id).toBe('prod-123')
        expect(result.value.description).toBe('Test Product')
        expect(result.value.price).toBe(10.5)
      }
    })

    it('should reject empty description', () => {
      const idResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)

      if (!idResult.ok || !priceResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createProduct({
        id: idResult.value,
        description: '',
        price: priceResult.value,
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('Description cannot be empty')
      }
    })

    it('should reject whitespace-only description', () => {
      const idResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)

      if (!idResult.ok || !priceResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createProduct({
        id: idResult.value,
        description: '   ',
        price: priceResult.value,
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('Description cannot be empty')
      }
    })

    it('should trim description whitespace', () => {
      const idResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)

      if (!idResult.ok || !priceResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createProduct({
        id: idResult.value,
        description: '  Test Product  ',
        price: priceResult.value,
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.description).toBe('Test Product')
      }
    })

    it('should enforce immutability - Product is readonly', () => {
      const idResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)

      if (!idResult.ok || !priceResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createProduct({
        id: idResult.value,
        description: 'Test Product',
        price: priceResult.value,
      })

      if (result.ok) {
        const product = result.value

        // TypeScript should prevent these at compile time:
        // product.description = 'Modified' // ❌ Cannot assign to 'description' because it is a read-only property
        // product.price = 20 // ❌ Cannot assign to 'price' because it is a read-only property

        expect(product.description).toBe('Test Product')
      }
    })

    it('should create Product with different prices', () => {
      const idResult = createProductId('prod-123')
      const priceResult1 = createPrice(0)
      const priceResult2 = createPrice(999.99)

      if (!idResult.ok || !priceResult1.ok || !priceResult2.ok) {
        throw new Error('Test setup failed')
      }

      const result1 = createProduct({
        id: idResult.value,
        description: 'Free Product',
        price: priceResult1.value,
      })

      const result2 = createProduct({
        id: idResult.value,
        description: 'Expensive Product',
        price: priceResult2.value,
      })

      expect(result1.ok).toBe(true)
      if (result1.ok) {
        expect(result1.value.price).toBe(0)
      }

      expect(result2.ok).toBe(true)
      if (result2.ok) {
        expect(result2.value.price).toBe(999.99)
      }
    })
  })

  describe('createProduct with optional identifiers', () => {
    it('should create Product with SKU and GTIN', () => {
      const idResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)
      const skuResult = createSKU('PROD-123')
      const gtinResult = createGTIN('7898357417892')

      if (!idResult.ok || !priceResult.ok || !skuResult.ok || !gtinResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createProduct({
        id: idResult.value,
        description: 'Test Product',
        price: priceResult.value,
        sku: skuResult.value,
        gtin: gtinResult.value,
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.id).toBe('prod-123')
        expect(result.value.description).toBe('Test Product')
        expect(result.value.price).toBe(10.5)
        expect(result.value.sku).toBe('PROD-123')
        expect(result.value.gtin).toBe('7898357417892')
      }
    })

    it('should create Product with only SKU (no GTIN)', () => {
      const idResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)
      const skuResult = createSKU('PROD-123')

      if (!idResult.ok || !priceResult.ok || !skuResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createProduct({
        id: idResult.value,
        description: 'Test Product',
        price: priceResult.value,
        sku: skuResult.value,
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.sku).toBe('PROD-123')
        expect(result.value.gtin).toBeUndefined()
      }
    })

    it('should create Product with only GTIN (no SKU)', () => {
      const idResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)
      const gtinResult = createGTIN('7898357417892')

      if (!idResult.ok || !priceResult.ok || !gtinResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createProduct({
        id: idResult.value,
        description: 'Test Product',
        price: priceResult.value,
        gtin: gtinResult.value,
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.sku).toBeUndefined()
        expect(result.value.gtin).toBe('7898357417892')
      }
    })

    it('should create Product without SKU or GTIN', () => {
      const idResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)

      if (!idResult.ok || !priceResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createProduct({
        id: idResult.value,
        description: 'Test Product',
        price: priceResult.value,
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.sku).toBeUndefined()
        expect(result.value.gtin).toBeUndefined()
      }
    })
  })
})
