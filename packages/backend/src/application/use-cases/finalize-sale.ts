import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import { type Sale, finalizeSale as finalizeSaleDomain } from '../../domain/sale/sale'
import { createSaleId } from '../../domain/sale/sale-id'
import type { RepositoryError, SaleRepository } from '../ports/sale-repository'

/**
 * FinalizeSale Use Case
 *
 * Finalizes a sale (changes status to COMPLETED).
 * Validates that the sale has items and is fully paid.
 */

export type FinalizeSaleInput = {
  readonly saleId: string
}

export type FinalizeSaleUseCaseError =
  | { readonly type: 'VALIDATION_ERROR'; readonly message: string }
  | { readonly type: 'REPOSITORY_ERROR'; readonly repositoryError: RepositoryError }
  | { readonly type: 'SALE_NOT_FOUND'; readonly saleId: string }

export type FinalizeSaleUseCase = (
  input: FinalizeSaleInput
) => Promise<Result<Sale, FinalizeSaleUseCaseError>>

export const createFinalizeSaleUseCase =
  (repository: SaleRepository): FinalizeSaleUseCase =>
  async (input: FinalizeSaleInput): Promise<Result<Sale, FinalizeSaleUseCaseError>> => {
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

    // Finalize sale (domain validation happens here)
    const finalizedSaleResult = finalizeSaleDomain(sale)
    if (!finalizedSaleResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `Failed to finalize sale: ${finalizedSaleResult.error}`,
      })
    }

    // Save finalized sale
    const saveResult = await repository.save(finalizedSaleResult.value)
    if (!saveResult.ok) {
      return ResultUtils.err({
        type: 'REPOSITORY_ERROR',
        repositoryError: saveResult.error,
      })
    }

    return ResultUtils.ok(saveResult.value)
  }
