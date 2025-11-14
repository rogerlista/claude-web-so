import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import { createInventoryId } from '../../domain/inventory/inventory-id'
import type { InventoryMovement } from '../../domain/inventory/inventory-movement'
import { createInventoryMovement } from '../../domain/inventory/inventory-movement'
import { createQuantity } from '../../domain/inventory/quantity'
import { createProductId } from '../../domain/product/product-id'
import type { InventoryRepository } from '../ports/inventory-repository'

/**
 * Register Stock Exit Use Case
 *
 * Validates stock availability before registering an exit movement.
 * Ensures that exits don't exceed available stock.
 */

export type RegisterStockExitInput = {
  readonly id: string
  readonly productId: string
  readonly quantity: number
  readonly description?: string
}

export type RegisterStockExitError =
  | { readonly type: 'VALIDATION_ERROR'; readonly message: string }
  | { readonly type: 'INSUFFICIENT_STOCK'; readonly available: number; readonly requested: number }
  | { readonly type: 'NO_STOCK'; readonly productId: string }
  | { readonly type: 'REPOSITORY_ERROR'; readonly message: string }

export type RegisterStockExitUseCase = (
  input: RegisterStockExitInput
) => Promise<Result<InventoryMovement, RegisterStockExitError>>

/**
 * Creates the register stock exit use case
 *
 * @param repository - Inventory repository
 * @returns Use case function
 */
export const registerStockExitUseCase =
  (repository: InventoryRepository): RegisterStockExitUseCase =>
  async (
    input: RegisterStockExitInput
  ): Promise<Result<InventoryMovement, RegisterStockExitError>> => {
    // Step 1: Validate and create InventoryId
    const inventoryIdResult = createInventoryId(input.id)
    if (!inventoryIdResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `InventoryId validation failed: ${inventoryIdResult.error}`,
      })
    }

    // Step 2: Validate and create ProductId
    const productIdResult = createProductId(input.productId)
    if (!productIdResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `ProductId validation failed: ${productIdResult.error}`,
      })
    }

    // Step 3: Validate and create Quantity
    const quantityResult = createQuantity(input.quantity)
    if (!quantityResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `Quantity validation failed: ${quantityResult.error}`,
      })
    }

    // Step 4: Check current stock availability
    const stockResult = await repository.getStock(productIdResult.value)

    if (!stockResult.ok) {
      // If stock not found, product has no movements yet
      if (stockResult.error.type === 'NOT_FOUND') {
        return ResultUtils.err({
          type: 'NO_STOCK',
          productId: input.productId,
        })
      }

      // Other repository errors
      return ResultUtils.err({
        type: 'REPOSITORY_ERROR',
        message: 'Failed to check stock availability',
      })
    }

    // Step 5: Validate sufficient stock
    const currentStock = stockResult.value.currentQuantity
    const requestedQuantity = quantityResult.value

    if (currentStock < requestedQuantity) {
      return ResultUtils.err({
        type: 'INSUFFICIENT_STOCK',
        available: currentStock,
        requested: requestedQuantity,
      })
    }

    // Step 6: Create exit movement
    const movementResult = createInventoryMovement({
      id: inventoryIdResult.value,
      productId: productIdResult.value,
      quantity: quantityResult.value,
      type: 'saida',
      date: new Date(),
      ...(input.description && { description: input.description }),
    })

    if (!movementResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `Failed to create movement: ${movementResult.error}`,
      })
    }

    // Step 7: Save movement
    const saveResult = await repository.saveMovement(movementResult.value)

    if (!saveResult.ok) {
      return ResultUtils.err({
        type: 'REPOSITORY_ERROR',
        message: 'Failed to save movement',
      })
    }

    return ResultUtils.ok(saveResult.value)
  }
