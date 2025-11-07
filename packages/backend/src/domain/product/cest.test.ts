import type { Result } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { type CEST, createCEST } from './cest'

/**
 * TDD - RED Phase
 * Tests for CEST (Código Especificador da Substituição Tributária) value object
 *
 * Domain Rule: CEST must be exactly 7 digits (numeric string)
 * Format: 9999999 (7 digits)
 * Example: 0100100
 */

describe('CEST', () => {
  describe('createCEST', () => {
    it('should create a valid CEST with 7 digits', () => {
      const result: Result<CEST, string> = createCEST('1234567')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('1234567')
      }
    })

    it('should accept CEST with leading zeros', () => {
      const result = createCEST('0100100')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('0100100')
      }
    })

    it('should reject empty string', () => {
      const result = createCEST('')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('CEST cannot be empty')
      }
    })

    it('should reject whitespace-only string', () => {
      const result = createCEST('   ')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('CEST cannot be empty')
      }
    })

    it('should reject CEST with less than 7 digits', () => {
      const result = createCEST('123456')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('CEST must have exactly 7 digits')
      }
    })

    it('should reject CEST with more than 7 digits', () => {
      const result = createCEST('12345678')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('CEST must have exactly 7 digits')
      }
    })

    it('should reject CEST with non-numeric characters', () => {
      const result = createCEST('123456A')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('CEST must contain only digits')
      }
    })

    it('should reject CEST with special characters', () => {
      const result = createCEST('123-4567')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('CEST must contain only digits')
      }
    })

    it('should trim whitespace from input', () => {
      const result = createCEST('  1234567  ')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('1234567')
      }
    })

    it('should reject CEST with spaces in the middle', () => {
      const result = createCEST('123 4567')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('CEST must contain only digits')
      }
    })
  })

  describe('CEST type safety', () => {
    it('should prevent accidental string assignment', () => {
      const result = createCEST('1234567')

      if (result.ok) {
        const cest: CEST = result.value

        // This should compile - CEST is a branded string
        expect(typeof cest).toBe('string')

        // TypeScript should prevent this at compile time:
        // const regularString: string = '1234567'
        // const cest2: CEST = regularString // ❌ Type error
      }
    })
  })
})
