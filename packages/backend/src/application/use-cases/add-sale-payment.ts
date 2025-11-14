import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import { createPaymentMethod } from '../../domain/sale/payment-method'
import { type Sale, addPaymentToSale } from '../../domain/sale/sale'
import { createSaleId } from '../../domain/sale/sale-id'
import { createSalePayment } from '../../domain/sale/sale-payment'
import type { RepositoryError, SaleRepository } from '../ports/sale-repository'

/**
 * AddSalePayment Use Case
 *
 * Adds a payment to an existing sale.
 */

export type AddSalePaymentInput = {
  readonly saleId: string
  readonly paymentMethodCode: string
  readonly amount: number
}

export type AddSalePaymentUseCaseError =
  | { readonly type: 'VALIDATION_ERROR'; readonly message: string }
  | { readonly type: 'REPOSITORY_ERROR'; readonly repositoryError: RepositoryError }
  | { readonly type: 'SALE_NOT_FOUND'; readonly saleId: string }

export type AddSalePaymentUseCase = (
  input: AddSalePaymentInput
) => Promise<Result<Sale, AddSalePaymentUseCaseError>>

export const createAddSalePaymentUseCase =
  (repository: SaleRepository): AddSalePaymentUseCase =>
  async (input: AddSalePaymentInput): Promise<Result<Sale, AddSalePaymentUseCaseError>> => {
    // Validate SaleId
    const saleIdResult = createSaleId(input.saleId)
    if (!saleIdResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `SaleId validation failed: ${saleIdResult.error}`,
      })
    }

    // Load existing sale
    const findResult = await repository.findById(saleIdResult.value)
    if (!findResult.ok) {
      if (findResult.error.type === 'NOT_FOUND') {
        return ResultUtils.err({
          type: 'SALE_NOT_FOUND',
          saleId: input.saleId,
        })
      }
      return ResultUtils.err({
        type: 'REPOSITORY_ERROR',
        repositoryError: findResult.error,
      })
    }

    const sale = findResult.value

    // Validate PaymentMethod
    const paymentMethodResult = createPaymentMethod(input.paymentMethodCode)
    if (!paymentMethodResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `Payment method validation failed: ${paymentMethodResult.error}`,
      })
    }

    // Create SalePayment
    const paymentResult = createSalePayment({
      paymentMethod: paymentMethodResult.value,
      amount: input.amount,
    })

    if (!paymentResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `Payment validation failed: ${paymentResult.error}`,
      })
    }

    // Add payment to sale
    const updatedSaleResult = addPaymentToSale(sale, paymentResult.value)
    if (!updatedSaleResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `Failed to add payment to sale: ${updatedSaleResult.error}`,
      })
    }

    // Save updated sale
    const saveResult = await repository.save(updatedSaleResult.value)
    if (!saveResult.ok) {
      return ResultUtils.err({
        type: 'REPOSITORY_ERROR',
        repositoryError: saveResult.error,
      })
    }

    return ResultUtils.ok(saveResult.value)
  }
