import { ResultUtils } from "@pos-nfce/shared";
import { describe, expect, it } from "vitest";
import type { InventoryRepository } from "../../application/ports/inventory-repository";
import type { SaleRepository } from "../../application/ports/sale-repository";
import { createCustomerId } from "../../domain/customer/customer-id";
import { createPrice } from "../../domain/product/price";
import { createProductId } from "../../domain/product/product-id";
import { createSale } from "../../domain/sale/sale";
import { createSaleId } from "../../domain/sale/sale-id";
import { createSaleItem } from "../../domain/sale/sale-item";
import { createSaleRoutes } from "./sale-routes";

describe("Sale Routes", () => {
	const createMockRepository = (): SaleRepository => ({
		save: async () =>
			ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
		findById: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
		findAll: async () => ResultUtils.ok([]),
		delete: async () => ResultUtils.ok(undefined),
		findByCustomerId: async () => ResultUtils.ok([]),
		findByStatus: async () => ResultUtils.ok([]),
	});

	const createMockInventoryRepository = (): InventoryRepository => ({
		saveMovement: async () =>
			ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
		getStock: async () =>
			ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
		listMovements: async () => ResultUtils.ok([]),
		findById: async () =>
			ResultUtils.err({ type: "NOT_FOUND", id: "inventory-1" }),
	});

	describe("POST /", () => {
		it("should create a sale", async () => {
			const saleId = createSaleId("550e8400-e29b-41d4-a716-446655440000");
			const customerId = createCustomerId("customer-1");
			const productId = createProductId("product-1");
			const price = createPrice(10.5);

			if (!saleId.ok || !customerId.ok || !productId.ok || !price.ok) {
				throw new Error("Failed to create test data");
			}

			const saleItem = createSaleItem({
				productId: productId.value,
				quantity: 2,
				unitPrice: price.value,
			});

			if (!saleItem.ok) {
				throw new Error("Failed to create sale item");
			}

			const testSale = createSale({
				id: saleId.value,
				customerId: customerId.value,
				items: [saleItem.value],
			});

			if (!testSale.ok) {
				throw new Error("Failed to create test sale");
			}

			const mockRepo: SaleRepository = {
				...createMockRepository(),
				save: async () => ResultUtils.ok(testSale.value),
			};

			const app = createSaleRoutes({
				saleRepository: mockRepo,
				inventoryRepository: createMockInventoryRepository(),
			});

			const res = await app.request("/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: saleId.value,
					customerId: customerId.value,
					items: [
						{
							productId: productId.value,
							quantity: 2,
							unitPrice: 10.5,
						},
					],
				}),
			});

			expect(res.status).toBe(201);
			const data = (await res.json()) as Record<string, unknown>;
			expect(data.id).toBe(saleId.value);
			expect(data.netTotal).toBe(21);
		});

		it("should return error for invalid sale data", async () => {
			const app = createSaleRoutes({
				saleRepository: createMockRepository(),
				inventoryRepository: createMockInventoryRepository(),
			});

			const res = await app.request("/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: "",
					customerId: "customer-1",
					items: [],
				}),
			});

			expect(res.status).toBe(400);
		});

		it("should handle invalid JSON", async () => {
			const app = createSaleRoutes({
				saleRepository: createMockRepository(),
				inventoryRepository: createMockInventoryRepository(),
			});

			const res = await app.request("/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: "invalid json",
			});

			expect(res.status).toBe(400);
		});
	});

	describe("GET /", () => {
		it("should list all sales", async () => {
			const mockRepo: SaleRepository = {
				...createMockRepository(),
				findAll: async () => ResultUtils.ok([]),
			};

			const app = createSaleRoutes({
				saleRepository: mockRepo,
				inventoryRepository: createMockInventoryRepository(),
			});

			const res = await app.request("/", { method: "GET" });

			expect(res.status).toBe(200);
			const data = (await res.json()) as unknown[];
			expect(Array.isArray(data)).toBe(true);
		});
	});

	describe("GET /:id", () => {
		it("should return a sale by id", async () => {
			const saleId = createSaleId("550e8400-e29b-41d4-a716-446655440000");
			const customerId = createCustomerId("customer-1");
			const productId = createProductId("product-1");
			const price = createPrice(10.5);

			if (!saleId.ok || !customerId.ok || !productId.ok || !price.ok) {
				throw new Error("Failed to create test data");
			}

			const saleItem = createSaleItem({
				productId: productId.value,
				quantity: 2,
				unitPrice: price.value,
			});

			if (!saleItem.ok) {
				throw new Error("Failed to create sale item");
			}

			const testSale = createSale({
				id: saleId.value,
				customerId: customerId.value,
				items: [saleItem.value],
			});

			if (!testSale.ok) {
				throw new Error("Failed to create test sale");
			}

			const mockRepo: SaleRepository = {
				...createMockRepository(),
				findById: async () => ResultUtils.ok(testSale.value),
			};

			const app = createSaleRoutes({
				saleRepository: mockRepo,
				inventoryRepository: createMockInventoryRepository(),
			});

			const res = await app.request(`/${saleId.value}`, { method: "GET" });

			expect(res.status).toBe(200);
			const data = (await res.json()) as Record<string, unknown>;
			expect(data.id).toBe(saleId.value);
		});

		it("should return 404 for non-existent sale", async () => {
			const mockRepo: SaleRepository = {
				...createMockRepository(),
				findById: async () =>
					ResultUtils.err({ type: "NOT_FOUND", id: "non-existent" }),
			};

			const app = createSaleRoutes({
				saleRepository: mockRepo,
				inventoryRepository: createMockInventoryRepository(),
			});

			const res = await app.request("/non-existent", { method: "GET" });

			expect(res.status).toBe(404);
		});
	});

	describe("DELETE /:id", () => {
		it("should delete a sale", async () => {
			const mockRepo: SaleRepository = {
				...createMockRepository(),
				delete: async () => ResultUtils.ok(undefined),
			};

			const app = createSaleRoutes({
				saleRepository: mockRepo,
				inventoryRepository: createMockInventoryRepository(),
			});

			const res = await app.request("/550e8400-e29b-41d4-a716-446655440000", {
				method: "DELETE",
			});

			expect(res.status).toBe(204);
		});

		it("should return 404 when deleting non-existent sale", async () => {
			const mockRepo: SaleRepository = {
				...createMockRepository(),
				delete: async () =>
					ResultUtils.err({ type: "NOT_FOUND", id: "non-existent" }),
			};

			const app = createSaleRoutes({
				saleRepository: mockRepo,
				inventoryRepository: createMockInventoryRepository(),
			});

			const res = await app.request("/non-existent", { method: "DELETE" });

			expect(res.status).toBe(404);
		});
	});
});
