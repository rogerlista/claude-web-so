import type { Brand, Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";

/**
 * DUN14 - Distribution Unit Number branded type
 *
 * Domain Rules:
 * - Must be exactly 14 digits
 * - Numeric only
 * - Leading zeros preserved
 *
 * DUN14 is a 14-digit logistics identifier used in the supply chain
 * to identify distribution units (pallets, boxes, etc.)
 */
export type Dun14 = Brand<string, "DUN14">;

/**
 * Create a DUN14 value object from a string
 *
 * @param value - String to validate as DUN14
 * @returns Result with DUN14 or error message
 *
 * @example
 * ```typescript
 * const result = createDun14("12345678901234");
 * if (result.ok) {
 *   console.log(result.value); // "12345678901234" (branded as DUN14)
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export const createDun14 = (value: string): Result<Dun14, string> => {
	// Validate input type
	if (value === null || value === undefined) {
		return ResultUtils.err("DUN14 cannot be null or undefined");
	}

	// Convert to string and trim
	const dun14Str = String(value).trim();

	// Validate not empty
	if (dun14Str.length === 0) {
		return ResultUtils.err("DUN14 must be exactly 14 digits");
	}

	// Validate length (must be exactly 14 digits)
	if (dun14Str.length !== 14) {
		return ResultUtils.err("DUN14 must be exactly 14 digits");
	}

	// Validate numeric only
	if (!/^\d{14}$/.test(dun14Str)) {
		return ResultUtils.err("DUN14 must contain only numeric characters");
	}

	// Return branded DUN14
	return ResultUtils.ok(dun14Str as Dun14);
};
