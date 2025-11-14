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

		it("should validate stock before allowing exit when type is 'saida'", async () => {
			const productIdResult = createProductId("prod-001");
			const availableQuantity = createQuantity(100);
			const exitQuantity = createQuantity(50);

			if (!productIdResult.ok || !availableQuantity.ok || !exitQuantity.ok) {
				throw new Error("Failed to create test data");
			}

			const idResult = createInventoryId("exit-001");
			if (!idResult.ok) {
				throw new Error("Failed to create test data");
			}

			const testMovement = createInventoryMovement({
				id: idResult.value,
				productId: productIdResult.value,
				quantity: exitQuantity.value,
				type: "saida",
				date: new Date(),
			});

			if (!testMovement.ok) {
				throw new Error("Failed to create test movement");
			}

			const mockRepo: InventoryRepository = {
				...createMockRepository(),
				getStock: async () =>
					ResultUtils.ok({
						productId: productIdResult.value,
						currentQuantity: availableQuantity.value,
						lastMovementDate: new Date(),
					}),
				saveMovement: async () => ResultUtils.ok(testMovement.value),
			};

			const app = createInventoryRoutes({ repository: mockRepo });

			const response = await app.request("/movimentos", {
				method: "POST",
				body: JSON.stringify({
					id: "exit-001",
					productId: "prod-001",
					quantity: 50,
					type: "saida",
					date: new Date().toISOString(),
				}),
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(response.status).toBe(201);
		});

		it("should reject exit when insufficient stock", async () => {
			const productIdResult = createProductId("prod-001");
			const availableQuantity = createQuantity(30);

			if (!productIdResult.ok || !availableQuantity.ok) {
				throw new Error("Failed to create test data");
			}

			const mockRepo: InventoryRepository = {
				...createMockRepository(),
				getStock: async () =>
					ResultUtils.ok({
						productId: productIdResult.value,
						currentQuantity: availableQuantity.value,
						lastMovementDate: new Date(),
					}),
			};

			const app = createInventoryRoutes({ repository: mockRepo });

			const response = await app.request("/movimentos", {
				method: "POST",
				body: JSON.stringify({
					id: "exit-002",
					productId: "prod-001",
					quantity: 50,
					type: "saida",
					date: new Date().toISOString(),
				}),
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(response.status).toBe(400);
			const data = (await response.json()) as Record<string, unknown>;
			expect(data.error).toBeDefined();
		});

		it("should reject exit when no stock exists for product", async () => {
			const mockRepo: InventoryRepository = {
				...createMockRepository(),
				getStock: async () =>
					ResultUtils.err({ type: "NOT_FOUND", id: "prod-001" }),
			};

			const app = createInventoryRoutes({ repository: mockRepo });

			const response = await app.request("/movimentos", {
				method: "POST",
				body: JSON.stringify({
					id: "exit-003",
					productId: "prod-001",
					quantity: 10,
					type: "saida",
					date: new Date().toISOString(),
				}),
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(response.status).toBe(400);
			const data = (await response.json()) as Record<string, unknown>;
			expect(data.error).toBeDefined();
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
