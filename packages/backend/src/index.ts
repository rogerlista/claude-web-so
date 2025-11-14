/**
 * @pos-nfce/backend - Entry Point
 *
 * Phase 4: Módulo de Produtos - REST API
 *
 * Functional Architecture:
 * - Database connection → Repository adapter → Use cases → HTTP routes
 * - All dependencies injected via function parameters (currying)
 */

import { serve } from '@hono/node-server'
import { createDatabase } from './infrastructure/database/connection'
import { createInventoryRepositoryDrizzle } from './infrastructure/repositories/inventory-repository-drizzle'
import { createProductRepositoryDrizzle } from './infrastructure/repositories/product-repository-drizzle'
import { createSaleRepositoryDrizzle } from './infrastructure/repositories/sale-repository-drizzle'
import { createApp } from './presentation/app'

/**
 * Application Bootstrap
 *
 * Wires dependencies and starts the server
 * Pure functional approach - no classes, no OOP
 */
const bootstrap = () => {
  // Create database connection
  const db = createDatabase()

  // Create repository adapters
  const productRepository = createProductRepositoryDrizzle(db)
  const inventoryRepository = createInventoryRepositoryDrizzle(db)
  const saleRepository = createSaleRepositoryDrizzle(db)

  // Create app with injected dependencies
  const app = createApp({
    productRepository,
    inventoryRepository,
    saleRepository,
  })

  // Start server
  const port = Number.parseInt(process.env['PORT'] ?? '3000', 10)

  serve({
    fetch: app.fetch,
    port,
  })
}

// Start application if running as main module
if (import.meta.url === `file://${process.argv[1]}`) {
  bootstrap()
}

export const version = '0.0.0'
export const status = 'Phase 4: Módulo de Produtos - REST API'
