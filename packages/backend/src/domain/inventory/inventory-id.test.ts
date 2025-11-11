import { describe, expect, it } from 'vitest'
import { createInventoryId } from './inventory-id'

/**
 * TDD - RED Phase
 * Tests for InventoryId branded type
 */

describe('InventoryId', () => {
  describe('createInventoryId', () => {
    it('should create valid inventory id with uuid format', () => {
      const result = createInventoryId('inv-123')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('inv-123')
      }
    })

    it('should create valid inventory id with any non-empty string', () => {
      const result = createInventoryId('movement-001')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('movement-001')
      }
    })

    it('should reject empty string', () => {
      const result = createInventoryId('')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('cannot be empty')
      }
    })

    it('should reject whitespace-only string', () => {
      const result = createInventoryId('   ')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('cannot be empty')
      }
    })

    it('should trim whitespace from id', () => {
      const result = createInventoryId('  inv-123  ')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toBe('inv-123')
      }
    })
  })
})
