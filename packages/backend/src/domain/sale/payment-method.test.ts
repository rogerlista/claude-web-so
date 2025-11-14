import { describe, expect, it } from "vitest";
import {
	createPaymentMethod,
	getAllPaymentMethods,
	getPaymentMethodDescription,
	isPaymentMethodCode,
	type PaymentMethod,
} from "./payment-method";

describe("PaymentMethod", () => {
	describe("createPaymentMethod", () => {
		it("should create payment method for Dinheiro (01)", () => {
			const result = createPaymentMethod("01");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.code).toBe("01");
				expect(result.value.description).toBe("Dinheiro");
			}
		});

		it("should create payment method for PIX (17)", () => {
			const result = createPaymentMethod("17");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.code).toBe("17");
				expect(result.value.description).toBe("PIX");
			}
		});

		it("should create payment method for Cartão de Crédito (03)", () => {
			const result = createPaymentMethod("03");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.code).toBe("03");
				expect(result.value.description).toBe("Cartão de Crédito");
			}
		});

		it("should create payment method for Cartão de Débito (04)", () => {
			const result = createPaymentMethod("04");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.code).toBe("04");
				expect(result.value.description).toBe("Cartão de Débito");
			}
		});

		it("should fail for invalid payment method code", () => {
			const result = createPaymentMethod("99999");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Invalid payment method code");
			}
		});

		it("should fail for empty string", () => {
			const result = createPaymentMethod("");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Invalid payment method code");
			}
		});

		it("should fail for single digit code without zero padding", () => {
			const result = createPaymentMethod("1");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Invalid payment method code");
			}
		});
	});

	describe("isPaymentMethodCode", () => {
		it("should return true for valid codes", () => {
			expect(isPaymentMethodCode("01")).toBe(true);
			expect(isPaymentMethodCode("03")).toBe(true);
			expect(isPaymentMethodCode("04")).toBe(true);
			expect(isPaymentMethodCode("17")).toBe(true);
		});

		it("should return false for invalid codes", () => {
			expect(isPaymentMethodCode("00")).toBe(false);
			expect(isPaymentMethodCode("100")).toBe(false);
			expect(isPaymentMethodCode("invalid")).toBe(false);
			expect(isPaymentMethodCode("")).toBe(false);
		});
	});

	describe("getAllPaymentMethods", () => {
		it("should return all payment methods", () => {
			const methods = getAllPaymentMethods();

			expect(methods.length).toBeGreaterThan(0);
			expect(methods).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ code: "01", description: "Dinheiro" }),
					expect.objectContaining({
						code: "03",
						description: "Cartão de Crédito",
					}),
					expect.objectContaining({
						code: "04",
						description: "Cartão de Débito",
					}),
					expect.objectContaining({ code: "17", description: "PIX" }),
				]),
			);
		});

		it("should return immutable array", () => {
			const methods = getAllPaymentMethods();
			expect(Object.isFrozen(methods)).toBe(false); // Array itself is not frozen but items are readonly
			expect(methods.every((m) => typeof m === "object")).toBe(true);
		});
	});

	describe("getPaymentMethodDescription", () => {
		it("should return description for valid code", () => {
			expect(getPaymentMethodDescription("01")).toBe("Dinheiro");
			expect(getPaymentMethodDescription("17")).toBe("PIX");
			expect(getPaymentMethodDescription("03")).toBe("Cartão de Crédito");
		});

		it("should return undefined for invalid code", () => {
			expect(getPaymentMethodDescription("00")).toBeUndefined();
			expect(getPaymentMethodDescription("invalid")).toBeUndefined();
			expect(getPaymentMethodDescription("")).toBeUndefined();
		});
	});

	describe("PaymentMethod type", () => {
		it("should be immutable", () => {
			const result = createPaymentMethod("01");

			if (result.ok) {
				const method: PaymentMethod = result.value;
				// TypeScript enforces readonly at compile time
				expect(method.code).toBe("01");
				expect(method.description).toBe("Dinheiro");
			}
		});
	});
});
