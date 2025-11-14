import type { Brand, Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";

/**
 * InventoryId - Branded type for inventory movement identifiers
 *
 * Domain Rules:
 * - Must be a non-empty string
 * - Whitespace is trimmed
 */
export type InventoryId = Brand<string, "InventoryId">;

/**
 * Create an InventoryId from a string
 *
 * @param value - The string value to convert to InventoryId
 * @returns Result with InventoryId or error message
 */
export const createInventoryId = (
	value: string,
): Result<InventoryId, string> => {
	const trimmed = value.trim();

	if (trimmed.length === 0) {
		return ResultUtils.err("InventoryId cannot be empty");
	}

	return ResultUtils.ok(trimmed as InventoryId);
};
