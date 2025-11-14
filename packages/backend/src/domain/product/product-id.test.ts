import type { Result } from "@pos-nfce/shared";
import { describe, expect, it } from "vitest";
import { createProductId, type ProductId } from "./product-id";

/**
 * TDD - RED Phase
 * Tests for ProductId branded type
 *
 * Domain Rule: ProductId must be a non-empty string (UUID format preferred)
 */

describe("ProductId", () => {
	describe("createProductId", () => {
		it("should create a valid ProductId from non-empty string", () => {
			const result: Result<ProductId, string> = createProductId("prod-123");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("prod-123");
			}
		});

		it("should reject empty string", () => {
			const result = createProductId("");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("ProductId cannot be empty");
			}
		});

		it("should reject whitespace-only string", () => {
			const result = createProductId("   ");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("ProductId cannot be empty");
			}
		});

		it("should accept UUID format", () => {
			const uuid = "550e8400-e29b-41d4-a716-446655440000";
			const result = createProductId(uuid);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(uuid);
			}
		});

		it("should trim whitespace from input", () => {
			const result = createProductId("  prod-123  ");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("prod-123");
			}
		});
	});

	describe("ProductId type safety", () => {
		it("should prevent accidental string assignment", () => {
			const result = createProductId("prod-123");

			if (result.ok) {
				const productId: ProductId = result.value;

				// This should compile - ProductId is a branded string
				expect(typeof productId).toBe("string");

				// TypeScript should prevent this at compile time:
				// const regularString: string = 'test'
				// const productId2: ProductId = regularString // ❌ Type error
			}
		});
	});
});
