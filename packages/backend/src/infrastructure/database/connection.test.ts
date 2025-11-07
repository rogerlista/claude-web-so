import { describe, expect, it } from 'vitest'
import { createInMemoryDatabase } from './connection'

describe('Database Connection', () => {
  it('should create in-memory database', () => {
    const db = createInMemoryDatabase()

    expect(db).toBeDefined()
  })

  it('should have schema defined', () => {
    const db = createInMemoryDatabase()

    // Verify that the database connection works by checking the schema
    expect(db._.schema).toBeDefined()
  })
})
