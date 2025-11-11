import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { createCustomerId } from '../../domain/customer/customer-id'
import { createPrice } from '../../domain/product/price'
import { createProductId } from '../../domain/product/product-id'
import type { Sale } from '../../domain/sale/sale'
import { createSaleId } from '../../domain/sale/sale-id'
import { createSaleItem } from '../../domain/sale/sale-item'
import type { RepositoryError, SaleRepository } from '../ports/sale-repository'
import { type CreateSaleInput, type CreateSaleUseCaseError, createSaleUseCase } from './create-sale'

/**
 * TDD - RED Phase
 * Tests for CreateSale use case
 *
 * Business Rules:
 * - Must validate sale ID
 * - Must validate customer ID
 * - Must have at least one item
 * - Must validate each item (productId, quantity, unitPrice)
 * - Total is calculated automatically
 * - Status defaults to PENDING
 * - CreatedAt defaults to now
 * - Must save sale using repository
 * - Must handle repository errors gracefully
 */

/**
 * Helper to create a properly typed Sale for testing
 */
const createMockSale = (
  saleId: string,
  customerId: string,
  productId: string,
  quantity: number,
  unitPrice: number,
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' = 'PENDING',
  createdAt: Date = new Date()
): Sale => {
  const saleIdResult = createSaleId(saleId)
  const customerIdResult = createCustomerId(customerId)
  const productIdResult = createProductId(productId)
  const priceResult = createPrice(unitPrice)

  if (!saleIdResult.ok || !customerIdResult.ok || !productIdResult.ok || !priceResult.ok) {
    throw new Error('Mock setup failed')
  }

  const itemResult = createSaleItem({
    productId: productIdResult.value,
    quantity,
    unitPrice: priceResult.value,
  })

  if (!itemResult.ok) {
    throw new Error('Mock setup failed')
  }

  const grossTotal = quantity * unitPrice
  return {
    id: saleIdResult.value,
    customerId: customerIdResult.value,
    items: [itemResult.value],
    grossTotal,
    discount: 0,
    addition: 0,
    netTotal: grossTotal,
    payments: [],
    status,
    createdAt,
  }
}

/**
 * Mock SaleRepository for testing
 */
const createMockRepository = (saveResult: Result<Sale, RepositoryError>): SaleRepository => ({
  save: async () => saveResult,
  findById: async () => ResultUtils.err({ type: 'NOT_FOUND' as const, id: 'test' }),
  findAll: async () => ResultUtils.ok([]),
  delete: async () => ResultUtils.ok(undefined),
  findByCustomerId: async () => ResultUtils.ok([]),
  findByStatus: async () => ResultUtils.ok([]),
})

