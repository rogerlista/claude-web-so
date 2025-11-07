import { ResultUtils } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { createPrice } from '../../domain/product/price'
import { createProduct } from '../../domain/product/product'
import type { Product } from '../../domain/product/product'
import { createProductId } from '../../domain/product/product-id'
import type { ProductRepository } from '../ports/product-repository'
import { createFindAllProducts } from './find-all-products'

describe('find-all-products use case', () => {
  const createTestProduct = (id: string, description: string, priceValue: number): Product => {
    const productId = createProductId(id)
    const price = createPrice(priceValue)

    if (!productId.ok || !price.ok) {
      throw new Error('Failed to create test data')
    }

    const product = createProduct({
      id: productId.value,
      description,
      price: price.value,
    })

    if (!product.ok) {
      throw new Error('Failed to create test product')
    }

    return product.value
  }

  it('should find all products without pagination', async () => {
    const product1 = createTestProduct('550e8400-e29b-41d4-a716-446655440000', 'Product 1', 10.5)
    const product2 = createTestProduct('550e8400-e29b-41d4-a716-446655440001', 'Product 2', 20.0)
    const product3 = createTestProduct('550e8400-e29b-41d4-a716-446655440002', 'Product 3', 15.75)

    const mockRepository: ProductRepository = {
      save: async () => ResultUtils.err({ type: 'UNKNOWN', message: 'Not implemented' }),
      findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      findAll: async () => ResultUtils.ok([product1, product2, product3]),
      delete: async () => ResultUtils.ok(undefined),
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      search: async () => ResultUtils.ok([]),
    }

    const findAllProducts = createFindAllProducts({ repository: mockRepository })

    const result = await findAllProducts({})

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.data).toHaveLength(3)
      expect(result.value.total).toBe(3)
      expect(result.value.page).toBe(1)
      expect(result.value.pageSize).toBe(3)
    }
  })

  it('should paginate products', async () => {
    const products = Array.from({ length: 25 }, (_, i) =>
      createTestProduct(
        `550e8400-e29b-41d4-a716-44665544${String(i).padStart(4, '0')}`,
        `Product ${i + 1}`,
        10.0 + i
      )
    )

    const mockRepository: ProductRepository = {
      save: async () => ResultUtils.err({ type: 'UNKNOWN', message: 'Not implemented' }),
      findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      findAll: async () => ResultUtils.ok(products),
      delete: async () => ResultUtils.ok(undefined),
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      search: async () => ResultUtils.ok([]),
    }

    const findAllProducts = createFindAllProducts({ repository: mockRepository })

    // Test first page (default page size: 10)
    const page1Result = await findAllProducts({ page: 1, pageSize: 10 })
    expect(page1Result.ok).toBe(true)
    if (page1Result.ok) {
      expect(page1Result.value.data).toHaveLength(10)
      expect(page1Result.value.total).toBe(25)
      expect(page1Result.value.page).toBe(1)
      expect(page1Result.value.pageSize).toBe(10)
      expect(page1Result.value.totalPages).toBe(3)
      expect(page1Result.value.data[0]?.description).toBe('Product 1')
    }

    // Test second page
    const page2Result = await findAllProducts({ page: 2, pageSize: 10 })
    expect(page2Result.ok).toBe(true)
    if (page2Result.ok) {
      expect(page2Result.value.data).toHaveLength(10)
      expect(page2Result.value.page).toBe(2)
      expect(page2Result.value.data[0]?.description).toBe('Product 11')
    }

    // Test last page
    const page3Result = await findAllProducts({ page: 3, pageSize: 10 })
    expect(page3Result.ok).toBe(true)
    if (page3Result.ok) {
      expect(page3Result.value.data).toHaveLength(5)
      expect(page3Result.value.page).toBe(3)
      expect(page3Result.value.data[0]?.description).toBe('Product 21')
    }
  })

  it('should return empty array when no products exist', async () => {
    const mockRepository: ProductRepository = {
      save: async () => ResultUtils.err({ type: 'UNKNOWN', message: 'Not implemented' }),
      findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      findAll: async () => ResultUtils.ok([]),
      delete: async () => ResultUtils.ok(undefined),
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      search: async () => ResultUtils.ok([]),
    }

    const findAllProducts = createFindAllProducts({ repository: mockRepository })

    const result = await findAllProducts({})

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.data).toHaveLength(0)
      expect(result.value.total).toBe(0)
      expect(result.value.totalPages).toBe(0)
    }
  })

  it('should handle invalid page number', async () => {
    const mockRepository: ProductRepository = {
      save: async () => ResultUtils.err({ type: 'UNKNOWN', message: 'Not implemented' }),
      findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      findAll: async () => ResultUtils.ok([]),
      delete: async () => ResultUtils.ok(undefined),
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      search: async () => ResultUtils.ok([]),
    }

    const findAllProducts = createFindAllProducts({ repository: mockRepository })

    const result = await findAllProducts({ page: 0 })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Page must be greater than 0')
    }
  })

  it('should handle invalid page size', async () => {
    const mockRepository: ProductRepository = {
      save: async () => ResultUtils.err({ type: 'UNKNOWN', message: 'Not implemented' }),
      findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      findAll: async () => ResultUtils.ok([]),
      delete: async () => ResultUtils.ok(undefined),
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      search: async () => ResultUtils.ok([]),
    }

    const findAllProducts = createFindAllProducts({ repository: mockRepository })

    const result = await findAllProducts({ pageSize: 0 })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Page size must be between 1 and 100')
    }
  })

  it('should handle repository errors', async () => {
    const mockRepository: ProductRepository = {
      save: async () => ResultUtils.err({ type: 'UNKNOWN', message: 'Not implemented' }),
      findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      findAll: async () => ResultUtils.err({ type: 'DATABASE_ERROR', message: 'Connection lost' }),
      delete: async () => ResultUtils.ok(undefined),
      findBySKU: async () => ResultUtils.ok([]),
      findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
      search: async () => ResultUtils.ok([]),
    }

    const findAllProducts = createFindAllProducts({ repository: mockRepository })

    const result = await findAllProducts({})

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Connection lost')
    }
  })
})
