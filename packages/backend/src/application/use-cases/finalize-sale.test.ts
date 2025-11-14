import { ResultUtils } from "@pos-nfce/shared";
import { describe, expect, it, vi } from "vitest";
import { createCustomerId } from "../../domain/customer/customer-id";
import { createQuantity } from "../../domain/inventory/quantity";
import { createPrice } from "../../domain/product/price";
import { createProductId } from "../../domain/product/product-id";
import { createPaymentMethod } from "../../domain/sale/payment-method";
import { createSale } from "../../domain/sale/sale";
import { createSaleId } from "../../domain/sale/sale-id";
import { createSaleItem } from "../../domain/sale/sale-item";
import { createSalePayment } from "../../domain/sale/sale-payment";
import type { InventoryRepository } from "../ports/inventory-repository";
import type { SaleRepository } from "../ports/sale-repository";
import { createFinalizeSaleUseCase } from "./finalize-sale";

describe("FinalizeSale Use Case", () => {
	const createMockInventoryRepository = (): InventoryRepository => ({
		saveMovement: async () =>
			ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
		getStock: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
		listMovements: async () => ResultUtils.ok([]),
		findById: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
	});

	it("should finalize a fully paid sale", async () => {
		// Setup
		const saleIdResult = createSaleId("sale-123");
		const customerIdResult = createCustomerId("customer-456");
		const productIdResult = createProductId("product-1");
		const priceResult = createPrice(100.0);
		const paymentMethodResult = createPaymentMethod("01");

		if (
			!saleIdResult.ok ||
			!customerIdResult.ok ||
			!productIdResult.ok ||
			!priceResult.ok ||
			!paymentMethodResult.ok
		) {
			throw new Error("Setup failed");
		}

		const itemResult = createSaleItem({
			productId: productIdResult.value,
			quantity: 1,
			unitPrice: priceResult.value,
		});

		const paymentResult = createSalePayment({
			paymentMethod: paymentMethodResult.value,
			amount: 100.0,
		});

		if (!itemResult.ok || !paymentResult.ok) {
			throw new Error("Setup failed");
		}

		const existingSaleResult = createSale({
			id: saleIdResult.value,
			customerId: customerIdResult.value,
			items: [itemResult.value],
			payments: [paymentResult.value],
		});

		if (!existingSaleResult.ok) {
			throw new Error("Setup failed");
		}

		const mockRepository: SaleRepository = {
			findById: () => Promise.resolve(ResultUtils.ok(existingSaleResult.value)),
			save: (sale) => Promise.resolve(ResultUtils.ok(sale)),
			findAll: () => Promise.resolve(ResultUtils.ok([])),
			delete: () => Promise.resolve(ResultUtils.ok(undefined)),
			findByCustomerId: () => Promise.resolve(ResultUtils.ok([])),
			findByStatus: () => Promise.resolve(ResultUtils.ok([])),
		};

		// Execute
		const useCase = createFinalizeSaleUseCase({
			saleRepository: mockRepository,
			inventoryRepository: createMockInventoryRepository(),
		});
		const result = await useCase({ saleId: "sale-123" });

		// Assert
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.status).toBe("COMPLETED");
		}
	});

	it("should fail if sale not found", async () => {
		const mockRepository: SaleRepository = {
			findById: () =>
				Promise.resolve(ResultUtils.err({ type: "NOT_FOUND", id: "sale-999" })),
			save: (sale) => Promise.resolve(ResultUtils.ok(sale)),
			findAll: () => Promise.resolve(ResultUtils.ok([])),
			delete: () => Promise.resolve(ResultUtils.ok(undefined)),
			findByCustomerId: () => Promise.resolve(ResultUtils.ok([])),
			findByStatus: () => Promise.resolve(ResultUtils.ok([])),
		};

		const useCase = createFinalizeSaleUseCase({
			saleRepository: mockRepository,
			inventoryRepository: createMockInventoryRepository(),
		});
		const result = await useCase({ saleId: "sale-999" });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("SALE_NOT_FOUND");
		}
	});

	it("should fail if sale has no items", async () => {
		const saleIdResult = createSaleId("sale-123");
		const customerIdResult = createCustomerId("customer-456");

		if (!saleIdResult.ok || !customerIdResult.ok) {
			throw new Error("Setup failed");
		}

		const saleResult = createSale({
			id: saleIdResult.value,
			customerId: customerIdResult.value,
			items: [], // No items
		});

		if (!saleResult.ok) {
			throw new Error("Setup failed");
		}

		const mockRepository: SaleRepository = {
			findById: () => Promise.resolve(ResultUtils.ok(saleResult.value)),
			save: (sale) => Promise.resolve(ResultUtils.ok(sale)),
			findAll: () => Promise.resolve(ResultUtils.ok([])),
			delete: () => Promise.resolve(ResultUtils.ok(undefined)),
			findByCustomerId: () => Promise.resolve(ResultUtils.ok([])),
			findByStatus: () => Promise.resolve(ResultUtils.ok([])),
		};

		const useCase = createFinalizeSaleUseCase({
			saleRepository: mockRepository,
			inventoryRepository: createMockInventoryRepository(),
		});
		const result = await useCase({ saleId: "sale-123" });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("VALIDATION_ERROR");
		}
	});

	it("should fail if sale is not fully paid", async () => {
		const saleIdResult = createSaleId("sale-123");
		const customerIdResult = createCustomerId("customer-456");
		const productIdResult = createProductId("product-1");
		const priceResult = createPrice(100.0);

		if (
			!saleIdResult.ok ||
			!customerIdResult.ok ||
			!productIdResult.ok ||
			!priceResult.ok
		) {
			throw new Error("Setup failed");
		}

		const itemResult = createSaleItem({
			productId: productIdResult.value,
			quantity: 1,
			unitPrice: priceResult.value,
		});

		if (!itemResult.ok) {
			throw new Error("Setup failed");
		}

		const saleResult = createSale({
			id: saleIdResult.value,
			customerId: customerIdResult.value,
			items: [itemResult.value],
			payments: [], // No payments
		});

		if (!saleResult.ok) {
			throw new Error("Setup failed");
		}

		const mockRepository: SaleRepository = {
			findById: () => Promise.resolve(ResultUtils.ok(saleResult.value)),
			save: (sale) => Promise.resolve(ResultUtils.ok(sale)),
			findAll: () => Promise.resolve(ResultUtils.ok([])),
			delete: () => Promise.resolve(ResultUtils.ok(undefined)),
			findByCustomerId: () => Promise.resolve(ResultUtils.ok([])),
			findByStatus: () => Promise.resolve(ResultUtils.ok([])),
		};

		const useCase = createFinalizeSaleUseCase({
			saleRepository: mockRepository,
			inventoryRepository: createMockInventoryRepository(),
		});
		const result = await useCase({ saleId: "sale-123" });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("VALIDATION_ERROR");
		}
	});

	describe("Stock Integration", () => {
		it("should decrease stock for each item when finalizing sale", async () => {
			// Setup
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-456");
			const product1IdResult = createProductId("product-1");
			const product2IdResult = createProductId("product-2");
			const price1Result = createPrice(50.0);
			const price2Result = createPrice(30.0);
			const paymentMethodResult = createPaymentMethod("01");
			const availableQuantity = createQuantity(100);

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!product1IdResult.ok ||
				!product2IdResult.ok ||
				!price1Result.ok ||
				!price2Result.ok ||
				!paymentMethodResult.ok ||
				!availableQuantity.ok
			) {
				throw new Error("Setup failed");
			}

			const item1Result = createSaleItem({
				productId: product1IdResult.value,
				quantity: 2,
				unitPrice: price1Result.value,
			});

			const item2Result = createSaleItem({
				productId: product2IdResult.value,
				quantity: 3,
				unitPrice: price2Result.value,
			});

			const paymentResult = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 190.0, // (2 * 50) + (3 * 30)
			});

			if (!item1Result.ok || !item2Result.ok || !paymentResult.ok) {
				throw new Error("Setup failed");
			}

			const existingSaleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [item1Result.value, item2Result.value],
				payments: [paymentResult.value],
			});

			if (!existingSaleResult.ok) {
				throw new Error("Setup failed");
			}

			const mockSaleRepository: SaleRepository = {
				findById: () =>
					Promise.resolve(ResultUtils.ok(existingSaleResult.value)),
				save: (sale) => Promise.resolve(ResultUtils.ok(sale)),
				findAll: () => Promise.resolve(ResultUtils.ok([])),
				delete: () => Promise.resolve(ResultUtils.ok(undefined)),
				findByCustomerId: () => Promise.resolve(ResultUtils.ok([])),
				findByStatus: () => Promise.resolve(ResultUtils.ok([])),
			};

			// Mock inventory repository to track stock exit calls
			const stockExitSpy = vi.fn().mockResolvedValue(
				ResultUtils.ok({
					id: "exit-001",
					productId: product1IdResult.value,
					quantity: 2,
					type: "saida" as const,
					date: new Date(),
				}),
			);

			const mockInventoryRepository: InventoryRepository = {
				...createMockInventoryRepository(),
				getStock: async () =>
					ResultUtils.ok({
						productId: product1IdResult.value,
						currentQuantity: availableQuantity.value,
						lastMovementDate: new Date(),
					}),
				saveMovement: stockExitSpy,
			};

			// Execute
			const useCase = createFinalizeSaleUseCase({
				saleRepository: mockSaleRepository,
				inventoryRepository: mockInventoryRepository,
			});
			const result = await useCase({ saleId: "sale-123" });

			// Assert
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.status).toBe("COMPLETED");
			}

			// Verify stock exits were called for each item
			expect(stockExitSpy).toHaveBeenCalledTimes(2);
			expect(stockExitSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					productId: product1IdResult.value,
					quantity: 2,
					type: "saida",
				}),
			);
			expect(stockExitSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					productId: product2IdResult.value,
					quantity: 3,
					type: "saida",
				}),
			);
		});

		it("should finalize sale even if stock exit fails (log error but don't block)", async () => {
			// Setup
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-456");
			const productIdResult = createProductId("product-1");
			const priceResult = createPrice(100.0);
			const paymentMethodResult = createPaymentMethod("01");

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok ||
				!paymentMethodResult.ok
			) {
				throw new Error("Setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			const paymentResult = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 100.0,
			});

			if (!itemResult.ok || !paymentResult.ok) {
				throw new Error("Setup failed");
			}

			const existingSaleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
				payments: [paymentResult.value],
			});

			if (!existingSaleResult.ok) {
				throw new Error("Setup failed");
			}

			const mockSaleRepository: SaleRepository = {
				findById: () =>
					Promise.resolve(ResultUtils.ok(existingSaleResult.value)),
				save: (sale) => Promise.resolve(ResultUtils.ok(sale)),
				findAll: () => Promise.resolve(ResultUtils.ok([])),
				delete: () => Promise.resolve(ResultUtils.ok(undefined)),
				findByCustomerId: () => Promise.resolve(ResultUtils.ok([])),
				findByStatus: () => Promise.resolve(ResultUtils.ok([])),
			};

			// Mock inventory repository to simulate stock exit failure
			const mockInventoryRepository: InventoryRepository = {
				...createMockInventoryRepository(),
				saveMovement: async () =>
					ResultUtils.err({
						type: "INSUFFICIENT_STOCK",
						available: 0,
						requested: 1,
					}),
			};

			// Execute
			const useCase = createFinalizeSaleUseCase({
				saleRepository: mockSaleRepository,
				inventoryRepository: mockInventoryRepository,
			});
			const result = await useCase({ saleId: "sale-123" });

			// Assert - sale should still be finalized even if stock exit fails
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.status).toBe("COMPLETED");
			}
		});
	});
});
