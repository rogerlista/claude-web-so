import type { Brand, Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";

/**
 * Origem Tributária Type
 *
 * Represents the tax origin code for products in Brazil.
 * Valid values: 0 to 8
 *
 * Meanings:
 * 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
 * 1 - Estrangeira - Importação direta, exceto a indicada no código 6
 * 2 - Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7
 * 3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40%
 * 4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos
 * 5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%
 * 6 - Estrangeira - Importação direta, sem similar nacional, constante em lista da CAMEX
 * 7 - Estrangeira - Adquirida no mercado interno, sem similar nacional, constante em lista da CAMEX
 * 8 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%
 */
export type OrigemTributaria = Brand<number, "OrigemTributaria">;

/**
 * Create an Origem Tributária value object
 *
 * @param value - Tax origin code (0-8)
 * @returns Result with OrigemTributaria or error message
 *
 * @example
 * ```typescript
 * const result = createOrigemTributaria(0); // Nacional
 * if (result.ok) {
 *   console.log(result.value); // 0
 * }
 * ```
 */
export const createOrigemTributaria = (
	value: number,
): Result<OrigemTributaria, string> => {
	// Validate input type
	if (value === null) {
		return ResultUtils.err("Origem tributária não pode ser null");
	}

	if (value === undefined) {
		return ResultUtils.err("Origem tributária não pode ser undefined");
	}

	if (typeof value !== "number") {
		return ResultUtils.err("Origem tributária deve ser um number");
	}

	if (Number.isNaN(value)) {
		return ResultUtils.err("Origem tributária não pode ser NaN");
	}

	// Validate integer
	if (!Number.isInteger(value)) {
		return ResultUtils.err("Origem tributária deve ser um número inteiro");
	}

	// Validate range (0-8)
	if (value < 0 || value > 8) {
		return ResultUtils.err("Origem tributária deve estar entre 0 e 8");
	}

	return ResultUtils.ok(value as OrigemTributaria);
};
