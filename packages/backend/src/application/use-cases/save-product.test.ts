import { ResultUtils } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { createPrice } from '../../domain/product/price'
import { createProductId } from '../../domain/product/product-id'
import type { ProductRepository } from '../ports/product-repository'
import { createSaveProduct } from './save-product'

describe('save-product use case', () => {
  it('should save a valid product', async () => {
    const mockRepository: ProductRepository = {
      save: async (product) => ResultUtils.ok(product),
      findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      findAll: async () => ResultUtils.ok([]),
      delete: async () => ResultUtils.ok(undefined),
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
    }

    const saveProduct = createSaveProduct({ repository: mockRepository })

    const productId = createProductId('550e8400-e29b-41d4-a716-446655440000')
    const price = createPrice(10.5)

    if (!productId.ok || !price.ok) {
      throw new Error('Failed to create product data')
    }

    const result = await saveProduct({
      id: productId.value,
      description: 'Test Product',
      price: price.value,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.description).toBe('Test Product')
      expect(result.value.price).toBe(price.value)
    }
  })

  it('should return error for empty description', async () => {
    const mockRepository: ProductRepository = {
      save: async (product) => ResultUtils.ok(product),
      findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      findAll: async () => ResultUtils.ok([]),
      delete: async () => ResultUtils.ok(undefined),
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
    }

    const saveProduct = createSaveProduct({ repository: mockRepository })

    const productId = createProductId('550e8400-e29b-41d4-a716-446655440001')
    const price = createPrice(10.5)

    if (!productId.ok || !price.ok) {
      throw new Error('Failed to create product data')
    }

    const result = await saveProduct({
      id: productId.value,
      description: '  ',
      price: price.value,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Description cannot be empty')
    }
  })

  it('should handle repository errors', async () => {
    const mockRepository: ProductRepository = {
      save: async () => ResultUtils.err({ type: 'DATABASE_ERROR', message: 'Connection failed' }),
      findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      findAll: async () => ResultUtils.ok([]),
      delete: async () => ResultUtils.ok(undefined),
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
    }

    const saveProduct = createSaveProduct({ repository: mockRepository })

    const productId = createProductId('550e8400-e29b-41d4-a716-446655440002')
    const price = createPrice(10.5)

    if (!productId.ok || !price.ok) {
      throw new Error('Failed to create product data')
    }

    const result = await saveProduct({
      id: productId.value,
      description: 'Test Product',
      price: price.value,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Connection failed')
    }
  })
})
