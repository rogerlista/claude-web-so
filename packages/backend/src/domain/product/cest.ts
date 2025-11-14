import type { Brand, Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";

/**
 * CEST (Código Especificador da Substituição Tributária) Value Object
 *
 * Domain Rules:
 * - Must be exactly 7 digits
 * - Must contain only numeric characters
 * - Cannot be empty
 * - Whitespace is trimmed
 *
 * Example: 0100100
 *
 * Branded type to prevent accidental string assignment
 */

export type CEST = Brand<string, "CEST">;

/**
 * Creates a validated CEST value object
 *
 * @param value - The CEST string to validate
 * @returns Result with CEST or error message
 *
 * @example
 * ```typescript
 * const cest = createCEST('0100100')
 * if (cest.ok) {
 *   console.log(cest.value) // '0100100' as CEST
 * }
 * ```
 */
export const createCEST = (value: string): Result<CEST, string> => {
	const trimmed = value.trim();

	if (trimmed.length === 0) {
		return ResultUtils.err("CEST cannot be empty");
	}

	// Check if contains only digits
	if (!/^\d+$/.test(trimmed)) {
		return ResultUtils.err("CEST must contain only digits");
	}

	// Check if has exactly 7 digits
	if (trimmed.length !== 7) {
		return ResultUtils.err("CEST must have exactly 7 digits");
	}

	return ResultUtils.ok(trimmed as CEST);
};
