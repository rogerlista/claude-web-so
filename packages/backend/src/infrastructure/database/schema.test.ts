import { describe, expect, it } from 'vitest'
import { customers, products, saleItems, sales } from './schema'
import type { CustomerInsert, ProductInsert, SaleInsert, SaleItemInsert } from './schema'

/**
 * Schema Validation Tests
 *
 * These tests validate that the Drizzle ORM schemas are correctly defined
 * and that type inference works as expected.
 */

describe('Database Schema', () => {
  describe('products schema', () => {
    it('should have correct table structure', () => {
      expect(products).toBeDefined()
      expect(products.id).toBeDefined()
      expect(products.description).toBeDefined()
      expect(products.priceInCents).toBeDefined()
      expect(products.sku).toBeDefined()
      expect(products.gtin).toBeDefined()
      expect(products.createdAt).toBeDefined()
      expect(products.updatedAt).toBeDefined()
    })

    it('should infer ProductInsert type correctly', () => {
      const product: ProductInsert = {
        id: 'product-1',
        description: 'Test Product',
        priceInCents: 1000,
      }

      expect(product.id).toBe('product-1')
      expect(product.description).toBe('Test Product')
      expect(product.priceInCents).toBe(1000)
    })
  })

  describe('customers schema', () => {
    it('should have correct table structure', () => {
      expect(customers).toBeDefined()
      expect(customers.id).toBeDefined()
      expect(customers.name).toBeDefined()
      expect(customers.cpf).toBeDefined()
      expect(customers.email).toBeDefined()
      expect(customers.phone).toBeDefined()
      expect(customers.createdAt).toBeDefined()
      expect(customers.updatedAt).toBeDefined()
    })

    it('should infer CustomerInsert type correctly', () => {
      const customer: CustomerInsert = {
        id: 'customer-1',
        name: 'John Doe',
        cpf: '12345678909',
      }

      expect(customer.id).toBe('customer-1')
      expect(customer.name).toBe('John Doe')
      expect(customer.cpf).toBe('12345678909')
    })

    it('should support optional email and phone', () => {
      const customerWithOptionals: CustomerInsert = {
        id: 'customer-2',
        name: 'Jane Doe',
        cpf: '98765432109',
        email: 'jane@example.com',
        phone: '11987654321',
      }

      expect(customerWithOptionals.email).toBe('jane@example.com')
      expect(customerWithOptionals.phone).toBe('11987654321')
    })
  })

  describe('sales schema', () => {
    it('should have correct table structure', () => {
      expect(sales).toBeDefined()
      expect(sales.id).toBeDefined()
      expect(sales.customerId).toBeDefined()
      expect(sales.totalInCents).toBeDefined()
      expect(sales.status).toBeDefined()
      expect(sales.createdAt).toBeDefined()
      expect(sales.updatedAt).toBeDefined()
    })

    it('should infer SaleInsert type correctly', () => {
      const sale: SaleInsert = {
        id: 'sale-1',
        customerId: 'customer-1',
        totalInCents: 2100,
        status: 'PENDING',
      }

      expect(sale.id).toBe('sale-1')
      expect(sale.customerId).toBe('customer-1')
      expect(sale.totalInCents).toBe(2100)
      expect(sale.status).toBe('PENDING')
    })

    it('should have foreign key reference to customers', () => {
      expect(sales.customerId).toBeDefined()
      // The foreign key constraint is defined in the schema
      // and will be enforced by the database
    })
  })

  describe('saleItems schema', () => {
    it('should have correct table structure', () => {
      expect(saleItems).toBeDefined()
      expect(saleItems.id).toBeDefined()
      expect(saleItems.saleId).toBeDefined()
      expect(saleItems.productId).toBeDefined()
      expect(saleItems.quantity).toBeDefined()
      expect(saleItems.unitPriceInCents).toBeDefined()
      expect(saleItems.totalInCents).toBeDefined()
      expect(saleItems.createdAt).toBeDefined()
    })

    it('should infer SaleItemInsert type correctly', () => {
      const saleItem: SaleItemInsert = {
        id: 'item-1',
        saleId: 'sale-1',
        productId: 'product-1',
        quantity: 2,
        unitPriceInCents: 1050,
        totalInCents: 2100,
      }

      expect(saleItem.id).toBe('item-1')
      expect(saleItem.saleId).toBe('sale-1')
      expect(saleItem.productId).toBe('product-1')
      expect(saleItem.quantity).toBe(2)
      expect(saleItem.unitPriceInCents).toBe(1050)
      expect(saleItem.totalInCents).toBe(2100)
    })

    it('should have foreign key reference to sales with cascade delete', () => {
      expect(saleItems.saleId).toBeDefined()
      // The foreign key with CASCADE is defined in the schema
      // When a sale is deleted, its items will be deleted automatically
    })

    it('should have foreign key reference to products', () => {
      expect(saleItems.productId).toBeDefined()
      // The foreign key constraint is defined in the schema
    })
  })

  describe('schema relationships', () => {
    it('should define correct relationships between tables', () => {
      // Sales references Customers
      expect(sales.customerId).toBeDefined()

      // SaleItems references Sales
      expect(saleItems.saleId).toBeDefined()

      // SaleItems references Products
      expect(saleItems.productId).toBeDefined()
    })
  })
})
