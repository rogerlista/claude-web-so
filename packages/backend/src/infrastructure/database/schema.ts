import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

/**
 * Products Table Schema
 *
 * Database schema for products using Drizzle ORM with SQLite.
 *
 * Design decisions:
 * - id: Text primary key (allows flexible ID strategies)
 * - price: Stored as integer (cents) to avoid floating-point issues
 * - sku: Optional text field for stock keeping unit
 * - gtin: Optional text field for barcode (GTIN-8/12/13/14)
 * - Timestamps for audit trail
 */
export const products = sqliteTable('products', {
  /**
   * Product ID (primary key)
   * Stored as text to support various ID formats (UUID, nanoid, etc.)
   */
  id: text('id').primaryKey().notNull(),

  /**
   * Product description
   * Required field with whitespace trimmed
   */
  description: text('description').notNull(),

  /**
   * Product price in cents
   * Stored as integer to avoid floating-point precision issues
   * Example: $10.50 = 1050 cents
   */
  priceInCents: integer('price_in_cents').notNull(),

  /**
   * Stock Keeping Unit (optional)
   * Alphanumeric identifier for inventory management
   */
  sku: text('sku'),

  /**
   * Global Trade Item Number (optional)
   * Barcode identifier (GTIN-8, GTIN-12, GTIN-13, or GTIN-14)
   */
  gtin: text('gtin'),

  /**
   * Timestamp when record was created
   */
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  /**
   * Timestamp when record was last updated
   */
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

/**
 * TypeScript type inferred from the schema
 */
export type ProductRow = typeof products.$inferSelect

/**
 * TypeScript type for inserting new products
 */
export type ProductInsert = typeof products.$inferInsert
