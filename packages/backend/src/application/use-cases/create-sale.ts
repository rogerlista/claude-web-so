import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import { createCustomerId } from '../../domain/customer/customer-id'
import { createPrice } from '../../domain/product/price'
import { createProductId } from '../../domain/product/product-id'
import { type Sale, createSale } from '../../domain/sale/sale'
import { createSaleId } from '../../domain/sale/sale-id'
import { type SaleItem, createSaleItem } from '../../domain/sale/sale-item'
import { type SaleStatus, createSaleStatus } from '../../domain/sale/sale-status'
import type { RepositoryError, SaleRepository } from '../ports/sale-repository'

/**
 * CreateSale Use Case
 *
 * Application layer use case for creating a new sale.
 * Follows Clean Architecture and functional programming principles.
 *
 * Responsibilities:
 * - Validate raw input data
 * - Create domain value objects
 * - Create sale items
 * - Create sale entity
 * - Orchestrate repository save operation
 * - Handle errors gracefully
 */

/**
 * Input for creating a sale item (raw data from presentation layer)
 */
export type CreateSaleItemInput = {
  readonly productId: string
  readonly quantity: number
  readonly unitPrice: number
}

/**
 * Input for creating a sale (raw data from presentation layer)
 */
export type CreateSaleInput = {
  readonly id: string
  readonly customerId: string
  readonly items: readonly CreateSaleItemInput[]
  readonly status?: string
  readonly createdAt?: Date
}

/**
 * Use case error types
 */
export type CreateSaleUseCaseError =
  | { readonly type: 'VALIDATION_ERROR'; readonly message: string }
  | { readonly type: 'REPOSITORY_ERROR'; readonly repositoryError: RepositoryError }

/**
 * CreateSale use case function type
 */
export type CreateSaleUseCase = (
  input: CreateSaleInput
) => Promise<Result<Sale, CreateSaleUseCaseError>>

/**
 * Create the CreateSale use case
 *
 * Factory function that creates a use case with injected dependencies.
 * This enables dependency injection and testability.
 *
 * @param repository - SaleRepository implementation
 * @returns Use case function
 */
export const createSaleUseCase =
  (repository: SaleRepository): CreateSaleUseCase =>
  async (input: CreateSaleInput): Promise<Result<Sale, CreateSaleUseCaseError>> => {
    // Step 1: Validate and create SaleId
    const saleIdResult = createSaleId(input.id)
    if (!saleIdResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `SaleId validation failed: ${saleIdResult.error}`,
      })
    }

    // Step 2: Validate and create CustomerId
    const customerIdResult = createCustomerId(input.customerId)
    if (!customerIdResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `CustomerId validation failed: ${customerIdResult.error}`,
      })
    }

    // Step 3: Validate items array is not empty
    if (input.items.length === 0) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: 'Sale must have at least one item',
      })
    }

    // Step 4: Validate and create SaleItems
    const saleItems: SaleItem[] = []

    for (let i = 0; i < input.items.length; i++) {
      const itemInput = input.items[i]
      if (!itemInput) {
        continue
      }

      // Validate ProductId
      const productIdResult = createProductId(itemInput.productId)
      if (!productIdResult.ok) {
        return ResultUtils.err({
          type: 'VALIDATION_ERROR',
          message: `ProductId validation failed for item ${i}: ${productIdResult.error}`,
        })
      }

      // Validate Price (unitPrice)
      const priceResult = createPrice(itemInput.unitPrice)
      if (!priceResult.ok) {
        return ResultUtils.err({
          type: 'VALIDATION_ERROR',
          message: `Price validation failed for item ${i}: ${priceResult.error}`,
        })
      }

      // Create SaleItem
      const saleItemResult = createSaleItem({
        productId: productIdResult.value,
        quantity: itemInput.quantity,
        unitPrice: priceResult.value,
      })

      if (!saleItemResult.ok) {
        return ResultUtils.err({
          type: 'VALIDATION_ERROR',
          message: `SaleItem validation failed for item ${i}: ${saleItemResult.error}`,
        })
      }

      saleItems.push(saleItemResult.value)
    }

    // Step 5: Validate and create SaleStatus (if provided)
    let status: SaleStatus | undefined
    if (input.status !== undefined) {
      const statusResult = createSaleStatus(input.status)
      if (!statusResult.ok) {
        return ResultUtils.err({
          type: 'VALIDATION_ERROR',
          message: `Sale status validation failed: ${statusResult.error}`,
        })
      }
      status = statusResult.value
    }

    // Step 6: Create Sale entity
    const saleResult = createSale({
      id: saleIdResult.value,
      customerId: customerIdResult.value,
      items: saleItems,
      ...(status !== undefined && { status }),
      ...(input.createdAt !== undefined && { createdAt: input.createdAt }),
    })

    if (!saleResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `Sale validation failed: ${saleResult.error}`,
      })
    }

    // Step 7: Save sale using repository
    const saveResult = await repository.save(saleResult.value)

    if (!saveResult.ok) {
      return ResultUtils.err({
        type: 'REPOSITORY_ERROR',
        repositoryError: saveResult.error,
      })
    }

    // Step 8: Return saved sale
    return ResultUtils.ok(saveResult.value)
  }
