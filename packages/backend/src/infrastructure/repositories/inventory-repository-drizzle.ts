import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import { desc, eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type {
  InventoryRepository,
  RepositoryError,
  StockInfo,
} from '../../application/ports/inventory-repository'
import { createInventoryId } from '../../domain/inventory/inventory-id'
import type { InventoryId } from '../../domain/inventory/inventory-id'
import type { InventoryMovement } from '../../domain/inventory/inventory-movement'
import { createInventoryMovement } from '../../domain/inventory/inventory-movement'
import type { InventoryMovementType } from '../../domain/inventory/inventory-movement-type'
import { createQuantity } from '../../domain/inventory/quantity'
import { createProductId } from '../../domain/product/product-id'
import type { ProductId } from '../../domain/product/product-id'
import { type InventoryInsert, type InventoryRow, inventory } from '../database/schema'

/**
 * Convert domain Quantity to database integer (multiply by 10000 for 4 decimal precision)
 */
const quantityToDb = (quantity: number): number => {
  return Math.round(quantity * 10000)
}

/**
 * Convert database integer to domain Quantity (divide by 10000)
 */
const quantityFromDb = (dbValue: number): number => {
  return dbValue / 10000
}

/**
 * Convert database row to domain InventoryMovement
 */
const rowToMovement = (row: InventoryRow): Result<InventoryMovement, string> => {
  const idResult = createInventoryId(row.id)
  const productIdResult = createProductId(row.productId)
  const quantityResult = createQuantity(quantityFromDb(row.quantity))

  /* c8 ignore start */
  if (!idResult.ok) {
    return ResultUtils.err(`Invalid InventoryId: ${idResult.error}`)
  }

  if (!productIdResult.ok) {
    return ResultUtils.err(`Invalid ProductId: ${productIdResult.error}`)
  }

  if (!quantityResult.ok) {
    return ResultUtils.err(`Invalid Quantity: ${quantityResult.error}`)
  }
  /* c8 ignore stop */

  return createInventoryMovement({
    id: idResult.value,
    productId: productIdResult.value,
    quantity: quantityResult.value,
    type: row.movementType as InventoryMovementType,
    date: row.movementDate,
    ...(row.description && { description: row.description }),
  })
}

/**
 * Drizzle implementation of InventoryRepository
 */
export const createInventoryRepositoryDrizzle = (
  // biome-ignore lint/suspicious/noExplicitAny: Drizzle schema type is complex
  db: BetterSQLite3Database<any>
): InventoryRepository => {
  return {
    /**
     * Save an inventory movement
     */
    saveMovement: async (
      movement: InventoryMovement
    ): Promise<Result<InventoryMovement, RepositoryError>> => {
      try {
        const insertData: InventoryInsert = {
          id: movement.id,
          productId: movement.productId,
          quantity: quantityToDb(movement.quantity),
          movementType: movement.type,
          movementDate: movement.date,
          description: movement.description,
        }

        await db.insert(inventory).values(insertData)

        return ResultUtils.ok(movement)
        /* c8 ignore start */
      } catch (error) {
        // Handle duplicate key error
        if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
          return ResultUtils.err({
            type: 'DUPLICATE',
            field: 'id',
            value: movement.id,
          })
        }

        // Handle foreign key error
        if (error instanceof Error && error.message.includes('FOREIGN KEY constraint failed')) {
          return ResultUtils.err({
            type: 'UNKNOWN',
            message: `Product not found: ${movement.productId}`,
          })
        }

        return ResultUtils.err({
          type: 'UNKNOWN',
          message: error instanceof Error ? error.message : 'Unknown database error',
        })
        /* c8 ignore stop */
      }
    },

    /**
     * Get current stock for a product
     */
    getStock: async (productId: ProductId): Promise<Result<StockInfo, RepositoryError>> => {
      try {
        const movements = await db
          .select()
          .from(inventory)
          .where(eq(inventory.productId, productId))
          .orderBy(desc(inventory.movementDate), desc(inventory.createdAt), desc(inventory.id))

        if (movements.length === 0) {
          return ResultUtils.err({
            type: 'NOT_FOUND',
            id: productId,
          })
        }

        // Calculate current stock
        let currentStock = 0
        let lastAjusteIndex = -1

        // Find the most recent 'ajuste' movement
        for (let i = 0; i < movements.length; i++) {
          const movement = movements[i]
          if (movement && movement.movementType === 'ajuste') {
            lastAjusteIndex = i
            break
          }
        }

        if (lastAjusteIndex >= 0) {
          // Start with the ajuste value
          const ajusteMovement = movements[lastAjusteIndex]
          /* c8 ignore start */
          if (!ajusteMovement) {
            return ResultUtils.err({
              type: 'UNKNOWN',
              message: 'Ajuste movement not found at expected index',
            })
          }
          /* c8 ignore stop */
          currentStock = quantityFromDb(ajusteMovement.quantity)

          // Then process movements AFTER the ajuste (indices 0 to lastAjusteIndex-1)
          // These are movements more recent than the ajuste
          for (let i = lastAjusteIndex - 1; i >= 0; i--) {
            const mov = movements[i]
            if (!mov) {
              continue
            }
            const qty = quantityFromDb(mov.quantity)
            if (mov.movementType === 'entrada') {
              currentStock += qty
            } else if (mov.movementType === 'saida') {
              currentStock -= qty
            } else if (mov.movementType === 'ajuste') {
              // Another ajuste found, replace the stock
              currentStock = qty
            }
          }
        } else {
          // No ajuste, process all movements from oldest to newest
          for (const mov of movements.reverse()) {
            const qty = quantityFromDb(mov.quantity)

            if (mov.movementType === 'entrada') {
              currentStock += qty
            } else if (mov.movementType === 'saida') {
              currentStock -= qty
            }
          }
        }

        const quantityResult = createQuantity(currentStock)
        /* c8 ignore start */
        if (!quantityResult.ok) {
          return ResultUtils.err({
            type: 'UNKNOWN',
            message: `Invalid calculated stock quantity: ${quantityResult.error}`,
          })
        }

        const lastMovement = movements[0]
        if (!lastMovement) {
          return ResultUtils.err({
            type: 'UNKNOWN',
            message: 'No movements found after validation',
          })
        }
        /* c8 ignore stop */

        return ResultUtils.ok({
          productId,
          currentQuantity: quantityResult.value,
          lastMovementDate: lastMovement.movementDate,
        })
        /* c8 ignore start */
      } catch (error) {
        return ResultUtils.err({
          type: 'UNKNOWN',
          message: error instanceof Error ? error.message : 'Unknown database error',
        })
        /* c8 ignore stop */
      }
    },

    /**
     * List all movements for a product
     */
    listMovements: async (
      productId: ProductId
    ): Promise<Result<readonly InventoryMovement[], RepositoryError>> => {
      try {
        const rows = await db
          .select()
          .from(inventory)
          .where(eq(inventory.productId, productId))
          .orderBy(desc(inventory.movementDate), desc(inventory.createdAt), desc(inventory.id))

        const movements: InventoryMovement[] = []

        for (const row of rows) {
          const movementResult = rowToMovement(row)
          /* c8 ignore start */
          if (!movementResult.ok) {
            return ResultUtils.err({
              type: 'UNKNOWN',
              message: `Failed to convert row to movement: ${movementResult.error}`,
            })
          }
          /* c8 ignore stop */
          movements.push(movementResult.value)
        }

        return ResultUtils.ok(movements)
        /* c8 ignore start */
      } catch (error) {
        return ResultUtils.err({
          type: 'UNKNOWN',
          message: error instanceof Error ? error.message : 'Unknown database error',
        })
        /* c8 ignore stop */
      }
    },

    /**
     * Find movement by ID
     */
    findById: async (id: InventoryId): Promise<Result<InventoryMovement, RepositoryError>> => {
      try {
        const rows = await db.select().from(inventory).where(eq(inventory.id, id))

        if (rows.length === 0) {
          return ResultUtils.err({
            type: 'NOT_FOUND',
            id,
          })
        }

        const row = rows[0]
        /* c8 ignore start */
        if (!row) {
          return ResultUtils.err({
            type: 'UNKNOWN',
            message: 'Row not found after length check',
          })
        }

        const movementResult = rowToMovement(row)
        if (!movementResult.ok) {
          return ResultUtils.err({
            type: 'UNKNOWN',
            message: `Failed to convert row to movement: ${movementResult.error}`,
          })
        }
        /* c8 ignore stop */

        return ResultUtils.ok(movementResult.value)
        /* c8 ignore start */
      } catch (error) {
        return ResultUtils.err({
          type: 'UNKNOWN',
          message: error instanceof Error ? error.message : 'Unknown database error',
        })
        /* c8 ignore stop */
      }
    },
  }
}
