import type { Brand, Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import type { Price } from "./price";

/**
 * Promotional Price Type
 *
 * Represents a time-bound price promotion for a product.
 *
 * Invariants:
 * - Promotional price must be lower than regular price
 * - End date must be greater than or equal to start date
 * - All dates must be valid
 */
export type PromotionalPrice = Brand<
	{
		readonly regularPrice: Price;
		readonly promotionalPrice: Price;
		readonly startDate: Date;
		readonly endDate: Date;
	},
	"PromotionalPrice"
>;

/**
 * Input for creating a Promotional Price
 */
export type CreatePromotionalPriceInput = {
	readonly regularPrice: Price;
	readonly promotionalPrice: Price;
	readonly startDate: Date;
	readonly endDate: Date;
};

/**
 * Create a Promotional Price value object
 *
 * @param input - Promotional price data
 * @returns Result with PromotionalPrice or error message
 *
 * @example
 * ```typescript
 * const regularPrice = createPrice(100.0);
 * const promoPrice = createPrice(80.0);
 * const result = createPromotionalPrice({
 *   regularPrice: regularPrice.value,
 *   promotionalPrice: promoPrice.value,
 *   startDate: new Date('2024-01-01'),
 *   endDate: new Date('2024-01-31')
 * });
 * ```
 */
export const createPromotionalPrice = (
	input: CreatePromotionalPriceInput,
): Result<PromotionalPrice, string> => {
	// Validate prices exist
	if (input.regularPrice === null || input.regularPrice === undefined) {
		return ResultUtils.err("Preço normal é obrigatório");
	}

	if (
		input.promotionalPrice === null ||
		input.promotionalPrice === undefined
	) {
		return ResultUtils.err("Preço promocional é obrigatório");
	}

	// Validate dates exist
	if (input.startDate === null || input.startDate === undefined) {
		return ResultUtils.err("Data inicial é obrigatória");
	}

	if (input.endDate === null || input.endDate === undefined) {
		return ResultUtils.err("Data final é obrigatória");
	}

	// Validate dates are valid
	if (Number.isNaN(input.startDate.getTime())) {
		return ResultUtils.err("Data inicial inválida");
	}

	if (Number.isNaN(input.endDate.getTime())) {
		return ResultUtils.err("Data final inválida");
	}

	// Validate promotional price is lower than regular price
	if (input.promotionalPrice >= input.regularPrice) {
		return ResultUtils.err(
			"Preço promocional deve ser menor que o preço normal",
		);
	}

	// Validate end date is greater than or equal to start date
	if (input.endDate < input.startDate) {
		return ResultUtils.err(
			"Data final deve ser maior ou igual à data inicial",
		);
	}

	return ResultUtils.ok({
		regularPrice: input.regularPrice,
		promotionalPrice: input.promotionalPrice,
		startDate: input.startDate,
		endDate: input.endDate,
	} as PromotionalPrice);
};
