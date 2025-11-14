import { ResultUtils } from "@pos-nfce/shared";
import { describe, expect, it } from "vitest";
import type { InventoryRepository } from "../application/ports/inventory-repository";
import type { ProductRepository } from "../application/ports/product-repository";
import type { SaleRepository } from "../application/ports/sale-repository";
import { createApp } from "./app";

describe("App", () => {
	const createMockProductRepository = (): ProductRepository => ({
		save: async () =>
			ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
		findById: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
		findAll: async () => ResultUtils.ok([]),
		delete: async () => ResultUtils.ok(undefined),
		findBySKU: async () => ResultUtils.ok([]),
		findByGTIN: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
		search: async () => ResultUtils.ok([]),
	});

	const createMockInventoryRepository = (): InventoryRepository => ({
		saveMovement: async () =>
			ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
		getStock: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
		listMovements: async () => ResultUtils.ok([]),
		findById: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
	});

	const createMockSaleRepository = (): SaleRepository => ({
		save: async () =>
			ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
		findById: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
		findAll: async () => ResultUtils.ok([]),
		delete: async () => ResultUtils.ok(undefined),
		findByCustomerId: async () => ResultUtils.ok([]),
		findByStatus: async () => ResultUtils.ok([]),
	});

	it("should have health check endpoint", async () => {
		const app = createApp({
			productRepository: createMockProductRepository(),
			inventoryRepository: createMockInventoryRepository(),
			saleRepository: createMockSaleRepository(),
		});

		const res = await app.request("/health", { method: "GET" });

		expect(res.status).toBe(200);
		const data = (await res.json()) as {
			status: string;
			version: string;
			timestamp: string;
		};
		expect(data.status).toBe("healthy");
		expect(data.version).toBe("0.0.0");
	});

	it("should return 404 for non-existent routes", async () => {
		const app = createApp({
			productRepository: createMockProductRepository(),
			inventoryRepository: createMockInventoryRepository(),
			saleRepository: createMockSaleRepository(),
		});

		const res = await app.request("/non-existent", { method: "GET" });

		expect(res.status).toBe(404);
		const data = (await res.json()) as { error: string };
		expect(data.error).toBe("Not found");
	});

	it("should have product routes mounted", async () => {
		const app = createApp({
			productRepository: createMockProductRepository(),
			inventoryRepository: createMockInventoryRepository(),
			saleRepository: createMockSaleRepository(),
		});

		const res = await app.request("/api/produtos", { method: "GET" });

		// Should not return 404 (route exists)
		expect(res.status).not.toBe(404);
	});

	it("should have sale routes mounted", async () => {
		const app = createApp({
			productRepository: createMockProductRepository(),
			inventoryRepository: createMockInventoryRepository(),
			saleRepository: createMockSaleRepository(),
		});

		const res = await app.request("/api/vendas", { method: "GET" });

		// Should not return 404 (route exists)
		expect(res.status).not.toBe(404);
	});
});
