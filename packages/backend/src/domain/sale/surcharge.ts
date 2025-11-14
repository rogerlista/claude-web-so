import type { Brand, Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";

/**
 * Surcharge Type - Percentage or Amount
 */
export type SurchargeType = "PERCENTAGE" | "AMOUNT";

/**
 * Surcharge Value Object
 *
 * Represents an additional charge that can be applied to a sale
 * - PERCENTAGE: surcharge as percentage (must be non-negative)
 * - AMOUNT: surcharge as fixed amount (must be non-negative)
 *
 * Domain invariants:
 * - Type must be either PERCENTAGE or AMOUNT
 * - Value must be a valid number (not NaN or Infinity)
 * - Value must be non-negative
 */
export type Surcharge = Brand<
	{
		readonly type: SurchargeType;
		readonly value: number;
	},
	"Surcharge"
>;

/**
 * Input for creating a Surcharge
 */
export type CreateSurchargeInput = {
	readonly type: SurchargeType;
	readonly value: number;
};

/**
 * Create a Surcharge value object
 *
 * @param input - Surcharge data
 * @returns Result with Surcharge or error message
 */
export const createSurcharge = (
	input: CreateSurchargeInput,
): Result<Surcharge, string> => {
	// Validate value is a valid number
	if (Number.isNaN(input.value) || !Number.isFinite(input.value)) {
		return ResultUtils.err("Surcharge value must be a valid number");
	}

	// Validate value is non-negative
	if (input.value < 0) {
		if (input.type === "PERCENTAGE") {
			return ResultUtils.err("Surcharge percentage cannot be negative");
		}
		return ResultUtils.err("Surcharge amount cannot be negative");
	}

	// Create immutable surcharge
	const surcharge = Object.freeze({
		type: input.type,
		value: input.value,
	}) as Surcharge;

	return ResultUtils.ok(surcharge);
};
