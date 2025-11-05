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
  // Identificação
  id: text('id').primaryKey().notNull(),
  codigo: text('codigo'), // Código interno
  sku: text('sku').unique(), // Stock Keeping Unit
  gtin: text('gtin').unique(), // Código de barras (EAN)
  dun14: text('dun14'), // Código DUN-14
  codigoBalanca: text('codigo_balanca'), // Código para balança

  // Status e informações básicas
  status: text('status').default('ACTIVE'), // ACTIVE, INACTIVE
  description: text('description').notNull(),
  unidadeMedida: text('unidade_medida').default('UN'), // UN, KG, LT, etc

  // Preços (em centavos)
  priceInCents: integer('price_in_cents').notNull(),
  precoPromocionalInCents: integer('preco_promocional_in_cents'),
  precoPromocionalInicio: integer('preco_promocional_inicio', { mode: 'timestamp' }),
  precoPromocionalFim: integer('preco_promocional_fim', { mode: 'timestamp' }),

  // Informações Fiscais/Tributárias (NFC-e)
  origemTributaria: text('origem_tributaria'), // 0-8 conforme SEFAZ
  ncm: text('ncm'), // Nomenclatura Comum do Mercosul (8 dígitos)
  cest: text('cest'), // Código Especificador da Substituição Tributária
  tributacao: text('tributacao'), // CST/CSOSN
  aliquotaIcms: integer('aliquota_icms'), // % * 100 (ex: 18% = 1800)

  // Auditoria
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }), // Soft delete
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
  // Identificação
  id: text('id').primaryKey().notNull(),
  numeroVenda: integer('numero_venda').unique(), // Número sequencial da venda
  dataHora: integer('data_hora', { mode: 'timestamp' }).default(sql`(unixepoch())`),

  // Usuário responsável
  userId: text('user_id').references(() => users.id),

  // Cliente (opcional para NFC-e)
  customerId: text('customer_id').references(() => customers.id),
  cpfCliente: text('cpf_cliente'), // CPF pode ser informado sem cadastro completo
  emailCliente: text('email_cliente'), // Email para envio da NFC-e

  // Status da venda
  status: text('status').notNull().default('PENDING'), // PENDING, COMPLETED, CANCELLED

  // Valores (em centavos) - compatibilidade com schema antigo
  totalInCents: integer('total_in_cents'), // Mantido para compatibilidade
  totalBrutoInCents: integer('total_bruto_in_cents'),
  descontoInCents: integer('desconto_in_cents').default(0),
  acrescimoInCents: integer('acrescimo_in_cents').default(0),
  totalLiquidoInCents: integer('total_liquido_in_cents'),

  // Informações NFC-e
  chaveNfce: text('chave_nfce').unique(), // Chave de acesso da NFC-e (44 dígitos)
  numeroNfce: integer('numero_nfce'), // Número da NFC-e
  serieNfce: text('serie_nfce'), // Série da NFC-e
  statusNfce: text('status_nfce'), // PENDENTE, AUTORIZADA, REJEITADA, CANCELADA

  // Auditoria
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
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
  id: text('id').primaryKey().notNull(),

  // Relacionamentos
  saleId: text('sale_id')
    .notNull()
    .references(() => sales.id, { onDelete: 'cascade' }),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),

  // Informações do item na venda (snapshot do momento da venda)
  numeroItem: integer('numero_item'), // Ordem do item na venda (1, 2, 3...)
  codigo: text('codigo'), // Código do produto no momento da venda
  descricao: text('descricao'), // Descrição do produto no momento da venda

  // Quantidade e valores (em centavos) - compatibilidade
  quantity: integer('quantity').notNull(),
  unitPriceInCents: integer('unit_price_in_cents'), // Compatibilidade
  totalInCents: integer('total_in_cents'), // Compatibilidade
  valorUnitarioInCents: integer('valor_unitario_in_cents'),
  totalItemInCents: integer('total_item_in_cents'),

  // Auditoria
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

