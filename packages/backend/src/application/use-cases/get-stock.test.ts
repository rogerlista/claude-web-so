import { ResultUtils } from "@pos-nfce/shared";
import { describe, expect, it } from "vitest";
import { createQuantity } from "../../domain/inventory/quantity";
import { createProductId } from "../../domain/product/product-id";
import type { InventoryRepository } from "../ports/inventory-repository";
import { getStockUseCase } from "./get-stock";

const createMockRepository = (currentQuantity: number): InventoryRepository => {
	const productIdResult = createProductId("prod-001");
	const quantityResult = createQuantity(currentQuantity);

	if (!productIdResult.ok || !quantityResult.ok) {
		throw new Error("Invalid mock data");
	}

	return {
		saveMovement: async () =>
			ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
		getStock: async () =>
			ResultUtils.ok({
				productId: productIdResult.value,
				currentQuantity: quantityResult.value,
				lastMovementDate: new Date("2024-01-01"),
			}),
		listMovements: async () => ResultUtils.ok([]),
		findById: async () => ResultUtils.err({ type: "NOT_FOUND", id: "test" }),
	};
};

describe("GetStock Use Case", () => {
	it("should get stock for valid product", async () => {
		const mockRepo = createMockRepository(100);
		const useCase = getStockUseCase(mockRepo);

		const result = await useCase({ productId: "prod-001" });

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.currentQuantity).toBe(100);
		}
	});

	it("should reject invalid product id", async () => {
		const mockRepo = createMockRepository(100);
		const useCase = getStockUseCase(mockRepo);

		const result = await useCase({ productId: "" });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("VALIDATION_ERROR");
		}
	});

	it("should handle repository error", async () => {
		const mockRepo: InventoryRepository = {
			saveMovement: async () =>
				ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
			getStock: async () =>
				ResultUtils.err({ type: "NOT_FOUND", id: "prod-001" }),
			listMovements: async () => ResultUtils.ok([]),
			findById: async () => ResultUtils.err({ type: "NOT_FOUND", id: "test" }),
		};

		const useCase = getStockUseCase(mockRepo);

		const result = await useCase({ productId: "prod-001" });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("REPOSITORY_ERROR");
		}
	});
});
