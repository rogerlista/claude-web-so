import { Hono } from "hono";
import type { InventoryRepository } from "../../application/ports/inventory-repository";
import type { SaleRepository } from "../../application/ports/sale-repository";
import { createAddSaleItemUseCase } from "../../application/use-cases/add-sale-item";
import { createAddSalePaymentUseCase } from "../../application/use-cases/add-sale-payment";
import { createApplySaleDiscountUseCase } from "../../application/use-cases/apply-sale-discount";
import { createSaleUseCase } from "../../application/use-cases/create-sale";
import { createFinalizeSaleUseCase } from "../../application/use-cases/finalize-sale";
import { createRemoveSaleItemUseCase } from "../../application/use-cases/remove-sale-item";
import { createUpdateSaleItemQuantityUseCase } from "../../application/use-cases/update-sale-item-quantity";
import { createCPF } from "../../domain/customer/cpf";
import { createEmail } from "../../domain/customer/email";
import type { Sale } from "../../domain/sale/sale";
import { createSaleId } from "../../domain/sale/sale-id";

/**
 * Sale Routes
 *
 * REST API endpoints for sales management (PDV/POS)
 * Following Hexagonal Architecture - this is the HTTP Adapter
 *
 * Endpoints:
 * - POST /api/vendas - Create new sale
 * - GET /api/vendas/:id - Get sale by ID
 * - POST /api/vendas/:id/items - Add item to sale
 * - DELETE /api/vendas/:id/items/:productId - Remove item from sale
 * - PUT /api/vendas/:id/items/:productId - Update item quantity
 * - POST /api/vendas/:id/discount - Apply discount to sale
 * - POST /api/vendas/:id/payments - Add payment to sale
 * - POST /api/vendas/:id/finalize - Finalize sale
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
	readonly saleRepository: SaleRepository;
	readonly inventoryRepository: InventoryRepository;
};

/**
 * Creates sale routes with injected dependencies
 *
 * @param deps - Dependencies (repository)
 * @returns Hono app with sale routes
 */
