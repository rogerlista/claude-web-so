import type { Brand, Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";

/**
 * SKU - Stock Keeping Unit branded type
 *
 * Domain Rules:
 * - Non-empty string
 * - Alphanumeric with hyphens and underscores allowed
 * - Stored as uppercase
 * - No spaces or special characters
 */
export type SKU = Brand<string, "SKU">;

/**
 * Create a SKU from a string
 *
 * @param value - The string value to convert to SKU
 * @returns Result with SKU or error message
 */
export const createSKU = (value: string): Result<SKU, string> => {
	const trimmed = value.trim().toUpperCase();

	// Validate non-empty
	if (trimmed.length === 0) {
		return ResultUtils.err("SKU cannot be empty");
	}

	// Validate alphanumeric with hyphens and underscores
	// Allowed: A-Z, 0-9, hyphen (-), underscore (_)
	const skuPattern = /^[A-Z0-9_-]+$/;

	if (!skuPattern.test(trimmed)) {
		return ResultUtils.err(
			"SKU must be alphanumeric (letters, numbers, hyphens, underscores only)",
		);
	}

	return ResultUtils.ok(trimmed as SKU);
};
