import { Hono } from 'hono'
import type { SaleRepository } from '../../application/ports/sale-repository'
import { createSaleUseCase } from '../../application/use-cases/create-sale'
import type { Sale } from '../../domain/sale/sale'
import { createSaleId } from '../../domain/sale/sale-id'

/**
 * Sale Routes
 *
 * REST API endpoints for sale management
 * Following Hexagonal Architecture - this is the HTTP Adapter
 *
 * Endpoints:
 * - POST /api/vendas - Create sale
 * - GET /api/vendas - List sales
 * - GET /api/vendas/:id - Get sale by ID
 * - DELETE /api/vendas/:id - Delete sale
 */

type SaleRoutesDeps = {
  readonly repository: SaleRepository
}

/**
 * Creates sale routes with injected dependencies
 *
 * @param deps - Dependencies (repository)
 * @returns Hono app with sale routes
 */
export const createSaleRoutes = (deps: SaleRoutesDeps): Hono => {
  const app = new Hono()

  // Inject dependencies into use cases
  const createSale = createSaleUseCase(deps.repository)

  /**
   * POST /api/vendas - Create sale
   */
  app.post('/', async (c) => {
    try {
      const body = await c.req.json()

      const result = await createSale({
        id: body.id,
        customerId: body.customerId,
        items: body.items,
        status: body.status,
        createdAt: body.createdAt,
      })

      if (!result.ok) {
        if (result.error.type === 'VALIDATION_ERROR') {
          return c.json({ error: result.error.message }, 400)
        }
        return c.json({ error: 'Failed to create sale' }, 500)
      }

      return c.json(
        {
          id: result.value.id,
          customerId: result.value.customerId,
          items: result.value.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
          total: result.value.total,
          status: result.value.status,
          createdAt: result.value.createdAt.toISOString(),
        },
        201
      )
      /* c8 ignore next 3 */
    } catch (_error) {
      return c.json({ error: 'Invalid request body' }, 400)
    }
  })

  /**
   * GET /api/vendas - List sales
   */
  app.get('/', async (c) => {
    try {
      const result = await deps.repository.findAll()

      if (!result.ok) {
        return c.json({ error: 'Failed to fetch sales' }, 500)
      }

      return c.json(
        result.value.map((sale: Sale) => ({
          id: sale.id,
          customerId: sale.customerId,
          items: sale.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
          total: sale.total,
          status: sale.status,
          createdAt: sale.createdAt.toISOString(),
        }))
      )
      /* c8 ignore next 3 */
    } catch (_error) {
      return c.json({ error: 'Failed to fetch sales' }, 500)
    }
  })

  /**
   * GET /api/vendas/:id - Get sale by ID
   */
  app.get('/:id', async (c) => {
    try {
      const id = c.req.param('id')

      const saleIdResult = createSaleId(id)
      if (!saleIdResult.ok) {
        return c.json({ error: 'Invalid sale ID' }, 400)
      }

      const result = await deps.repository.findById(saleIdResult.value)

      if (!result.ok) {
        if (result.error.type === 'NOT_FOUND') {
          return c.json({ error: 'Sale not found' }, 404)
        }
        return c.json({ error: 'Failed to fetch sale' }, 500)
      }

      return c.json({
        id: result.value.id,
        customerId: result.value.customerId,
        items: result.value.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
        total: result.value.total,
        status: result.value.status,
        createdAt: result.value.createdAt.toISOString(),
      })
      /* c8 ignore next 3 */
    } catch (_error) {
      return c.json({ error: 'Failed to fetch sale' }, 500)
    }
  })

  /**
   * DELETE /api/vendas/:id - Delete sale
   */
  app.delete('/:id', async (c) => {
    try {
      const id = c.req.param('id')

      const saleIdResult = createSaleId(id)
      if (!saleIdResult.ok) {
        return c.json({ error: 'Invalid sale ID' }, 400)
      }

      const result = await deps.repository.delete(saleIdResult.value)

      if (!result.ok) {
        if (result.error.type === 'NOT_FOUND') {
          return c.json({ error: 'Sale not found' }, 404)
        }
        return c.json({ error: 'Failed to delete sale' }, 500)
      }

      return c.body(null, 204)
      /* c8 ignore next 3 */
    } catch (_error) {
      return c.json({ error: 'Failed to delete sale' }, 500)
    }
  })

  return app
}
