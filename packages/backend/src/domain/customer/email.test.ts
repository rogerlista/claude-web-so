import type { Result } from "@pos-nfce/shared";
import { describe, expect, it } from "vitest";
import { createEmail, type Email } from "./email";

/**
 * TDD - RED Phase
 * Tests for Email branded type
 *
 * Domain Rules:
 * - Email must follow basic email format
 * - Stored as lowercase
 * - Must have @ symbol
 * - Must have domain with at least one dot
 */

describe("Email", () => {
	describe("createEmail", () => {
		it("should create a valid Email from correct format", () => {
			const result: Result<Email, string> = createEmail("user@example.com");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("user@example.com");
			}
		});

		it("should convert email to lowercase", () => {
			const result = createEmail("USER@EXAMPLE.COM");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("user@example.com");
			}
		});

		it("should accept email with subdomain", () => {
			const result = createEmail("user@mail.example.com");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("user@mail.example.com");
			}
		});

		it("should accept email with numbers", () => {
			const result = createEmail("user123@example123.com");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("user123@example123.com");
			}
		});

		it("should accept email with dots in local part", () => {
			const result = createEmail("first.last@example.com");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("first.last@example.com");
			}
		});

		it("should accept email with plus sign", () => {
			const result = createEmail("user+tag@example.com");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("user+tag@example.com");
			}
		});

		it("should reject empty string", () => {
			const result = createEmail("");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Email cannot be empty");
			}
		});

		it("should reject email without @ symbol", () => {
			const result = createEmail("userexample.com");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Email must be in valid format");
			}
		});

		it("should reject email without domain", () => {
			const result = createEmail("user@");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Email must be in valid format");
			}
		});

		it("should reject email without local part", () => {
			const result = createEmail("@example.com");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Email must be in valid format");
			}
		});

		it("should reject email with spaces", () => {
			const result = createEmail("user name@example.com");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("Email must be in valid format");
			}
		});

		it("should trim whitespace from input", () => {
			const result = createEmail("  user@example.com  ");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("user@example.com");
			}
		});
	});

	describe("Email type safety", () => {
		it("should prevent accidental string assignment", () => {
			const result = createEmail("user@example.com");

			if (result.ok) {
				const email: Email = result.value;

				// This should compile - Email is a branded string
				expect(typeof email).toBe("string");

				// TypeScript should prevent this at compile time:
				// const regularString: string = 'test@test.com'
				// const email2: Email = regularString // ❌ Type error
			}
		});
	});
});
