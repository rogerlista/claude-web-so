import type { Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import { describe, expect, it } from "vitest";
import { createInventoryId } from "../../domain/inventory/inventory-id";
import type { InventoryMovement } from "../../domain/inventory/inventory-movement";
import { createQuantity } from "../../domain/inventory/quantity";
import { createProductId } from "../../domain/product/product-id";
import type {
	InventoryRepository,
	RepositoryError,
} from "../ports/inventory-repository";
import {
	type RegisterStockMovementInput,
	registerStockMovementUseCase,
} from "./register-stock-movement";

/**
 * TDD - Tests for RegisterStockMovement use case
 */

const createMockMovement = (data: {
	id: string;
	productId: string;
	quantity: number;
}): InventoryMovement => {
	const idResult = createInventoryId(data.id);
	const productIdResult = createProductId(data.productId);
	const quantityResult = createQuantity(data.quantity);

	if (!idResult.ok || !productIdResult.ok || !quantityResult.ok) {
		throw new Error("Invalid mock data");
	}

	return {
		id: idResult.value,
		productId: productIdResult.value,
		quantity: quantityResult.value,
		type: "entrada",
		date: new Date(),
	};
};

const createMockRepository = (
	saveResult: Result<InventoryMovement, RepositoryError>,
): InventoryRepository => ({
	saveMovement: async () => saveResult,
	getStock: async () => ResultUtils.err({ type: "NOT_FOUND", id: "test" }),
	listMovements: async () => ResultUtils.ok([]),
	findById: async () => ResultUtils.err({ type: "NOT_FOUND", id: "test" }),
});

describe("RegisterStockMovement Use Case", () => {
	it("should register entrada movement with valid data", async () => {
		const mockRepo = createMockRepository(
			ResultUtils.ok(
				createMockMovement({
					id: "inv-001",
					productId: "prod-001",
					quantity: 10,
				}),
			),
		);

		const useCase = registerStockMovementUseCase(mockRepo);

		const input: RegisterStockMovementInput = {
			id: "inv-001",
			productId: "prod-001",
			quantity: 10,
			type: "entrada",
			date: new Date("2024-01-01"),
		};

		const result = await useCase(input);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.type).toBe("entrada");
		}
	});

	it("should register saida movement", async () => {
		const mockRepo = createMockRepository(
			ResultUtils.ok(
				createMockMovement({
					id: "inv-002",
					productId: "prod-001",
					quantity: 5,
				}),
			),
		);

		const useCase = registerStockMovementUseCase(mockRepo);

		const input: RegisterStockMovementInput = {
			id: "inv-002",
			productId: "prod-001",
			quantity: 5,
			type: "saida",
			date: new Date(),
		};

		const result = await useCase(input);

		expect(result.ok).toBe(true);
	});

	it("should register ajuste movement with description", async () => {
		const mockRepo = createMockRepository(
			ResultUtils.ok(
				createMockMovement({
					id: "inv-003",
					productId: "prod-001",
					quantity: 15,
				}),
			),
		);

		const useCase = registerStockMovementUseCase(mockRepo);

		const input: RegisterStockMovementInput = {
			id: "inv-003",
			productId: "prod-001",
			quantity: 15,
			type: "ajuste",
			date: new Date(),
			description: "Ajuste de inventário",
		};

		const result = await useCase(input);

		expect(result.ok).toBe(true);
	});

	it("should register movement with userId", async () => {
		const mockRepo = createMockRepository(
			ResultUtils.ok(
				createMockMovement({
					id: "inv-004",
					productId: "prod-001",
					quantity: 10,
				}),
			),
		);

		const useCase = registerStockMovementUseCase(mockRepo);

		const input: RegisterStockMovementInput = {
			id: "inv-004",
			productId: "prod-001",
			quantity: 10,
			type: "entrada",
			date: new Date(),
			userId: "user-001",
		};

		const result = await useCase(input);

		expect(result.ok).toBe(true);
	});

	it("should register ajuste movement with adjustmentReason", async () => {
		const mockRepo = createMockRepository(
			ResultUtils.ok(
				createMockMovement({
					id: "inv-005",
					productId: "prod-001",
					quantity: 20,
				}),
			),
		);

		const useCase = registerStockMovementUseCase(mockRepo);

		const input: RegisterStockMovementInput = {
			id: "inv-005",
			productId: "prod-001",
			quantity: 20,
			type: "ajuste",
			date: new Date(),
			adjustmentReason: "Diferença no inventário físico",
			userId: "user-001",
		};

		const result = await useCase(input);

		expect(result.ok).toBe(true);
	});

	it("should reject invalid product id", async () => {
		const mockRepo = createMockRepository(
			ResultUtils.ok(
				createMockMovement({
					id: "inv-001",
					productId: "prod-001",
					quantity: 10,
				}),
			),
		);

		const useCase = registerStockMovementUseCase(mockRepo);

		const input: RegisterStockMovementInput = {
			id: "inv-001",
			productId: "",
			quantity: 10,
			type: "entrada",
			date: new Date(),
		};

		const result = await useCase(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("VALIDATION_ERROR");
		}
	});

	it("should reject invalid quantity", async () => {
		const mockRepo = createMockRepository(
			ResultUtils.ok(
				createMockMovement({
					id: "inv-001",
					productId: "prod-001",
					quantity: 10,
				}),
			),
		);

		const useCase = registerStockMovementUseCase(mockRepo);

		const input: RegisterStockMovementInput = {
			id: "inv-001",
			productId: "prod-001",
			quantity: -5,
			type: "entrada",
			date: new Date(),
		};

		const result = await useCase(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("VALIDATION_ERROR");
		}
	});

	it("should handle repository error", async () => {
		const mockRepo = createMockRepository(
			ResultUtils.err({ type: "UNKNOWN", message: "Database error" }),
		);

		const useCase = registerStockMovementUseCase(mockRepo);

		const input: RegisterStockMovementInput = {
			id: "inv-001",
			productId: "prod-001",
			quantity: 10,
			type: "entrada",
			date: new Date(),
		};

		const result = await useCase(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("REPOSITORY_ERROR");
		}
	});
});
