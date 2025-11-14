import { ResultUtils } from "@pos-nfce/shared";
import { describe, expect, it } from "vitest";
import { createCustomerId } from "../../domain/customer/customer-id";
import { createQuantity } from "../../domain/inventory/quantity";
import { createPrice } from "../../domain/product/price";
import { createProductId } from "../../domain/product/product-id";
import { createSale } from "../../domain/sale/sale";
import { createSaleId } from "../../domain/sale/sale-id";
import { createSaleItem } from "../../domain/sale/sale-item";
import type { InventoryRepository } from "../ports/inventory-repository";
import type { SaleRepository } from "../ports/sale-repository";
import { createAddSaleItemUseCase } from "./add-sale-item";

describe("AddSaleItem Use Case", () => {
	const createMockInventoryRepository = (): InventoryRepository => ({
		saveMovement: async () =>
			ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
		getStock: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
		listMovements: async () => ResultUtils.ok([]),
		findById: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
	});

	it("should add an item to an existing sale", async () => {
		// Setup: Create existing sale
		const saleIdResult = createSaleId("sale-123");
		const customerIdResult = createCustomerId("customer-456");
		const productId1Result = createProductId("product-1");
		const productId2Result = createProductId("product-2");
		const price1Result = createPrice(10.0);
		const availableQuantity = createQuantity(100);

		if (
			!saleIdResult.ok ||
			!customerIdResult.ok ||
			!productId1Result.ok ||
			!productId2Result.ok ||
			!price1Result.ok ||
			!availableQuantity.ok
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

		// Mock repositories
		const mockSaleRepository: SaleRepository = {
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

		const mockInventoryRepository: InventoryRepository = {
			...createMockInventoryRepository(),
			getStock: async () =>
				ResultUtils.ok({
					productId: productId2Result.value,
					currentQuantity: availableQuantity.value,
					lastMovementDate: new Date(),
				}),
		};

		// Execute use case
		const useCase = createAddSaleItemUseCase({
			saleRepository: mockSaleRepository,
			inventoryRepository: mockInventoryRepository,
		});
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
		const mockSaleRepository: SaleRepository = {
			findById: async () =>
				ResultUtils.err({ type: "NOT_FOUND", id: "sale-999" }),
			save: async (sale) => ResultUtils.ok(sale),
			findAll: async () => ResultUtils.ok([]),
			delete: async () => ResultUtils.ok(undefined),
			findByCustomerId: async () => ResultUtils.ok([]),
			findByStatus: async () => ResultUtils.ok([]),
		};

		const useCase = createAddSaleItemUseCase({
			saleRepository: mockSaleRepository,
			inventoryRepository: createMockInventoryRepository(),
		});
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

		const mockSaleRepository: SaleRepository = {
			findById: async () => ResultUtils.ok(saleResult.value),
			save: async (sale) => ResultUtils.ok(sale),
			findAll: async () => ResultUtils.ok([]),
			delete: async () => ResultUtils.ok(undefined),
			findByCustomerId: async () => ResultUtils.ok([]),
			findByStatus: async () => ResultUtils.ok([]),
		};

		const useCase = createAddSaleItemUseCase({
			saleRepository: mockSaleRepository,
			inventoryRepository: createMockInventoryRepository(),
		});
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
		const productIdResult = createProductId("product-1");
		const availableQuantity = createQuantity(100);

		if (
			!saleIdResult.ok ||
			!customerIdResult.ok ||
			!productIdResult.ok ||
			!availableQuantity.ok
		) {
			throw new Error("Setup failed");
		}

		const saleResult = createSale({
			id: saleIdResult.value,
			customerId: customerIdResult.value,
		});

		if (!saleResult.ok) {
			throw new Error("Setup failed");
		}

		const mockSaleRepository: SaleRepository = {
			findById: async () => ResultUtils.ok(saleResult.value),
			save: async (sale) => ResultUtils.ok(sale),
			findAll: async () => ResultUtils.ok([]),
			delete: async () => ResultUtils.ok(undefined),
			findByCustomerId: async () => ResultUtils.ok([]),
			findByStatus: async () => ResultUtils.ok([]),
		};

		const mockInventoryRepository: InventoryRepository = {
			...createMockInventoryRepository(),
			getStock: async () =>
				ResultUtils.ok({
					productId: productIdResult.value,
					currentQuantity: availableQuantity.value,
					lastMovementDate: new Date(),
				}),
		};

		const useCase = createAddSaleItemUseCase({
			saleRepository: mockSaleRepository,
			inventoryRepository: mockInventoryRepository,
		});
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

	describe("Stock Validation", () => {
		it("should add item when sufficient stock available", async () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-456");
			const productIdResult = createProductId("product-1");
			const availableQuantity = createQuantity(100);

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!availableQuantity.ok
			) {
				throw new Error("Setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
			});

			if (!saleResult.ok) {
				throw new Error("Setup failed");
			}

			const mockSaleRepository: SaleRepository = {
				findById: async () => ResultUtils.ok(saleResult.value),
				save: async (sale) => ResultUtils.ok(sale),
				findAll: async () => ResultUtils.ok([]),
				delete: async () => ResultUtils.ok(undefined),
				findByCustomerId: async () => ResultUtils.ok([]),
				findByStatus: async () => ResultUtils.ok([]),
			};

			const mockInventoryRepository: InventoryRepository = {
				...createMockInventoryRepository(),
				getStock: async () =>
					ResultUtils.ok({
						productId: productIdResult.value,
						currentQuantity: availableQuantity.value,
						lastMovementDate: new Date(),
					}),
			};

			const useCase = createAddSaleItemUseCase({
				saleRepository: mockSaleRepository,
				inventoryRepository: mockInventoryRepository,
			});

			const result = await useCase({
				saleId: "sale-123",
				productId: "product-1",
				quantity: 50,
				unitPrice: 10.0,
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.items).toHaveLength(1);
				expect(result.value.items[0]?.quantity).toBe(50);
			}
		});

		it("should fail when insufficient stock", async () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-456");
			const productIdResult = createProductId("product-1");
			const availableQuantity = createQuantity(30);

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!availableQuantity.ok
			) {
				throw new Error("Setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
			});

			if (!saleResult.ok) {
				throw new Error("Setup failed");
			}

			const mockSaleRepository: SaleRepository = {
				findById: async () => ResultUtils.ok(saleResult.value),
				save: async (sale) => ResultUtils.ok(sale),
				findAll: async () => ResultUtils.ok([]),
				delete: async () => ResultUtils.ok(undefined),
				findByCustomerId: async () => ResultUtils.ok([]),
				findByStatus: async () => ResultUtils.ok([]),
			};

			const mockInventoryRepository: InventoryRepository = {
				...createMockInventoryRepository(),
				getStock: async () =>
					ResultUtils.ok({
						productId: productIdResult.value,
						currentQuantity: availableQuantity.value,
						lastMovementDate: new Date(),
					}),
			};

			const useCase = createAddSaleItemUseCase({
				saleRepository: mockSaleRepository,
				inventoryRepository: mockInventoryRepository,
			});

			const result = await useCase({
				saleId: "sale-123",
				productId: "product-1",
				quantity: 50,
				unitPrice: 10.0,
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("INSUFFICIENT_STOCK");
				if (result.error.type === "INSUFFICIENT_STOCK") {
					expect(result.error.available).toBe(30);
					expect(result.error.requested).toBe(50);
				}
			}
		});

		it("should fail when product has no stock record", async () => {
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

			const mockSaleRepository: SaleRepository = {
				findById: async () => ResultUtils.ok(saleResult.value),
				save: async (sale) => ResultUtils.ok(sale),
				findAll: async () => ResultUtils.ok([]),
				delete: async () => ResultUtils.ok(undefined),
				findByCustomerId: async () => ResultUtils.ok([]),
				findByStatus: async () => ResultUtils.ok([]),
			};

			const mockInventoryRepository: InventoryRepository = {
				...createMockInventoryRepository(),
				getStock: async () =>
					ResultUtils.err({ type: "NOT_FOUND", id: "product-1" }),
			};

			const useCase = createAddSaleItemUseCase({
				saleRepository: mockSaleRepository,
				inventoryRepository: mockInventoryRepository,
			});

			const result = await useCase({
				saleId: "sale-123",
				productId: "product-1",
				quantity: 10,
				unitPrice: 10.0,
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("NO_STOCK");
			}
		});
	});
});
