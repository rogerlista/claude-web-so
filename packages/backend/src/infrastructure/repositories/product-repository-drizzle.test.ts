import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import { createGTIN } from '../../domain/product/gtin'
import { createPrice } from '../../domain/product/price'
import type { Product } from '../../domain/product/product'
import { createProductId } from '../../domain/product/product-id'
import { createSKU } from '../../domain/product/sku'
import { createProductRepositoryDrizzle } from './product-repository-drizzle'

/**
 * TDD - RED Phase
 * Tests for ProductRepository Drizzle adapter
 *
 * Tests the concrete implementation of ProductRepository using Drizzle ORM.
 * Uses in-memory SQLite database for fast, isolated tests.
 */

describe('ProductRepository Drizzle Adapter', () => {
  let sqlite: Database.Database
  let db: ReturnType<typeof drizzle>
  let repository: ReturnType<typeof createProductRepositoryDrizzle>

  /**
   * Setup: Create fresh in-memory database for each test
   */
  beforeEach(() => {
    // Create in-memory SQLite database
    sqlite = new Database(':memory:')

    // Initialize Drizzle
    db = drizzle(sqlite)

    // Create products table (matching expanded NFC-e schema)
    sqlite.exec(`
      CREATE TABLE products (
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
      )
    `)

    // Create repository
    repository = createProductRepositoryDrizzle(db)
  })

  describe('save', () => {
    it('should save a new product', async () => {
      const idResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)

      if (!idResult.ok || !priceResult.ok) {
        throw new Error('Test setup failed')
      }

      const product: Product = {
        id: idResult.value,
        description: 'Test Product',
        price: priceResult.value,
      }

      const result = await repository.save(product)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.id).toBe('prod-123')
        expect(result.value.description).toBe('Test Product')
        expect(result.value.price).toBe(10.5)
      }
    })

    it('should handle database error', async () => {
      const idResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)

      if (!idResult.ok || !priceResult.ok) {
        throw new Error('Test setup failed')
      }

      const product: Product = {
        id: idResult.value,
        description: 'Test Product',
        price: priceResult.value,
      }

      // Close database to trigger error
      sqlite.close()

      const result = await repository.save(product)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('DATABASE_ERROR')
      }
    })

    it('should save a product with SKU and GTIN', async () => {
      const idResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)
      const skuResult = createSKU('PROD-123')
      const gtinResult = createGTIN('7898357417892')

      if (!idResult.ok || !priceResult.ok || !skuResult.ok || !gtinResult.ok) {
        throw new Error('Test setup failed')
      }

      const product: Product = {
        id: idResult.value,
        description: 'Test Product',
        price: priceResult.value,
        sku: skuResult.value,
        gtin: gtinResult.value,
      }

      const result = await repository.save(product)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.sku).toBe('PROD-123')
        expect(result.value.gtin).toBe('7898357417892')
      }
    })

    it('should update an existing product', async () => {
      const idResult = createProductId('prod-123')
      const priceResult1 = createPrice(10.5)
      const priceResult2 = createPrice(15.99)

      if (!idResult.ok || !priceResult1.ok || !priceResult2.ok) {
        throw new Error('Test setup failed')
      }

      // Insert initial product
      const product1: Product = {
        id: idResult.value,
        description: 'Original Description',
        price: priceResult1.value,
      }
      await repository.save(product1)

      // Update product
      const product2: Product = {
        id: idResult.value,
        description: 'Updated Description',
        price: priceResult2.value,
      }
      const result = await repository.save(product2)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.description).toBe('Updated Description')
        expect(result.value.price).toBe(15.99)
      }
    })
  })

  describe('findById', () => {
    it('should find a product by ID', async () => {
      const idResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)

      if (!idResult.ok || !priceResult.ok) {
        throw new Error('Test setup failed')
      }

      // Insert product
      const product: Product = {
        id: idResult.value,
        description: 'Test Product',
        price: priceResult.value,
      }
      await repository.save(product)

      // Find product
      const result = await repository.findById(idResult.value)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.id).toBe('prod-123')
        expect(result.value.description).toBe('Test Product')
        expect(result.value.price).toBe(10.5)
      }
    })

    it('should return NOT_FOUND for non-existent product', async () => {
      const idResult = createProductId('non-existent')

      if (!idResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = await repository.findById(idResult.value)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'NOT_FOUND') {
        expect(result.error.type).toBe('NOT_FOUND')
        expect(result.error.id).toBe('non-existent')
      }
    })

    it('should handle database error', async () => {
      const idResult = createProductId('prod-123')

      if (!idResult.ok) {
        throw new Error('Test setup failed')
      }

      // Close database to trigger error
      sqlite.close()

      const result = await repository.findById(idResult.value)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('DATABASE_ERROR')
      }
    })

    it('should handle invalid product data in database', async () => {
      // Insert product with invalid price (negative cents)
      sqlite.exec(`
        INSERT INTO products (id, description, price_in_cents)
        VALUES ('invalid-prod', 'Invalid Product', -100)
      `)

      const idResult = createProductId('invalid-prod')

      if (!idResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = await repository.findById(idResult.value)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('DATABASE_ERROR')
      }
    })
  })

  describe('findAll', () => {
    it('should return empty array when no products exist', async () => {
      const result = await repository.findAll()

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual([])
      }
    })

    it('should return all products', async () => {
      const id1Result = createProductId('prod-1')
      const id2Result = createProductId('prod-2')
      const priceResult = createPrice(10.5)

      if (!id1Result.ok || !id2Result.ok || !priceResult.ok) {
        throw new Error('Test setup failed')
      }

      // Insert products
      await repository.save({
        id: id1Result.value,
        description: 'Product 1',
        price: priceResult.value,
      })
      await repository.save({
        id: id2Result.value,
        description: 'Product 2',
        price: priceResult.value,
      })

      // Find all
      const result = await repository.findAll()

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toHaveLength(2)
        expect(result.value[0]?.id).toBe('prod-1')
        expect(result.value[1]?.id).toBe('prod-2')
      }
    })

    it('should handle database error', async () => {
      // Close database to trigger error
      sqlite.close()

      const result = await repository.findAll()

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('DATABASE_ERROR')
      }
    })

    it('should handle invalid product data in database', async () => {
      // Insert product with invalid price (negative)
      sqlite.exec(`
        INSERT INTO products (id, description, price_in_cents)
        VALUES ('invalid-prod', 'Invalid', -100)
      `)

      const result = await repository.findAll()

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('DATABASE_ERROR')
      }
    })
  })

  describe('delete', () => {
    it('should delete a product', async () => {
      const idResult = createProductId('prod-123')
      const priceResult = createPrice(10.5)

      if (!idResult.ok || !priceResult.ok) {
        throw new Error('Test setup failed')
      }

      // Insert product
      await repository.save({
        id: idResult.value,
        description: 'Test Product',
        price: priceResult.value,
      })

      // Delete product
      const deleteResult = await repository.delete(idResult.value)
      expect(deleteResult.ok).toBe(true)

      // Verify deleted
      const findResult = await repository.findById(idResult.value)
      expect(findResult.ok).toBe(false)
      if (!findResult.ok) {
        expect(findResult.error.type).toBe('NOT_FOUND')
      }
    })

    it('should return NOT_FOUND when deleting non-existent product', async () => {
      const idResult = createProductId('non-existent')

      if (!idResult.ok) {
        throw new Error('Test setup failed')
      }

      const result = await repository.delete(idResult.value)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('NOT_FOUND')
      }
    })

    it('should handle database error', async () => {
      const idResult = createProductId('prod-123')

      if (!idResult.ok) {
        throw new Error('Test setup failed')
      }

      // Close database to trigger error
      sqlite.close()

      const result = await repository.delete(idResult.value)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('DATABASE_ERROR')
      }
    })
  })

  describe('findBySKU', () => {
    it('should find products by SKU', async () => {
      const id1Result = createProductId('prod-1')
      const priceResult = createPrice(10.5)
      const skuResult = createSKU('PROD-SKU')

      if (!id1Result.ok || !priceResult.ok || !skuResult.ok) {
        throw new Error('Test setup failed')
      }

      // Insert product with SKU
      await repository.save({
        id: id1Result.value,
        description: 'Product with SKU',
        price: priceResult.value,
        sku: skuResult.value,
      })

      // Find by SKU
      const result = await repository.findBySKU('PROD-SKU')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toHaveLength(1)
        expect(result.value[0]?.sku).toBe('PROD-SKU')
      }
    })

    it('should return empty array when no products match SKU', async () => {
      const result = await repository.findBySKU('NON-EXISTENT')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toEqual([])
      }
    })

    it('should handle database error', async () => {
      // Close database to trigger error
      sqlite.close()

      const result = await repository.findBySKU('PROD-SKU')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('DATABASE_ERROR')
      }
    })

    it('should handle invalid product data in database', async () => {
      // Insert product with invalid price (negative)
      sqlite.exec(`
        INSERT INTO products (id, description, price_in_cents, sku)
        VALUES ('invalid-sku-prod', 'Invalid', -100, 'INVALID-SKU')
      `)

      const result = await repository.findBySKU('INVALID-SKU')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('DATABASE_ERROR')
      }
    })
  })

  describe('findByGTIN', () => {
    it('should find product by GTIN', async () => {
      const idResult = createProductId('prod-1')
      const priceResult = createPrice(10.5)
      const gtinResult = createGTIN('7898357417892')

      if (!idResult.ok || !priceResult.ok || !gtinResult.ok) {
        throw new Error('Test setup failed')
      }

      // Insert product with GTIN
      await repository.save({
        id: idResult.value,
        description: 'Product with GTIN',
        price: priceResult.value,
        gtin: gtinResult.value,
      })

      // Find by GTIN
      const result = await repository.findByGTIN('7898357417892')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.gtin).toBe('7898357417892')
      }
    })

    it('should return NOT_FOUND when no product matches GTIN', async () => {
      const result = await repository.findByGTIN('0000000000000')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('NOT_FOUND')
      }
    })

    it('should handle database error', async () => {
      // Close database to trigger error
      sqlite.close()

      const result = await repository.findByGTIN('7898357417892')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('DATABASE_ERROR')
      }
    })

    it('should handle invalid product data in database', async () => {
      // Insert product with invalid price (negative)
      sqlite.exec(`
        INSERT INTO products (id, description, price_in_cents, gtin)
        VALUES ('invalid-gtin-prod', 'Invalid', -100, '7891234567890')
      `)

      const result = await repository.findByGTIN('7891234567890')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('DATABASE_ERROR')
      }
    })
  })
})
