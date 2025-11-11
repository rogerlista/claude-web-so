import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import type { ProductId } from '../product/product-id'
import type { InventoryId } from './inventory-id'
import type { InventoryMovementType } from './inventory-movement-type'
import type { Quantity } from './quantity'

/**
 * InventoryMovement Entity
 *
 * Represents a stock movement (in, out, or adjustment)
 *
 * Domain invariants:
 * - Must have id, productId, quantity, type, and date
 * - Description is optional
 * - All fields are immutable (readonly)
 */
export type InventoryMovement = {
  readonly id: InventoryId
  readonly productId: ProductId
  readonly quantity: Quantity
  readonly type: InventoryMovementType
  readonly date: Date
  readonly description?: string
}

/**
 * Input for creating an InventoryMovement
 */
export type CreateInventoryMovementInput = {
  readonly id: InventoryId
  readonly productId: ProductId
  readonly quantity: Quantity
  readonly type: InventoryMovementType
  readonly date: Date
  readonly description?: string
}

/**
 * Create an InventoryMovement entity
 *
 * @param input - InventoryMovement data
 * @returns Result with InventoryMovement
 */
export const createInventoryMovement = (
  input: CreateInventoryMovementInput
): Result<InventoryMovement, string> => {
  // Process description: trim and treat empty as undefined
  const trimmedDescription = input.description?.trim()
  const description =
    trimmedDescription && trimmedDescription.length > 0 ? trimmedDescription : undefined

  // Create immutable inventory movement
  const movement: InventoryMovement = {
    id: input.id,
    productId: input.productId,
    quantity: input.quantity,
    type: input.type,
    date: input.date,
    ...(description !== undefined && { description }),
  }

  return ResultUtils.ok(movement)
}