/**
 * Inventory Table Schema
 *
 * Tracks product stock movements and current quantities.
 */
export const inventory = sqliteTable('inventory', {
  id: text('id').primaryKey().notNull(),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull(),
  movementType: text('movement_type').notNull(), // 'IN', 'OUT', 'ADJUSTMENT'
  observation: text('observation'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

export type InventoryRow = typeof inventory.$inferSelect
export type InventoryInsert = typeof inventory.$inferInsert

/**
 * Sale Payments Table Schema
 *
 * Stores payment information for each sale.
 */
export const salePayments = sqliteTable('sale_payments', {
  id: text('id').primaryKey().notNull(),
  saleId: text('sale_id')
    .notNull()
    .references(() => sales.id, { onDelete: 'cascade' }),
  paymentMethod: text('payment_method').notNull(), // 'CASH', 'CREDIT', 'DEBIT', 'PIX', etc.
  paymentMethodCode: text('payment_method_code').notNull(), // SEFAZ codes: 01-99
  amountInCents: integer('amount_in_cents').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

export type SalePaymentRow = typeof salePayments.$inferSelect
export type SalePaymentInsert = typeof salePayments.$inferInsert

/**
 * Users Table Schema
 *
 * Stores user authentication and authorization data.
 */
export const users = sqliteTable('users', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  login: text('login').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(), // 'ADMIN', 'MANAGER', 'OPERATOR'
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

export type UserRow = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert

/**
 * Cash Movements Table Schema
 *
 * Tracks cash register opening and closing.
 */
export const cashMovements = sqliteTable('cash_movements', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  openingDate: integer('opening_date', { mode: 'timestamp' }).notNull(),
  closingDate: integer('closing_date', { mode: 'timestamp' }),
  initialAmountInCents: integer('initial_amount_in_cents').notNull(),
  status: text('status').notNull(), // 'OPEN', 'CLOSED'
  // Totals
  grossSalesInCents: integer('gross_sales_in_cents').notNull().default(0),
  cancellationsInCents: integer('cancellations_in_cents').notNull().default(0),
  discountsInCents: integer('discounts_in_cents').notNull().default(0),
  additionsInCents: integer('additions_in_cents').notNull().default(0),
  netSalesInCents: integer('net_sales_in_cents').notNull().default(0),
  // Movements
  withdrawalsInCents: integer('withdrawals_in_cents').notNull().default(0),
  expensesInCents: integer('expenses_in_cents').notNull().default(0),
  additionalSupplyInCents: integer('additional_supply_in_cents').notNull().default(0),
  finalBalanceInCents: integer('final_balance_in_cents').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

export type CashMovementRow = typeof cashMovements.$inferSelect
export type CashMovementInsert = typeof cashMovements.$inferInsert

/**
 * Cash Transactions Table Schema
 *
 * Records individual cash transactions (withdrawals, expenses, supplies).
 */
export const cashTransactions = sqliteTable('cash_transactions', {
  id: text('id').primaryKey().notNull(),
  cashMovementId: text('cash_movement_id')
    .notNull()
    .references(() => cashMovements.id),
  type: text('type').notNull(), // 'SUPPLY', 'EXPENSE', 'WITHDRAWAL'
  description: text('description').notNull(),
  amountInCents: integer('amount_in_cents').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  paymentMethodId: text('payment_method_id'), // Optional, for withdrawals
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

export type CashTransactionRow = typeof cashTransactions.$inferSelect
export type CashTransactionInsert = typeof cashTransactions.$inferInsert

/**
 * Audit Table Schema
 *
 * Tracks all changes to critical data for compliance and debugging.
 */
export const audit = sqliteTable('audit', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  tableName: text('table_name').notNull(),
  operation: text('operation').notNull(), // 'INSERT', 'UPDATE', 'DELETE'
  recordId: text('record_id').notNull(),
  previousData: text('previous_data'), // JSON string
  newData: text('new_data'), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

export type AuditRow = typeof audit.$inferSelect
export type AuditInsert = typeof audit.$inferInsert
