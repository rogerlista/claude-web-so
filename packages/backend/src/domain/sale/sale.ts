import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import type { CustomerId } from '../customer/customer-id'
import type { SaleId } from './sale-id'
import type { SaleItem } from './sale-item'
import type { SaleStatus } from './sale-status'

/**
 * Sale Entity
 *
 * Domain invariants:
 * - Must have id, customerId, and at least one item
 * - Total is calculated from items
 * - Status defaults to PENDING
 * - CreatedAt is set automatically if not provided
 * - All fields are immutable
 */
export type Sale = {
  readonly id: SaleId
  readonly customerId: CustomerId
  readonly items: readonly SaleItem[]
  readonly total: number
  readonly status: SaleStatus
  readonly createdAt: Date
}

/**
 * Input for creating a Sale
 */
export type CreateSaleInput = {
  readonly id: SaleId
  readonly customerId: CustomerId
  readonly items: readonly SaleItem[]
  readonly status?: SaleStatus
  readonly createdAt?: Date
}

/**
 * Create a Sale entity
 *
 * @param input - Sale data
 * @returns Result with Sale or error message
 */
export const createSale = (input: CreateSaleInput): Result<Sale, string> => {
  // Validate items array is not empty
  if (input.items.length === 0) {
    return ResultUtils.err('Sale must have at least one item')
  }

  // Calculate total from items
  const total = input.items.reduce((sum, item) => {
    return Math.round((sum + item.total) * 100) / 100
  }, 0)

  // Create immutable sale
  const sale: Sale = {
    id: input.id,
    customerId: input.customerId,
    items: input.items,
    total,
    status: input.status ?? 'PENDING',
    createdAt: input.createdAt ?? new Date(),
  }

  return ResultUtils.ok(sale)
}
