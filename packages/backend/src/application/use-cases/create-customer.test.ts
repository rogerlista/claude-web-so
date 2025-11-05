import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import type { Customer } from '../../domain/customer/customer'
import type { CustomerRepository, RepositoryError } from '../ports/customer-repository'
import {
  type CreateCustomerInput,
  type CreateCustomerUseCaseError,
  createCustomerUseCase,
} from './create-customer'

/**
 * TDD - RED Phase
 * Tests for CreateCustomer use case
 *
 * Business Rules:
 * - Must validate all input data
 * - Must create valid Customer entity
 * - Must save customer using repository
 * - Must handle repository errors gracefully
 * - Email and phone are optional
 */

/**
 * Mock CustomerRepository for testing
 */
const createMockRepository = (
  saveResult: Result<Customer, RepositoryError>,
): CustomerRepository => ({
  save: async () => saveResult,
  findById: async () => ResultUtils.err({ type: 'NOT_FOUND' as const, id: 'test' }),
  findAll: async () => ResultUtils.ok([]),
  delete: async () => ResultUtils.ok(undefined),
  findByCPF: async () => ResultUtils.err({ type: 'NOT_FOUND' as const, id: 'test' }),
  findByEmail: async () => ResultUtils.err({ type: 'NOT_FOUND' as const, id: 'test' }),
})

describe('CreateCustomer Use Case', () => {
  describe('createCustomerUseCase', () => {
    it('should create a customer with valid data', async () => {
      const mockRepo = createMockRepository(
        ResultUtils.ok({
          id: 'customer-123' as any,
          name: 'João Silva',
          cpf: '12345678909' as any,
        }),
      )

      const useCase = createCustomerUseCase(mockRepo)

      const input: CreateCustomerInput = {
        id: 'customer-123',
        name: 'João Silva',
        cpf: '123.456.789-09',
      }

      const result: Result<Customer, CreateCustomerUseCaseError> = await useCase(input)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.id).toBe('customer-123')
        expect(result.value.name).toBe('João Silva')
        expect(result.value.cpf).toBe('12345678909')
      }
    })

    it('should create a customer with email and phone', async () => {
      const mockRepo = createMockRepository(
        ResultUtils.ok({
          id: 'customer-123' as any,
          name: 'João Silva',
          cpf: '12345678909' as any,
          email: 'joao@example.com' as any,
          phone: '11987654321' as any,
        }),
      )

      const useCase = createCustomerUseCase(mockRepo)

      const input: CreateCustomerInput = {
        id: 'customer-123',
        name: 'João Silva',
        cpf: '123.456.789-09',
        email: 'joao@example.com',
        phone: '(11) 98765-4321',
      }

      const result = await useCase(input)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.email).toBe('joao@example.com')
        expect(result.value.phone).toBe('11987654321')
      }
    })

    it('should reject invalid customer ID', async () => {
      const mockRepo = createMockRepository(ResultUtils.ok({} as any))
      const useCase = createCustomerUseCase(mockRepo)

      const input: CreateCustomerInput = {
        id: '',
        name: 'João Silva',
        cpf: '123.456.789-09',
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'VALIDATION_ERROR') {
        expect(result.error.type).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('CustomerId')
      }
    })

    it('should reject invalid CPF', async () => {
      const mockRepo = createMockRepository(ResultUtils.ok({} as any))
      const useCase = createCustomerUseCase(mockRepo)

      const input: CreateCustomerInput = {
        id: 'customer-123',
        name: 'João Silva',
        cpf: '123.456.789-00', // Invalid check digit
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'VALIDATION_ERROR') {
        expect(result.error.type).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('CPF')
      }
    })

    it('should reject empty name', async () => {
      const mockRepo = createMockRepository(ResultUtils.ok({} as any))
      const useCase = createCustomerUseCase(mockRepo)

      const input: CreateCustomerInput = {
        id: 'customer-123',
        name: '',
        cpf: '123.456.789-09',
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'VALIDATION_ERROR') {
        expect(result.error.type).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('Name')
      }
    })

    it('should reject invalid email', async () => {
      const mockRepo = createMockRepository(ResultUtils.ok({} as any))
      const useCase = createCustomerUseCase(mockRepo)

      const input: CreateCustomerInput = {
        id: 'customer-123',
        name: 'João Silva',
        cpf: '123.456.789-09',
        email: 'invalid-email',
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'VALIDATION_ERROR') {
        expect(result.error.type).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('Email')
      }
    })

    it('should reject invalid phone', async () => {
      const mockRepo = createMockRepository(ResultUtils.ok({} as any))
      const useCase = createCustomerUseCase(mockRepo)

      const input: CreateCustomerInput = {
        id: 'customer-123',
        name: 'João Silva',
        cpf: '123.456.789-09',
        phone: '123', // Too short
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'VALIDATION_ERROR') {
        expect(result.error.type).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('Phone')
      }
    })

    it('should handle repository errors', async () => {
      const mockRepo = createMockRepository(
        ResultUtils.err({ type: 'DATABASE_ERROR' as const, message: 'Connection failed' }),
      )

      const useCase = createCustomerUseCase(mockRepo)

      const input: CreateCustomerInput = {
        id: 'customer-123',
        name: 'João Silva',
        cpf: '123.456.789-09',
      }

      const result = await useCase(input)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'REPOSITORY_ERROR') {
        expect(result.error.type).toBe('REPOSITORY_ERROR')
        expect(result.error.repositoryError.type).toBe('DATABASE_ERROR')
      }
    })

    it('should handle duplicate customer error', async () => {
      const mockRepo = createMockRepository(
        ResultUtils.err({ type: 'DUPLICATE' as const, id: 'customer-123' }),
      )

      const useCase = createCustomerUseCase(mockRepo)

      const input: CreateCustomerInput = {
        id: 'customer-123',
        name: 'João Silva',
        cpf: '123.456.789-09',
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
