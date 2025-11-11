import type { Brand, Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'

/**
 * Discount Type - Percentage or Amount
 */
export type DiscountType = 'PERCENTAGE' | 'AMOUNT'

/**
 * Discount Value Object
 *
 * Represents a discount that can be applied to a sale
 * - PERCENTAGE: discount as percentage (0-100%)
 * - AMOUNT: discount as fixed amount (must be non-negative)
 *
 * Domain invariants:
 * - Type must be either PERCENTAGE or AMOUNT
 * - Value must be a valid number (not NaN or Infinity)
 * - Percentage must be between 0 and 100
 * - Amount must be non-negative
 */
export type Discount = Brand<
  {
    readonly type: DiscountType
    readonly value: number
  },
  'Discount'
>

/**
 * Input for creating a Discount
 */
export type CreateDiscountInput = {
  readonly type: DiscountType
  readonly value: number
}

/**
 * Create a Discount value object
 *
 * @param input - Discount data
 * @returns Result with Discount or error message
 */
export const createDiscount = (input: CreateDiscountInput): Result<Discount, string> => {
  // Validate value is a valid number
  if (Number.isNaN(input.value) || !Number.isFinite(input.value)) {
    return ResultUtils.err('Discount value must be a valid number')
  }

  // Validate based on type
  if (input.type === 'PERCENTAGE') {
    if (input.value < 0 || input.value > 100) {
      return ResultUtils.err('Discount percentage must be between 0 and 100')
    }
  } else if (input.type === 'AMOUNT') {
    if (input.value < 0) {
      return ResultUtils.err('Discount amount cannot be negative')
    }
  }

  // Create immutable discount
  const discount = Object.freeze({
    type: input.type,
    value: input.value,
  }) as Discount

  return ResultUtils.ok(discount)
}
