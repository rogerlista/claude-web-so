import type { Result } from "@pos-nfce/shared";
import { describe, expect, it } from "vitest";
import { createSaleId, type SaleId } from "./sale-id";

/**
 * TDD - RED Phase
 * Tests for SaleId branded type
 *
 * Domain Rules:
 * - SaleId must be a non-empty string
 * - Whitespace should be trimmed
 */

describe("SaleId", () => {
	describe("createSaleId", () => {
		it("should create a valid SaleId from non-empty string", () => {
			const result: Result<SaleId, string> = createSaleId("sale-123");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("sale-123");
			}
		});

		it("should reject empty string", () => {
			const result = createSaleId("");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("SaleId cannot be empty");
			}
		});

		it("should reject whitespace-only string", () => {
			const result = createSaleId("   ");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("SaleId cannot be empty");
			}
		});

		it("should trim whitespace from input", () => {
			const result = createSaleId("  sale-123  ");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("sale-123");
			}
		});
	});
});
