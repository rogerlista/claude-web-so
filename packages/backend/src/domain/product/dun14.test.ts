import { describe, expect, it } from "vitest";
import { createDun14 } from "./dun14";

/**
 * TDD Tests for DUN14 Value Object
 *
 * DUN14 (Distribution Unit Number) - 14-digit logistics identifier
 *
 * Domain Rules:
 * - Must be exactly 14 digits
 * - Numeric only
 * - Leading zeros preserved
 */

describe("DUN14 Value Object", () => {
	describe("Valid DUN14", () => {
		it("should accept valid 14-digit DUN14", () => {
			const result = createDun14("12345678901234");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("12345678901234");
			}
		});

		it("should preserve leading zeros", () => {
			const result = createDun14("00000000000123");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("00000000000123");
			}
		});

		it("should accept all zeros", () => {
			const result = createDun14("00000000000000");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("00000000000000");
			}
		});

		it("should accept all nines", () => {
			const result = createDun14("99999999999999");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("99999999999999");
			}
		});
	});

	describe("Invalid DUN14 - Length", () => {
		it("should reject empty string", () => {
			const result = createDun14("");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("14 digits");
			}
		});

		it("should reject 13 digits (too short)", () => {
			const result = createDun14("1234567890123");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("14 digits");
			}
		});

		it("should reject 15 digits (too long)", () => {
			const result = createDun14("123456789012345");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("14 digits");
			}
		});
	});

	describe("Invalid DUN14 - Format", () => {
		it("should reject non-numeric characters", () => {
			const result = createDun14("1234567890123A");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("numeric");
			}
		});

		it("should reject special characters", () => {
			const result = createDun14("12345678901-34");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("numeric");
			}
		});

		it("should reject spaces", () => {
			const result = createDun14("12345 67890123");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("numeric");
			}
		});

		it("should reject letters", () => {
			const result = createDun14("ABCDEFGHIJKLMN");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("numeric");
			}
		});
	});

	describe("Edge Cases", () => {
		it("should reject null input", () => {
			const result = createDun14(null as unknown as string);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeDefined();
			}
		});

		it("should reject undefined input", () => {
			const result = createDun14(undefined as unknown as string);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeDefined();
			}
		});

		it("should handle whitespace-only input", () => {
			const result = createDun14("              ");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeDefined();
			}
		});
	});
});
