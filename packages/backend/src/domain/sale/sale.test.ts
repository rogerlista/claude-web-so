import type { Result } from "@pos-nfce/shared";
import { describe, expect, it } from "vitest";
import { createCPF } from "../customer/cpf";
import { createCustomerId } from "../customer/customer-id";
import { createEmail } from "../customer/email";
import { createPrice } from "../product/price";
import { createProductId } from "../product/product-id";
import { createPaymentMethod } from "./payment-method";
import {
	addItemToSale,
	addPaymentToSale,
	applyAddition,
	applyDiscount,
	createSale,
	finalizeSale,
	getRemainingAmount,
	isSaleFullyPaid,
	removeItemFromSale,
	removePaymentFromSale,
	type Sale,
	updateItemQuantity,
} from "./sale";
import { createSaleId } from "./sale-id";
import { createSaleItem } from "./sale-item";
import { createSalePayment } from "./sale-payment";

/**
 * Tests for Sale entity
 *
 * Domain Rules:
 * - Must have id and customerId
 * - Can have zero or more items
 * - Gross total is calculated from items
 * - Net total = gross total - discount + addition
 * - Status defaults to PENDING
 * - CreatedAt is set automatically
 * - All fields are immutable
 */

describe("Sale Entity", () => {
	describe("createSale", () => {
		it("should create an empty sale", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");

			if (!saleIdResult.ok || !customerIdResult.ok) {
				throw new Error("Test setup failed");
			}

			const result: Result<Sale, string> = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.id).toBe("sale-123");
				expect(result.value.customerId).toBe("customer-123");
				expect(result.value.items).toHaveLength(0);
				expect(result.value.grossTotal).toBe(0);
				expect(result.value.discount).toBe(0);
				expect(result.value.addition).toBe(0);
				expect(result.value.netTotal).toBe(0);
				expect(result.value.payments).toHaveLength(0);
				expect(result.value.status).toBe("PENDING");
				expect(result.value.createdAt).toBeInstanceOf(Date);
			}
		});

		it("should create a valid Sale with single item", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(10.5);

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 2,
				unitPrice: priceResult.value,
			});

			if (!itemResult.ok) {
				throw new Error("Test setup failed");
			}

			const result: Result<Sale, string> = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.id).toBe("sale-123");
				expect(result.value.customerId).toBe("customer-123");
				expect(result.value.items).toHaveLength(1);
				expect(result.value.grossTotal).toBe(21); // 2 * 10.5
				expect(result.value.netTotal).toBe(21);
				expect(result.value.status).toBe("PENDING");
				expect(result.value.createdAt).toBeInstanceOf(Date);
			}
		});

		it("should create a Sale with multiple items", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const prod1Result = createProductId("prod-1");
			const prod2Result = createProductId("prod-2");
			const price1Result = createPrice(10.0);
			const price2Result = createPrice(5.5);

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!prod1Result.ok ||
				!prod2Result.ok ||
				!price1Result.ok ||
				!price2Result.ok
			) {
				throw new Error("Test setup failed");
			}

			const item1Result = createSaleItem({
				productId: prod1Result.value,
				quantity: 2,
				unitPrice: price1Result.value,
			});

			const item2Result = createSaleItem({
				productId: prod2Result.value,
				quantity: 3,
				unitPrice: price2Result.value,
			});

			if (!item1Result.ok || !item2Result.ok) {
				throw new Error("Test setup failed");
			}

			const result = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [item1Result.value, item2Result.value],
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.items).toHaveLength(2);
				expect(result.value.grossTotal).toBe(36.5); // (2*10) + (3*5.5) = 20 + 16.5
				expect(result.value.netTotal).toBe(36.5);
			}
		});

		it("should apply discount correctly", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(100.0);

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			if (!itemResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
				discount: 10.0,
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.grossTotal).toBe(100.0);
				expect(result.value.discount).toBe(10.0);
				expect(result.value.netTotal).toBe(90.0);
			}
		});

		it("should apply addition correctly", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(100.0);

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			if (!itemResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
				addition: 5.0,
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.grossTotal).toBe(100.0);
				expect(result.value.addition).toBe(5.0);
				expect(result.value.netTotal).toBe(105.0);
			}
		});

		it("should apply discount and addition together", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(100.0);

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			if (!itemResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
				discount: 20.0,
				addition: 5.0,
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.grossTotal).toBe(100.0);
				expect(result.value.discount).toBe(20.0);
				expect(result.value.addition).toBe(5.0);
				expect(result.value.netTotal).toBe(85.0); // 100 - 20 + 5
			}
		});

		it("should reject negative discount", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");

			if (!saleIdResult.ok || !customerIdResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				discount: -10.0,
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Discount cannot be negative");
			}
		});

		it("should reject negative addition", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");

			if (!saleIdResult.ok || !customerIdResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				addition: -5.0,
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Addition cannot be negative");
			}
		});

		it("should reject discount exceeding gross total", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(50.0);

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			if (!itemResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
				discount: 60.0,
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Net total cannot be negative");
			}
		});
	});

	describe("addItemToSale", () => {
		it("should add item to empty sale", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(10.0);

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
			});

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 2,
				unitPrice: priceResult.value,
			});

			if (!saleResult.ok || !itemResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = addItemToSale(saleResult.value, itemResult.value);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.items).toHaveLength(1);
				expect(result.value.grossTotal).toBe(20.0);
				expect(result.value.netTotal).toBe(20.0);
			}
		});

		it("should add multiple items", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const prod1Result = createProductId("prod-1");
			const prod2Result = createProductId("prod-2");
			const price1Result = createPrice(10.0);
			const price2Result = createPrice(5.0);

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!prod1Result.ok ||
				!prod2Result.ok ||
				!price1Result.ok ||
				!price2Result.ok
			) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
			});

			const item1Result = createSaleItem({
				productId: prod1Result.value,
				quantity: 1,
				unitPrice: price1Result.value,
			});

			const item2Result = createSaleItem({
				productId: prod2Result.value,
				quantity: 2,
				unitPrice: price2Result.value,
			});

			if (!saleResult.ok || !item1Result.ok || !item2Result.ok) {
				throw new Error("Test setup failed");
			}

			let sale = saleResult.value;
			const result1 = addItemToSale(sale, item1Result.value);
			expect(result1.ok).toBe(true);

			if (result1.ok) {
				sale = result1.value;
				const result2 = addItemToSale(sale, item2Result.value);
				expect(result2.ok).toBe(true);

				if (result2.ok) {
					expect(result2.value.items).toHaveLength(2);
					expect(result2.value.grossTotal).toBe(20.0); // 10 + (2*5)
				}
			}
		});
	});

	describe("removeItemFromSale", () => {
		it("should remove item from sale", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const prod1Result = createProductId("prod-1");
			const prod2Result = createProductId("prod-2");
			const priceResult = createPrice(10.0);

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!prod1Result.ok ||
				!prod2Result.ok ||
				!priceResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const item1Result = createSaleItem({
				productId: prod1Result.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			const item2Result = createSaleItem({
				productId: prod2Result.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			if (!item1Result.ok || !item2Result.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [item1Result.value, item2Result.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = removeItemFromSale(saleResult.value, "prod-1");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.items).toHaveLength(1);
				expect(result.value.items[0]?.productId).toBe("prod-2");
				expect(result.value.grossTotal).toBe(10.0);
			}
		});
	});

	describe("updateItemQuantity", () => {
		it("should update item quantity", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(10.0);

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 2,
				unitPrice: priceResult.value,
			});

			if (!itemResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = updateItemQuantity(saleResult.value, "prod-123", 5);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.items[0]?.quantity).toBe(5);
				expect(result.value.grossTotal).toBe(50.0);
			}
		});

		it("should fail for non-existent product", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");

			if (!saleIdResult.ok || !customerIdResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = updateItemQuantity(saleResult.value, "non-existent", 5);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("not found in sale");
			}
		});
	});

	describe("applyDiscount", () => {
		it("should apply discount to sale", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(100.0);

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			if (!itemResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = applyDiscount(saleResult.value, 15.0);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.discount).toBe(15.0);
				expect(result.value.netTotal).toBe(85.0);
			}
		});
	});

	describe("applyAddition", () => {
		it("should apply addition to sale", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(100.0);

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			if (!itemResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = applyAddition(saleResult.value, 10.0);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.addition).toBe(10.0);
				expect(result.value.netTotal).toBe(110.0);
			}
		});
	});

	describe("addPaymentToSale", () => {
		it("should add payment to sale", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(100.0);
			const paymentMethodResult = createPaymentMethod("01");

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok ||
				!paymentMethodResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			if (!itemResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
			});

			const paymentResult = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 100.0,
			});

			if (!saleResult.ok || !paymentResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = addPaymentToSale(saleResult.value, paymentResult.value);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.payments).toHaveLength(1);
				expect(result.value.payments[0]?.amount).toBe(100.0);
			}
		});
	});

	describe("removePaymentFromSale", () => {
		it("should remove payment from sale by index", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(100.0);
			const paymentMethodResult = createPaymentMethod("01");

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok ||
				!paymentMethodResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			if (!itemResult.ok) {
				throw new Error("Test setup failed");
			}

			// Create sale with two payments
			const payment1Result = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 60.0,
			});

			const payment2Result = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 40.0,
			});

			if (!payment1Result.ok || !payment2Result.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
				payments: [payment1Result.value, payment2Result.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			// Remove first payment (index 0)
			const result = removePaymentFromSale(saleResult.value, 0);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.payments).toHaveLength(1);
				expect(result.value.payments[0]?.amount).toBe(40.0);
			}
		});

		it("should remove last payment from sale", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(100.0);
			const paymentMethodResult = createPaymentMethod("01");

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok ||
				!paymentMethodResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			if (!itemResult.ok) {
				throw new Error("Test setup failed");
			}

			const payment1Result = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 60.0,
			});

			const payment2Result = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 40.0,
			});

			if (!payment1Result.ok || !payment2Result.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
				payments: [payment1Result.value, payment2Result.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			// Remove last payment (index 1)
			const result = removePaymentFromSale(saleResult.value, 1);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.payments).toHaveLength(1);
				expect(result.value.payments[0]?.amount).toBe(60.0);
			}
		});

		it("should return error for negative index", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");

			if (!saleIdResult.ok || !customerIdResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = removePaymentFromSale(saleResult.value, -1);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Invalid payment index");
			}
		});

		it("should return error for out of bounds index", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const paymentMethodResult = createPaymentMethod("01");

			if (!saleIdResult.ok || !customerIdResult.ok || !paymentMethodResult.ok) {
				throw new Error("Test setup failed");
			}

			const paymentResult = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 50.0,
			});

			if (!paymentResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				payments: [paymentResult.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			// Try to remove payment at index 1 (only has index 0)
			const result = removePaymentFromSale(saleResult.value, 1);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Invalid payment index");
				expect(result.error).toContain("has 1 payments");
			}
		});

		it("should handle removing only payment", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const paymentMethodResult = createPaymentMethod("01");

			if (!saleIdResult.ok || !customerIdResult.ok || !paymentMethodResult.ok) {
				throw new Error("Test setup failed");
			}

			const paymentResult = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 100.0,
			});

			if (!paymentResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				payments: [paymentResult.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = removePaymentFromSale(saleResult.value, 0);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.payments).toHaveLength(0);
			}
		});
	});

	describe("isSaleFullyPaid", () => {
		it("should return true when fully paid", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(100.0);
			const paymentMethodResult = createPaymentMethod("01");

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok ||
				!paymentMethodResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			if (!itemResult.ok) {
				throw new Error("Test setup failed");
			}

			const paymentResult = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 100.0,
			});

			if (!paymentResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
				payments: [paymentResult.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			expect(isSaleFullyPaid(saleResult.value)).toBe(true);
		});

		it("should return false when not fully paid", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(100.0);
			const paymentMethodResult = createPaymentMethod("01");

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok ||
				!paymentMethodResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			if (!itemResult.ok) {
				throw new Error("Test setup failed");
			}

			const paymentResult = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 50.0,
			});

			if (!paymentResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
				payments: [paymentResult.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			expect(isSaleFullyPaid(saleResult.value)).toBe(false);
		});
	});

	describe("getRemainingAmount", () => {
		it("should return remaining amount", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(100.0);
			const paymentMethodResult = createPaymentMethod("01");

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok ||
				!paymentMethodResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			if (!itemResult.ok) {
				throw new Error("Test setup failed");
			}

			const paymentResult = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 60.0,
			});

			if (!paymentResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
				payments: [paymentResult.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			expect(getRemainingAmount(saleResult.value)).toBe(40.0);
		});

		it("should return 0 when fully paid", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(100.0);
			const paymentMethodResult = createPaymentMethod("01");

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok ||
				!paymentMethodResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			if (!itemResult.ok) {
				throw new Error("Test setup failed");
			}

			const paymentResult = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 100.0,
			});

			if (!paymentResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
				payments: [paymentResult.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			expect(getRemainingAmount(saleResult.value)).toBe(0);
		});
	});

	describe("finalizeSale", () => {
		it("should finalize fully paid sale", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(100.0);
			const paymentMethodResult = createPaymentMethod("01");

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok ||
				!paymentMethodResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			if (!itemResult.ok) {
				throw new Error("Test setup failed");
			}

			const paymentResult = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 100.0,
			});

			if (!paymentResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
				payments: [paymentResult.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = finalizeSale(saleResult.value);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.status).toBe("COMPLETED");
			}
		});

		it("should fail to finalize sale with no items", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");

			if (!saleIdResult.ok || !customerIdResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = finalizeSale(saleResult.value);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Cannot finalize sale with no items");
			}
		});

		it("should fail to finalize not fully paid sale", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const productIdResult = createProductId("prod-123");
			const priceResult = createPrice(100.0);

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!productIdResult.ok ||
				!priceResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const itemResult = createSaleItem({
				productId: productIdResult.value,
				quantity: 1,
				unitPrice: priceResult.value,
			});

			if (!itemResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				items: [itemResult.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = finalizeSale(saleResult.value);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("remaining amount");
			}
		});
	});

	describe("Customer Information (CPF/Email)", () => {
		it("should create sale with customer CPF", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const cpfResult = createCPF("11144477735"); // Valid CPF for testing

			if (!saleIdResult.ok || !customerIdResult.ok || !cpfResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				customerCpf: cpfResult.value,
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.customerCpf).toBe("11144477735");
			}
		});

		it("should create sale with customer email", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const emailResult = createEmail("customer@example.com");

			if (!saleIdResult.ok || !customerIdResult.ok || !emailResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				customerEmail: emailResult.value,
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.customerEmail).toBe("customer@example.com");
			}
		});

		it("should create sale with both CPF and email", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const cpfResult = createCPF("11144477735"); // Valid CPF for testing
			const emailResult = createEmail("customer@example.com");

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!cpfResult.ok ||
				!emailResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const result = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				customerCpf: cpfResult.value,
				customerEmail: emailResult.value,
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.customerCpf).toBe("11144477735");
				expect(result.value.customerEmail).toBe("customer@example.com");
			}
		});

		it("should create sale without CPF and email (optional fields)", () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");

			if (!saleIdResult.ok || !customerIdResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.customerCpf).toBeUndefined();
				expect(result.value.customerEmail).toBeUndefined();
			}
		});
	});
});
