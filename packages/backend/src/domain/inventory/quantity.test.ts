import { describe, expect, it } from 'vitest'
import { createQuantity } from './quantity'

/**
 * TDD - RED Phase
 * Tests for Quantity value object
 *
 * Business Rules:
 * - Must be a valid number (not NaN or Infinity)
 * - Must be non-negative (>= 0)
 * - Cannot have more than 4 decimal places (for precision in unit measurements)
 */

describe('Quantity Value Object', () => {
  describe('createQuantity', () => {
    it('should create valid quantity with integer', () => {
      const result = createQuantity(10)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe(10)
      }
    })

    it('should create valid quantity with decimals', () => {
      const result = createQuantity(10.5)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe(10.5)
      }
    })

    it('should create valid quantity with up to 4 decimal places', () => {
      const result = createQuantity(10.1234)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe(10.1234)
      }
    })

    it('should accept zero as valid quantity', () => {
      const result = createQuantity(0)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe(0)
      }
    })

    it('should reject negative quantity', () => {
      const result = createQuantity(-10)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('non-negative')
      }
    })

    it('should reject NaN', () => {
      const result = createQuantity(Number.NaN)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('valid number')
      }
    })

    it('should reject Infinity', () => {
      const result = createQuantity(Number.POSITIVE_INFINITY)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('valid number')
      }
    })

    it('should reject quantity with more than 4 decimal places', () => {
      const result = createQuantity(10.12345)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('4 decimal places')
      }
    })

    it('should round quantity to 4 decimal places to handle floating point precision', () => {
      // Test floating point precision issue
      const result = createQuantity(10.12340001)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe(10.1234)
      }
    })
  })
})
