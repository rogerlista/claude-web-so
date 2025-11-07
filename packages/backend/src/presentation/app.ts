import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { ProductRepository } from '../application/ports/product-repository'
import { createProductRoutes } from './routes/product-routes'

/**
 * Application Factory
 *
 * Creates a Hono app with all routes and middleware
 * Following Hexagonal Architecture - this is the main HTTP Adapter
 *
 * Dependencies are injected via parameters (functional approach)
 */

type AppDeps = {
  readonly productRepository: ProductRepository
}

/**
 * Creates the main application with injected dependencies
 *
 * @param deps - Dependencies (repositories)
 * @returns Hono app
 *
 * @example
 * ```typescript
 * const app = createApp({
 *   productRepository: createProductRepositoryDrizzle({ db })
 * })
 *
 * export default app
 * ```
 */
export const createApp = (deps: AppDeps): Hono => {
  const app = new Hono()

  // Middleware
  app.use('*', logger())
  app.use('*', cors())

  // Health check
  app.get('/health', (c) => {
    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.0.0',
    })
  })

  // API Routes
  app.route('/api/produtos', createProductRoutes({ repository: deps.productRepository }))

  // 404 handler
  app.notFound((c) => {
    return c.json({ error: 'Not found' }, 404)
  })

  // Error handler
  /* c8 ignore next 4 */
  app.onError((err, c) => {
    console.error('Server error:', err)
    return c.json({ error: 'Internal server error' }, 500)
  })

  return app
}
