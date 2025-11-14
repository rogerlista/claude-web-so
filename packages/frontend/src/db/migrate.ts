/**
 * Frontend Database Migrations
 *
 * Aplica migrations do backend no banco local do frontend
 * Sincroniza schema entre backend e frontend
 */

import { sql } from "drizzle-orm";
import type { SQLJsDatabase } from "drizzle-orm/sql-js";
import type * as schema from "./schema";

/**
 * Aplica todas as migrations pendentes
 *
 * Como estamos reutilizando os schemas do backend, vamos criar
 * as tabelas diretamente usando o SQL da migration do backend
 */
export async function runMigrations(
	db: SQLJsDatabase<typeof schema>,
): Promise<void> {
	console.info("[DB] Running migrations...");

	try {
		// Verifica se já existe a tabela de controle de migrations
		const hasMigrationsTable = await checkMigrationsTableExists(db);

		if (!hasMigrationsTable) {
			await createMigrationsTable(db);
		}

		// Aplica a migration do backend (0000_whole_triathlon.sql)
		// Copiamos o SQL diretamente da migration gerada pelo Drizzle Kit
		await applyInitialMigration(db);

		console.info("[DB] Migrations completed successfully");
	} catch (error) {
		console.error("[DB] Migration failed:", error);
		throw error;
	}
}

/**
 * Verifica se a tabela de controle de migrations existe
 */
async function checkMigrationsTableExists(
	db: SQLJsDatabase<typeof schema>,
): Promise<boolean> {
	try {
		const result = await db.all(
			sql.raw(
				"SELECT name FROM sqlite_master WHERE type='table' AND name='__drizzle_migrations'",
			),
		);
		return result.length > 0;
	} catch {
		return false;
	}
}

/**
 * Cria a tabela de controle de migrations
 */
