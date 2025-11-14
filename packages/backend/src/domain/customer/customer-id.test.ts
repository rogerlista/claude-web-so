import type { Result } from "@pos-nfce/shared";
import { describe, expect, it } from "vitest";
import { type CustomerId, createCustomerId } from "./customer-id";

/**
 * TDD - RED Phase
 * Tests for CustomerId branded type
 *
 * Domain Rules:
 * - CustomerId must be a non-empty string
 * - Whitespace should be trimmed
 */

describe("CustomerId", () => {
	describe("createCustomerId", () => {
		it("should create a valid CustomerId from non-empty string", () => {
			const result: Result<CustomerId, string> =
				createCustomerId("customer-123");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("customer-123");
			}
		});

		it("should reject empty string", () => {
			const result = createCustomerId("");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("CustomerId cannot be empty");
			}
		});

		it("should reject whitespace-only string", () => {
			const result = createCustomerId("   ");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("CustomerId cannot be empty");
			}
		});

		it("should trim whitespace from input", () => {
			const result = createCustomerId("  customer-123  ");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("customer-123");
			}
		});

		it("should accept alphanumeric IDs", () => {
			const result = createCustomerId("ABC123");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("ABC123");
			}
		});

		it("should accept UUIDs", () => {
			const result = createCustomerId("550e8400-e29b-41d4-a716-446655440000");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("550e8400-e29b-41d4-a716-446655440000");
			}
		});
	});

	describe("CustomerId type safety", () => {
		it("should prevent accidental string assignment", () => {
			const result = createCustomerId("customer-123");

			if (result.ok) {
				const customerId: CustomerId = result.value;

				// This should compile - CustomerId is a branded string
				expect(typeof customerId).toBe("string");

				// TypeScript should prevent this at compile time:
				// const regularString: string = 'test'
				// const customerId2: CustomerId = regularString // ❌ Type error
			}
		});
	});
});
