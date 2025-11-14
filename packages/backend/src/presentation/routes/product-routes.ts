import { Hono } from "hono";
import type { ProductRepository } from "../../application/ports/product-repository";
import { createDeleteProduct } from "../../application/use-cases/delete-product";
import { createFindAllProducts } from "../../application/use-cases/find-all-products";
import { createFindProductById } from "../../application/use-cases/find-product-by-id";
import { createSaveProduct } from "../../application/use-cases/save-product";
import { createSearchProducts } from "../../application/use-cases/search-products";
import type { Product } from "../../domain/product/product";

/**
 * Product Routes
 *
 * REST API endpoints for product management
 * Following Hexagonal Architecture - this is the HTTP Adapter
 *
 * Endpoints:
 * - POST /api/produtos - Create/Update product
 * - GET /api/produtos - List products (paginated)
 * - GET /api/produtos/search - Search products by query
 * - GET /api/produtos/:id - Get product by ID
 * - PUT /api/produtos/:id - Update product
 * - DELETE /api/produtos/:id - Delete product
 */

type ProductRoutesDeps = {
	readonly repository: ProductRepository;
};

/**
 * Creates product routes with injected dependencies
 *
 * @param deps - Dependencies (repository)
 * @returns Hono app with product routes
 */
export const createProductRoutes = (deps: ProductRoutesDeps): Hono => {
	const app = new Hono();

	// Inject dependencies into use cases
	const saveProduct = createSaveProduct(deps);
	const findProductById = createFindProductById(deps);
	const findAllProducts = createFindAllProducts(deps);
	const searchProducts = createSearchProducts(deps);
	const deleteProduct = createDeleteProduct(deps);

	/**
	 * POST /api/produtos - Create product
	 */
	app.post("/", async (c) => {
		try {
			const body = await c.req.json();

			const result = await saveProduct({
				id: body.id,
				description: body.description,
				price: body.price,
				sku: body.sku,
				gtin: body.gtin,
			});

			if (!result.ok) {
				return c.json({ error: result.error }, 400);
			}

			return c.json(
				{
					id: result.value.id,
					description: result.value.description,
					price: result.value.price,
					sku: result.value.sku,
					gtin: result.value.gtin,
				},
				201,
			);
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Invalid request body" }, 400);
		}
	});

	/**
	 * GET /api/produtos - List products (paginated)
	 */
	app.get("/", async (c) => {
		try {
			const pageQuery = c.req.query("page");
			const pageSizeQuery = c.req.query("pageSize");

			const input: { page?: number; pageSize?: number } = {};
			if (pageQuery) {
				input.page = Number.parseInt(pageQuery, 10);
			}
			if (pageSizeQuery) {
				input.pageSize = Number.parseInt(pageSizeQuery, 10);
			}

			const result = await findAllProducts(input);

			if (!result.ok) {
				return c.json({ error: result.error }, 400);
			}

			return c.json({
				data: result.value.data.map((product: Product) => ({
					id: product.id,
					description: product.description,
					price: product.price,
					sku: product.sku,
					gtin: product.gtin,
				})),
				total: result.value.total,
				page: result.value.page,
				pageSize: result.value.pageSize,
				totalPages: result.value.totalPages,
			});
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Failed to fetch products" }, 500);
		}
	});

	/**
	 * GET /api/produtos/search - Search products
	 */
	app.get("/search", async (c) => {
		try {
			const query = c.req.query("q");

			if (!query) {
				return c.json({ error: 'Query parameter "q" is required' }, 400);
			}

			const result = await searchProducts({ query });

			if (!result.ok) {
				return c.json({ error: result.error }, 400);
			}

			return c.json({
				data: result.value.map((product: Product) => ({
					id: product.id,
					description: product.description,
					price: product.price,
					sku: product.sku,
					gtin: product.gtin,
				})),
				total: result.value.length,
			});
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Failed to search products" }, 500);
		}
	});

	/**
	 * GET /api/produtos/:id - Get product by ID
	 */
	app.get("/:id", async (c) => {
		try {
			const id = c.req.param("id");

			const result = await findProductById({ id });

			if (!result.ok) {
				return c.json({ error: result.error }, 404);
			}

			return c.json({
				id: result.value.id,
				description: result.value.description,
				price: result.value.price,
				sku: result.value.sku,
				gtin: result.value.gtin,
			});
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Failed to fetch product" }, 500);
		}
	});

	/**
	 * PUT /api/produtos/:id - Update product
	 */
	app.put("/:id", async (c) => {
		try {
			const id = c.req.param("id");
			const body = await c.req.json();

			const result = await saveProduct({
				id,
				description: body.description,
				price: body.price,
				sku: body.sku,
				gtin: body.gtin,
			});

			if (!result.ok) {
				return c.json({ error: result.error }, 400);
			}

			return c.json({
				id: result.value.id,
				description: result.value.description,
				price: result.value.price,
				sku: result.value.sku,
				gtin: result.value.gtin,
			});
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Invalid request body" }, 400);
		}
	});

	/**
	 * DELETE /api/produtos/:id - Delete product
	 */
	app.delete("/:id", async (c) => {
		try {
			const id = c.req.param("id");

			const result = await deleteProduct({ id });

			if (!result.ok) {
				return c.json({ error: result.error }, 404);
			}

			return c.json({ message: "Product deleted successfully" });
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Failed to delete product" }, 500);
		}
	});

	return app;
};
