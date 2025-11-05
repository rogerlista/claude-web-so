import type { Result } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { type CPF, createCPF } from './cpf'

/**
 * TDD - RED Phase
 * Tests for CPF (Cadastro de Pessoa Física) branded type
 *
 * Domain Rules:
 * - CPF must be 11 digits
 * - Must pass validation algorithm (check digits)
 * - Can accept formatted (XXX.XXX.XXX-XX) or unformatted (XXXXXXXXXXX)
 * - Stored as digits only (no formatting)
 * - Cannot be all same digits (000.000.000-00, 111.111.111-11, etc.)
 */

describe('CPF', () => {
  describe('createCPF', () => {
    it('should create a valid CPF from unformatted string', () => {
      // Valid CPF: 123.456.789-09
      const result: Result<CPF, string> = createCPF('12345678909')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('12345678909')
      }
    })

    it('should create a valid CPF from formatted string', () => {
      // Valid CPF with formatting
      const result = createCPF('123.456.789-09')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('12345678909') // Stored without formatting
      }
    })

    it('should accept another valid CPF', () => {
      // Valid CPF: 111.444.777-35
      const result = createCPF('111.444.777-35')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('11144477735')
      }
    })

    it('should reject empty string', () => {
      const result = createCPF('')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('CPF cannot be empty')
      }
    })

    it('should reject CPF with invalid length', () => {
      const result = createCPF('123456789') // Only 9 digits

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('CPF must have 11 digits')
      }
    })

    it('should reject CPF with invalid check digits', () => {
      // Invalid check digits (should be 09, not 00)
      const result = createCPF('123.456.789-00')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('CPF has invalid check digits')
      }
    })

    it('should reject CPF with all same digits', () => {
      const cpfs = [
        '000.000.000-00',
        '111.111.111-11',
        '222.222.222-22',
        '333.333.333-33',
        '444.444.444-44',
        '555.555.555-55',
        '666.666.666-66',
        '777.777.777-77',
        '888.888.888-88',
        '999.999.999-99',
      ]

      for (const cpf of cpfs) {
        const result = createCPF(cpf)
        expect(result.ok).toBe(false)
        if (!result.ok) {
          expect(result.error).toContain('CPF cannot have all same digits')
        }
      }
    })

    it('should trim whitespace from input', () => {
      const result = createCPF('  123.456.789-09  ')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('12345678909')
      }
    })

    it('should accept CPF with spaces', () => {
      const result = createCPF('123 456 789 09')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('12345678909')
      }
    })
  })

  describe('CPF type safety', () => {
    it('should prevent accidental string assignment', () => {
      const result = createCPF('123.456.789-09')

      if (result.ok) {
        const cpf: CPF = result.value

        // This should compile - CPF is a branded string
        expect(typeof cpf).toBe('string')

        // TypeScript should prevent this at compile time:
        // const regularString: string = '12345678909'
        // const cpf2: CPF = regularString // ❌ Type error
      }
    })
  })
})
