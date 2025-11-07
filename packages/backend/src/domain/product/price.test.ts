import type { Result } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { type Price, createPrice } from './price'

/**
 * TDD - RED Phase
 * Tests for Price branded type
 *
 * Domain Rules:
 * - Price must be greater than zero (positive)
 * - Price must have at most 2 decimal places
 * - Price cannot be NaN or Infinity
 */

describe('Price', () => {
  describe('createPrice', () => {
    it('should create a valid Price from positive number', () => {
      const result: Result<Price, string> = createPrice(10.5)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe(10.5)
      }
    })

    it('should reject zero price', () => {
      const result = createPrice(0)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('Price must be greater than zero')
      }
    })

    it('should reject negative numbers', () => {
      const result = createPrice(-10.5)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('Price must be greater than zero')
      }
    })

    it('should reject NaN', () => {
      const result = createPrice(Number.NaN)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('Price must be a valid number')
      }
    })

    it('should reject Infinity', () => {
      const result = createPrice(Number.POSITIVE_INFINITY)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('Price must be a valid number')
      }
    })

    it('should reject negative Infinity', () => {
      const result = createPrice(Number.NEGATIVE_INFINITY)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('Price must be a valid number')
      }
    })

    it('should reject more than 2 decimal places', () => {
      const result = createPrice(10.999)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('Price cannot have more than 2 decimal places')
      }
    })

    it('should accept exactly 2 decimal places', () => {
      const result = createPrice(10.99)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe(10.99)
      }
    })

    it('should accept 1 decimal place', () => {
      const result = createPrice(10.5)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe(10.5)
      }
    })

    it('should accept integer prices', () => {
      const result = createPrice(100)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe(100)
      }
    })

    it('should handle floating point precision correctly', () => {
      // 0.1 + 0.2 = 0.30000000000000004 in JavaScript
      const result = createPrice(0.1 + 0.2)

      expect(result.ok).toBe(true)
      if (result.ok) {
        // Should handle as 0.30, not reject due to floating point precision
        expect(result.value).toBeCloseTo(0.3, 2)
      }
    })
  })

  describe('Price type safety', () => {
    it('should prevent accidental number assignment', () => {
      const result = createPrice(10.5)

      if (result.ok) {
        const price: Price = result.value

        // This should compile - Price is a branded number
        expect(typeof price).toBe('number')

        // TypeScript should prevent this at compile time:
        // const regularNumber: number = 42
        // const price2: Price = regularNumber // ❌ Type error
      }
    })
  })
})
