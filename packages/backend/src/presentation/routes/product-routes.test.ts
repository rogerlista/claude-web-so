import { ResultUtils } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import type { ProductRepository } from '../../application/ports/product-repository'
import { createPrice } from '../../domain/product/price'
import { createProduct } from '../../domain/product/product'
import { createProductId } from '../../domain/product/product-id'
import { createProductRoutes } from './product-routes'

describe('Product Routes', () => {
  const createMockRepository = (): ProductRepository => ({
    save: async () => ResultUtils.err({ type: 'UNKNOWN', message: 'Not implemented' }),
    findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
    findAll: async () => ResultUtils.ok([]),
    delete: async () => ResultUtils.ok(undefined),
    findBySKU: async () => ResultUtils.ok([]),
    findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
    search: async () => ResultUtils.ok([]),
  })

  describe('POST /', () => {
    it('should create a product', async () => {
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

      const mockRepo: ProductRepository = {
        ...createMockRepository(),
        save: async () => ResultUtils.ok(testProduct.value),
      }

      const app = createProductRoutes({ repository: mockRepo })

      const res = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId.value,
          description: 'Test Product',
          price: 10.5,
        }),
      })

      expect(res.status).toBe(201)
      const data = (await res.json()) as Record<string, unknown>
      expect(data['description']).toBe('Test Product')
    })

    it('should return error for invalid product data', async () => {
      const app = createProductRoutes({ repository: createMockRepository() })

      const res = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: '550e8400-e29b-41d4-a716-446655440000',
          description: '',
          price: 10.5,
        }),
      })

      expect(res.status).toBe(400)
    })

    it('should handle invalid JSON', async () => {
      const app = createProductRoutes({ repository: createMockRepository() })

      const res = await app.request('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      })

      expect(res.status).toBe(400)
    })
  })

  describe('GET /', () => {
    it('should list all products', async () => {
      const mockRepo: ProductRepository = {
        ...createMockRepository(),
        findAll: async () => ResultUtils.ok([]),
      }

      const app = createProductRoutes({ repository: mockRepo })

      const res = await app.request('/', { method: 'GET' })

      expect(res.status).toBe(200)
      const data = (await res.json()) as Record<string, unknown>
      expect(data['data']).toEqual([])
      expect(data['total']).toBe(0)
    })

    it('should handle pagination parameters', async () => {
      const mockRepo: ProductRepository = {
        ...createMockRepository(),
        findAll: async () => ResultUtils.ok([]),
      }

      const app = createProductRoutes({ repository: mockRepo })

      const res = await app.request('/?page=2&pageSize=20', { method: 'GET' })

      expect(res.status).toBe(200)
    })

    it('should handle repository errors', async () => {
      const mockRepo: ProductRepository = {
        ...createMockRepository(),
        findAll: async () => ResultUtils.err({ type: 'DATABASE_ERROR', message: 'Test error' }),
      }

      const app = createProductRoutes({ repository: mockRepo })

      const res = await app.request('/', { method: 'GET' })

      expect(res.status).toBe(400)
    })
  })

  describe('GET /:id', () => {
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

      const mockRepo: ProductRepository = {
        ...createMockRepository(),
        findById: async () => ResultUtils.ok(testProduct.value),
      }

      const app = createProductRoutes({ repository: mockRepo })

      const res = await app.request('/550e8400-e29b-41d4-a716-446655440000', { method: 'GET' })

      expect(res.status).toBe(200)
      const data = (await res.json()) as Record<string, unknown>
      expect(data['description']).toBe('Test Product')
    })

    it('should return 404 for non-existent product', async () => {
      const mockRepo: ProductRepository = {
        ...createMockRepository(),
        findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: 'test' }),
      }

      const app = createProductRoutes({ repository: mockRepo })

      const res = await app.request('/550e8400-e29b-41d4-a716-446655440000', { method: 'GET' })

      expect(res.status).toBe(404)
    })
  })

  describe('PUT /:id', () => {
    it('should update a product', async () => {
      const productId = createProductId('550e8400-e29b-41d4-a716-446655440000')
      const price = createPrice(15.0)

      if (!productId.ok || !price.ok) {
        throw new Error('Failed to create test data')
      }

      const testProduct = createProduct({
        id: productId.value,
        description: 'Updated Product',
        price: price.value,
      })

      if (!testProduct.ok) {
        throw new Error('Failed to create test product')
      }

      const mockRepo: ProductRepository = {
        ...createMockRepository(),
        save: async () => ResultUtils.ok(testProduct.value),
      }

      const app = createProductRoutes({ repository: mockRepo })

      const res = await app.request('/550e8400-e29b-41d4-a716-446655440000', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'Updated Product',
          price: 15.0,
        }),
      })

      expect(res.status).toBe(200)
      const data = (await res.json()) as Record<string, unknown>
      expect(data['description']).toBe('Updated Product')
    })

    it('should handle invalid data', async () => {
      const app = createProductRoutes({ repository: createMockRepository() })

      const res = await app.request('/550e8400-e29b-41d4-a716-446655440000', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid',
      })

      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /:id', () => {
    it('should delete a product', async () => {
      const mockRepo: ProductRepository = {
        ...createMockRepository(),
        delete: async () => ResultUtils.ok(undefined),
      }

      const app = createProductRoutes({ repository: mockRepo })

      const res = await app.request('/550e8400-e29b-41d4-a716-446655440000', { method: 'DELETE' })

      expect(res.status).toBe(200)
      const data = (await res.json()) as Record<string, unknown>
      expect(data['message']).toBe('Product deleted successfully')
    })

    it('should return 404 for non-existent product', async () => {
      const mockRepo: ProductRepository = {
        ...createMockRepository(),
        delete: async () => ResultUtils.err({ type: 'NOT_FOUND', id: 'test' }),
      }

      const app = createProductRoutes({ repository: mockRepo })

      const res = await app.request('/550e8400-e29b-41d4-a716-446655440000', { method: 'DELETE' })

      expect(res.status).toBe(404)
    })
  })

  describe('GET /search', () => {
    it('should search products by query', async () => {
      const product1Id = createProductId('prod-1')
      const product1Price = createPrice(10.5)
      const product2Id = createProductId('prod-2')
      const product2Price = createPrice(20.0)

      if (!product1Id.ok || !product1Price.ok || !product2Id.ok || !product2Price.ok) {
        throw new Error('Failed to create test data')
      }

      const mockRepo: ProductRepository = {
        ...createMockRepository(),
        search: (query) => {
          if (query === 'arroz') {
            return Promise.resolve(
              ResultUtils.ok([
                {
                  id: product1Id.value,
                  description: 'Arroz Branco 1kg',
                  price: product1Price.value,
                },
                {
                  id: product2Id.value,
                  description: 'Arroz Integral 1kg',
                  price: product2Price.value,
                },
              ])
            )
          }
          return Promise.resolve(ResultUtils.ok([]))
        },
      }

      const app = createProductRoutes({ repository: mockRepo })

      const res = await app.request('/search?q=arroz', { method: 'GET' })

      expect(res.status).toBe(200)
      const data = (await res.json()) as Record<string, unknown>
      expect(data['total']).toBe(2)
      expect(Array.isArray(data['data'])).toBe(true)
    })

    it('should return 400 when query parameter is missing', async () => {
      const app = createProductRoutes({ repository: createMockRepository() })

      const res = await app.request('/search', { method: 'GET' })

      expect(res.status).toBe(400)
      const data = (await res.json()) as Record<string, unknown>
      expect(data['error']).toBe('Query parameter "q" is required')
    })

    it('should return empty array when no products match', async () => {
      const mockRepo: ProductRepository = {
        ...createMockRepository(),
        search: async () => ResultUtils.ok([]),
      }

      const app = createProductRoutes({ repository: mockRepo })

      const res = await app.request('/search?q=nonexistent', { method: 'GET' })

      expect(res.status).toBe(200)
      const data = (await res.json()) as Record<string, unknown>
      expect(data['total']).toBe(0)
      expect(Array.isArray(data['data'])).toBe(true)
    })
  })
})
