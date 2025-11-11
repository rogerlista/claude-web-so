import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type {
  CustomerRepository,
  RepositoryError,
} from '../../application/ports/customer-repository'
import { createCPF } from '../../domain/customer/cpf'
import type { Customer } from '../../domain/customer/customer'
import type { CustomerId } from '../../domain/customer/customer-id'
import { createCustomerId } from '../../domain/customer/customer-id'
import type { Email } from '../../domain/customer/email'
import { createEmail } from '../../domain/customer/email'
import type { Phone } from '../../domain/customer/phone'
import { createPhone } from '../../domain/customer/phone'
import { type CustomerRow, customers } from '../database/schema'

/**
 * CustomerRepository Drizzle Adapter
 *
 * Concrete implementation of CustomerRepository using Drizzle ORM.
 * Maps between domain models and database models.
 */

/**
 * Map domain Customer to database CustomerRow (for insert/update)
 */
const customerToRow = (customer: Customer): typeof customers.$inferInsert => ({
  id: customer.id as string,
  name: customer.name,
  cpf: customer.cpf as string,
  email: customer.email as string | undefined,
  phone: customer.phone as string | undefined,
})

/**
 * Map database CustomerRow to domain Customer
 */
const rowToCustomer = (row: CustomerRow): Result<Customer, string> => {
  const idResult = createCustomerId(row.id)
  /* c8 ignore start */
  if (!idResult.ok) {
    return ResultUtils.err(`Invalid CustomerId in database: ${idResult.error}`)
  }
  /* c8 ignore stop */

  const cpfResult = createCPF(row.cpf)
  /* c8 ignore start */
  if (!cpfResult.ok) {
    return ResultUtils.err(`Invalid CPF in database: ${cpfResult.error}`)
  }
  /* c8 ignore stop */

  let email: Email | undefined
  if (row.email !== null && row.email !== undefined) {
    const emailResult = createEmail(row.email)
    /* c8 ignore start */
    if (!emailResult.ok) {
      return ResultUtils.err(`Invalid Email in database: ${emailResult.error}`)
    }
    /* c8 ignore stop */
    email = emailResult.value
  }

  let phone: Phone | undefined
  if (row.phone !== null && row.phone !== undefined) {
    const phoneResult = createPhone(row.phone)
    /* c8 ignore start */
    if (!phoneResult.ok) {
      return ResultUtils.err(`Invalid Phone in database: ${phoneResult.error}`)
    }
    /* c8 ignore stop */
    phone = phoneResult.value
  }

  return ResultUtils.ok({
    id: idResult.value,
    name: row.name,
    cpf: cpfResult.value,
    ...(email !== undefined && { email }),
    ...(phone !== undefined && { phone }),
  })
}

/**
 * Create CustomerRepository implementation using Drizzle
 */
export const createCustomerRepositoryDrizzle = (
  db: BetterSQLite3Database<Record<string, unknown>>
): CustomerRepository => ({
  save: async (customer: Customer): Promise<Result<Customer, RepositoryError>> => {
    try {
      const row = customerToRow(customer)

      await db
        .insert(customers)
        .values(row)
        .onConflictDoUpdate({
          target: customers.id,
          set: {
            name: row.name,
            cpf: row.cpf,
            email: row.email,
            phone: row.phone,
            updatedAt: new Date(),
          },
        })

      return ResultUtils.ok(customer)
      /* c8 ignore start */
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      /* c8 ignore stop */
    }
  },

  findById: async (id: CustomerId): Promise<Result<Customer, RepositoryError>> => {
    try {
      const rows = await db
        .select()
        .from(customers)
        .where(eq(customers.id, id as string))

      const row = rows[0]
      if (row === undefined) {
        return ResultUtils.err({
          type: 'NOT_FOUND',
          id: id as string,
        })
      }

      const customerResult = rowToCustomer(row)
      /* c8 ignore start */
      if (!customerResult.ok) {
        return ResultUtils.err({
          type: 'DATABASE_ERROR',
          message: customerResult.error,
        })
      }
      /* c8 ignore stop */

      return ResultUtils.ok(customerResult.value)
      /* c8 ignore start */
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      /* c8 ignore stop */
    }
  },

  findAll: async (): Promise<Result<readonly Customer[], RepositoryError>> => {
    try {
      const rows = await db.select().from(customers)

      const customerResults = rows.map(rowToCustomer)

      // Check if any conversion failed
      /* c8 ignore start */
      const failedResult = customerResults.find((r) => !r.ok)
      if (failedResult && !failedResult.ok) {
        return ResultUtils.err({
          type: 'DATABASE_ERROR',
          message: failedResult.error,
        })
      }
      /* c8 ignore stop */

      const customerList = customerResults
        .filter((r): r is { ok: true; value: Customer } => r.ok)
        .map((r) => r.value)

      return ResultUtils.ok(customerList)
      /* c8 ignore start */
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      /* c8 ignore stop */
    }
  },

  delete: async (id: CustomerId): Promise<Result<void, RepositoryError>> => {
    try {
      const findResult = await db
        .select()
        .from(customers)
        .where(eq(customers.id, id as string))

      if (findResult[0] === undefined) {
        return ResultUtils.err({
          type: 'NOT_FOUND',
          id: id as string,
        })
      }

      await db.delete(customers).where(eq(customers.id, id as string))

      return ResultUtils.ok(undefined)
      /* c8 ignore start */
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      /* c8 ignore stop */
    }
  },

  findByCPF: async (cpf: string): Promise<Result<Customer, RepositoryError>> => {
    try {
      const rows = await db.select().from(customers).where(eq(customers.cpf, cpf))

      const row = rows[0]
      if (row === undefined) {
        return ResultUtils.err({
          type: 'NOT_FOUND',
          id: cpf,
        })
      }

      const customerResult = rowToCustomer(row)
      /* c8 ignore start */
      if (!customerResult.ok) {
        return ResultUtils.err({
          type: 'DATABASE_ERROR',
          message: customerResult.error,
        })
      }
      /* c8 ignore stop */

      return ResultUtils.ok(customerResult.value)
      /* c8 ignore start */
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      /* c8 ignore stop */
    }
  },

  findByEmail: async (email: string): Promise<Result<Customer, RepositoryError>> => {
    try {
      const rows = await db.select().from(customers).where(eq(customers.email, email))

      const row = rows[0]
      if (row === undefined) {
        return ResultUtils.err({
          type: 'NOT_FOUND',
          id: email,
        })
      }

      const customerResult = rowToCustomer(row)
      /* c8 ignore start */
      if (!customerResult.ok) {
        return ResultUtils.err({
          type: 'DATABASE_ERROR',
          message: customerResult.error,
        })
      }
      /* c8 ignore stop */

      return ResultUtils.ok(customerResult.value)
      /* c8 ignore start */
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
      /* c8 ignore stop */
    }
  },
})
