import type { Brand, Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'

/**
 * Quantity - Branded type for stock quantities
 *
 * Domain Rules:
 * - Must be non-negative (>= 0)
 * - Must have at most 4 decimal places (for precision)
 * - Cannot be NaN or Infinity
 */
export type Quantity = Brand<number, 'Quantity'>

/**
 * Create a Quantity from a number
 *
 * @param value - The number value to convert to Quantity
 * @returns Result with Quantity or error message
 */
export const createQuantity = (value: number): Result<Quantity, string> => {
  // Validate that value is a valid number
  if (!Number.isFinite(value)) {
    return ResultUtils.err('Quantity must be a valid number')
  }

  // Validate non-negative (>= 0)
  if (value < 0) {
    return ResultUtils.err('Quantity must be non-negative')
  }

  // Validate decimal places (at most 4)
  // Check if multiplying by 10000 results in an integer (allowing for floating point precision)
  const multiplied = value * 10000
  const hasMoreThan4Decimals = Math.abs(multiplied - Math.round(multiplied)) > 0.0001

  if (hasMoreThan4Decimals) {
    return ResultUtils.err('Quantity cannot have more than 4 decimal places')
  }

  // Round to 4 decimal places to handle floating point precision issues
  const rounded = Math.round(value * 10000) / 10000

  return ResultUtils.ok(rounded as Quantity)
}
