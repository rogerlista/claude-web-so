import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * Example Schema
 *
 * Schema de exemplo para validar configuração do Drizzle.
 * Este schema será removido quando os schemas reais forem implementados.
 */
export const exampleTable = sqliteTable('example', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

export type Example = typeof exampleTable.$inferSelect
export type NewExample = typeof exampleTable.$inferInsert
