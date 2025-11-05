import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

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
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),

  /**
   * Timestamp when record was last updated
   */
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

/**
 * TypeScript type inferred from the schema
 */
export type ProductRow = typeof products.$inferSelect

/**
 * TypeScript type for inserting new products
 */
export type ProductInsert = typeof products.$inferInsert

/**
 * Customers Table Schema
 *
 * Database schema for customers using Drizzle ORM with SQLite.
 *
 * Design decisions:
 * - id: Text primary key (allows flexible ID strategies)
 * - cpf: Unique constraint for Brazilian tax ID
 * - email: Optional, unique when present
 * - phone: Optional text field for Brazilian phone numbers
 * - Timestamps for audit trail
 */
export const customers = sqliteTable('customers', {
  /**
   * Customer ID (primary key)
   * Stored as text to support various ID formats (UUID, nanoid, etc.)
   */
  id: text('id').primaryKey().notNull(),

  /**
   * Customer name
   * Required field
   */
  name: text('name').notNull(),

  /**
   * CPF - Cadastro de Pessoa Física (Brazilian Tax ID)
   * 11 digits, stored without formatting
   * Unique constraint - each CPF can only be registered once
   */
  cpf: text('cpf').notNull().unique(),

  /**
   * Email address (optional)
   * Stored as lowercase
   * Unique constraint when present
   */
  email: text('email').unique(),

  /**
   * Phone number (optional)
   * Brazilian phone format (10-13 digits)
   * Stored without formatting
   */
  phone: text('phone'),

  /**
   * Timestamp when record was created
   */
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),

  /**
   * Timestamp when record was last updated
   */
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

/**
 * TypeScript type inferred from the customers schema
 */
export type CustomerRow = typeof customers.$inferSelect

/**
 * TypeScript type for inserting new customers
 */
export type CustomerInsert = typeof customers.$inferInsert

/**
 * Sales Table Schema
 *
 * Database schema for sales using Drizzle ORM with SQLite.
 *
 * Design decisions:
 * - id: Text primary key (allows flexible ID strategies)
 * - customer_id: Foreign key to customers table
 * - total: Stored as integer (cents) to avoid floating-point issues
 * - status: Text field for sale status (PENDING, COMPLETED, CANCELLED)
 * - Timestamps for audit trail
 */
export const sales = sqliteTable('sales', {
  /**
   * Sale ID (primary key)
   * Stored as text to support various ID formats (UUID, nanoid, etc.)
   */
  id: text('id').primaryKey().notNull(),

  /**
   * Customer ID (foreign key)
   * References customers table
   */
  customerId: text('customer_id')
    .notNull()
    .references(() => customers.id),

  /**
   * Sale total in cents
   * Stored as integer to avoid floating-point precision issues
   * Example: $26.50 = 2650 cents
   */
  totalInCents: integer('total_in_cents').notNull(),

  /**
   * Sale status
   * Valid values: PENDING, COMPLETED, CANCELLED
   */
  status: text('status').notNull(),

  /**
   * Timestamp when record was created
   */
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),

  /**
   * Timestamp when record was last updated
   */
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

/**
 * TypeScript type inferred from the sales schema
 */
export type SaleRow = typeof sales.$inferSelect

/**
 * TypeScript type for inserting new sales
 */
export type SaleInsert = typeof sales.$inferInsert

/**
 * Sale Items Table Schema
 *
 * Database schema for sale items using Drizzle ORM with SQLite.
 *
 * Design decisions:
 * - id: Text primary key (auto-generated for each item)
 * - sale_id: Foreign key to sales table
 * - product_id: Foreign key to products table
 * - quantity: Integer for item quantity
 * - unit_price_in_cents: Integer to store price per unit
 * - total_in_cents: Integer to store item total (quantity * unit_price)
 * - Timestamp for audit trail
 */
export const saleItems = sqliteTable('sale_items', {
  /**
   * Sale Item ID (primary key)
   * Auto-generated unique identifier
   */
  id: text('id').primaryKey().notNull(),

  /**
   * Sale ID (foreign key)
   * References sales table
   */
  saleId: text('sale_id')
    .notNull()
    .references(() => sales.id, { onDelete: 'cascade' }),

  /**
   * Product ID (foreign key)
   * References products table
   */
  productId: text('product_id')
    .notNull()
    .references(() => products.id),

  /**
   * Item quantity
   * Must be a positive integer
   */
  quantity: integer('quantity').notNull(),

  /**
   * Unit price in cents
   * Price per unit at the time of sale
   * Stored as integer to avoid floating-point precision issues
   */
  unitPriceInCents: integer('unit_price_in_cents').notNull(),

  /**
   * Total in cents
   * Calculated as quantity * unit_price_in_cents
   * Stored as integer to avoid floating-point precision issues
   */
  totalInCents: integer('total_in_cents').notNull(),

  /**
   * Timestamp when record was created
   */
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

/**
 * TypeScript type inferred from the sale_items schema
 */
export type SaleItemRow = typeof saleItems.$inferSelect

/**
 * TypeScript type for inserting new sale items
 */
export type SaleItemInsert = typeof saleItems.$inferInsert
