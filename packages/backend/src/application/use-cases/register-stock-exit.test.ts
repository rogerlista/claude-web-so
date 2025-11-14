import { ResultUtils } from "@pos-nfce/shared";
import { describe, expect, it } from "vitest";
import { createQuantity } from "../../domain/inventory/quantity";
import { createProductId } from "../../domain/product/product-id";
import type { InventoryRepository } from "../ports/inventory-repository";
import { registerStockExitUseCase } from "./register-stock-exit";

/**
 * TDD - Tests for Register Stock Exit Use Case
 *
 * This use case validates stock availability before allowing exits
 */

describe("registerStockExitUseCase", () => {
	const createMockRepository = (): InventoryRepository => ({
		saveMovement: async () =>
			ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
		getStock: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
		listMovements: async () => ResultUtils.ok([]),
		findById: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
	});

	it("should register stock exit when sufficient stock available", async () => {
		const productIdResult = createProductId("prod-001");
		const availableQuantity = createQuantity(100);
		const exitQuantity = createQuantity(50);

		if (!productIdResult.ok || !availableQuantity.ok || !exitQuantity.ok) {
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
			saveMovement: async (movement) => ResultUtils.ok(movement),
		};

		const useCase = registerStockExitUseCase(mockRepo);

		const result = await useCase({
			id: "exit-001",
			productId: "prod-001",
			quantity: 50,
			description: "Exit for sale",
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.type).toBe("saida");
			expect(result.value.quantity).toBe(50);
		}
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

		const useCase = registerStockExitUseCase(mockRepo);

		const result = await useCase({
			id: "exit-002",
			productId: "prod-001",
			quantity: 50,
			description: "Exit attempt",
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("INSUFFICIENT_STOCK");
		}
	});

	it("should reject exit when no stock exists for product", async () => {
		const mockRepo: InventoryRepository = {
			...createMockRepository(),
			getStock: async () =>
				ResultUtils.err({ type: "NOT_FOUND", id: "prod-001" }),
		};

		const useCase = registerStockExitUseCase(mockRepo);

		const result = await useCase({
			id: "exit-003",
			productId: "prod-001",
			quantity: 10,
			description: "Exit attempt",
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("NO_STOCK");
		}
	});

	it("should reject exit with invalid product ID", async () => {
		const mockRepo = createMockRepository();
		const useCase = registerStockExitUseCase(mockRepo);

		const result = await useCase({
			id: "exit-004",
			productId: "",
			quantity: 10,
			description: "Invalid exit",
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("VALIDATION_ERROR");
		}
	});

	it("should reject exit with invalid quantity", async () => {
		const mockRepo = createMockRepository();
		const useCase = registerStockExitUseCase(mockRepo);

		const result = await useCase({
			id: "exit-005",
			productId: "prod-001",
			quantity: -10,
			description: "Invalid quantity",
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("VALIDATION_ERROR");
		}
	});

	it("should reject exit with invalid ID", async () => {
		const mockRepo = createMockRepository();
		const useCase = registerStockExitUseCase(mockRepo);

		const result = await useCase({
			id: "",
			productId: "prod-001",
			quantity: 10,
			description: "Invalid ID",
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("VALIDATION_ERROR");
		}
	});

	it("should allow exit with exact available quantity", async () => {
		const productIdResult = createProductId("prod-001");
		const availableQuantity = createQuantity(50);

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
			saveMovement: async (movement) => ResultUtils.ok(movement),
		};

		const useCase = registerStockExitUseCase(mockRepo);

		const result = await useCase({
			id: "exit-006",
			productId: "prod-001",
			quantity: 50,
			description: "Exact quantity exit",
		});

		expect(result.ok).toBe(true);
	});

	it("should handle repository error when checking stock", async () => {
		const mockRepo: InventoryRepository = {
			...createMockRepository(),
			getStock: async () =>
				ResultUtils.err({ type: "UNKNOWN", message: "Database error" }),
		};

		const useCase = registerStockExitUseCase(mockRepo);

		const result = await useCase({
			id: "exit-007",
			productId: "prod-001",
			quantity: 10,
			description: "Exit with repo error",
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("REPOSITORY_ERROR");
		}
	});

	it("should handle repository error when saving movement", async () => {
		const productIdResult = createProductId("prod-001");
		const availableQuantity = createQuantity(100);

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
			saveMovement: async () =>
				ResultUtils.err({ type: "UNKNOWN", message: "Save failed" }),
		};

		const useCase = registerStockExitUseCase(mockRepo);

		const result = await useCase({
			id: "exit-008",
			productId: "prod-001",
			quantity: 50,
			description: "Exit with save error",
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("REPOSITORY_ERROR");
		}
	});
});
