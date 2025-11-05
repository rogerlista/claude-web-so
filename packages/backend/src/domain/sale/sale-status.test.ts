import type { Result } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { type SaleStatus, createSaleStatus, isSaleStatus } from './sale-status'

/**
 * TDD - RED Phase
 * Tests for SaleStatus type
 *
 * Domain Rules:
 * - SaleStatus must be one of: PENDING, COMPLETED, CANCELLED
 * - Case-insensitive input
 * - Stored as uppercase
 */

describe('SaleStatus', () => {
  describe('createSaleStatus', () => {
    it('should create PENDING status', () => {
      const result: Result<SaleStatus, string> = createSaleStatus('PENDING')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('PENDING')
      }
    })

    it('should create COMPLETED status', () => {
      const result = createSaleStatus('COMPLETED')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('COMPLETED')
      }
    })

    it('should create CANCELLED status', () => {
      const result = createSaleStatus('CANCELLED')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('CANCELLED')
      }
    })

    it('should accept lowercase input', () => {
      const result = createSaleStatus('pending')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('PENDING')
      }
    })

    it('should accept mixed case input', () => {
      const result = createSaleStatus('Completed')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('COMPLETED')
      }
    })

    it('should reject invalid status', () => {
      const result = createSaleStatus('INVALID')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('Invalid sale status')
      }
    })

    it('should reject empty string', () => {
      const result = createSaleStatus('')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('Invalid sale status')
      }
    })

    it('should trim whitespace', () => {
      const result = createSaleStatus('  PENDING  ')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('PENDING')
      }
    })
  })

  describe('isSaleStatus', () => {
    it('should return true for valid status', () => {
      expect(isSaleStatus('PENDING')).toBe(true)
      expect(isSaleStatus('COMPLETED')).toBe(true)
      expect(isSaleStatus('CANCELLED')).toBe(true)
    })

    it('should return false for invalid status', () => {
      expect(isSaleStatus('INVALID')).toBe(false)
      expect(isSaleStatus('')).toBe(false)
      expect(isSaleStatus('pending')).toBe(false) // Case sensitive
    })
  })
})
