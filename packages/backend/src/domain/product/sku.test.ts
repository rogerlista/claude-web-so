import type { Result } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { type SKU, createSKU } from './sku'

/**
 * TDD - RED Phase
 * Tests for SKU (Stock Keeping Unit) branded type
 *
 * Domain Rules:
 * - SKU must be a non-empty string
 * - SKU must be alphanumeric (can include hyphens and underscores)
 * - SKU is case-insensitive (stored as uppercase)
 * - Whitespace is trimmed
 */

describe('SKU', () => {
  describe('createSKU', () => {
    it('should create a valid SKU from alphanumeric string', () => {
      const result: Result<SKU, string> = createSKU('PROD123')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('PROD123')
      }
    })

    it('should convert SKU to uppercase', () => {
      const result = createSKU('prod123')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('PROD123')
      }
    })

    it('should accept hyphens in SKU', () => {
      const result = createSKU('PROD-123-ABC')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('PROD-123-ABC')
      }
    })

    it('should accept underscores in SKU', () => {
      const result = createSKU('PROD_123_ABC')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('PROD_123_ABC')
      }
    })

    it('should reject empty string', () => {
      const result = createSKU('')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('SKU cannot be empty')
      }
    })

    it('should reject whitespace-only string', () => {
      const result = createSKU('   ')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('SKU cannot be empty')
      }
    })

    it('should trim whitespace from input', () => {
      const result = createSKU('  PROD123  ')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('PROD123')
      }
    })

    it('should reject SKU with spaces', () => {
      const result = createSKU('PROD 123')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('SKU must be alphanumeric')
      }
    })

    it('should reject SKU with special characters', () => {
      const result = createSKU('PROD@123')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('SKU must be alphanumeric')
      }
    })

    it('should accept numeric-only SKU', () => {
      const result = createSKU('123456')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('123456')
      }
    })

    it('should accept letters-only SKU', () => {
      const result = createSKU('ABCDEF')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('ABCDEF')
      }
    })

    it('should handle mixed case correctly', () => {
      const result = createSKU('PrOd-123-AbC')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('PROD-123-ABC')
      }
    })
  })

  describe('SKU type safety', () => {
    it('should prevent accidental string assignment', () => {
      const result = createSKU('PROD123')

      if (result.ok) {
        const sku: SKU = result.value

        // This should compile - SKU is a branded string
        expect(typeof sku).toBe('string')

        // TypeScript should prevent this at compile time:
        // const regularString: string = 'test'
        // const sku2: SKU = regularString // ❌ Type error
      }
    })
  })
})
