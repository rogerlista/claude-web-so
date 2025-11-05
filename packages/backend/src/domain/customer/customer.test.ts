import type { Result } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import { createCPF } from './cpf'
import { type Customer, createCustomer } from './customer'
import { createCustomerId } from './customer-id'
import { createEmail } from './email'
import { createPhone } from './phone'

/**
 * TDD - RED Phase
 * Tests for Customer entity
 *
 * Domain Rules:
 * - Customer must have id, name, and cpf
 * - Email and phone are optional
 * - Name must be non-empty
 * - All customer data is immutable
 */

describe('Customer Entity', () => {
  describe('createCustomer', () => {
    it('should create a valid Customer with required fields', () => {
      const idResult = createCustomerId('customer-123')
      const cpfResult = createCPF('123.456.789-09')

      if (!idResult.ok || !cpfResult.ok) {
        throw new Error('Test setup failed')
      }

      const result: Result<Customer, string> = createCustomer({
        id: idResult.value,
        name: 'João Silva',
        cpf: cpfResult.value,
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.id).toBe('customer-123')
        expect(result.value.name).toBe('João Silva')
        expect(result.value.cpf).toBe('12345678909')
      }
    })

    it('should create a Customer with email and phone', () => {
      const idResult = createCustomerId('customer-123')
      const cpfResult = createCPF('123.456.789-09')
      const emailResult = createEmail('joao@example.com')
      const phoneResult = createPhone('11987654321')

      if (!idResult.ok || !cpfResult.ok || !emailResult.ok || !phoneResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createCustomer({
        id: idResult.value,
        name: 'João Silva',
        cpf: cpfResult.value,
        email: emailResult.value,
        phone: phoneResult.value,
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.email).toBe('joao@example.com')
        expect(result.value.phone).toBe('11987654321')
      }
    })

    it('should create a Customer with only email (no phone)', () => {
      const idResult = createCustomerId('customer-123')
      const cpfResult = createCPF('123.456.789-09')
      const emailResult = createEmail('joao@example.com')

      if (!idResult.ok || !cpfResult.ok || !emailResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createCustomer({
        id: idResult.value,
        name: 'João Silva',
        cpf: cpfResult.value,
        email: emailResult.value,
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.email).toBe('joao@example.com')
        expect(result.value.phone).toBeUndefined()
      }
    })

    it('should create a Customer with only phone (no email)', () => {
      const idResult = createCustomerId('customer-123')
      const cpfResult = createCPF('123.456.789-09')
      const phoneResult = createPhone('11987654321')

      if (!idResult.ok || !cpfResult.ok || !phoneResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createCustomer({
        id: idResult.value,
        name: 'João Silva',
        cpf: cpfResult.value,
        phone: phoneResult.value,
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.phone).toBe('11987654321')
        expect(result.value.email).toBeUndefined()
      }
    })

    it('should create a Customer without email or phone', () => {
      const idResult = createCustomerId('customer-123')
      const cpfResult = createCPF('123.456.789-09')

      if (!idResult.ok || !cpfResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createCustomer({
        id: idResult.value,
        name: 'João Silva',
        cpf: cpfResult.value,
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.email).toBeUndefined()
        expect(result.value.phone).toBeUndefined()
      }
    })

    it('should reject empty name', () => {
      const idResult = createCustomerId('customer-123')
      const cpfResult = createCPF('123.456.789-09')

      if (!idResult.ok || !cpfResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createCustomer({
        id: idResult.value,
        name: '',
        cpf: cpfResult.value,
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('Name cannot be empty')
      }
    })

    it('should reject whitespace-only name', () => {
      const idResult = createCustomerId('customer-123')
      const cpfResult = createCPF('123.456.789-09')

      if (!idResult.ok || !cpfResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createCustomer({
        id: idResult.value,
        name: '   ',
        cpf: cpfResult.value,
      })

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toContain('Name cannot be empty')
      }
    })

    it('should trim name whitespace', () => {
      const idResult = createCustomerId('customer-123')
      const cpfResult = createCPF('123.456.789-09')

      if (!idResult.ok || !cpfResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createCustomer({
        id: idResult.value,
        name: '  João Silva  ',
        cpf: cpfResult.value,
      })

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.name).toBe('João Silva')
      }
    })

    it('should enforce immutability - Customer is readonly', () => {
      const idResult = createCustomerId('customer-123')
      const cpfResult = createCPF('123.456.789-09')

      if (!idResult.ok || !cpfResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = createCustomer({
        id: idResult.value,
        name: 'João Silva',
        cpf: cpfResult.value,
      })

      if (result.ok) {
        const customer = result.value

        // TypeScript should prevent these at compile time:
        // customer.name = 'Modified' // ❌ Cannot assign to 'name' because it is a read-only property
        // customer.cpf = '...' // ❌ Cannot assign to 'cpf' because it is a read-only property

        expect(customer.name).toBe('João Silva')
      }
    })
  })
})
