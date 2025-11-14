import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import { createCustomerId } from '../../domain/customer/customer-id'
import { createPrice } from '../../domain/product/price'
import { createProductId } from '../../domain/product/product-id'
import type { Sale } from '../../domain/sale/sale'
import { createSaleId } from '../../domain/sale/sale-id'
import { createSaleItem } from '../../domain/sale/sale-item'
import { createSaleRepositoryDrizzle } from './sale-repository-drizzle'

/**
 * TDD - RED Phase
 * Tests for SaleRepository Drizzle adapter
 */

describe('SaleRepository Drizzle Adapter', () => {
  let sqlite: Database.Database
  let db: ReturnType<typeof drizzle>
  let repository: ReturnType<typeof createSaleRepositoryDrizzle>

  beforeEach(() => {
    sqlite = new Database(':memory:')
    db = drizzle(sqlite)

    // Create required tables (matching expanded NFC-e schema)
    sqlite.exec(`
      CREATE TABLE customers (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        phone TEXT,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      );

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
      );

      CREATE TABLE users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        login TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        active INTEGER DEFAULT 1 NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      );

      CREATE TABLE sales (
        id TEXT PRIMARY KEY NOT NULL,
        numero_venda INTEGER,
        data_hora INTEGER DEFAULT (unixepoch()),
        user_id TEXT REFERENCES users(id),
        customer_id TEXT REFERENCES customers(id),
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
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      );

      CREATE TABLE sale_items (
        id TEXT PRIMARY KEY NOT NULL,
        sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
        product_id TEXT NOT NULL REFERENCES products(id),
        numero_item INTEGER,
        codigo TEXT,
        descricao TEXT,
        quantity INTEGER NOT NULL,
        unit_price_in_cents INTEGER,
        total_in_cents INTEGER,
        valor_unitario_in_cents INTEGER,
        total_item_in_cents INTEGER,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL
      );
    `)

    // Insert test customer and product
    sqlite.exec(`
      INSERT INTO customers (id, name, cpf) VALUES ('customer-456', 'João Silva', '12345678909');
      INSERT INTO products (id, description, price_in_cents) VALUES ('product-789', 'Test Product', 1050);
    `)

    repository = createSaleRepositoryDrizzle(db)
  })

  describe('save', () => {
    it('should save a new sale with items', async () => {
      const saleIdResult = createSaleId('sale-123')
      const customerIdResult = createCustomerId('customer-456')
      const productIdResult = createProductId('product-789')
      const priceResult = createPrice(10.5)

      if (!saleIdResult.ok || !customerIdResult.ok || !productIdResult.ok || !priceResult.ok) {
        throw new Error('Setup failed')
      }

      const itemResult = createSaleItem({
        productId: productIdResult.value,
        quantity: 2,
        unitPrice: priceResult.value,
      })

      if (!itemResult.ok) {
        throw new Error('Setup failed')
      }

      const sale: Sale = {
        id: saleIdResult.value,
        customerId: customerIdResult.value,
        items: [itemResult.value],
        grossTotal: 21.0,
        discount: 0,
        addition: 0,
        netTotal: 21.0,
        payments: [],
        status: 'PENDING',
        createdAt: new Date('2025-01-01'),
      }

      const result = await repository.save(sale)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.id).toBe('sale-123')
        expect(result.value.customerId).toBe('customer-456')
        expect(result.value.items).toHaveLength(1)
        expect(result.value.netTotal).toBe(21.0)
        expect(result.value.status).toBe('PENDING')
      }
    })

    it('should save a sale with multiple items', async () => {
      const saleIdResult = createSaleId('sale-123')
      const customerIdResult = createCustomerId('customer-456')
      const productIdResult = createProductId('product-789')
      const price1Result = createPrice(10.5)
      const price2Result = createPrice(5.0)

      if (
        !saleIdResult.ok ||
        !customerIdResult.ok ||
        !productIdResult.ok ||
        !price1Result.ok ||
        !price2Result.ok
      ) {
        throw new Error('Setup failed')
      }

      const item1Result = createSaleItem({
        productId: productIdResult.value,
        quantity: 2,
        unitPrice: price1Result.value,
      })

      const item2Result = createSaleItem({
        productId: productIdResult.value,
        quantity: 1,
        unitPrice: price2Result.value,
      })

      if (!item1Result.ok || !item2Result.ok) {
        throw new Error('Setup failed')
      }

      const sale: Sale = {
        id: saleIdResult.value,
        customerId: customerIdResult.value,
        items: [item1Result.value, item2Result.value],
        grossTotal: 26.0,
        discount: 0,
        addition: 0,
        netTotal: 26.0,
        payments: [],
        status: 'PENDING',
        createdAt: new Date(),
      }

      const result = await repository.save(sale)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.items).toHaveLength(2)
      }
    })

    it('should handle database error', async () => {
      const saleIdResult = createSaleId('sale-123')
      const customerIdResult = createCustomerId('customer-456')
      const productIdResult = createProductId('product-789')
      const priceResult = createPrice(10.5)

      if (!saleIdResult.ok || !customerIdResult.ok || !productIdResult.ok || !priceResult.ok) {
        throw new Error('Setup failed')
      }

      const itemResult = createSaleItem({
        productId: productIdResult.value,
        quantity: 2,
        unitPrice: priceResult.value,
      })

      if (!itemResult.ok) {
        throw new Error('Setup failed')
      }

      const sale: Sale = {
        id: saleIdResult.value,
        customerId: customerIdResult.value,
        items: [itemResult.value],
        grossTotal: 21.0,
        discount: 0,
        addition: 0,
        netTotal: 21.0,
        payments: [],
        status: 'PENDING',
        createdAt: new Date(),
      }

      // Close database to trigger error
      sqlite.close()

      const result = await repository.save(sale)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('DATABASE_ERROR')
      }
    })
  })

  describe('findById', () => {
    it('should find a sale by ID', async () => {
      const saleIdResult = createSaleId('sale-123')
      const customerIdResult = createCustomerId('customer-456')
      const productIdResult = createProductId('product-789')
      const priceResult = createPrice(10.5)

      if (!saleIdResult.ok || !customerIdResult.ok || !productIdResult.ok || !priceResult.ok) {
        throw new Error('Setup failed')
      }

      const itemResult = createSaleItem({
        productId: productIdResult.value,
        quantity: 2,
        unitPrice: priceResult.value,
      })

      if (!itemResult.ok) {
        throw new Error('Setup failed')
      }

      const sale: Sale = {
        id: saleIdResult.value,
        customerId: customerIdResult.value,
        items: [itemResult.value],
        grossTotal: 21.0,
        discount: 0,
        addition: 0,
        netTotal: 21.0,
        payments: [],
        status: 'PENDING',
        createdAt: new Date('2025-01-01'),
      }

      await repository.save(sale)

      const result = await repository.findById(saleIdResult.value)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value.id).toBe('sale-123')
        expect(result.value.items).toHaveLength(1)
        expect(result.value.netTotal).toBe(21.0)
      }
    })

    it('should return NOT_FOUND for non-existent sale', async () => {
      const idResult = createSaleId('non-existent')
      if (!idResult.ok) {
        throw new Error('Setup failed')
      }

      const result = await repository.findById(idResult.value)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'NOT_FOUND') {
        expect(result.error.type).toBe('NOT_FOUND')
      }
    })

    it('should handle database error', async () => {
      const idResult = createSaleId('sale-123')
      if (!idResult.ok) {
        throw new Error('Setup failed')
      }

      // Close database to trigger error
      sqlite.close()

      const result = await repository.findById(idResult.value)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('DATABASE_ERROR')
      }
    })
  })

  describe('findByCustomerId', () => {
    it('should find all sales for a customer', async () => {
      const saleId1Result = createSaleId('sale-123')
      const saleId2Result = createSaleId('sale-456')
      const customerIdResult = createCustomerId('customer-456')
      const productIdResult = createProductId('product-789')
      const priceResult = createPrice(10.5)

      if (
        !saleId1Result.ok ||
        !saleId2Result.ok ||
        !customerIdResult.ok ||
        !productIdResult.ok ||
        !priceResult.ok
      ) {
        throw new Error('Setup failed')
      }

      const itemResult = createSaleItem({
        productId: productIdResult.value,
        quantity: 1,
        unitPrice: priceResult.value,
      })

      if (!itemResult.ok) {
        throw new Error('Setup failed')
      }

      const sale1: Sale = {
        id: saleId1Result.value,
        customerId: customerIdResult.value,
        items: [itemResult.value],
        grossTotal: 10.5,
        discount: 0,
        addition: 0,
        netTotal: 10.5,
        payments: [],
        status: 'PENDING',
        createdAt: new Date(),
      }

      const sale2: Sale = {
        id: saleId2Result.value,
        customerId: customerIdResult.value,
        items: [itemResult.value],
        grossTotal: 10.5,
        discount: 0,
        addition: 0,
        netTotal: 10.5,
        payments: [],
        status: 'COMPLETED',
        createdAt: new Date(),
      }

      await repository.save(sale1)
      await repository.save(sale2)

      const result = await repository.findByCustomerId(customerIdResult.value)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toHaveLength(2)
      }
    })

    it('should handle database error', async () => {
      const customerIdResult = createCustomerId('customer-456')
      if (!customerIdResult.ok) {
        throw new Error('Setup failed')
      }

      // Close database to trigger error
      sqlite.close()

      const result = await repository.findByCustomerId(customerIdResult.value)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('DATABASE_ERROR')
      }
    })
  })

  describe('findByStatus', () => {
    it('should find all sales with a specific status', async () => {
      const saleId1Result = createSaleId('sale-123')
      const saleId2Result = createSaleId('sale-456')
      const customerIdResult = createCustomerId('customer-456')
      const productIdResult = createProductId('product-789')
      const priceResult = createPrice(10.5)

      if (
        !saleId1Result.ok ||
        !saleId2Result.ok ||
        !customerIdResult.ok ||
        !productIdResult.ok ||
        !priceResult.ok
      ) {
        throw new Error('Setup failed')
      }

      const itemResult = createSaleItem({
        productId: productIdResult.value,
        quantity: 1,
        unitPrice: priceResult.value,
      })

      if (!itemResult.ok) {
        throw new Error('Setup failed')
      }

      const sale1: Sale = {
        id: saleId1Result.value,
        customerId: customerIdResult.value,
        items: [itemResult.value],
        grossTotal: 10.5,
        discount: 0,
        addition: 0,
        netTotal: 10.5,
        payments: [],
        status: 'PENDING',
        createdAt: new Date(),
      }

      const sale2: Sale = {
        id: saleId2Result.value,
        customerId: customerIdResult.value,
        items: [itemResult.value],
        grossTotal: 10.5,
        discount: 0,
        addition: 0,
        netTotal: 10.5,
        payments: [],
        status: 'COMPLETED',
        createdAt: new Date(),
      }

      await repository.save(sale1)
      await repository.save(sale2)

      const result = await repository.findByStatus('PENDING')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toHaveLength(1)
        expect(result.value[0]?.status).toBe('PENDING')
      }
    })

    it('should handle database error', async () => {
      // Close database to trigger error
      sqlite.close()

      const result = await repository.findByStatus('PENDING')

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.type).toBe('DATABASE_ERROR')
      }
    })

    it('should return empty array when no sales with status exist', async () => {
      const result = await repository.findByStatus('CANCELLED')

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toHaveLength(0)
      }
    })
  })

  describe('findAll', () => {
    it('should find all sales', async () => {
      const saleId1Result = createSaleId('sale-123')
      const saleId2Result = createSaleId('sale-456')
      const customerIdResult = createCustomerId('customer-456')
      const productIdResult = createProductId('product-789')
      const priceResult = createPrice(10.5)

      if (
        !saleId1Result.ok ||
        !saleId2Result.ok ||
        !customerIdResult.ok ||
        !productIdResult.ok ||
        !priceResult.ok
      ) {
        throw new Error('Setup failed')
      }

      const itemResult = createSaleItem({
        productId: productIdResult.value,
        quantity: 1,
        unitPrice: priceResult.value,
      })

      if (!itemResult.ok) {
        throw new Error('Setup failed')
      }

      const sale1: Sale = {
        id: saleId1Result.value,
        customerId: customerIdResult.value,
        items: [itemResult.value],
        grossTotal: 10.5,
        discount: 0,
        addition: 0,
        netTotal: 10.5,
        payments: [],
        status: 'PENDING',
        createdAt: new Date(),
      }

      const sale2: Sale = {
        id: saleId2Result.value,
        customerId: customerIdResult.value,
        items: [itemResult.value],
        grossTotal: 10.5,
        discount: 0,
        addition: 0,
        netTotal: 10.5,
        payments: [],
        status: 'COMPLETED',
        createdAt: new Date(),
      }

      await repository.save(sale1)
      await repository.save(sale2)

      const result = await repository.findAll()

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.value).toHaveLength(2)
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
  })

  describe('delete', () => {
    it('should delete a sale and its items (cascade)', async () => {
      const saleIdResult = createSaleId('sale-123')
      const customerIdResult = createCustomerId('customer-456')
      const productIdResult = createProductId('product-789')
      const priceResult = createPrice(10.5)

      if (!saleIdResult.ok || !customerIdResult.ok || !productIdResult.ok || !priceResult.ok) {
        throw new Error('Setup failed')
      }

      const itemResult = createSaleItem({
        productId: productIdResult.value,
        quantity: 2,
        unitPrice: priceResult.value,
      })

      if (!itemResult.ok) {
        throw new Error('Setup failed')
      }

      const sale: Sale = {
        id: saleIdResult.value,
        customerId: customerIdResult.value,
        items: [itemResult.value],
        grossTotal: 21.0,
        discount: 0,
        addition: 0,
        netTotal: 21.0,
        payments: [],
        status: 'PENDING',
        createdAt: new Date(),
      }

      await repository.save(sale)

      const deleteResult = await repository.delete(saleIdResult.value)

      expect(deleteResult.ok).toBe(true)

      const findResult = await repository.findById(saleIdResult.value)
      expect(findResult.ok).toBe(false)
    })

    it('should return NOT_FOUND when deleting non-existent sale', async () => {
      const idResult = createSaleId('non-existent')
      if (!idResult.ok) {
        throw new Error('Setup failed')
      }

      const result = await repository.delete(idResult.value)

      expect(result.ok).toBe(false)
      if (!result.ok && result.error.type === 'NOT_FOUND') {
        expect(result.error.type).toBe('NOT_FOUND')
      }
    })

    it('should handle database error', async () => {
      const idResult = createSaleId('sale-123')
      if (!idResult.ok) {
        throw new Error('Setup failed')
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
})
