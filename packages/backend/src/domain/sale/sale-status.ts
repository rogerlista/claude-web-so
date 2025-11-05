import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'

/**
 * SaleStatus type
 *
 * Represents the current status of a sale.
 *
 * - PENDING: Sale created but not completed
 * - COMPLETED: Sale successfully completed
 * - CANCELLED: Sale cancelled
 */
export type SaleStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED'

/**
 * Valid sale status values
 */
const VALID_STATUSES: readonly SaleStatus[] = ['PENDING', 'COMPLETED', 'CANCELLED']

/**
 * Type guard to check if a string is a valid SaleStatus
 *
 * @param value - String to check
 * @returns true if value is a valid SaleStatus
 */
export const isSaleStatus = (value: string): value is SaleStatus => {
  return VALID_STATUSES.includes(value as SaleStatus)
}

/**
 * Create a SaleStatus from a string
 *
 * @param value - The string value to convert to SaleStatus
 * @returns Result with SaleStatus or error message
 */
export const createSaleStatus = (value: string): Result<SaleStatus, string> => {
  const normalized = value.trim().toUpperCase()

  if (!isSaleStatus(normalized)) {
    return ResultUtils.err(
      `Invalid sale status: ${value}. Must be one of: ${VALID_STATUSES.join(', ')}`
    )
  }

  return ResultUtils.ok(normalized)
}
