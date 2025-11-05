import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type { RepositoryError, SaleRepository } from '../../application/ports/sale-repository'
import type { CustomerId } from '../../domain/customer/customer-id'
import { createCustomerId } from '../../domain/customer/customer-id'
import { createPrice } from '../../domain/product/price'
import { createProductId } from '../../domain/product/product-id'
import type { Sale } from '../../domain/sale/sale'
import type { SaleId } from '../../domain/sale/sale-id'
import { createSaleId } from '../../domain/sale/sale-id'
import type { SaleItem } from '../../domain/sale/sale-item'
import { createSaleItem } from '../../domain/sale/sale-item'
import type { SaleStatus } from '../../domain/sale/sale-status'
import { createSaleStatus } from '../../domain/sale/sale-status'
import {
  type SaleInsert,
  type SaleItemInsert,
  type SaleItemRow,
  type SaleRow,
  saleItems,
  sales,
} from '../database/schema'

/**
 * SaleRepository Drizzle Adapter
 *
 * Concrete implementation of SaleRepository using Drizzle ORM.
 * Maps between domain models and database models.
 * Handles one-to-many relationship between Sale and SaleItems.
 */

/**
 * Generate a unique ID for a sale item
 * Using sale ID + index to ensure uniqueness
 */
const generateSaleItemId = (saleId: string, index: number): string => {
  return `${saleId}-item-${index}`
}

/**
 * Map domain Sale to database SaleRow (for insert/update)
 */
const saleToRow = (sale: Sale): SaleInsert => ({
  id: sale.id as string,
  customerId: sale.customerId as string,
  totalInCents: Math.round(sale.total * 100),
  status: sale.status,
  createdAt: sale.createdAt,
})

/**
 * Map domain SaleItems to database SaleItemRows (for insert/update)
 */
const saleItemsToRows = (saleId: string, items: readonly SaleItem[]): SaleItemInsert[] => {
  return items.map((item, index) => ({
    id: generateSaleItemId(saleId, index),
    saleId,
    productId: item.productId as string,
    quantity: item.quantity,
    unitPriceInCents: Math.round(item.unitPrice * 100),
    totalInCents: Math.round(item.total * 100),
  }))
}

/**
 * Map database SaleItemRow to domain SaleItem
 */
const rowToSaleItem = (row: SaleItemRow): Result<SaleItem, string> => {
  const productIdResult = createProductId(row.productId)
  if (!productIdResult.ok) {
    return ResultUtils.err(`Invalid ProductId in database: ${productIdResult.error}`)
  }

  const priceResult = createPrice(row.unitPriceInCents / 100)
  if (!priceResult.ok) {
    return ResultUtils.err(`Invalid Price in database: ${priceResult.error}`)
  }

  const saleItemResult = createSaleItem({
    productId: productIdResult.value,
    quantity: row.quantity,
    unitPrice: priceResult.value,
  })

  if (!saleItemResult.ok) {
    return ResultUtils.err(`Invalid SaleItem in database: ${saleItemResult.error}`)
  }

  return ResultUtils.ok(saleItemResult.value)
}

/**
 * Map database SaleRow and SaleItemRows to domain Sale
 */
const rowToSale = (saleRow: SaleRow, itemRows: SaleItemRow[]): Result<Sale, string> => {
  const saleIdResult = createSaleId(saleRow.id)
  if (!saleIdResult.ok) {
    return ResultUtils.err(`Invalid SaleId in database: ${saleIdResult.error}`)
  }

  const customerIdResult = createCustomerId(saleRow.customerId)
  if (!customerIdResult.ok) {
    return ResultUtils.err(`Invalid CustomerId in database: ${customerIdResult.error}`)
  }

  const statusResult = createSaleStatus(saleRow.status)
  if (!statusResult.ok) {
    return ResultUtils.err(`Invalid SaleStatus in database: ${statusResult.error}`)
  }

  // Map all sale items
  const itemResults = itemRows.map(rowToSaleItem)

  // Check if any item failed to map
  const failedItem = itemResults.find((r) => !r.ok)
  if (failedItem && !failedItem.ok) {
    return ResultUtils.err(failedItem.error)
  }

  // Extract successful items
  const items = itemResults
    .filter((r): r is { ok: true; value: SaleItem } => r.ok)
    .map((r) => r.value)

  return ResultUtils.ok({
    id: saleIdResult.value,
    customerId: customerIdResult.value,
    items,
    total: saleRow.totalInCents / 100,
    status: statusResult.value,
    createdAt: saleRow.createdAt,
  })
}

/**
 * Create SaleRepository implementation using Drizzle
 */
