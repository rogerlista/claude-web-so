import { describe, expect, it } from "vitest";
import { createDiscount } from "./discount";

/**
 * TDD - RED Phase
 * Tests for Discount Value Object
 *
 * Discount represents a discount that can be applied to a sale
 * Can be either:
 * - PERCENTAGE: discount as percentage (0-100)
 * - AMOUNT: discount as fixed amount (must be positive)
 */

describe("Discount Value Object", () => {
	describe("createDiscount", () => {
		describe("PERCENTAGE discount", () => {
			it("should create discount with valid percentage", () => {
				const result = createDiscount({ type: "PERCENTAGE", value: 10 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.type).toBe("PERCENTAGE");
					expect(result.value.value).toBe(10);
				}
			});

			it("should create discount with 0%", () => {
				const result = createDiscount({ type: "PERCENTAGE", value: 0 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.value).toBe(0);
				}
			});

			it("should create discount with 100%", () => {
				const result = createDiscount({ type: "PERCENTAGE", value: 100 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.value).toBe(100);
				}
			});

			it("should reject negative percentage", () => {
				const result = createDiscount({ type: "PERCENTAGE", value: -1 });

				expect(result.ok).toBe(false);
				if (!result.ok) {
					expect(result.error).toContain("percentage");
					expect(result.error).toContain("0");
				}
			});

			it("should reject percentage greater than 100", () => {
				const result = createDiscount({ type: "PERCENTAGE", value: 101 });

				expect(result.ok).toBe(false);
				if (!result.ok) {
					expect(result.error).toContain("percentage");
					expect(result.error).toContain("100");
				}
			});

			it("should reject NaN percentage", () => {
				const result = createDiscount({
					type: "PERCENTAGE",
					value: Number.NaN,
				});

				expect(result.ok).toBe(false);
				if (!result.ok) {
					expect(result.error).toContain("valid");
				}
			});

			it("should reject Infinity percentage", () => {
				const result = createDiscount({
					type: "PERCENTAGE",
					value: Number.POSITIVE_INFINITY,
				});

				expect(result.ok).toBe(false);
				if (!result.ok) {
					expect(result.error).toContain("valid");
				}
			});
		});

		describe("AMOUNT discount", () => {
			it("should create discount with valid amount", () => {
				const result = createDiscount({ type: "AMOUNT", value: 10.5 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.type).toBe("AMOUNT");
					expect(result.value.value).toBe(10.5);
				}
			});

			it("should create discount with zero amount", () => {
				const result = createDiscount({ type: "AMOUNT", value: 0 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.value).toBe(0);
				}
			});

			it("should create discount with large amount", () => {
				const result = createDiscount({ type: "AMOUNT", value: 999999.99 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.value).toBe(999999.99);
				}
			});

			it("should reject negative amount", () => {
				const result = createDiscount({ type: "AMOUNT", value: -1 });

				expect(result.ok).toBe(false);
				if (!result.ok) {
					expect(result.error).toContain("amount");
					expect(result.error).toContain("negative");
				}
			});

			it("should reject NaN amount", () => {
				const result = createDiscount({ type: "AMOUNT", value: Number.NaN });

				expect(result.ok).toBe(false);
				if (!result.ok) {
					expect(result.error).toContain("valid");
				}
			});

			it("should reject Infinity amount", () => {
				const result = createDiscount({
					type: "AMOUNT",
					value: Number.POSITIVE_INFINITY,
				});

				expect(result.ok).toBe(false);
				if (!result.ok) {
					expect(result.error).toContain("valid");
				}
			});
		});

		describe("edge cases", () => {
			it("should handle decimal percentages correctly", () => {
				const result = createDiscount({ type: "PERCENTAGE", value: 10.5 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.value).toBe(10.5);
				}
			});

			it("should handle very small amounts", () => {
				const result = createDiscount({ type: "AMOUNT", value: 0.01 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.value).toBe(0.01);
				}
			});
		});

		describe("immutability", () => {
			it("should create immutable discount", () => {
				const result = createDiscount({ type: "PERCENTAGE", value: 10 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					const discount = result.value;
					// TypeScript should prevent this, but let's verify runtime too
					expect(() => {
						// @ts-expect-error - Testing immutability
						discount.value = 20;
					}).toThrow();
				}
			});
		});
	});

	describe("type guards", () => {
		it("should distinguish between percentage and amount discounts", () => {
			const percentageResult = createDiscount({
				type: "PERCENTAGE",
				value: 10,
			});
			const amountResult = createDiscount({ type: "AMOUNT", value: 10 });

			expect(percentageResult.ok).toBe(true);
			expect(amountResult.ok).toBe(true);

			if (percentageResult.ok && amountResult.ok) {
				expect(percentageResult.value.type).toBe("PERCENTAGE");
				expect(amountResult.value.type).toBe("AMOUNT");
			}
		});
	});
});
