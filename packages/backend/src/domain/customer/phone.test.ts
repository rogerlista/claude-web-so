import type { Result } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { type Phone, createPhone } from './phone'

/**
 * TDD - RED Phase
 * Tests for Phone (Brazilian phone number) branded type
 *
 * Domain Rules:
 * - Must be 10 or 11 digits (Brazilian format)
 * - 10 digits: (XX) XXXX-XXXX (landline)
 * - 11 digits: (XX) 9XXXX-XXXX (mobile with 9)
 * - Stored as digits only (no formatting)
 * - Can accept formatted or unformatted input
 */

describe('Phone', () => {
  describe('createPhone', () => {
    it('should create a valid Phone from unformatted mobile number', () => {
      // 11 digits - mobile with 9
      const result: Result<Phone, string> = createPhone('11987654321')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('11987654321')
      }
    })

    it('should create a valid Phone from formatted mobile number', () => {
      const result = createPhone('(11) 98765-4321')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('11987654321')
      }
    })

    it('should create a valid Phone from unformatted landline number', () => {
      // 10 digits - landline
      const result = createPhone('1134567890')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('1134567890')
      }
    })

    it('should create a valid Phone from formatted landline number', () => {
      const result = createPhone('(11) 3456-7890')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('1134567890')
      }
    })

    it('should accept phone with country code', () => {
      const result = createPhone('+55 11 98765-4321')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('5511987654321')
      }
    })

    it('should reject empty string', () => {
      const result = createPhone('')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('Phone cannot be empty')
      }
    })

    it('should reject phone with invalid length', () => {
      const result = createPhone('123456789') // 9 digits

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('Phone must have 10, 11, 12, or 13 digits')
      }
    })

    it('should reject phone with too many digits', () => {
      const result = createPhone('12345678901234') // 14 digits

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('Phone must have 10, 11, 12, or 13 digits')
      }
    })

    it('should trim whitespace from input', () => {
      const result = createPhone('  11987654321  ')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('11987654321')
      }
    })

    it('should accept phone with spaces and dashes', () => {
      const result = createPhone('11 9 8765-4321')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('11987654321')
      }
    })

    it('should accept phone with parentheses', () => {
      const result = createPhone('(11)987654321')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('11987654321')
      }
    })
  })

  describe('Phone type safety', () => {
    it('should prevent accidental string assignment', () => {
      const result = createPhone('11987654321')

      if (result.ok) {
        const phone: Phone = result.value

        // This should compile - Phone is a branded string
        expect(typeof phone).toBe('string')

        // TypeScript should prevent this at compile time:
        // const regularString: string = '11987654321'
        // const phone2: Phone = regularString // ❌ Type error
      }
    })
  })
})
