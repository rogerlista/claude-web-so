import { ResultUtils } from "@pos-nfce/shared";
import { describe, expect, it } from "vitest";
import { createCustomerId } from "../../domain/customer/customer-id";
import { createPrice } from "../../domain/product/price";
import { createProductId } from "../../domain/product/product-id";
import { createSale } from "../../domain/sale/sale";
import { createSaleId } from "../../domain/sale/sale-id";
import { createSaleItem } from "../../domain/sale/sale-item";
import type { SaleRepository } from "../ports/sale-repository";
import { createAddSaleItemUseCase } from "./add-sale-item";

describe("AddSaleItem Use Case", () => {
	it("should add an item to an existing sale", async () => {
		// Setup: Create existing sale
		const saleIdResult = createSaleId("sale-123");
		const customerIdResult = createCustomerId("customer-456");
		const productId1Result = createProductId("product-1");
		const price1Result = createPrice(10.0);

		if (
			!saleIdResult.ok ||
			!customerIdResult.ok ||
			!productId1Result.ok ||
			!price1Result.ok
		) {
			throw new Error("Setup failed");
		}

		const item1Result = createSaleItem({
			productId: productId1Result.value,
			quantity: 1,
			unitPrice: price1Result.value,
		});

		if (!item1Result.ok) {
			throw new Error("Setup failed");
		}

		const existingSaleResult = createSale({
			id: saleIdResult.value,
			customerId: customerIdResult.value,
			items: [item1Result.value],
		});

		if (!existingSaleResult.ok) {
			throw new Error("Setup failed");
		}

		const existingSale = existingSaleResult.value;

		// Mock repository
		const mockRepository: SaleRepository = {
			findById: (id) => {
				if (id === saleIdResult.value) {
					return Promise.resolve(ResultUtils.ok(existingSale));
				}
				return Promise.resolve(
					ResultUtils.err({ type: "NOT_FOUND", id: id as string }),
				);
			},
			save: (sale) => Promise.resolve(ResultUtils.ok(sale)),
			findAll: () => Promise.resolve(ResultUtils.ok([])),
			delete: () => Promise.resolve(ResultUtils.ok(undefined)),
			findByCustomerId: () => Promise.resolve(ResultUtils.ok([])),
			findByStatus: () => Promise.resolve(ResultUtils.ok([])),
		};

		// Execute use case
		const useCase = createAddSaleItemUseCase(mockRepository);
		const result = await useCase({
			saleId: "sale-123",
			productId: "product-2",
			quantity: 3,
			unitPrice: 5.0,
		});

		// Assert
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.items).toHaveLength(2);
			expect(result.value.items[1]?.productId).toBe("product-2");
			expect(result.value.items[1]?.quantity).toBe(3);
			expect(result.value.grossTotal).toBe(25.0); // 10 + (3 * 5)
		}
	});

	it("should fail if sale not found", async () => {
		const mockRepository: SaleRepository = {
			findById: async () =>
				ResultUtils.err({ type: "NOT_FOUND", id: "sale-999" }),
			save: async (sale) => ResultUtils.ok(sale),
			findAll: async () => ResultUtils.ok([]),
			delete: async () => ResultUtils.ok(undefined),
			findByCustomerId: async () => ResultUtils.ok([]),
			findByStatus: async () => ResultUtils.ok([]),
		};

		const useCase = createAddSaleItemUseCase(mockRepository);
		const result = await useCase({
			saleId: "sale-999",
			productId: "product-1",
			quantity: 1,
			unitPrice: 10.0,
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("SALE_NOT_FOUND");
		}
	});

	it("should fail for invalid product id", async () => {
		const saleIdResult = createSaleId("sale-123");
		const customerIdResult = createCustomerId("customer-456");

		if (!saleIdResult.ok || !customerIdResult.ok) {
			throw new Error("Setup failed");
		}

		const saleResult = createSale({
			id: saleIdResult.value,
			customerId: customerIdResult.value,
		});

		if (!saleResult.ok) {
			throw new Error("Setup failed");
		}

		const mockRepository: SaleRepository = {
			findById: async () => ResultUtils.ok(saleResult.value),
			save: async (sale) => ResultUtils.ok(sale),
			findAll: async () => ResultUtils.ok([]),
			delete: async () => ResultUtils.ok(undefined),
			findByCustomerId: async () => ResultUtils.ok([]),
			findByStatus: async () => ResultUtils.ok([]),
		};

		const useCase = createAddSaleItemUseCase(mockRepository);
		const result = await useCase({
			saleId: "sale-123",
			productId: "", // Invalid
			quantity: 1,
			unitPrice: 10.0,
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("VALIDATION_ERROR");
			if (result.error.type === "VALIDATION_ERROR") {
				expect(result.error.message).toContain("ProductId");
			}
		}
	});

	it("should fail for invalid quantity", async () => {
		const saleIdResult = createSaleId("sale-123");
		const customerIdResult = createCustomerId("customer-456");

		if (!saleIdResult.ok || !customerIdResult.ok) {
			throw new Error("Setup failed");
		}

		const saleResult = createSale({
			id: saleIdResult.value,
			customerId: customerIdResult.value,
		});

		if (!saleResult.ok) {
			throw new Error("Setup failed");
		}

		const mockRepository: SaleRepository = {
			findById: async () => ResultUtils.ok(saleResult.value),
			save: async (sale) => ResultUtils.ok(sale),
			findAll: async () => ResultUtils.ok([]),
			delete: async () => ResultUtils.ok(undefined),
			findByCustomerId: async () => ResultUtils.ok([]),
			findByStatus: async () => ResultUtils.ok([]),
		};

		const useCase = createAddSaleItemUseCase(mockRepository);
		const result = await useCase({
			saleId: "sale-123",
			productId: "product-1",
			quantity: 0, // Invalid
			unitPrice: 10.0,
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("VALIDATION_ERROR");
			if (result.error.type === "VALIDATION_ERROR") {
				expect(result.error.message).toContain("SaleItem");
			}
		}
	});
});
