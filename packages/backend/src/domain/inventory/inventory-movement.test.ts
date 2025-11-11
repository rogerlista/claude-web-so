import { describe, expect, it } from 'vitest'
import { createProductId } from '../product/product-id'
import { createInventoryId } from './inventory-id'
import { createInventoryMovement } from './inventory-movement'
import { createQuantity } from './quantity'

/**
 * TDD - RED Phase
 * Tests for InventoryMovement entity
 *
 * Business Rules:
 * - Must have id, productId, quantity, type, and date
 * - Description is optional
 * - Type must be valid (entrada/saida/ajuste)
 * - Quantity must be positive
 * - All fields are immutable
 */

describe('InventoryMovement Entity', () => {
  describe('createInventoryMovement', () => {
    it('should create movement with required fields only', () => {
      const idResult = createInventoryId('inv-001')
      const productIdResult = createProductId('prod-001')
      const quantityResult = createQuantity(10)

      if (!idResult.ok || !productIdResult.ok || !quantityResult.ok) {
        throw new Error('Setup failed')
      }

      const result = createInventoryMovement({
        id: idResult.value,
        productId: productIdResult.value,
        quantity: quantityResult.value,
        type: 'entrada',
        date: new Date('2024-01-01'),
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.id).toBe(idResult.value)
        expect(result.value.productId).toBe(productIdResult.value)
        expect(result.value.quantity).toBe(quantityResult.value)
        expect(result.value.type).toBe('entrada')
        expect(result.value.date).toEqual(new Date('2024-01-01'))
        expect(result.value.description).toBeUndefined()
      }
    })

    it('should create movement with optional description', () => {
      const idResult = createInventoryId('inv-001')
      const productIdResult = createProductId('prod-001')
      const quantityResult = createQuantity(10)

      if (!idResult.ok || !productIdResult.ok || !quantityResult.ok) {
        throw new Error('Setup failed')
      }

      const result = createInventoryMovement({
        id: idResult.value,
        productId: productIdResult.value,
        quantity: quantityResult.value,
        type: 'entrada',
        date: new Date('2024-01-01'),
        description: 'Compra de produtos',
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.description).toBe('Compra de produtos')
      }
    })

    it('should accept entrada type', () => {
      const idResult = createInventoryId('inv-001')
      const productIdResult = createProductId('prod-001')
      const quantityResult = createQuantity(10)

      if (!idResult.ok || !productIdResult.ok || !quantityResult.ok) {
        throw new Error('Setup failed')
      }

      const result = createInventoryMovement({
        id: idResult.value,
        productId: productIdResult.value,
        quantity: quantityResult.value,
        type: 'entrada',
        date: new Date(),
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.type).toBe('entrada')
      }
    })

    it('should accept saida type', () => {
      const idResult = createInventoryId('inv-001')
      const productIdResult = createProductId('prod-001')
      const quantityResult = createQuantity(10)

      if (!idResult.ok || !productIdResult.ok || !quantityResult.ok) {
        throw new Error('Setup failed')
      }

      const result = createInventoryMovement({
        id: idResult.value,
        productId: productIdResult.value,
        quantity: quantityResult.value,
        type: 'saida',
        date: new Date(),
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.type).toBe('saida')
      }
    })

    it('should accept ajuste type', () => {
      const idResult = createInventoryId('inv-001')
      const productIdResult = createProductId('prod-001')
      const quantityResult = createQuantity(10)

      if (!idResult.ok || !productIdResult.ok || !quantityResult.ok) {
        throw new Error('Setup failed')
      }

      const result = createInventoryMovement({
        id: idResult.value,
        productId: productIdResult.value,
        quantity: quantityResult.value,
        type: 'ajuste',
        date: new Date(),
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.type).toBe('ajuste')
      }
    })

    it('should trim description whitespace', () => {
      const idResult = createInventoryId('inv-001')
      const productIdResult = createProductId('prod-001')
      const quantityResult = createQuantity(10)

      if (!idResult.ok || !productIdResult.ok || !quantityResult.ok) {
        throw new Error('Setup failed')
      }

      const result = createInventoryMovement({
        id: idResult.value,
        productId: productIdResult.value,
        quantity: quantityResult.value,
        type: 'entrada',
        date: new Date(),
        description: '  Test description  ',
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.description).toBe('Test description')
      }
    })

    it('should treat empty description as undefined', () => {
      const idResult = createInventoryId('inv-001')
      const productIdResult = createProductId('prod-001')
      const quantityResult = createQuantity(10)

      if (!idResult.ok || !productIdResult.ok || !quantityResult.ok) {
        throw new Error('Setup failed')
      }

      const result = createInventoryMovement({
        id: idResult.value,
        productId: productIdResult.value,
        quantity: quantityResult.value,
        type: 'entrada',
        date: new Date(),
        description: '   ',
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.description).toBeUndefined()
      }
    })
  })
})
