import type { Result } from '@pos-nfce/shared'
import type { InventoryId } from '../../domain/inventory/inventory-id'
import type { InventoryMovement } from '../../domain/inventory/inventory-movement'
import type { Quantity } from '../../domain/inventory/quantity'
import type { ProductId } from '../../domain/product/product-id'

/**
 * Repository errors
 */
export type RepositoryError =
  | { readonly type: 'NOT_FOUND'; readonly id: string }
  | { readonly type: 'DUPLICATE'; readonly field: string; readonly value: string }
  | { readonly type: 'UNKNOWN'; readonly message: string }

/**
 * Stock information for a product
 */
export type StockInfo = {
  readonly productId: ProductId
  readonly currentQuantity: Quantity
  readonly lastMovementDate?: Date
}

/**
 * InventoryRepository Port
 *
 * Defines the interface for inventory persistence operations
 */
export type InventoryRepository = {
  /**
   * Save an inventory movement
   */
  readonly saveMovement: (
    movement: InventoryMovement
  ) => Promise<Result<InventoryMovement, RepositoryError>>

  /**
   * Get current stock for a product
   */
  readonly getStock: (productId: ProductId) => Promise<Result<StockInfo, RepositoryError>>

  /**
   * List all movements for a product
   */
  readonly listMovements: (
    productId: ProductId
  ) => Promise<Result<readonly InventoryMovement[], RepositoryError>>

  /**
   * Find movement by ID
   */
  readonly findById: (id: InventoryId) => Promise<Result<InventoryMovement, RepositoryError>>
}
