import type { Brand, Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";

/**
 * Alíquota ICMS Type
 *
 * Represents the ICMS (Imposto sobre Circulação de Mercadorias e Serviços)
 * tax rate percentage for products in Brazil.
 *
 * Valid values: 0 to 100 (percentage)
 *
 * Common ICMS rates in Brazil:
 * - 0% - Exempt products or zero-rated
 * - 7% - Some interstate operations
 * - 12% - Some interstate operations and specific products
 * - 17% - Standard rate in some states
 * - 18% - Standard rate in many states
 * - 25% - Some specific products (luxury items, etc.)
 */
export type AliquotaIcms = Brand<number, "AliquotaIcms">;

/**
 * Create an Alíquota ICMS value object
 *
 * @param value - ICMS tax rate percentage (0-100)
 * @returns Result with AliquotaIcms or error message
 *
 * @example
 * ```typescript
 * const result = createAliquotaIcms(18); // 18% ICMS rate
 * if (result.ok) {
 *   console.log(result.value); // 18
 * }
 * ```
 */
export const createAliquotaIcms = (
	value: number,
): Result<AliquotaIcms, string> => {
	// Validate input type
	if (value === null) {
		return ResultUtils.err("Alíquota ICMS não pode ser null");
	}

	if (value === undefined) {
		return ResultUtils.err("Alíquota ICMS não pode ser undefined");
	}

	if (typeof value !== "number") {
		return ResultUtils.err("Alíquota ICMS deve ser um number");
	}

	if (Number.isNaN(value)) {
		return ResultUtils.err("Alíquota ICMS não pode ser NaN");
	}

	if (!Number.isFinite(value)) {
		return ResultUtils.err("Alíquota ICMS deve ser um número finito");
	}

	// Validate range (0-100)
	if (value < 0 || value > 100) {
		return ResultUtils.err("Alíquota ICMS deve estar entre 0 e 100");
	}

	return ResultUtils.ok(value as AliquotaIcms);
};
