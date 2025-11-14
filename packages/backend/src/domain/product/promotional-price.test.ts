import { describe, expect, it } from "vitest";
import { createPrice } from "./price";
import { createPromotionalPrice } from "./promotional-price";

/**
 * Tests for Promotional Price Value Object
 *
 * PromotionalPrice represents a time-bound price promotion for a product.
 * It ensures that the promotional price is lower than the regular price
 * and that the promotion period is valid.
 */
describe("Promotional Price Value Object", () => {
	describe("Valid Promotional Price", () => {
		it("should accept promotional price lower than regular price", () => {
			const regularPriceResult = createPrice(100.0);
			const promotionalPriceResult = createPrice(80.0);
			const startDate = new Date("2024-01-01");
			const endDate = new Date("2024-01-31");

			if (!regularPriceResult.ok || !promotionalPriceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createPromotionalPrice({
				regularPrice: regularPriceResult.value,
				promotionalPrice: promotionalPriceResult.value,
				startDate,
				endDate,
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.promotionalPrice).toBe(80.0);
				expect(result.value.regularPrice).toBe(100.0);
				expect(result.value.startDate).toEqual(startDate);
				expect(result.value.endDate).toEqual(endDate);
			}
		});

		it("should accept 50% discount", () => {
			const regularPriceResult = createPrice(200.0);
			const promotionalPriceResult = createPrice(100.0);
			const startDate = new Date("2024-06-01");
			const endDate = new Date("2024-06-30");

			if (!regularPriceResult.ok || !promotionalPriceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createPromotionalPrice({
				regularPrice: regularPriceResult.value,
				promotionalPrice: promotionalPriceResult.value,
				startDate,
				endDate,
			});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.promotionalPrice).toBe(100.0);
			}
		});

		it("should accept 1 cent discount", () => {
			const regularPriceResult = createPrice(10.0);
			const promotionalPriceResult = createPrice(9.99);
			const startDate = new Date("2024-01-01");
			const endDate = new Date("2024-01-02");

			if (!regularPriceResult.ok || !promotionalPriceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createPromotionalPrice({
				regularPrice: regularPriceResult.value,
				promotionalPrice: promotionalPriceResult.value,
				startDate,
				endDate,
			});

			expect(result.ok).toBe(true);
		});

		it("should accept same day promotion (start equals end)", () => {
			const regularPriceResult = createPrice(50.0);
			const promotionalPriceResult = createPrice(40.0);
			const date = new Date("2024-12-25");

			if (!regularPriceResult.ok || !promotionalPriceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createPromotionalPrice({
				regularPrice: regularPriceResult.value,
				promotionalPrice: promotionalPriceResult.value,
				startDate: date,
				endDate: date,
			});

			expect(result.ok).toBe(true);
		});
	});

	describe("Invalid Promotional Price - Price Comparison", () => {
		it("should reject when promotional price equals regular price", () => {
			const regularPriceResult = createPrice(100.0);
			const promotionalPriceResult = createPrice(100.0);
			const startDate = new Date("2024-01-01");
			const endDate = new Date("2024-01-31");

			if (!regularPriceResult.ok || !promotionalPriceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createPromotionalPrice({
				regularPrice: regularPriceResult.value,
				promotionalPrice: promotionalPriceResult.value,
				startDate,
				endDate,
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("menor");
				expect(result.error).toContain("pre\u00e7o normal");
			}
		});

		it("should reject when promotional price is higher than regular price", () => {
			const regularPriceResult = createPrice(100.0);
			const promotionalPriceResult = createPrice(120.0);
			const startDate = new Date("2024-01-01");
			const endDate = new Date("2024-01-31");

			if (!regularPriceResult.ok || !promotionalPriceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createPromotionalPrice({
				regularPrice: regularPriceResult.value,
				promotionalPrice: promotionalPriceResult.value,
				startDate,
				endDate,
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("menor");
			}
		});
	});

	describe("Invalid Promotional Price - Date Validation", () => {
		it("should reject when end date is before start date", () => {
			const regularPriceResult = createPrice(100.0);
			const promotionalPriceResult = createPrice(80.0);
			const startDate = new Date("2024-01-31");
			const endDate = new Date("2024-01-01");

			if (!regularPriceResult.ok || !promotionalPriceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createPromotionalPrice({
				regularPrice: regularPriceResult.value,
				promotionalPrice: promotionalPriceResult.value,
				startDate,
				endDate,
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Data final");
				expect(result.error).toContain("data inicial");
			}
		});

		it("should reject when end date is 1 day before start date", () => {
			const regularPriceResult = createPrice(100.0);
			const promotionalPriceResult = createPrice(80.0);
			const startDate = new Date("2024-01-15");
			const endDate = new Date("2024-01-14");

			if (!regularPriceResult.ok || !promotionalPriceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createPromotionalPrice({
				regularPrice: regularPriceResult.value,
				promotionalPrice: promotionalPriceResult.value,
				startDate,
				endDate,
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Data final");
			}
		});

		it("should reject invalid start date", () => {
			const regularPriceResult = createPrice(100.0);
			const promotionalPriceResult = createPrice(80.0);
			const startDate = new Date("invalid");
			const endDate = new Date("2024-01-31");

			if (!regularPriceResult.ok || !promotionalPriceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createPromotionalPrice({
				regularPrice: regularPriceResult.value,
				promotionalPrice: promotionalPriceResult.value,
				startDate,
				endDate,
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Data inicial");
				expect(result.error).toContain("inválida");
			}
		});

		it("should reject invalid end date", () => {
			const regularPriceResult = createPrice(100.0);
			const promotionalPriceResult = createPrice(80.0);
			const startDate = new Date("2024-01-01");
			const endDate = new Date("invalid");

			if (!regularPriceResult.ok || !promotionalPriceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createPromotionalPrice({
				regularPrice: regularPriceResult.value,
				promotionalPrice: promotionalPriceResult.value,
				startDate,
				endDate,
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Data final");
				expect(result.error).toContain("inválida");
			}
		});
	});

	describe("Invalid Promotional Price - Null/Undefined", () => {
		it("should reject null regular price", () => {
			const promotionalPriceResult = createPrice(80.0);
			const startDate = new Date("2024-01-01");
			const endDate = new Date("2024-01-31");

			if (!promotionalPriceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createPromotionalPrice({
				regularPrice: null as unknown as number,
				promotionalPrice: promotionalPriceResult.value,
				startDate,
				endDate,
			});

			expect(result.ok).toBe(false);
		});

		it("should reject null promotional price", () => {
			const regularPriceResult = createPrice(100.0);
			const startDate = new Date("2024-01-01");
			const endDate = new Date("2024-01-31");

			if (!regularPriceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createPromotionalPrice({
				regularPrice: regularPriceResult.value,
				promotionalPrice: null as unknown as number,
				startDate,
				endDate,
			});

			expect(result.ok).toBe(false);
		});

		it("should reject null start date", () => {
			const regularPriceResult = createPrice(100.0);
			const promotionalPriceResult = createPrice(80.0);
			const endDate = new Date("2024-01-31");

			if (!regularPriceResult.ok || !promotionalPriceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createPromotionalPrice({
				regularPrice: regularPriceResult.value,
				promotionalPrice: promotionalPriceResult.value,
				startDate: null as unknown as Date,
				endDate,
			});

			expect(result.ok).toBe(false);
		});

		it("should reject null end date", () => {
			const regularPriceResult = createPrice(100.0);
			const promotionalPriceResult = createPrice(80.0);
			const startDate = new Date("2024-01-01");

			if (!regularPriceResult.ok || !promotionalPriceResult.ok) {
				throw new Error("Test setup failed");
			}

			const result = createPromotionalPrice({
				regularPrice: regularPriceResult.value,
				promotionalPrice: promotionalPriceResult.value,
				startDate,
				endDate: null as unknown as Date,
			});

			expect(result.ok).toBe(false);
		});
	});
});
