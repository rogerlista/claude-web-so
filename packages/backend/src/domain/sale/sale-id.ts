import type { Brand, Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";

/**
 * SaleId branded type
 *
 * Domain Rules:
 * - Non-empty string
 * - Whitespace trimmed
 * - Supports any ID format (UUID, nanoid, sequential, etc.)
 */
export type SaleId = Brand<string, "SaleId">;

/**
 * Create a SaleId from a string
 *
 * @param value - The string value to convert to SaleId
 * @returns Result with SaleId or error message
 */
export const createSaleId = (value: string): Result<SaleId, string> => {
	const trimmed = value.trim();

	if (trimmed.length === 0) {
		return ResultUtils.err("SaleId cannot be empty");
	}

	return ResultUtils.ok(trimmed as SaleId);
};
