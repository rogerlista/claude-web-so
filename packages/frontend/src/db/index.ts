/**
 * Frontend Database Module
 *
 * Exporta todas as funcionalidades de persistência offline
 * usando SQLite (SQL.js) + Drizzle ORM
 */

export { initDatabase, getDatabase, closeDatabase, saveDatabaseToStorage } from './client'
export { runMigrations } from './migrate'
export * from './schema'

// Re-export tipos do Drizzle para facilitar uso
export type { SQLJsDatabase } from 'drizzle-orm/sql-js'
