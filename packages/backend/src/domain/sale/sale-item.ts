import type { Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import type { Price } from "../product/price";
import type { ProductId } from "../product/product-id";

/**
 * SaleItem value object
 *
 * Represents a single item in a sale.
 *
 * Domain invariants:
 * - Must have productId, quantity, and unitPrice
 * - Quantity must be positive integer
 * - Total is calculated automatically (quantity * unitPrice)
 * - All fields are immutable
 */
export type SaleItem = {
	readonly productId: ProductId;
	readonly quantity: number;
	readonly unitPrice: Price;
	readonly total: number;
};

/**
 * Input for creating a SaleItem
 */
export type CreateSaleItemInput = {
	readonly productId: ProductId;
	readonly quantity: number;
	readonly unitPrice: Price;
};

/**
 * Create a SaleItem
 *
 * @param input - SaleItem data
 * @returns Result with SaleItem or error message
 */
export const createSaleItem = (
	input: CreateSaleItemInput,
): Result<SaleItem, string> => {
	// Validate quantity is positive
	if (input.quantity <= 0) {
		return ResultUtils.err("Quantity must be positive");
	}

	// Validate quantity is integer
	if (!Number.isInteger(input.quantity)) {
		return ResultUtils.err("Quantity must be an integer");
	}

	// Calculate total
	const total = Math.round(input.quantity * input.unitPrice * 100) / 100;

	// Create immutable sale item
	const saleItem: SaleItem = {
		productId: input.productId,
		quantity: input.quantity,
		unitPrice: input.unitPrice,
		total,
	};

	return ResultUtils.ok(saleItem);
};
