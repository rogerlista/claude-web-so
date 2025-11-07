import type { Brand, Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'

/**
 * Price - Branded type for monetary values
 *
 * Domain Rules:
 * - Must be greater than zero (positive)
 * - Must have at most 2 decimal places
 * - Cannot be NaN or Infinity
 */
export type Price = Brand<number, 'Price'>

/**
 * Create a Price from a number
 *
 * @param value - The number value to convert to Price
 * @returns Result with Price or error message
 */
export const createPrice = (value: number): Result<Price, string> => {
  // Validate that value is a valid number
  if (!Number.isFinite(value)) {
    return ResultUtils.err('Price must be a valid number')
  }

  // Validate positive (greater than zero)
  if (value <= 0) {
    return ResultUtils.err('Price must be greater than zero')
  }

  // Validate decimal places (at most 2)
  // Check if multiplying by 100 results in an integer (allowing for floating point precision)
  const multiplied = value * 100
  const hasMoreThan2Decimals = Math.abs(multiplied - Math.round(multiplied)) > 0.0001

  if (hasMoreThan2Decimals) {
    return ResultUtils.err('Price cannot have more than 2 decimal places')
  }

  // Round to 2 decimal places to handle floating point precision issues
  const rounded = Math.round(value * 100) / 100

  return ResultUtils.ok(rounded as Price)
}