export const createSaleRepositoryDrizzle = (
  db: BetterSQLite3Database<Record<string, unknown>>
): SaleRepository => ({
  save: async (sale: Sale): Promise<Result<Sale, RepositoryError>> => {
    try {
      const saleRow = saleToRow(sale)
      const itemRows = saleItemsToRows(sale.id as string, sale.items)

      // Save sale (insert or update)
      await db
        .insert(sales)
        .values(saleRow)
        .onConflictDoUpdate({
          target: sales.id,
          set: {
            customerId: saleRow.customerId,
            totalInCents: saleRow.totalInCents,
            status: saleRow.status,
            updatedAt: new Date(),
          },
        })

      // Delete existing sale items (for updates)
      await db.delete(saleItems).where(eq(saleItems.saleId, sale.id as string))

      // Insert new sale items
      if (itemRows.length > 0) {
        await db.insert(saleItems).values(itemRows)
      }

      return ResultUtils.ok(sale)
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },

  findById: async (id: SaleId): Promise<Result<Sale, RepositoryError>> => {
    try {
      const saleRows = await db
        .select()
        .from(sales)
        .where(eq(sales.id, id as string))

      const saleRow = saleRows[0]
      if (saleRow === undefined) {
        return ResultUtils.err({
          type: 'NOT_FOUND',
          id: id as string,
        })
      }

      // Get sale items
      const itemRows = await db
        .select()
        .from(saleItems)
        .where(eq(saleItems.saleId, id as string))

      const saleResult = rowToSale(saleRow, itemRows)
      if (!saleResult.ok) {
        return ResultUtils.err({
          type: 'DATABASE_ERROR',
          message: saleResult.error,
        })
      }

      return ResultUtils.ok(saleResult.value)
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },

  findAll: async (): Promise<Result<readonly Sale[], RepositoryError>> => {
    try {
      const saleRows = await db.select().from(sales)

      // Get all sale items for all sales
      const allItemRows = await db.select().from(saleItems)

      // Group items by saleId
      const itemsBySaleId = new Map<string, SaleItemRow[]>()
      for (const itemRow of allItemRows) {
        const existing = itemsBySaleId.get(itemRow.saleId) ?? []
        existing.push(itemRow)
        itemsBySaleId.set(itemRow.saleId, existing)
      }

      // Map sales with their items
      const saleResults = saleRows.map((saleRow) => {
        const items = itemsBySaleId.get(saleRow.id) ?? []
        return rowToSale(saleRow, items)
      })

      // Check if any sale failed to map
      const failedResult = saleResults.find((r) => !r.ok)
      if (failedResult && !failedResult.ok) {
        return ResultUtils.err({
          type: 'DATABASE_ERROR',
          message: failedResult.error,
        })
      }

      const salesList = saleResults
        .filter((r): r is { ok: true; value: Sale } => r.ok)
        .map((r) => r.value)

      return ResultUtils.ok(salesList)
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },

  delete: async (id: SaleId): Promise<Result<void, RepositoryError>> => {
    try {
      const findResult = await db
        .select()
        .from(sales)
        .where(eq(sales.id, id as string))

      if (findResult[0] === undefined) {
        return ResultUtils.err({
          type: 'NOT_FOUND',
          id: id as string,
        })
      }

      // Delete sale (sale items will be cascade deleted by DB)
      await db.delete(sales).where(eq(sales.id, id as string))

      return ResultUtils.ok(undefined)
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },

  findByCustomerId: async (
    customerId: CustomerId
  ): Promise<Result<readonly Sale[], RepositoryError>> => {
    try {
      const saleRows = await db
        .select()
        .from(sales)
        .where(eq(sales.customerId, customerId as string))

      if (saleRows.length === 0) {
        return ResultUtils.ok([])
      }

      // Get all sale items for these sales
      const saleIds = saleRows.map((row) => row.id)
      const allItemRows = await db.select().from(saleItems)

      // Filter items that belong to our sales
      const filteredItemRows = allItemRows.filter((item) => saleIds.includes(item.saleId))

      // Group items by saleId
      const itemsBySaleId = new Map<string, SaleItemRow[]>()
      for (const itemRow of filteredItemRows) {
        const existing = itemsBySaleId.get(itemRow.saleId) ?? []
        existing.push(itemRow)
        itemsBySaleId.set(itemRow.saleId, existing)
      }

      // Map sales with their items
      const saleResults = saleRows.map((saleRow) => {
        const items = itemsBySaleId.get(saleRow.id) ?? []
        return rowToSale(saleRow, items)
      })

      // Check if any sale failed to map
      const failedResult = saleResults.find((r) => !r.ok)
      if (failedResult && !failedResult.ok) {
        return ResultUtils.err({
          type: 'DATABASE_ERROR',
          message: failedResult.error,
        })
      }

      const salesList = saleResults
        .filter((r): r is { ok: true; value: Sale } => r.ok)
        .map((r) => r.value)

      return ResultUtils.ok(salesList)
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },

  findByStatus: async (status: SaleStatus): Promise<Result<readonly Sale[], RepositoryError>> => {
    try {
      const saleRows = await db.select().from(sales).where(eq(sales.status, status))

      if (saleRows.length === 0) {
        return ResultUtils.ok([])
      }

      // Get all sale items for these sales
      const saleIds = saleRows.map((row) => row.id)
      const allItemRows = await db.select().from(saleItems)

      // Filter items that belong to our sales
      const filteredItemRows = allItemRows.filter((item) => saleIds.includes(item.saleId))

      // Group items by saleId
      const itemsBySaleId = new Map<string, SaleItemRow[]>()
      for (const itemRow of filteredItemRows) {
        const existing = itemsBySaleId.get(itemRow.saleId) ?? []
        existing.push(itemRow)
        itemsBySaleId.set(itemRow.saleId, existing)
      }

      // Map sales with their items
      const saleResults = saleRows.map((saleRow) => {
        const items = itemsBySaleId.get(saleRow.id) ?? []
        return rowToSale(saleRow, items)
      })

      // Check if any sale failed to map
      const failedResult = saleResults.find((r) => !r.ok)
      if (failedResult && !failedResult.ok) {
        return ResultUtils.err({
          type: 'DATABASE_ERROR',
          message: failedResult.error,
        })
      }

      const salesList = saleResults
        .filter((r): r is { ok: true; value: Sale } => r.ok)
        .map((r) => r.value)

      return ResultUtils.ok(salesList)
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },
})
