import type { Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import { createGTIN } from "../../domain/product/gtin";
import { createPrice } from "../../domain/product/price";
import type { Product } from "../../domain/product/product";
import { createProduct } from "../../domain/product/product";
import { createProductId } from "../../domain/product/product-id";
import { createSKU } from "../../domain/product/sku";
import type {
	ProductRepository,
	RepositoryError,
} from "../ports/product-repository";

/**
 * Input for saving a product
 */
export type SaveProductInput = {
	readonly id: string;
	readonly description: string;
	readonly price: number;
	readonly sku?: string;
	readonly gtin?: string;
};

/**
 * Dependencies for save product use case
 */
type SaveProductDeps = {
	readonly repository: ProductRepository;
};

/**
 * Save Product Use Case (functional)
 *
 * Curried function for dependency injection
 * @param deps - Dependencies (repository)
 * @returns Function that accepts input and returns Result
 */
export const createSaveProduct =
	(deps: SaveProductDeps) =>
	async (input: SaveProductInput): Promise<Result<Product, string>> => {
		// Parse and validate product ID
		const productIdResult = createProductId(input.id);
		if (!productIdResult.ok) {
			return ResultUtils.err(productIdResult.error);
		}

		// Parse and validate price
		const priceResult = createPrice(input.price);
		if (!priceResult.ok) {
			return ResultUtils.err(priceResult.error);
		}

		// Parse SKU if provided
		const skuResult = input.sku ? createSKU(input.sku) : undefined;
		/* c8 ignore start */
		if (skuResult && !skuResult.ok) {
			return ResultUtils.err(skuResult.error);
		}
		/* c8 ignore stop */

		// Parse GTIN if provided
		const gtinResult = input.gtin ? createGTIN(input.gtin) : undefined;
		/* c8 ignore start */
		if (gtinResult && !gtinResult.ok) {
			return ResultUtils.err(gtinResult.error);
		}
		/* c8 ignore stop */

		// Validate SKU uniqueness if provided
		if (skuResult?.ok) {
			const existingBySKU = await deps.repository.findBySKU(skuResult.value);
			if (existingBySKU.ok && existingBySKU.value.length > 0) {
				// Check if any existing product has different ID (indicating duplicate)
				const hasDuplicate = existingBySKU.value.some(
					(p: Product) => p.id !== productIdResult.value,
				);
				if (hasDuplicate) {
					return ResultUtils.err(
						`SKU ${skuResult.value} already exists for another product`,
					);
				}
			}
		}

		// Validate GTIN uniqueness if provided
		if (gtinResult?.ok) {
			const existingByGTIN = await deps.repository.findByGTIN(gtinResult.value);
			if (
				existingByGTIN.ok &&
				existingByGTIN.value.id !== productIdResult.value
			) {
				// Product with this GTIN exists and has different ID (duplicate)
				return ResultUtils.err(
					`GTIN ${gtinResult.value} already exists for another product`,
				);
			}
		}

		// Create product domain entity
		const productResult = createProduct({
			id: productIdResult.value,
			description: input.description,
			price: priceResult.value,
			...(skuResult?.ok && { sku: skuResult.value }),
			...(gtinResult?.ok && { gtin: gtinResult.value }),
		});

		if (!productResult.ok) {
			return ResultUtils.err(productResult.error);
		}

		// Save to repository
		const saveResult = await deps.repository.save(productResult.value);

		if (!saveResult.ok) {
			return ResultUtils.err(formatRepositoryError(saveResult.error));
		}

		return ResultUtils.ok(saveResult.value);
	};

/**
 * Format repository error to string
 */
const formatRepositoryError = (error: RepositoryError): string => {
	switch (error.type) {
		/* c8 ignore start */
		case "NOT_FOUND":
			return `Product not found: ${error.id}`;
		/* c8 ignore stop */
		case "DUPLICATE":
			return `Product already exists: ${error.id}`;
		case "DATABASE_ERROR":
			return `Database error: ${error.message}`;
		/* c8 ignore next 2 */
		case "UNKNOWN":
			return `Unknown error: ${error.message}`;
	}
};
