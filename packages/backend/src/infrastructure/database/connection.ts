import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

/**
 * Database Connection
 *
 * Creates and configures SQLite database connection using Drizzle ORM
 * Functional approach - returns database instance
 */

/**
 * Creates a database connection
 *
 * @param dbPath - Path to SQLite database file (default: 'data/pos-nfce.db')
 * @returns Drizzle database instance
 *
 * @example
 * ```typescript
 * const db = createDatabase()
 * const db = createDatabase('./test.db') // for testing
 * ```
 */
/* c8 ignore next 11 */
export const createDatabase = (
  dbPath = 'data/pos-nfce.db'
): BetterSQLite3Database<typeof schema> => {
  const sqlite = new Database(dbPath)

  // Enable WAL mode for better concurrency
  sqlite.pragma('journal_mode = WAL')

  // Enable foreign keys
  sqlite.pragma('foreign_keys = ON')

  const db = drizzle(sqlite, { schema })

  return db
}

/**
 * Creates an in-memory database (for testing)
 *
 * @returns Drizzle database instance
 */
export const createInMemoryDatabase = (): BetterSQLite3Database<typeof schema> => {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')

  const db = drizzle(sqlite, { schema })

  return db
}