async function createMigrationsTable(
	db: SQLJsDatabase<typeof schema>,
): Promise<void> {
	await db.run(
		sql.raw(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `),
	);
}

/**
 * Aplica a migration inicial (0000_whole_triathlon.sql)
 */
async function applyInitialMigration(
	db: SQLJsDatabase<typeof schema>,
): Promise<void> {
	// Verifica se já foi aplicada
	const result = await db.all(
		sql.raw(
			"SELECT * FROM __drizzle_migrations WHERE hash='0000_whole_triathlon'",
		),
	);

	if (result.length > 0) {
		console.debug("[DB] Initial migration already applied");
		return;
	}

	// SQL da migration gerada pelo Drizzle Kit
	// Copiado de packages/backend/drizzle/0000_whole_triathlon.sql
	// Aplicamos cada statement separadamente pois SQL.js não suporta múltiplos statements
	const migrationStatements = [
		`CREATE TABLE IF NOT EXISTS audit (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      table_name TEXT NOT NULL,
      operation TEXT NOT NULL,
      record_id TEXT NOT NULL,
      previous_data TEXT,
      new_data TEXT,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action
    )`,
		`CREATE TABLE IF NOT EXISTS cash_movements (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      opening_date INTEGER NOT NULL,
      closing_date INTEGER,
      initial_amount_in_cents INTEGER NOT NULL,
      status TEXT NOT NULL,
      gross_sales_in_cents INTEGER DEFAULT 0 NOT NULL,
      cancellations_in_cents INTEGER DEFAULT 0 NOT NULL,
      discounts_in_cents INTEGER DEFAULT 0 NOT NULL,
      additions_in_cents INTEGER DEFAULT 0 NOT NULL,
      net_sales_in_cents INTEGER DEFAULT 0 NOT NULL,
      withdrawals_in_cents INTEGER DEFAULT 0 NOT NULL,
      expenses_in_cents INTEGER DEFAULT 0 NOT NULL,
      additional_supply_in_cents INTEGER DEFAULT 0 NOT NULL,
      final_balance_in_cents INTEGER DEFAULT 0 NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action
    )`,
		`CREATE TABLE IF NOT EXISTS cash_transactions (
      id TEXT PRIMARY KEY NOT NULL,
      cash_movement_id TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      amount_in_cents INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      payment_method_id TEXT,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      FOREIGN KEY (cash_movement_id) REFERENCES cash_movements(id) ON UPDATE no action ON DELETE no action,
      FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action
    )`,
		`CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      cpf TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )`,
		"CREATE UNIQUE INDEX IF NOT EXISTS customers_cpf_unique ON customers (cpf)",
		"CREATE UNIQUE INDEX IF NOT EXISTS customers_email_unique ON customers (email)",
		`CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      movement_type TEXT NOT NULL,
      observation TEXT,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE no action ON DELETE no action
    )`,
		`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY NOT NULL,
      codigo TEXT,
      sku TEXT,
      gtin TEXT,
      dun14 TEXT,
      codigo_balanca TEXT,
      status TEXT DEFAULT 'ACTIVE',
      description TEXT NOT NULL,
      unidade_medida TEXT DEFAULT 'UN',
      price_in_cents INTEGER NOT NULL,
      preco_promocional_in_cents INTEGER,
      preco_promocional_inicio INTEGER,
      preco_promocional_fim INTEGER,
      origem_tributaria TEXT,
      ncm TEXT,
      cest TEXT,
      tributacao TEXT,
      aliquota_icms INTEGER,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      deleted_at INTEGER
    )`,
		"CREATE UNIQUE INDEX IF NOT EXISTS products_sku_unique ON products (sku)",
		"CREATE UNIQUE INDEX IF NOT EXISTS products_gtin_unique ON products (gtin)",
		`CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY NOT NULL,
      sale_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      numero_item INTEGER,
      codigo TEXT,
      descricao TEXT,
      quantity INTEGER NOT NULL,
      unit_price_in_cents INTEGER,
      total_in_cents INTEGER,
      valor_unitario_in_cents INTEGER,
      total_item_in_cents INTEGER,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE no action ON DELETE no action
    )`,
		`CREATE TABLE IF NOT EXISTS sale_payments (
      id TEXT PRIMARY KEY NOT NULL,
      sale_id TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      amount_in_cents INTEGER NOT NULL,
      paid_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id) ON UPDATE no action ON DELETE cascade
    )`,
		`CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY NOT NULL,
      numero_venda INTEGER,
      data_hora INTEGER DEFAULT (unixepoch()),
      user_id TEXT,
      customer_id TEXT,
      cpf_cliente TEXT,
      email_cliente TEXT,
      status TEXT DEFAULT 'PENDING' NOT NULL,
      total_in_cents INTEGER,
      total_bruto_in_cents INTEGER,
      desconto_in_cents INTEGER DEFAULT 0,
      acrescimo_in_cents INTEGER DEFAULT 0,
      total_liquido_in_cents INTEGER,
      chave_nfce TEXT,
      numero_nfce INTEGER,
      serie_nfce TEXT,
      status_nfce TEXT,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON UPDATE no action ON DELETE no action
    )`,
		"CREATE UNIQUE INDEX IF NOT EXISTS sales_numero_venda_unique ON sales (numero_venda)",
		"CREATE UNIQUE INDEX IF NOT EXISTS sales_chave_nfce_unique ON sales (chave_nfce)",
		`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      login TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      active INTEGER DEFAULT 1 NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
    )`,
		"CREATE UNIQUE INDEX IF NOT EXISTS users_login_unique ON users (login)",
	];

	// Executa cada statement
	for (const statement of migrationStatements) {
		await db.run(sql.raw(statement));
	}

	// Registra a migration como aplicada
	await db.run(
		sql.raw(
			"INSERT INTO __drizzle_migrations (hash, created_at) VALUES ('0000_whole_triathlon', unixepoch())",
		),
	);

	console.info("[DB] Initial migration applied successfully");
}
