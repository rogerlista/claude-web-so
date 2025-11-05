import type { Result } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { type GTIN, createGTIN } from './gtin'

/**
 * TDD - RED Phase
 * Tests for GTIN (Global Trade Item Number) branded type
 *
 * Domain Rules:
 * - GTIN must be 8, 12, 13, or 14 digits
 * - Must be numeric only
 * - Must pass check digit validation
 * - Leading zeros are preserved
 */

describe('GTIN', () => {
  describe('createGTIN', () => {
    it('should create a valid GTIN-13 (EAN)', () => {
      // Valid EAN-13: 7898357417892
      const result: Result<GTIN, string> = createGTIN('7898357417892')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('7898357417892')
      }
    })

    it('should create a valid GTIN-12 (UPC)', () => {
      // Valid UPC: 012345678905
      const result = createGTIN('012345678905')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('012345678905')
      }
    })

    it('should create a valid GTIN-8', () => {
      // Valid GTIN-8: 12345670
      const result = createGTIN('12345670')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('12345670')
      }
    })

    it('should create a valid GTIN-14', () => {
      // Valid GTIN-14: 12345678901231
      const result = createGTIN('12345678901231')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('12345678901231')
      }
    })

    it('should reject empty string', () => {
      const result = createGTIN('')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('GTIN cannot be empty')
      }
    })

    it('should reject GTIN with invalid length', () => {
      const result = createGTIN('12345') // 5 digits

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('GTIN must be 8, 12, 13, or 14 digits')
      }
    })

    it('should reject GTIN with non-numeric characters', () => {
      const result = createGTIN('12345678901A3')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('GTIN must contain only digits')
      }
    })

    it('should reject GTIN with invalid check digit', () => {
      // Invalid check digit: 7898357417893 (should be 7898357417892)
      const result = createGTIN('7898357417893')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('GTIN has invalid check digit')
      }
    })

    it('should trim whitespace from input', () => {
      const result = createGTIN('  7898357417892  ')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('7898357417892')
      }
    })

    it('should preserve leading zeros', () => {
      const result = createGTIN('012345678905')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('012345678905')
        expect(result.value.length).toBe(12)
      }
    })

    it('should reject GTIN with spaces', () => {
      const result = createGTIN('7898 3574 1789 2')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('GTIN must contain only digits')
      }
    })
  })

  describe('GTIN check digit validation', () => {
    it('should validate GTIN-13 check digit correctly', () => {
      // Multiple valid EAN-13 codes
      expect(createGTIN('5901234123457').ok).toBe(true)
      expect(createGTIN('5901234123458').ok).toBe(false) // Invalid check digit
    })

    it('should validate GTIN-8 check digit correctly', () => {
      expect(createGTIN('96385074').ok).toBe(true)
      expect(createGTIN('96385075').ok).toBe(false) // Invalid check digit
    })
  })

  describe('GTIN type safety', () => {
    it('should prevent accidental string assignment', () => {
      const result = createGTIN('7898357417892')

      if (result.ok) {
        const gtin: GTIN = result.value

        // This should compile - GTIN is a branded string
        expect(typeof gtin).toBe('string')

        // TypeScript should prevent this at compile time:
        // const regularString: string = '1234567890123'
        // const gtin2: GTIN = regularString // ❌ Type error
      }
    })
  })
})
