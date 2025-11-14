import { Hono } from "hono";
import type { InventoryRepository } from "../../application/ports/inventory-repository";
import { getStockUseCase } from "../../application/use-cases/get-stock";
import { registerStockMovementUseCase } from "../../application/use-cases/register-stock-movement";
import { createInventoryId } from "../../domain/inventory/inventory-id";
import type { InventoryMovement } from "../../domain/inventory/inventory-movement";
import { createProductId } from "../../domain/product/product-id";

/**
 * Inventory Routes
 *
 * REST API endpoints for inventory/stock management
 * Following Hexagonal Architecture - this is the HTTP Adapter
 *
 * Endpoints:
 * - POST /api/estoque/movimentos - Register stock movement
 * - GET /api/estoque/stock/:productId - Get current stock
 * - GET /api/estoque/movimentos/:productId - List movements for product
 * - GET /api/estoque/movimentos/id/:id - Get movement by ID
 */

type InventoryRoutesDeps = {
	readonly repository: InventoryRepository;
};

/**
 * Creates inventory routes with injected dependencies
 *
 * @param deps - Dependencies (repository)
 * @returns Hono app with inventory routes
 */
export const createInventoryRoutes = (deps: InventoryRoutesDeps): Hono => {
	const app = new Hono();

	// Inject dependencies into use cases
	const registerMovement = registerStockMovementUseCase(deps.repository);
	const getStock = getStockUseCase(deps.repository);

	/**
	 * POST /api/estoque/movimentos - Register stock movement
	 */
	app.post("/movimentos", async (c) => {
		try {
			const body = await c.req.json();

			const result = await registerMovement({
				id: body.id,
				productId: body.productId,
				quantity: body.quantity,
				type: body.type,
				date: new Date(body.date),
				description: body.description,
			});

			if (!result.ok) {
				return c.json({ error: result.error }, 400);
			}

			return c.json(
				{
					id: result.value.id,
					productId: result.value.productId,
					quantity: result.value.quantity,
					type: result.value.type,
					date: result.value.date,
					description: result.value.description,
				},
				201,
			);
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Invalid request body" }, 400);
		}
	});

	/**
	 * GET /api/estoque/stock/:productId - Get current stock
	 */
	app.get("/stock/:productId", async (c) => {
		try {
			const productId = c.req.param("productId");

			const result = await getStock({ productId });

			if (!result.ok) {
				return c.json({ error: result.error }, 404);
			}

			return c.json({
				productId: result.value.productId,
				currentQuantity: result.value.currentQuantity,
				lastMovementDate: result.value.lastMovementDate,
			});
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Failed to fetch stock" }, 500);
		}
	});

	/**
	 * GET /api/estoque/movimentos/:productId - List movements for product
	 */
	app.get("/movimentos/:productId", async (c) => {
		try {
			const productIdStr = c.req.param("productId");

			const productIdResult = createProductId(productIdStr);
			if (!productIdResult.ok) {
				return c.json({ error: "Invalid product ID" }, 400);
			}

			const result = await deps.repository.listMovements(productIdResult.value);

			if (!result.ok) {
				return c.json({ error: result.error }, 500);
			}

			return c.json({
				data: result.value.map((movement: InventoryMovement) => ({
					id: movement.id,
					productId: movement.productId,
					quantity: movement.quantity,
					type: movement.type,
					date: movement.date,
					description: movement.description,
				})),
				total: result.value.length,
			});
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Failed to list movements" }, 500);
		}
	});

	/**
	 * GET /api/estoque/movimentos/id/:id - Get movement by ID
	 */
	app.get("/movimentos/id/:id", async (c) => {
		try {
			const idStr = c.req.param("id");

			const idResult = createInventoryId(idStr);
			if (!idResult.ok) {
				return c.json({ error: "Invalid inventory ID" }, 400);
			}

			const result = await deps.repository.findById(idResult.value);

			if (!result.ok) {
				return c.json({ error: result.error }, 404);
			}

			return c.json({
				id: result.value.id,
				productId: result.value.productId,
				quantity: result.value.quantity,
				type: result.value.type,
				date: result.value.date,
				description: result.value.description,
			});
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Failed to fetch movement" }, 500);
		}
	});

	return app;
};
