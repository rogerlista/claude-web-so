import { ResultUtils } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { createProductId } from '../../domain/product/product-id'
import type { ProductRepository } from '../ports/product-repository'
import { createDeleteProduct } from './delete-product'

describe('delete-product use case', () => {
  it('should delete a product by id', async () => {
    const productId = createProductId('550e8400-e29b-41d4-a716-446655440000')

    if (!productId.ok) {
      throw new Error('Failed to create test data')
    }

    const mockRepository: ProductRepository = {
      save: async () => ResultUtils.err({ type: 'UNKNOWN', message: 'Not implemented' }),
      findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      findAll: async () => ResultUtils.ok([]),
      delete: async (id) => {
        await Promise.resolve()
        if (id === productId.value) {
          return ResultUtils.ok(undefined)
        }
        return ResultUtils.err({ type: 'NOT_FOUND', id: id as string })
      },
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
    }

    const deleteProduct = createDeleteProduct({ repository: mockRepository })

    const result = await deleteProduct({ id: productId.value })

    expect(result.ok).toBe(true)
  })

  it('should return error for invalid product id', async () => {
    const mockRepository: ProductRepository = {
      save: async () => ResultUtils.err({ type: 'UNKNOWN', message: 'Not implemented' }),
      findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      findAll: async () => ResultUtils.ok([]),
      delete: async () => ResultUtils.ok(undefined),
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
    }

    const deleteProduct = createDeleteProduct({ repository: mockRepository })

    const result = await deleteProduct({ id: '' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('ProductId cannot be empty')
    }
  })

  it('should return error when product not found', async () => {
    const mockRepository: ProductRepository = {
      save: async () => ResultUtils.err({ type: 'UNKNOWN', message: 'Not implemented' }),
      findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      findAll: async () => ResultUtils.ok([]),
      delete: async (id) => ResultUtils.err({ type: 'NOT_FOUND', id: id as string }),
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
    }

    const deleteProduct = createDeleteProduct({ repository: mockRepository })

    const result = await deleteProduct({ id: '550e8400-e29b-41d4-a716-446655440099' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('not found')
    }
  })

  it('should handle repository errors', async () => {
    const mockRepository: ProductRepository = {
      save: async () => ResultUtils.err({ type: 'UNKNOWN', message: 'Not implemented' }),
      findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      findAll: async () => ResultUtils.ok([]),
      delete: async () => ResultUtils.err({ type: 'DATABASE_ERROR', message: 'Failed to delete' }),
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
    }

    const deleteProduct = createDeleteProduct({ repository: mockRepository })

    const result = await deleteProduct({ id: '550e8400-e29b-41d4-a716-446655440000' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Failed to delete')
    }
  })
})
