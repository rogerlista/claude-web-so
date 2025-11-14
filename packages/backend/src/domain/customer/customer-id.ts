import type { Brand, Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";

/**
 * CustomerId branded type
 *
 * Domain Rules:
 * - Non-empty string
 * - Whitespace trimmed
 * - Supports any ID format (UUID, nanoid, sequential, etc.)
 */
export type CustomerId = Brand<string, "CustomerId">;

/**
 * Create a CustomerId from a string
 *
 * @param value - The string value to convert to CustomerId
 * @returns Result with CustomerId or error message
 */
export const createCustomerId = (value: string): Result<CustomerId, string> => {
	const trimmed = value.trim();

	if (trimmed.length === 0) {
		return ResultUtils.err("CustomerId cannot be empty");
	}

	return ResultUtils.ok(trimmed as CustomerId);
};
