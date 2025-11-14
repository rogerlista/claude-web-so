import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import type { Price } from '../product/price'
import { createPrice } from '../product/price'
import type { PaymentMethod } from './payment-method'

/**
 * SalePayment value object
 *
 * Represents a payment made for a sale.
 *
 * Domain invariants:
 * - Must have paymentMethod and amount
 * - Amount must be positive
 * - All fields are immutable
 */
export type SalePayment = {
  readonly paymentMethod: PaymentMethod
  readonly amount: Price
}

/**
 * Input for creating a SalePayment
 */
export type CreateSalePaymentInput = {
  readonly paymentMethod: PaymentMethod
  readonly amount: number
}

/**
 * Create a SalePayment
 *
 * @param input - SalePayment data
 * @returns Result with SalePayment or error message
 */
export const createSalePayment = (input: CreateSalePaymentInput): Result<SalePayment, string> => {
  // Validate amount is positive using Price validation
  const amountResult = createPrice(input.amount)
  if (!amountResult.ok) {
    return ResultUtils.err(`Payment amount validation failed: ${amountResult.error}`)
  }

  // Create immutable sale payment
  const salePayment: SalePayment = {
    paymentMethod: input.paymentMethod,
    amount: amountResult.value,
  }

  return ResultUtils.ok(salePayment)
}