describe('CreateSale Use Case', () => {
  describe('createSaleUseCase', () => {
    it('should create a sale with valid data', async () => {
      const mockSale = createMockSale('sale-123', 'customer-456', 'product-789', 2, 10.5)
      const mockRepo = createMockRepository(ResultUtils.ok(mockSale))

      const useCase = createSaleUseCase(mockRepo)

      const input: CreateSaleInput = {
        id: 'sale-123',
        customerId: 'customer-456',
        items: [
          {
            productId: 'product-789',
            quantity: 2,
            unitPrice: 10.5,
          },
        ],
      }

      const result: Result<Sale, CreateSaleUseCaseError> = await useCase(input)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.id).toBe('sale-123')
        expect(result.value.customerId).toBe('customer-456')
        expect(result.value.items).toHaveLength(1)
        expect(result.value.netTotal).toBe(21.0)
        expect(result.value.status).toBe('PENDING')
      }
    })

    it('should create a sale with multiple items', async () => {
      // Create a more complex mock with multiple items
      const saleIdResult = createSaleId('sale-123')
      const customerIdResult = createCustomerId('customer-456')
      const product1IdResult = createProductId('product-789')
      const product2IdResult = createProductId('product-999')
      const price1Result = createPrice(10.5)
      const price2Result = createPrice(5.0)

      if (
        !saleIdResult.ok ||
        !customerIdResult.ok ||
        !product1IdResult.ok ||
        !product2IdResult.ok ||
        !price1Result.ok ||
        !price2Result.ok
      ) {
        throw new Error('Mock setup failed')
      }

      const item1Result = createSaleItem({
        productId: product1IdResult.value,
        quantity: 2,
        unitPrice: price1Result.value,
      })

      const item2Result = createSaleItem({
        productId: product2IdResult.value,
        quantity: 1,
        unitPrice: price2Result.value,
      })

      if (!item1Result.ok || !item2Result.ok) {
        throw new Error('Mock setup failed')
      }

      const mockSale: Sale = {
        id: saleIdResult.value,
        customerId: customerIdResult.value,
        items: [item1Result.value, item2Result.value],
        grossTotal: 26.0,
        discount: 0,
        addition: 0,
        netTotal: 26.0,
        payments: [],
        status: 'PENDING',
        createdAt: new Date(),
      }

      const mockRepo = createMockRepository(ResultUtils.ok(mockSale))

      const useCase = createSaleUseCase(mockRepo)

      const input: CreateSaleInput = {
        id: 'sale-123',
        customerId: 'customer-456',
        items: [
          {
            productId: 'product-789',
            quantity: 2,
            unitPrice: 10.5,
          },
          {
            productId: 'product-999',
            quantity: 1,
            unitPrice: 5.0,
          },
        ],
      }

      const result = await useCase(input)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.items).toHaveLength(2)
        expect(result.value.netTotal).toBe(26.0)
      }
    })

    it('should create a sale with custom status', async () => {
      const mockSale = createMockSale(
        'sale-123',
        'customer-456',
        'product-789',
        1,
        10.0,
        'COMPLETED'
      )
      const mockRepo = createMockRepository(ResultUtils.ok(mockSale))

      const useCase = createSaleUseCase(mockRepo)

      const input: CreateSaleInput = {
        id: 'sale-123',
        customerId: 'customer-456',
        items: [
          {
            productId: 'product-789',
            quantity: 1,
            unitPrice: 10.0,
          },
        ],
        status: 'COMPLETED',
      }

      const result = await useCase(input)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.status).toBe('COMPLETED')
      }
    })

    it('should reject invalid sale ID', async () => {
      const mockRepo = createMockRepository(ResultUtils.ok({} as Sale))
      const useCase = createSaleUseCase(mockRepo)

      const input: CreateSaleInput = {
        id: '',
        customerId: 'customer-456',
        items: [
          {
            productId: 'product-789',
            quantity: 1,
            unitPrice: 10.0,
          },
        ],
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'VALIDATION_ERROR') {
        expect(result.error.type).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('SaleId')
      }
    })

    it('should reject invalid customer ID', async () => {
      const mockRepo = createMockRepository(ResultUtils.ok({} as Sale))
      const useCase = createSaleUseCase(mockRepo)

      const input: CreateSaleInput = {
        id: 'sale-123',
        customerId: '',
        items: [
          {
            productId: 'product-789',
            quantity: 1,
            unitPrice: 10.0,
          },
        ],
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'VALIDATION_ERROR') {
        expect(result.error.type).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('CustomerId')
      }
    })

    it('should reject empty items array', async () => {
      const mockRepo = createMockRepository(ResultUtils.ok({} as Sale))
      const useCase = createSaleUseCase(mockRepo)

      const input: CreateSaleInput = {
        id: 'sale-123',
        customerId: 'customer-456',
        items: [],
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'VALIDATION_ERROR') {
        expect(result.error.type).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('at least one item')
      }
    })

    it('should reject invalid product ID in item', async () => {
      const mockRepo = createMockRepository(ResultUtils.ok({} as Sale))
      const useCase = createSaleUseCase(mockRepo)

      const input: CreateSaleInput = {
        id: 'sale-123',
        customerId: 'customer-456',
        items: [
          {
            productId: '',
            quantity: 1,
            unitPrice: 10.0,
          },
        ],
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'VALIDATION_ERROR') {
        expect(result.error.type).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('ProductId')
      }
    })

    it('should reject invalid quantity in item', async () => {
      const mockRepo = createMockRepository(ResultUtils.ok({} as Sale))
      const useCase = createSaleUseCase(mockRepo)

      const input: CreateSaleInput = {
        id: 'sale-123',
        customerId: 'customer-456',
        items: [
          {
            productId: 'product-789',
            quantity: 0,
            unitPrice: 10.0,
          },
        ],
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'VALIDATION_ERROR') {
        expect(result.error.type).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('Quantity')
      }
    })

    it('should reject invalid unit price in item', async () => {
      const mockRepo = createMockRepository(ResultUtils.ok({} as Sale))
      const useCase = createSaleUseCase(mockRepo)

      const input: CreateSaleInput = {
        id: 'sale-123',
        customerId: 'customer-456',
        items: [
          {
            productId: 'product-789',
            quantity: 1,
            unitPrice: -5.0,
          },
        ],
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'VALIDATION_ERROR') {
        expect(result.error.type).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('Price')
      }
    })

    it('should reject invalid status', async () => {
      const mockRepo = createMockRepository(ResultUtils.ok({} as Sale))
      const useCase = createSaleUseCase(mockRepo)

      const input: CreateSaleInput = {
        id: 'sale-123',
        customerId: 'customer-456',
        items: [
          {
            productId: 'product-789',
            quantity: 1,
            unitPrice: 10.0,
          },
        ],
        status: 'INVALID_STATUS',
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'VALIDATION_ERROR') {
        expect(result.error.type).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('status')
      }
    })

    it('should handle repository errors', async () => {
      const mockRepo = createMockRepository(
        ResultUtils.err({ type: 'DATABASE_ERROR' as const, message: 'Connection failed' })
      )

      const useCase = createSaleUseCase(mockRepo)

      const input: CreateSaleInput = {
        id: 'sale-123',
        customerId: 'customer-456',
        items: [
          {
            productId: 'product-789',
            quantity: 1,
            unitPrice: 10.0,
          },
        ],
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'REPOSITORY_ERROR') {
        expect(result.error.type).toBe('REPOSITORY_ERROR')
        expect(result.error.repositoryError.type).toBe('DATABASE_ERROR')
      }
    })

    it('should handle duplicate sale error', async () => {
      const mockRepo = createMockRepository(
        ResultUtils.err({ type: 'DUPLICATE' as const, id: 'sale-123' })
      )

      const useCase = createSaleUseCase(mockRepo)

      const input: CreateSaleInput = {
        id: 'sale-123',
        customerId: 'customer-456',
        items: [
          {
            productId: 'product-789',
            quantity: 1,
            unitPrice: 10.0,
          },
        ],
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