export const createSaleRoutes = (deps: SaleRoutesDeps): Hono => {
	const app = new Hono();

	// Inject dependencies into use cases
	const createSale = createSaleUseCase(deps.saleRepository);
	const addSaleItem = createAddSaleItemUseCase({
		saleRepository: deps.saleRepository,
		inventoryRepository: deps.inventoryRepository,
	});
	const removeSaleItem = createRemoveSaleItemUseCase(deps.saleRepository);
	const updateSaleItemQuantity = createUpdateSaleItemQuantityUseCase(
		deps.saleRepository,
	);
	const applySaleDiscount = createApplySaleDiscountUseCase(
		deps.saleRepository,
	);
	const addSalePayment = createAddSalePaymentUseCase(deps.saleRepository);
	const finalizeSale = createFinalizeSaleUseCase({
		saleRepository: deps.saleRepository,
		inventoryRepository: deps.inventoryRepository,
	});

	/**
	 * POST /api/vendas - Create sale
	 */
	app.post("/", async (c) => {
		try {
			const body = await c.req.json();

			const result = await createSale({
				id: body.id,
				customerId: body.customerId,
				items: body.items,
				discount: body.discount,
				addition: body.addition,
				status: body.status,
			});

			if (!result.ok) {
				const error = result.error;
				if (error.type === "VALIDATION_ERROR") {
					return c.json({ error: error.message }, 400);
				}
				return c.json({ error: "Failed to create sale" }, 500);
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
					grossTotal: result.value.grossTotal,
					discount: result.value.discount,
					addition: result.value.addition,
					netTotal: result.value.netTotal,
					payments: result.value.payments,
					status: result.value.status,
					createdAt: result.value.createdAt.toISOString(),
				},
				201,
			);
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Invalid request body" }, 400);
		}
	});

	/**
	 * GET /api/vendas/:id - Get sale by ID
	 */
	app.get("/:id", async (c) => {
		try {
			const id = c.req.param("id");

			const result = await deps.saleRepository.findById(id as never);

			if (!result.ok) {
				if (result.error.type === "NOT_FOUND") {
					return c.json({ error: "Sale not found" }, 404);
				}
				return c.json({ error: "Failed to fetch sale" }, 500);
			}

			return c.json({
				id: result.value.id,
				customerId: result.value.customerId,
				items: result.value.items,
				grossTotal: result.value.grossTotal,
				discount: result.value.discount,
				addition: result.value.addition,
				netTotal: result.value.netTotal,
				payments: result.value.payments,
				status: result.value.status,
				createdAt: result.value.createdAt,
			});
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Failed to fetch sale" }, 500);
		}
	});

	/**
	 * POST /api/vendas/:id/items - Add item to sale
	 */
	app.post("/:id/items", async (c) => {
		try {
			const saleId = c.req.param("id");
			const body = await c.req.json();

			const result = await addSaleItem({
				saleId,
				productId: body.productId,
				quantity: body.quantity,
				unitPrice: body.unitPrice,
			});

			if (!result.ok) {
				const error = result.error;
				if (error.type === "VALIDATION_ERROR") {
					return c.json({ error: error.message }, 400);
				}
				if (error.type === "SALE_NOT_FOUND") {
					return c.json({ error: "Sale not found" }, 404);
				}
				return c.json({ error: "Failed to add item" }, 500);
			}

			return c.json({
				id: result.value.id,
				items: result.value.items,
				grossTotal: result.value.grossTotal,
				netTotal: result.value.netTotal,
			});
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Invalid request body" }, 400);
		}
	});

	/**
	 * DELETE /api/vendas/:id/items/:productId - Remove item from sale
	 */
	app.delete("/:id/items/:productId", async (c) => {
		try {
			const saleId = c.req.param("id");
			const productId = c.req.param("productId");

			const result = await removeSaleItem({
				saleId,
				productId,
			});

			if (!result.ok) {
				const error = result.error;
				if (error.type === "VALIDATION_ERROR") {
					return c.json({ error: error.message }, 400);
				}
				if (error.type === "SALE_NOT_FOUND") {
					return c.json({ error: "Sale not found" }, 404);
				}
				return c.json({ error: "Failed to remove item" }, 500);
			}

			return c.json({
				id: result.value.id,
				items: result.value.items,
				grossTotal: result.value.grossTotal,
				netTotal: result.value.netTotal,
			});
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Failed to remove item" }, 500);
		}
	});

	/**
	 * PUT /api/vendas/:id/items/:productId - Update item quantity
	 */
	app.put("/:id/items/:productId", async (c) => {
		try {
			const saleId = c.req.param("id");
			const productId = c.req.param("productId");
			const body = await c.req.json();

			const result = await updateSaleItemQuantity({
				saleId,
				productId,
				quantity: body.quantity,
			});

			if (!result.ok) {
				const error = result.error;
				if (error.type === "VALIDATION_ERROR") {
					return c.json({ error: error.message }, 400);
				}
				if (error.type === "SALE_NOT_FOUND") {
					return c.json({ error: "Sale not found" }, 404);
				}
				return c.json({ error: "Failed to update item" }, 500);
			}

			return c.json({
				id: result.value.id,
				items: result.value.items,
				grossTotal: result.value.grossTotal,
				netTotal: result.value.netTotal,
			});
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Invalid request body" }, 400);
		}
	});

	/**
	 * POST /api/vendas/:id/discount - Apply discount to sale
	 */
	app.post("/:id/discount", async (c) => {
		try {
			const saleId = c.req.param("id");
			const body = await c.req.json();

			const result = await applySaleDiscount({
				saleId,
				discount: body.discount,
			});

			if (!result.ok) {
				const error = result.error;
				if (error.type === "VALIDATION_ERROR") {
					return c.json({ error: error.message }, 400);
				}
				if (error.type === "SALE_NOT_FOUND") {
					return c.json({ error: "Sale not found" }, 404);
				}
				return c.json({ error: "Failed to apply discount" }, 500);
			}

			return c.json({
				id: result.value.id,
				discount: result.value.discount,
				grossTotal: result.value.grossTotal,
				netTotal: result.value.netTotal,
			});
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Invalid request body" }, 400);
		}
	});

	/**
	 * POST /api/vendas/:id/payments - Add payment to sale
	 */
	app.post("/:id/payments", async (c) => {
		try {
			const saleId = c.req.param("id");
			const body = await c.req.json();

			const result = await addSalePayment({
				saleId,
				paymentMethodCode: body.paymentMethodCode,
				amount: body.amount,
			});

			if (!result.ok) {
				const error = result.error;
				if (error.type === "VALIDATION_ERROR") {
					return c.json({ error: error.message }, 400);
				}
				if (error.type === "SALE_NOT_FOUND") {
					return c.json({ error: "Sale not found" }, 404);
				}
				return c.json({ error: "Failed to add payment" }, 500);
			}

			return c.json({
				id: result.value.id,
				payments: result.value.payments,
				netTotal: result.value.netTotal,
			});
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Invalid request body" }, 400);
		}
	});

	/**
	 * PATCH /api/vendas/:id/customer-info - Update customer information
	 */
	app.patch("/:id/customer-info", async (c) => {
		try {
			const saleIdStr = c.req.param("id");
			const body = await c.req.json();

			const saleIdResult = createSaleId(saleIdStr);
			if (!saleIdResult.ok) {
				return c.json({ error: "Invalid sale ID" }, 400);
			}

			// Validate CPF if provided
			let customerCpf;
			if (body.cpf) {
				const cpfResult = createCPF(body.cpf);
				if (!cpfResult.ok) {
					return c.json({ error: `Invalid CPF: ${cpfResult.error}` }, 400);
				}
				customerCpf = cpfResult.value;
			}

			// Validate Email if provided
			let customerEmail;
			if (body.email) {
				const emailResult = createEmail(body.email);
				if (!emailResult.ok) {
					return c.json({ error: `Invalid email: ${emailResult.error}` }, 400);
				}
				customerEmail = emailResult.value;
			}

			// Get current sale
			const saleResult = await deps.saleRepository.findById(saleIdResult.value);
			if (!saleResult.ok) {
				return c.json({ error: "Sale not found" }, 404);
			}

			// Update sale with customer info
			const updatedSale: Sale = {
				...saleResult.value,
				...(customerCpf !== undefined && { customerCpf }),
				...(customerEmail !== undefined && { customerEmail }),
			};

			// Save updated sale
			const saveResult = await deps.saleRepository.save(updatedSale);
			if (!saveResult.ok) {
				return c.json({ error: "Failed to update customer info" }, 500);
			}

			return c.json({ data: saveResult.value });
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Invalid request body" }, 400);
		}
	});

	/**
	 * POST /api/vendas/:id/finalize - Finalize sale
	 */
	app.post("/:id/finalize", async (c) => {
		try {
			const saleId = c.req.param("id");

			const result = await finalizeSale({ saleId });

			if (!result.ok) {
				const error = result.error;
				if (error.type === "VALIDATION_ERROR") {
					return c.json({ error: error.message }, 400);
				}
				if (error.type === "SALE_NOT_FOUND") {
					return c.json({ error: "Sale not found" }, 404);
				}
				return c.json({ error: "Failed to finalize sale" }, 500);
			}

			return c.json({
				id: result.value.id,
				status: result.value.status,
				netTotal: result.value.netTotal,
				payments: result.value.payments,
				createdAt: result.value.createdAt,
			});
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Failed to finalize sale" }, 500);
		}
	});

	/**
	 * GET /api/vendas - List sales
	 */
	app.get("/", async (c) => {
		try {
			const result = await deps.saleRepository.findAll();

			if (!result.ok) {
				return c.json({ error: "Failed to fetch sales" }, 500);
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
					grossTotal: sale.grossTotal,
					discount: sale.discount,
					addition: sale.addition,
					netTotal: sale.netTotal,
					payments: sale.payments,
					status: sale.status,
					createdAt: sale.createdAt.toISOString(),
				})),
			);
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Failed to fetch sales" }, 500);
		}
	});

	/**
	 * DELETE /api/vendas/:id - Delete sale
	 */
	app.delete("/:id", async (c) => {
		try {
			const id = c.req.param("id");

			const saleIdResult = createSaleId(id);
			if (!saleIdResult.ok) {
				return c.json({ error: "Invalid sale ID" }, 400);
			}

			const result = await deps.saleRepository.delete(saleIdResult.value);

			if (!result.ok) {
				if (result.error.type === "NOT_FOUND") {
					return c.json({ error: "Sale not found" }, 404);
				}
				return c.json({ error: "Failed to delete sale" }, 500);
			}

			return c.body(null, 204);
			/* c8 ignore next 3 */
		} catch (_error) {
			return c.json({ error: "Failed to delete sale" }, 500);
		}
	});

	return app;
};
