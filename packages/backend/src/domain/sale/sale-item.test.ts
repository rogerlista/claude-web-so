import type { Result } from "@pos-nfce/shared";
import { describe, expect, it } from "vitest";
import { createPrice } from "../product/price";
import { createProductId } from "../product/product-id";
import { createSaleItem, type SaleItem } from "./sale-item";

/**
 * TDD - RED Phase
 * Tests for SaleItem value object
 *
 * Domain Rules:
 * - Must have productId, quantity, and unitPrice
 * - Quantity must be positive integer
 * - Unit price must be valid Price
 * - Calculates total automatically (quantity * unitPrice)
 * - Immutable
 */

describe("SaleItem", () => {
	describe("createSaleItem", () => {
		it("should create a valid SaleItem", () => {
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(10.5);

			if (!productIdResult.ok || !priceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result: Result<SaleItem, string> = createSaleItem({
				productId: productIdResult.value,
				quantity: 2,
				unitPrice: priceResult.value,
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.productId).toBe("prod-123");
				expect(result.value.quantity).toBe(2);
				expect(result.value.unitPrice).toBe(10.5);
				expect(result.value.total).toBe(21); // 2 * 10.5
			}
		});

		it("should calculate total correctly for single item", () => {
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(15.99);

			if (!productIdResult.ok || !priceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createSaleItem({
				productId: productIdResult.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.total).toBe(15.99);
			}
		});

		it("should calculate total correctly for multiple items", () => {
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(3.33);

			if (!productIdResult.ok || !priceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createSaleItem({
				productId: productIdResult.value,
				quantity: 3,
				unitPrice: priceResult.value,
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.total).toBe(9.99); // 3 * 3.33
			}
		});

		it("should reject zero quantity", () => {
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(10.5);

			if (!productIdResult.ok || !priceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createSaleItem({
				productId: productIdResult.value,
				quantity: 0,
				unitPrice: priceResult.value,
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Quantity must be positive");
			}
		});

		it("should reject negative quantity", () => {
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(10.5);

			if (!productIdResult.ok || !priceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createSaleItem({
				productId: productIdResult.value,
				quantity: -5,
				unitPrice: priceResult.value,
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Quantity must be positive");
			}
		});

		it("should reject decimal quantity", () => {
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(10.5);

			if (!productIdResult.ok || !priceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createSaleItem({
				productId: productIdResult.value,
				quantity: 2.5,
				unitPrice: priceResult.value,
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Quantity must be an integer");
			}
		});

		it("should round total to 2 decimal places", () => {
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(1.11);

			if (!productIdResult.ok || !priceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createSaleItem({
				productId: productIdResult.value,
				quantity: 3,
				unitPrice: priceResult.value,
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				// 3 * 1.11 = 3.33
				expect(result.value.total).toBe(3.33);
			}
		});
	});
});
