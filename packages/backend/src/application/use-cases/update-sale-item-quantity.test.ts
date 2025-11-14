import { ResultUtils } from "@pos-nfce/shared";
import { describe, expect, it } from "vitest";
import { createCustomerId } from "../../domain/customer/customer-id";
import { createPrice } from "../../domain/product/price";
import { createProductId } from "../../domain/product/product-id";
import { createSale } from "../../domain/sale/sale";
import { createSaleId } from "../../domain/sale/sale-id";
import { createSaleItem } from "../../domain/sale/sale-item";
import type { SaleRepository } from "../ports/sale-repository";
import { createUpdateSaleItemQuantityUseCase } from "./update-sale-item-quantity";

describe("UpdateSaleItemQuantity Use Case", () => {
	it("should update item quantity in a sale", async () => {
		// Setup
		const saleIdResult = createSaleId("sale-123");
		const customerIdResult = createCustomerId("customer-456");
		const productIdResult = createProductId("product-1");
		const priceResult = createPrice(10.0);

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
			quantity: 2,
			unitPrice: priceResult.value,
		});

		if (!itemResult.ok) {
			throw new Error("Setup failed");
		}

		const existingSaleResult = createSale({
			id: saleIdResult.value,
			customerId: customerIdResult.value,
			items: [itemResult.value],
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
		const useCase = createUpdateSaleItemQuantityUseCase(mockRepository);
		const result = await useCase({
			saleId: "sale-123",
			productId: "product-1",
			quantity: 5,
		});

		// Assert
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.items[0]?.quantity).toBe(5);
			expect(result.value.grossTotal).toBe(50.0); // 5 * 10
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

		const useCase = createUpdateSaleItemQuantityUseCase(mockRepository);
		const result = await useCase({
			saleId: "sale-999",
			productId: "product-1",
			quantity: 5,
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("SALE_NOT_FOUND");
		}
	});
});
