/**
 * Tests for ValidatePassword Use Case
 * Task 1.6: Backend password validation endpoint
 * TDD Phase: RED - Write failing tests first
 */

import type { Result } from "@pos-nfce/shared";
import { describe, expect, it } from "vitest";
import {
	type ValidatePasswordError,
	validatePassword,
} from "./validate-password";

// Mock database interface
interface MockUserRepository {
	findById: (id: string) => Promise<{ passwordHash: string } | null>;
}

// Known bcrypt hash for "admin123"
// Generated with: bcryptjs.hash("admin123", 10)
const ADMIN_PASSWORD_HASH =
	"$2b$10$nCdQEJXWvVKy1mW04f8lBu2Cfu65m2O28EBssyZSjUN23PU8JN1SO";

describe("ValidatePassword Use Case", () => {
	describe("Success Cases", () => {
		it("should return true when password matches hash", async () => {
			const mockRepo: MockUserRepository = {
				findById: async () => ({ passwordHash: ADMIN_PASSWORD_HASH }),
			};

			const result: Result<boolean, ValidatePasswordError> =
				await validatePassword(mockRepo, {
					userId: "admin-001",
					password: "admin123",
				});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(true);
			}
		});

		it("should return false when password does not match hash", async () => {
			const mockRepo: MockUserRepository = {
				findById: async () => ({ passwordHash: ADMIN_PASSWORD_HASH }),
			};

			const result: Result<boolean, ValidatePasswordError> =
				await validatePassword(mockRepo, {
					userId: "admin-001",
					password: "wrongpassword",
				});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(false);
			}
		});
	});

	describe("Error Cases", () => {
		it("should return USER_NOT_FOUND error when user does not exist", async () => {
			const mockRepo: MockUserRepository = {
				findById: async () => null,
			};

			const result: Result<boolean, ValidatePasswordError> =
				await validatePassword(mockRepo, {
					userId: "non-existent",
					password: "admin123",
				});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("USER_NOT_FOUND");
				expect(result.error.message).toContain("non-existent");
			}
		});

		it("should handle empty password", async () => {
			const mockRepo: MockUserRepository = {
				findById: async () => ({ passwordHash: ADMIN_PASSWORD_HASH }),
			};

			const result: Result<boolean, ValidatePasswordError> =
				await validatePassword(mockRepo, {
					userId: "admin-001",
					password: "",
				});

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(false);
			}
		});

		it("should handle invalid password hash in database", async () => {
			const mockRepo: MockUserRepository = {
				findById: async () => ({ passwordHash: "invalid-hash" }),
			};

			const result: Result<boolean, ValidatePasswordError> =
				await validatePassword(mockRepo, {
					userId: "admin-001",
					password: "admin123",
				});

			// bcrypt returns false for invalid hashes instead of throwing
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(false);
			}
		});
	});

	describe("Security", () => {
		it("should be resistant to timing attacks", async () => {
			const mockRepo: MockUserRepository = {
				findById: async () => ({ passwordHash: ADMIN_PASSWORD_HASH }),
			};

			// Measure time for correct password
			const start1 = Date.now();
			await validatePassword(mockRepo, {
				userId: "admin-001",
				password: "admin123",
			});
			const time1 = Date.now() - start1;

			// Measure time for incorrect password
			const start2 = Date.now();
			await validatePassword(mockRepo, {
				userId: "admin-001",
				password: "wrongpassword",
			});
			const time2 = Date.now() - start2;

			// Time difference should be minimal (bcrypt.compare is constant-time)
			// Allow up to 50ms difference due to system variance
			const timeDiff = Math.abs(time1 - time2);
			expect(timeDiff).toBeLessThan(50);
		});
	});
});
