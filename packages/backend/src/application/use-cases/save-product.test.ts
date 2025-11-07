import { ResultUtils } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { createGTIN } from '../../domain/product/gtin'
import { createPrice } from '../../domain/product/price'
import { createProductId } from '../../domain/product/product-id'
import { createSKU } from '../../domain/product/sku'
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
      search: async () => ResultUtils.ok([]),
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
      search: async () => ResultUtils.ok([]),
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
      search: async () => ResultUtils.ok([]),
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

  it('should reject product with duplicate SKU', async () => {
    const existingProductId = createProductId('550e8400-e29b-41d4-a716-446655440099')
    const existingPrice = createPrice(10)
    const existingSKU = createSKU('SKU123')

    if (!existingProductId.ok || !existingPrice.ok || !existingSKU.ok) {
      throw new Error('Failed to create test data')
    }

    const mockRepository: ProductRepository = {
      save: async (product) => ResultUtils.ok(product),
      findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      findAll: async () => ResultUtils.ok([]),
      delete: async () => ResultUtils.ok(undefined),
      findBySKU: (sku) => {
        if (sku === existingSKU.value) {
          // Return a product with different ID (indicating duplicate)
          return Promise.resolve(
            ResultUtils.ok([
              {
                id: existingProductId.value,
                description: 'Existing Product',
                price: existingPrice.value,
                sku: existingSKU.value,
              },
            ])
          )
        }
        return Promise.resolve(ResultUtils.ok([]))
      },
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      search: async () => ResultUtils.ok([]),
    }

    const saveProduct = createSaveProduct({ repository: mockRepository })

    const result = await saveProduct({
      id: '550e8400-e29b-41d4-a716-446655440000',
      description: 'New Product',
      price: 15.0,
      sku: 'SKU123',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('SKU')
      expect(result.error).toContain('already exists')
    }
  })

  it('should reject product with duplicate GTIN', async () => {
    const existingProductId = createProductId('550e8400-e29b-41d4-a716-446655440099')
    const existingPrice = createPrice(10)
    const existingGTIN = createGTIN('7898357417892')

    if (!existingProductId.ok || !existingPrice.ok || !existingGTIN.ok) {
      throw new Error('Failed to create test data')
    }

    const mockRepository: ProductRepository = {
      save: async (product) => ResultUtils.ok(product),
      findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      findAll: async () => ResultUtils.ok([]),
      delete: async () => ResultUtils.ok(undefined),
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: (gtin) => {
        if (gtin === existingGTIN.value) {
          // Return a product with different ID (indicating duplicate)
          return Promise.resolve(
            ResultUtils.ok({
              id: existingProductId.value,
              description: 'Existing Product',
              price: existingPrice.value,
              gtin: existingGTIN.value,
            })
          )
        }
        return Promise.resolve(ResultUtils.err({ type: 'NOT_FOUND', id: '' }))
      },
      search: async () => ResultUtils.ok([]),
    }

    const saveProduct = createSaveProduct({ repository: mockRepository })

    const result = await saveProduct({
      id: '550e8400-e29b-41d4-a716-446655440000',
      description: 'New Product',
      price: 15.0,
      gtin: '7898357417892',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('GTIN')
      expect(result.error).toContain('already exists')
    }
  })

  it('should allow updating product with same SKU (same ID)', async () => {
    const productId = '550e8400-e29b-41d4-a716-446655440000'
    const existingProductId = createProductId(productId)
    const existingPrice = createPrice(10)
    const existingSKU = createSKU('SKU123')

    if (!existingProductId.ok || !existingPrice.ok || !existingSKU.ok) {
      throw new Error('Failed to create test data')
    }

    const mockRepository: ProductRepository = {
      save: async (product) => ResultUtils.ok(product),
      findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      findAll: async () => ResultUtils.ok([]),
      delete: async () => ResultUtils.ok(undefined),
      findBySKU: (sku) => {
        if (sku === existingSKU.value) {
          // Return the same product (update scenario)
          return Promise.resolve(
            ResultUtils.ok([
              {
                id: existingProductId.value,
                description: 'Same Product',
                price: existingPrice.value,
                sku: existingSKU.value,
              },
            ])
          )
        }
        return Promise.resolve(ResultUtils.ok([]))
      },
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      search: async () => ResultUtils.ok([]),
    }

    const saveProduct = createSaveProduct({ repository: mockRepository })

    const result = await saveProduct({
      id: productId,
      description: 'Updated Product',
      price: 20.0,
      sku: 'SKU123',
    })

    expect(result.ok).toBe(true)
  })

  it('should allow updating product with same GTIN (same ID)', async () => {
    const productId = '550e8400-e29b-41d4-a716-446655440000'
    const existingProductId = createProductId(productId)
    const existingPrice = createPrice(10)
    const existingGTIN = createGTIN('5901234123457')

    if (!existingProductId.ok || !existingPrice.ok || !existingGTIN.ok) {
      throw new Error('Failed to create test data')
    }

    const mockRepository: ProductRepository = {
      save: async (product) => ResultUtils.ok(product),
      findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      findAll: async () => ResultUtils.ok([]),
      delete: async () => ResultUtils.ok(undefined),
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: (gtin) => {
        if (gtin === existingGTIN.value) {
          // Return the same product (update scenario)
          return Promise.resolve(
            ResultUtils.ok({
              id: existingProductId.value,
              description: 'Same Product',
              price: existingPrice.value,
              gtin: existingGTIN.value,
            })
          )
        }
        return Promise.resolve(ResultUtils.err({ type: 'NOT_FOUND', id: '' }))
      },
      search: async () => ResultUtils.ok([]),
    }

    const saveProduct = createSaveProduct({ repository: mockRepository })

    const result = await saveProduct({
      id: productId,
      description: 'Updated Product',
      price: 20.0,
      gtin: '5901234123457',
    })

    expect(result.ok).toBe(true)
  })
})
