import { describe, expect, it } from "vitest";
import { createAliquotaIcms } from "./aliquota-icms";

/**
 * Tests for Alíquota ICMS Value Object
 *
 * Alíquota ICMS represents the ICMS (Imposto sobre Circulação de Mercadorias e Serviços)
 * tax rate percentage for products in Brazil.
 *
 * Valid values: 0 to 100 (percentage)
 *
 * Common ICMS rates in Brazil:
 * - 0% - Exempt products or zero-rated
 * - 7% - Some interstate operations
 * - 12% - Some interstate operations and specific products
 * - 17% - Standard rate in some states
 * - 18% - Standard rate in many states
 * - 25% - Some specific products (luxury items, etc.)
 */
describe("Alíquota ICMS Value Object", () => {
	describe("Valid Alíquota ICMS", () => {
		it("should accept 0% (exempt/zero-rated)", () => {
			const result = createAliquotaIcms(0);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(0);
			}
		});

		it("should accept 7%", () => {
			const result = createAliquotaIcms(7);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(7);
			}
		});

		it("should accept 12%", () => {
			const result = createAliquotaIcms(12);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(12);
			}
		});

		it("should accept 18%", () => {
			const result = createAliquotaIcms(18);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(18);
			}
		});

		it("should accept 25%", () => {
			const result = createAliquotaIcms(25);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(25);
			}
		});

		it("should accept 100% (maximum)", () => {
			const result = createAliquotaIcms(100);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(100);
			}
		});

		it("should accept decimal values like 17.5%", () => {
			const result = createAliquotaIcms(17.5);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(17.5);
			}
		});

		it("should accept 4%", () => {
			const result = createAliquotaIcms(4);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(4);
			}
		});
	});

	describe("Invalid Alíquota ICMS - Out of Range", () => {
		it("should reject negative value", () => {
			const result = createAliquotaIcms(-1);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("0 e 100");
			}
		});

		it("should reject -0.5", () => {
			const result = createAliquotaIcms(-0.5);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("0 e 100");
			}
		});

		it("should reject 100.01 (just above maximum)", () => {
			const result = createAliquotaIcms(100.01);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("0 e 100");
			}
		});

		it("should reject 150", () => {
			const result = createAliquotaIcms(150);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("0 e 100");
			}
		});
	});

	describe("Invalid Alíquota ICMS - Type Validation", () => {
		it("should reject null", () => {
			const result = createAliquotaIcms(null as unknown as number);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("null");
			}
		});

		it("should reject undefined", () => {
			const result = createAliquotaIcms(undefined as unknown as number);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("undefined");
			}
		});

		it("should reject string", () => {
			const result = createAliquotaIcms("18" as unknown as number);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("number");
			}
		});

		it("should reject NaN", () => {
			const result = createAliquotaIcms(Number.NaN);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("NaN");
			}
		});

		it("should reject infinity", () => {
			const result = createAliquotaIcms(Number.POSITIVE_INFINITY);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("finito");
			}
		});

		it("should reject negative infinity", () => {
			const result = createAliquotaIcms(Number.NEGATIVE_INFINITY);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("finito");
			}
		});
	});
});
