import { ResultUtils } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { createPrice } from '../../domain/product/price'
import { createProduct } from '../../domain/product/product'
import { createProductId } from '../../domain/product/product-id'
import type { ProductRepository } from '../ports/product-repository'
import { createFindProductById } from './find-product-by-id'

describe('find-product-by-id use case', () => {
  it('should find product by id', async () => {
    const productId = createProductId('550e8400-e29b-41d4-a716-446655440000')
    const price = createPrice(10.5)

    if (!productId.ok || !price.ok) {
      throw new Error('Failed to create test data')
    }

    const testProduct = createProduct({
      id: productId.value,
      description: 'Test Product',
      price: price.value,
    })

    if (!testProduct.ok) {
      throw new Error('Failed to create test product')
    }

    const mockRepository: ProductRepository = {
      save: async () => ResultUtils.err({ type: 'UNKNOWN', message: 'Not implemented' }),
      findById: async (id) => {
        await Promise.resolve()
        if (id === productId.value) {
          return ResultUtils.ok(testProduct.value)
        }
        return ResultUtils.err({ type: 'NOT_FOUND', id: id as string })
      },
      findAll: async () => ResultUtils.ok([]),
      delete: async () => ResultUtils.ok(undefined),
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
    }

    const findProductById = createFindProductById({ repository: mockRepository })

    const result = await findProductById({ id: productId.value })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.id).toBe(productId.value)
      expect(result.value.description).toBe('Test Product')
      expect(result.value.price).toBe(price.value)
    }
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

    const findProductById = createFindProductById({ repository: mockRepository })

    const result = await findProductById({ id: '' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('ProductId cannot be empty')
    }
  })

  it('should return error when product not found', async () => {
    const mockRepository: ProductRepository = {
      save: async () => ResultUtils.err({ type: 'UNKNOWN', message: 'Not implemented' }),
      findById: async (id) => ResultUtils.err({ type: 'NOT_FOUND', id: id as string }),
      findAll: async () => ResultUtils.ok([]),
      delete: async () => ResultUtils.ok(undefined),
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
    }

    const findProductById = createFindProductById({ repository: mockRepository })

    const result = await findProductById({ id: '550e8400-e29b-41d4-a716-446655440099' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('not found')
    }
  })

  it('should handle repository errors', async () => {
    const mockRepository: ProductRepository = {
      save: async () => ResultUtils.err({ type: 'UNKNOWN', message: 'Not implemented' }),
      findById: async () =>
        ResultUtils.err({ type: 'DATABASE_ERROR', message: 'Connection timeout' }),
      findAll: async () => ResultUtils.ok([]),
      delete: async () => ResultUtils.ok(undefined),
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
    }

    const findProductById = createFindProductById({ repository: mockRepository })

    const result = await findProductById({ id: '550e8400-e29b-41d4-a716-446655440000' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Connection timeout')
    }
  })
})
