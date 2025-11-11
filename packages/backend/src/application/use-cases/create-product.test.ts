import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { createGTIN } from '../../domain/product/gtin'
import { createPrice } from '../../domain/product/price'
import type { Product } from '../../domain/product/product'
import { createProductId } from '../../domain/product/product-id'
import { createSKU } from '../../domain/product/sku'
import type { ProductRepository, RepositoryError } from '../ports/product-repository'
import {
  type CreateProductInput,
  type CreateProductUseCaseError,
  createProductUseCase,
} from './create-product'

/**
 * TDD - RED Phase
 * Tests for CreateProduct use case
 *
 * Business Rules:
 * - Must validate all input data
 * - Must create valid Product entity
 * - Must save product using repository
 * - Must handle repository errors gracefully
 * - SKU and GTIN are optional
 */

/**
 * Helper to create a mock Product for testing
 */
const createMockProduct = (data: {
  id: string
  description: string
  price: number
  sku?: string
  gtin?: string
}): Product => {
  const idResult = createProductId(data.id)
  const priceResult = createPrice(data.price)

  if (!idResult.ok || !priceResult.ok) {
    throw new Error('Invalid mock product data')
  }

  const product: Product = {
    id: idResult.value,
    description: data.description,
    price: priceResult.value,
  }

  if (data.sku) {
    const skuResult = createSKU(data.sku)
    if (skuResult.ok) {
      Object.assign(product, { sku: skuResult.value })
    }
  }

  if (data.gtin) {
    const gtinResult = createGTIN(data.gtin)
    if (gtinResult.ok) {
      Object.assign(product, { gtin: gtinResult.value })
    }
  }

  return product
}

/**
 * Mock ProductRepository for testing
 */
const createMockRepository = (saveResult: Result<Product, RepositoryError>): ProductRepository => ({
  save: async () => saveResult,
  findById: async () => ResultUtils.err({ type: 'NOT_FOUND' as const, id: 'test' }),
  findAll: async () => ResultUtils.ok([]),
  delete: async () => ResultUtils.ok(undefined),
  findBySKU: async () => ResultUtils.ok([]),
  findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND' as const, id: 'test' }),
  search: async () => ResultUtils.ok([]),
})

describe('CreateProduct Use Case', () => {
  describe('createProductUseCase', () => {
    it('should create a product with valid data', async () => {
      const mockRepo = createMockRepository(
        ResultUtils.ok(
          createMockProduct({
            id: 'prod-123',
            description: 'Test Product',
            price: 10.5,
          })
        )
      )

      const useCase = createProductUseCase(mockRepo)

      const input: CreateProductInput = {
        id: 'prod-123',
        description: 'Test Product',
        price: 10.5,
      }

      const result: Result<Product, CreateProductUseCaseError> = await useCase(input)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.id).toBe('prod-123')
        expect(result.value.description).toBe('Test Product')
        expect(result.value.price).toBe(10.5)
      }
    })

    it('should create a product with SKU and GTIN', async () => {
      const mockRepo = createMockRepository(
        ResultUtils.ok(
          createMockProduct({
            id: 'prod-123',
            description: 'Test Product',
            price: 10.5,
            sku: 'PROD-123',
            gtin: '7898357417892',
          })
        )
      )

      const useCase = createProductUseCase(mockRepo)

      const input: CreateProductInput = {
        id: 'prod-123',
        description: 'Test Product',
        price: 10.5,
        sku: 'PROD-123',
        gtin: '7898357417892',
      }

      const result = await useCase(input)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.sku).toBe('PROD-123')
        expect(result.value.gtin).toBe('7898357417892')
      }
    })

    it('should reject invalid product ID', async () => {
      const mockRepo = createMockRepository(
        ResultUtils.ok(createMockProduct({ id: 'prod-123', description: 'Test', price: 10 }))
      )
      const useCase = createProductUseCase(mockRepo)

      const input: CreateProductInput = {
        id: '',
        description: 'Test Product',
        price: 10.5,
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'VALIDATION_ERROR') {
        expect(result.error.type).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('ProductId')
      }
    })

    it('should reject invalid price', async () => {
      const mockRepo = createMockRepository(
        ResultUtils.ok(createMockProduct({ id: 'prod-123', description: 'Test', price: 10 }))
      )
      const useCase = createProductUseCase(mockRepo)

      const input: CreateProductInput = {
        id: 'prod-123',
        description: 'Test Product',
        price: -10,
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'VALIDATION_ERROR') {
        expect(result.error.type).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('Price')
      }
    })

    it('should reject invalid description', async () => {
      const mockRepo = createMockRepository(
        ResultUtils.ok(createMockProduct({ id: 'prod-123', description: 'Test', price: 10 }))
      )
      const useCase = createProductUseCase(mockRepo)

      const input: CreateProductInput = {
        id: 'prod-123',
        description: '',
        price: 10.5,
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'VALIDATION_ERROR') {
        expect(result.error.type).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('Description')
      }
    })

    it('should reject invalid SKU', async () => {
      const mockRepo = createMockRepository(
        ResultUtils.ok(createMockProduct({ id: 'prod-123', description: 'Test', price: 10 }))
      )
      const useCase = createProductUseCase(mockRepo)

      const input: CreateProductInput = {
        id: 'prod-123',
        description: 'Test Product',
        price: 10.5,
        sku: 'INVALID SKU!',
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'VALIDATION_ERROR') {
        expect(result.error.type).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('SKU')
      }
    })

    it('should reject invalid GTIN', async () => {
      const mockRepo = createMockRepository(
        ResultUtils.ok(createMockProduct({ id: 'prod-123', description: 'Test', price: 10 }))
      )
      const useCase = createProductUseCase(mockRepo)

      const input: CreateProductInput = {
        id: 'prod-123',
        description: 'Test Product',
        price: 10.5,
        gtin: '12345',
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'VALIDATION_ERROR') {
        expect(result.error.type).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('GTIN')
      }
    })

    it('should handle repository errors', async () => {
      const mockRepo = createMockRepository(
        ResultUtils.err({ type: 'DATABASE_ERROR' as const, message: 'Connection failed' })
      )

      const useCase = createProductUseCase(mockRepo)

      const input: CreateProductInput = {
        id: 'prod-123',
        description: 'Test Product',
        price: 10.5,
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'REPOSITORY_ERROR') {
        expect(result.error.type).toBe('REPOSITORY_ERROR')
        expect(result.error.repositoryError.type).toBe('DATABASE_ERROR')
      }
    })

    it('should handle duplicate product error', async () => {
      const mockRepo = createMockRepository(
        ResultUtils.err({ type: 'DUPLICATE' as const, id: 'prod-123' })
      )

      const useCase = createProductUseCase(mockRepo)

      const input: CreateProductInput = {
        id: 'prod-123',
        description: 'Test Product',
        price: 10.5,
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'REPOSITORY_ERROR') {
        expect(result.error.type).toBe('REPOSITORY_ERROR')
        expect(result.error.repositoryError.type).toBe('DUPLICATE')
      }
    })
  })
})
