import { describe, expect, it } from "vitest";
import { createSurcharge } from "./surcharge";

/**
 * TDD - RED Phase
 * Tests for Surcharge Value Object
 *
 * Surcharge represents an additional charge that can be applied to a sale
 * Can be either:
 * - PERCENTAGE: surcharge as percentage (must be positive)
 * - AMOUNT: surcharge as fixed amount (must be positive)
 */

describe("Surcharge Value Object", () => {
	describe("createSurcharge", () => {
		describe("PERCENTAGE surcharge", () => {
			it("should create surcharge with valid percentage", () => {
				const result = createSurcharge({ type: "PERCENTAGE", value: 10 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.type).toBe("PERCENTAGE");
					expect(result.value.value).toBe(10);
				}
			});

			it("should create surcharge with 0%", () => {
				const result = createSurcharge({ type: "PERCENTAGE", value: 0 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.value).toBe(0);
				}
			});

			it("should create surcharge with high percentage", () => {
				const result = createSurcharge({ type: "PERCENTAGE", value: 200 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.value).toBe(200);
				}
			});

			it("should reject negative percentage", () => {
				const result = createSurcharge({ type: "PERCENTAGE", value: -1 });

				expect(result.ok).toBe(false);
				if (!result.ok) {
					expect(result.error).toContain("percentage");
					expect(result.error).toContain("negative");
				}
			});

			it("should reject NaN percentage", () => {
				const result = createSurcharge({
					type: "PERCENTAGE",
					value: Number.NaN,
				});

				expect(result.ok).toBe(false);
				if (!result.ok) {
					expect(result.error).toContain("valid");
				}
			});

			it("should reject Infinity percentage", () => {
				const result = createSurcharge({
					type: "PERCENTAGE",
					value: Number.POSITIVE_INFINITY,
				});

				expect(result.ok).toBe(false);
				if (!result.ok) {
					expect(result.error).toContain("valid");
				}
			});
		});

		describe("AMOUNT surcharge", () => {
			it("should create surcharge with valid amount", () => {
				const result = createSurcharge({ type: "AMOUNT", value: 10.5 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.type).toBe("AMOUNT");
					expect(result.value.value).toBe(10.5);
				}
			});

			it("should create surcharge with zero amount", () => {
				const result = createSurcharge({ type: "AMOUNT", value: 0 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.value).toBe(0);
				}
			});

			it("should create surcharge with large amount", () => {
				const result = createSurcharge({ type: "AMOUNT", value: 999999.99 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.value).toBe(999999.99);
				}
			});

			it("should reject negative amount", () => {
				const result = createSurcharge({ type: "AMOUNT", value: -1 });

				expect(result.ok).toBe(false);
				if (!result.ok) {
					expect(result.error).toContain("amount");
					expect(result.error).toContain("negative");
				}
			});

			it("should reject NaN amount", () => {
				const result = createSurcharge({ type: "AMOUNT", value: Number.NaN });

				expect(result.ok).toBe(false);
				if (!result.ok) {
					expect(result.error).toContain("valid");
				}
			});

			it("should reject Infinity amount", () => {
				const result = createSurcharge({
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
				const result = createSurcharge({ type: "PERCENTAGE", value: 10.5 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.value).toBe(10.5);
				}
			});

			it("should handle very small amounts", () => {
				const result = createSurcharge({ type: "AMOUNT", value: 0.01 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					expect(result.value.value).toBe(0.01);
				}
			});
		});

		describe("immutability", () => {
			it("should create immutable surcharge", () => {
				const result = createSurcharge({ type: "PERCENTAGE", value: 10 });

				expect(result.ok).toBe(true);
				if (result.ok) {
					const surcharge = result.value;
					// TypeScript should prevent this, but let's verify runtime too
					expect(() => {
						// @ts-expect-error - Testing immutability
						surcharge.value = 20;
					}).toThrow();
				}
			});
		});
	});

	describe("type guards", () => {
		it("should distinguish between percentage and amount surcharges", () => {
			const percentageResult = createSurcharge({
				type: "PERCENTAGE",
				value: 10,
			});
			const amountResult = createSurcharge({ type: "AMOUNT", value: 10 });

			expect(percentageResult.ok).toBe(true);
			expect(amountResult.ok).toBe(true);

			if (percentageResult.ok && amountResult.ok) {
				expect(percentageResult.value.type).toBe("PERCENTAGE");
				expect(amountResult.value.type).toBe("AMOUNT");
			}
		});
	});
});
