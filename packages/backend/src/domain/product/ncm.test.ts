import type { Result } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { type NCM, createNCM } from './ncm'

/**
 * TDD - RED Phase
 * Tests for NCM (Nomenclatura Comum do Mercosul) value object
 *
 * Domain Rule: NCM must be exactly 8 digits (numeric string)
 * Format: 99999999 (8 digits)
 * Example: 12345678
 */

describe('NCM', () => {
  describe('createNCM', () => {
    it('should create a valid NCM with 8 digits', () => {
      const result: Result<NCM, string> = createNCM('12345678')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('12345678')
      }
    })

    it('should accept NCM with leading zeros', () => {
      const result = createNCM('01234567')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('01234567')
      }
    })

    it('should reject empty string', () => {
      const result = createNCM('')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('NCM cannot be empty')
      }
    })

    it('should reject whitespace-only string', () => {
      const result = createNCM('   ')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('NCM cannot be empty')
      }
    })

    it('should reject NCM with less than 8 digits', () => {
      const result = createNCM('1234567')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('NCM must have exactly 8 digits')
      }
    })

    it('should reject NCM with more than 8 digits', () => {
      const result = createNCM('123456789')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('NCM must have exactly 8 digits')
      }
    })

    it('should reject NCM with non-numeric characters', () => {
      const result = createNCM('1234567A')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('NCM must contain only digits')
      }
    })

    it('should reject NCM with special characters', () => {
      const result = createNCM('1234-5678')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('NCM must contain only digits')
      }
    })

    it('should trim whitespace from input', () => {
      const result = createNCM('  12345678  ')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('12345678')
      }
    })

    it('should reject NCM with spaces in the middle', () => {
      const result = createNCM('1234 5678')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('NCM must contain only digits')
      }
    })
  })

  describe('NCM type safety', () => {
    it('should prevent accidental string assignment', () => {
      const result = createNCM('12345678')

      if (result.ok) {
        const ncm: NCM = result.value

        // This should compile - NCM is a branded string
        expect(typeof ncm).toBe('string')

        // TypeScript should prevent this at compile time:
        // const regularString: string = '12345678'
        // const ncm2: NCM = regularString // ❌ Type error
      }
    })
  })
})
