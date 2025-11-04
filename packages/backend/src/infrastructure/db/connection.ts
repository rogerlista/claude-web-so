import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'

const databaseUrl = process.env['DATABASE_URL'] || './data/pos-nfce.db'

// Criar instância do SQLite
const sqlite = new Database(databaseUrl)

// Habilitar foreign keys
sqlite.pragma('foreign_keys = ON')

// Habilitar WAL mode para melhor concorrência
sqlite.pragma('journal_mode = WAL')

// Criar instância do Drizzle
export const db = drizzle(sqlite, { schema })

// Exportar tipos
export type Database = typeof db
export { schema }
