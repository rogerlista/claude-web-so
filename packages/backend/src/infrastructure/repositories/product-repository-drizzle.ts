import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import { eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type { ProductRepository, RepositoryError } from '../../application/ports/product-repository'
import { createGTIN } from '../../domain/product/gtin'
import type { GTIN } from '../../domain/product/gtin'
import { createPrice } from '../../domain/product/price'
import type { Product } from '../../domain/product/product'
import type { ProductId } from '../../domain/product/product-id'
import { createProductId } from '../../domain/product/product-id'
import type { SKU } from '../../domain/product/sku'
import { createSKU } from '../../domain/product/sku'
import { type ProductRow, products } from '../database/schema'

/**
 * ProductRepository Drizzle Adapter
 *
 * Concrete implementation of ProductRepository using Drizzle ORM.
 * Follows Hexagonal Architecture - this is an adapter that implements the port.
 *
 * Responsibilities:
 * - Map between domain models (Product) and database models (ProductRow)
 * - Execute database operations using Drizzle
 * - Handle database errors and convert to RepositoryError
 */

/**
 * Map domain Product to database ProductRow (for insert/update)
 */
const productToRow = (product: Product): typeof products.$inferInsert => ({
  id: product.id as string,
  description: product.description,
  priceInCents: Math.round(product.price * 100),
  sku: product.sku as string | undefined,
  gtin: product.gtin as string | undefined,
})

/**
 * Map database ProductRow to domain Product
 */
const rowToProduct = (row: ProductRow): Result<Product, string> => {
  const idResult = createProductId(row.id)
  /* c8 ignore start */
  if (!idResult.ok) {
    return ResultUtils.err(`Invalid ProductId in database: ${idResult.error}`)
  }
  /* c8 ignore stop */

  const price = row.priceInCents / 100
  const priceResult = createPrice(price)
  if (!priceResult.ok) {
    return ResultUtils.err(`Invalid Price in database: ${priceResult.error}`)
  }

  let sku: SKU | undefined
  if (row.sku !== null && row.sku !== undefined) {
    const skuResult = createSKU(row.sku)
    /* c8 ignore start */
    if (!skuResult.ok) {
      return ResultUtils.err(`Invalid SKU in database: ${skuResult.error}`)
    }
    /* c8 ignore stop */
    sku = skuResult.value
  }

  let gtin: GTIN | undefined
  if (row.gtin !== null && row.gtin !== undefined) {
    const gtinResult = createGTIN(row.gtin)
    /* c8 ignore start */
    if (!gtinResult.ok) {
      return ResultUtils.err(`Invalid GTIN in database: ${gtinResult.error}`)
    }
    /* c8 ignore stop */
    gtin = gtinResult.value
  }

  return ResultUtils.ok({
    id: idResult.value,
    description: row.description,
    price: priceResult.value,
    ...(sku !== undefined && { sku }),
    ...(gtin !== undefined && { gtin }),
  })
}

/**
 * Create ProductRepository implementation using Drizzle
 *
 * @param db - Drizzle database instance
 * @returns ProductRepository implementation
 */
export const createProductRepositoryDrizzle = (
  db: BetterSQLite3Database<Record<string, unknown>>
): ProductRepository => ({
  /**
   * Save a product (insert or update)
   */
  save: async (product: Product): Promise<Result<Product, RepositoryError>> => {
    try {
      const row = productToRow(product)

      // Use INSERT OR REPLACE for upsert behavior
      await db
        .insert(products)
        .values(row)
        .onConflictDoUpdate({
          target: products.id,
          set: {
            description: row.description,
            priceInCents: row.priceInCents,
            sku: row.sku,
            gtin: row.gtin,
            updatedAt: new Date(),
          },
        })

      return ResultUtils.ok(product)
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },

  /**
   * Find a product by ID
   */
  findById: async (id: ProductId): Promise<Result<Product, RepositoryError>> => {
    try {
      const rows = await db
        .select()
        .from(products)
        .where(eq(products.id, id as string))

      const row = rows[0]
      if (row === undefined) {
        return ResultUtils.err({
          type: 'NOT_FOUND',
          id: id as string,
        })
      }

      const productResult = rowToProduct(row)
      if (!productResult.ok) {
        return ResultUtils.err({
          type: 'DATABASE_ERROR',
          message: productResult.error,
        })
      }

      return ResultUtils.ok(productResult.value)
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },

  /**
   * Find all products
   */
  findAll: async (): Promise<Result<readonly Product[], RepositoryError>> => {
    try {
      const rows = await db.select().from(products)

      const productResults = rows.map(rowToProduct)

      // Check if any conversion failed
      const failedResult = productResults.find((r) => !r.ok)
      if (failedResult && !failedResult.ok) {
        return ResultUtils.err({
          type: 'DATABASE_ERROR',
          message: failedResult.error,
        })
      }

      const productList = productResults
        .filter((r): r is { ok: true; value: Product } => r.ok)
        .map((r) => r.value)

      return ResultUtils.ok(productList)
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },

  /**
   * Delete a product by ID
   */
  delete: async (id: ProductId): Promise<Result<void, RepositoryError>> => {
    try {
      // Check if product exists
      const findResult = await db
        .select()
        .from(products)
        .where(eq(products.id, id as string))

      if (findResult[0] === undefined) {
        return ResultUtils.err({
          type: 'NOT_FOUND',
          id: id as string,
        })
      }

      // Delete product
      await db.delete(products).where(eq(products.id, id as string))

      return ResultUtils.ok(undefined)
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },

  /**
   * Find products by SKU
   */
  findBySKU: async (sku: string): Promise<Result<readonly Product[], RepositoryError>> => {
    try {
      const rows = await db.select().from(products).where(eq(products.sku, sku))

      const productResults = rows.map(rowToProduct)

      // Check if any conversion failed
      const failedResult = productResults.find((r) => !r.ok)
      if (failedResult && !failedResult.ok) {
        return ResultUtils.err({
          type: 'DATABASE_ERROR',
          message: failedResult.error,
        })
      }

      const productList = productResults
        .filter((r): r is { ok: true; value: Product } => r.ok)
        .map((r) => r.value)

      return ResultUtils.ok(productList)
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },

  /**
   * Find product by GTIN
   */
  findByGTIN: async (gtin: string): Promise<Result<Product, RepositoryError>> => {
    try {
      const rows = await db.select().from(products).where(eq(products.gtin, gtin))

      const row = rows[0]
      if (row === undefined) {
        return ResultUtils.err({
          type: 'NOT_FOUND',
          id: gtin,
        })
      }

      const productResult = rowToProduct(row)
      if (!productResult.ok) {
        return ResultUtils.err({
          type: 'DATABASE_ERROR',
          message: productResult.error,
        })
      }

      return ResultUtils.ok(productResult.value)
    } catch (error) {
      return ResultUtils.err({
        type: 'DATABASE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },
})
