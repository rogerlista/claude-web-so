import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import { createCPF } from '../../domain/customer/cpf'
import type { Customer } from '../../domain/customer/customer'
import { createCustomerId } from '../../domain/customer/customer-id'
import { createEmail } from '../../domain/customer/email'
import { createPhone } from '../../domain/customer/phone'
import { createCustomerRepositoryDrizzle } from './customer-repository-drizzle'

/**
 * TDD - RED Phase
 * Tests for CustomerRepository Drizzle adapter
 */

describe('CustomerRepository Drizzle Adapter', () => {
  let sqlite: Database.Database
  let db: ReturnType<typeof drizzle>
  let repository: ReturnType<typeof createCustomerRepositoryDrizzle>

  beforeEach(() => {
    sqlite = new Database(':memory:')
    db = drizzle(sqlite)

    // Create customers table
    sqlite.exec(`
      CREATE TABLE customers (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        phone TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `)

    repository = createCustomerRepositoryDrizzle(db)
  })

  describe('save', () => {
    it('should save a new customer', async () => {
      const idResult = createCustomerId('customer-123')
      const cpfResult = createCPF('123.456.789-09')

      if (!idResult.ok || !cpfResult.ok) throw new Error('Setup failed')

      const customer: Customer = {
        id: idResult.value,
        name: 'João Silva',
        cpf: cpfResult.value,
      }

      const result = await repository.save(customer)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.id).toBe('customer-123')
        expect(result.value.name).toBe('João Silva')
        expect(result.value.cpf).toBe('12345678909')
      }
    })

    it('should save a customer with email and phone', async () => {
      const idResult = createCustomerId('customer-123')
      const cpfResult = createCPF('123.456.789-09')
      const emailResult = createEmail('joao@example.com')
      const phoneResult = createPhone('11987654321')

      if (!idResult.ok || !cpfResult.ok || !emailResult.ok || !phoneResult.ok) {
        throw new Error('Setup failed')
      }

      const customer: Customer = {
        id: idResult.value,
        name: 'João Silva',
        cpf: cpfResult.value,
        email: emailResult.value,
        phone: phoneResult.value,
      }

      const result = await repository.save(customer)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.email).toBe('joao@example.com')
        expect(result.value.phone).toBe('11987654321')
      }
    })
  })

  describe('findById', () => {
    it('should find a customer by ID', async () => {
      const idResult = createCustomerId('customer-123')
      const cpfResult = createCPF('123.456.789-09')

      if (!idResult.ok || !cpfResult.ok) throw new Error('Setup failed')

      await repository.save({
        id: idResult.value,
        name: 'João Silva',
        cpf: cpfResult.value,
      })

      const result = await repository.findById(idResult.value)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.name).toBe('João Silva')
      }
    })

    it('should return NOT_FOUND for non-existent customer', async () => {
      const idResult = createCustomerId('non-existent')
      if (!idResult.ok) throw new Error('Setup failed')

      const result = await repository.findById(idResult.value)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'NOT_FOUND') {
        expect(result.error.type).toBe('NOT_FOUND')
      }
    })
  })

  describe('findByCPF', () => {
    it('should find customer by CPF', async () => {
      const idResult = createCustomerId('customer-123')
      const cpfResult = createCPF('123.456.789-09')

      if (!idResult.ok || !cpfResult.ok) throw new Error('Setup failed')

      await repository.save({
        id: idResult.value,
        name: 'João Silva',
        cpf: cpfResult.value,
      })

      const result = await repository.findByCPF('12345678909')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.name).toBe('João Silva')
      }
    })
  })

  describe('findByEmail', () => {
    it('should find customer by email', async () => {
      const idResult = createCustomerId('customer-123')
      const cpfResult = createCPF('123.456.789-09')
      const emailResult = createEmail('joao@example.com')

      if (!idResult.ok || !cpfResult.ok || !emailResult.ok) {
        throw new Error('Setup failed')
      }

      await repository.save({
        id: idResult.value,
        name: 'João Silva',
        cpf: cpfResult.value,
        email: emailResult.value,
      })

      const result = await repository.findByEmail('joao@example.com')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.email).toBe('joao@example.com')
      }
    })
  })

  describe('delete', () => {
    it('should delete a customer', async () => {
      const idResult = createCustomerId('customer-123')
      const cpfResult = createCPF('123.456.789-09')

      if (!idResult.ok || !cpfResult.ok) throw new Error('Setup failed')

      await repository.save({
        id: idResult.value,
        name: 'João Silva',
        cpf: cpfResult.value,
      })

      const deleteResult = await repository.delete(idResult.value)
      expect(deleteResult.ok).toBe(true)

      const findResult = await repository.findById(idResult.value)
      expect(findResult.ok).toBe(false)
    })
  })
})
