import { ResultUtils } from "@pos-nfce/shared";
import { describe, expect, it } from "vitest";
import type { InventoryRepository } from "../../application/ports/inventory-repository";
import { createInventoryId } from "../../domain/inventory/inventory-id";
import { createInventoryMovement } from "../../domain/inventory/inventory-movement";
import { createQuantity } from "../../domain/inventory/quantity";
import { createProductId } from "../../domain/product/product-id";
import { createInventoryRoutes } from "./inventory-routes";

/**
 * TDD - Tests for Inventory Routes
 */

describe("Inventory Routes", () => {
	const createMockRepository = (): InventoryRepository => ({
		saveMovement: async () =>
			ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
		getStock: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
		listMovements: async () => ResultUtils.ok([]),
		findById: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
	});

	describe("POST /movimentos", () => {
		it("should register a stock movement", async () => {
			const idResult = createInventoryId("inv-001");
			const productIdResult = createProductId("prod-001");
			const quantityResult = createQuantity(10);

			if (!idResult.ok || !productIdResult.ok || !quantityResult.ok) {
				throw new Error("Failed to create test data");
			}

			const testMovement = createInventoryMovement({
				id: idResult.value,
				productId: productIdResult.value,
				quantity: quantityResult.value,
				type: "entrada",
				date: new Date(),
			});

			if (!testMovement.ok) {
				throw new Error("Failed to create test movement");
			}

			const mockRepo: InventoryRepository = {
				...createMockRepository(),
				saveMovement: async () => ResultUtils.ok(testMovement.value),
			};

			const app = createInventoryRoutes({ repository: mockRepo });

			const response = await app.request("/movimentos", {
				method: "POST",
				body: JSON.stringify({
					id: "inv-001",
					productId: "prod-001",
					quantity: 10,
					type: "entrada",
					date: new Date().toISOString(),
				}),
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(response.status).toBe(201);
			const data = (await response.json()) as Record<string, unknown>;
			expect(data.id).toBe("inv-001");
			expect(data.quantity).toBe(10);
		});

		it("should return error for invalid movement data", async () => {
			const app = createInventoryRoutes({ repository: createMockRepository() });

			const response = await app.request("/movimentos", {
				method: "POST",
				body: JSON.stringify({
					id: "",
					productId: "prod-001",
					quantity: 10,
					type: "entrada",
					date: new Date().toISOString(),
				}),
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(response.status).toBe(400);
		});

		it("should handle invalid JSON", async () => {
			const app = createInventoryRoutes({ repository: createMockRepository() });

			const response = await app.request("/movimentos", {
				method: "POST",
				body: "invalid json",
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(response.status).toBe(400);
		});
	});

	describe("GET /stock/:productId", () => {
		it("should get current stock", async () => {
			const productIdResult = createProductId("prod-001");
			const quantityResult = createQuantity(100);

			if (!productIdResult.ok || !quantityResult.ok) {
				throw new Error("Failed to create test data");
			}

			const mockRepo: InventoryRepository = {
				...createMockRepository(),
				getStock: async () =>
					ResultUtils.ok({
						productId: productIdResult.value,
						currentQuantity: quantityResult.value,
						lastMovementDate: new Date(),
					}),
			};

			const app = createInventoryRoutes({ repository: mockRepo });

			const response = await app.request("/stock/prod-001");

			expect(response.status).toBe(200);
			const data = (await response.json()) as Record<string, unknown>;
			expect(data.currentQuantity).toBe(100);
		});

		it("should return 404 for non-existent product", async () => {
			const app = createInventoryRoutes({ repository: createMockRepository() });

			const response = await app.request("/stock/prod-999");

			expect(response.status).toBe(404);
		});
	});

	describe("GET /movimentos/:productId", () => {
		it("should list movements for a product", async () => {
			const app = createInventoryRoutes({ repository: createMockRepository() });

			const response = await app.request("/movimentos/prod-001");

			expect(response.status).toBe(200);
			const data = (await response.json()) as Record<string, unknown>;
			expect(data).toHaveProperty("data");
			expect(Array.isArray(data.data)).toBe(true);
		});

		it("should return error for invalid product ID", async () => {
			const app = createInventoryRoutes({ repository: createMockRepository() });

			const response = await app.request("/movimentos/");

			expect(response.status).toBe(404);
		});
	});

	describe("GET /movimentos/id/:id", () => {
		it("should get movement by ID", async () => {
			const idResult = createInventoryId("inv-001");
			const productIdResult = createProductId("prod-001");
			const quantityResult = createQuantity(10);

			if (!idResult.ok || !productIdResult.ok || !quantityResult.ok) {
				throw new Error("Failed to create test data");
			}

			const testMovement = createInventoryMovement({
				id: idResult.value,
				productId: productIdResult.value,
				quantity: quantityResult.value,
				type: "entrada",
				date: new Date(),
			});

			if (!testMovement.ok) {
				throw new Error("Failed to create test movement");
			}

			const mockRepo: InventoryRepository = {
				...createMockRepository(),
				findById: async () => ResultUtils.ok(testMovement.value),
			};

			const app = createInventoryRoutes({ repository: mockRepo });

			const response = await app.request("/movimentos/id/inv-001");

			expect(response.status).toBe(200);
			const data = (await response.json()) as Record<string, unknown>;
			expect(data.id).toBe("inv-001");
		});

		it("should return 404 for non-existent movement", async () => {
			const app = createInventoryRoutes({ repository: createMockRepository() });

			const response = await app.request("/movimentos/id/inv-999");

			expect(response.status).toBe(404);
		});
	});
});
