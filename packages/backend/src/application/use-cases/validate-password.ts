/**
 * ValidatePassword Use Case
 * Task 1.6: Backend password validation endpoint
 * TDD Phase: GREEN - Implement to pass tests
 */

import type { Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import bcrypt from "bcryptjs";

/**
 * Error types for password validation
 */
export type ValidatePasswordError =
	| {
			type: "USER_NOT_FOUND";
			message: string;
	  }
	| {
			type: "VALIDATION_ERROR";
			message: string;
	  }
	| {
			type: "UNKNOWN";
			message: string;
	  };

/**
 * Input for password validation
 */
export interface ValidatePasswordInput {
	readonly userId: string;
	readonly password: string;
}

/**
 * Repository interface for user data
 */
export interface UserRepository {
	findById: (id: string) => Promise<{ passwordHash: string } | null>;
}

/**
 * Validates a user password against stored hash
 *
 * @param userRepo - Repository for accessing user data
 * @param input - User ID and password to validate
 * @returns Result with boolean (true if valid, false if invalid) or error
 *
 * @example
 * ```typescript
 * const result = await validatePassword(userRepo, {
 *   userId: "admin-001",
 *   password: "admin123"
 * });
 *
 * if (result.type === "SUCCESS") {
 *   console.log(result.value ? "Valid" : "Invalid");
 * }
 * ```
 */
export async function validatePassword(
	userRepo: UserRepository,
	input: ValidatePasswordInput,
): Promise<Result<boolean, ValidatePasswordError>> {
	try {
		// Find user by ID
		const user = await userRepo.findById(input.userId);

		if (!user) {
			return ResultUtils.err({
				type: "USER_NOT_FOUND",
				message: `User ${input.userId} not found`,
			});
		}

		// Validate password using bcrypt
		// bcrypt.compare is constant-time, resistant to timing attacks
		// Note: bcrypt.compare returns false for invalid hashes instead of throwing
		const isValid = await bcrypt.compare(input.password, user.passwordHash);
		return ResultUtils.ok(isValid);
	} catch (error) {
		return ResultUtils.err({
			type: "UNKNOWN",
			message:
				error instanceof Error ? error.message : "Unknown error occurred",
		});
	}
}
