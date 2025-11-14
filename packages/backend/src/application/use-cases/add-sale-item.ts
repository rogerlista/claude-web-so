import type { Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import { createPrice } from "../../domain/product/price";
import { createProductId } from "../../domain/product/product-id";
import { addItemToSale, type Sale } from "../../domain/sale/sale";
import { createSaleId } from "../../domain/sale/sale-id";
import { createSaleItem } from "../../domain/sale/sale-item";
import type { RepositoryError, SaleRepository } from "../ports/sale-repository";

/**
 * AddSaleItem Use Case
 *
 * Adds an item to an existing sale.
 *
 * Responsibilities:
 * - Load existing sale
 * - Validate product and quantity
 * - Add item to sale
 * - Save updated sale
 */

/**
 * Input for adding an item to a sale
 */
export type AddSaleItemInput = {
	readonly saleId: string;
	readonly productId: string;
	readonly quantity: number;
	readonly unitPrice: number;
};

/**
 * Use case error types
 */
export type AddSaleItemUseCaseError =
	| { readonly type: "VALIDATION_ERROR"; readonly message: string }
	| {
			readonly type: "REPOSITORY_ERROR";
			readonly repositoryError: RepositoryError;
	  }
	| { readonly type: "SALE_NOT_FOUND"; readonly saleId: string };

/**
 * AddSaleItem use case function type
 */
export type AddSaleItemUseCase = (
	input: AddSaleItemInput,
) => Promise<Result<Sale, AddSaleItemUseCaseError>>;

/**
 * Create the AddSaleItem use case
 *
 * @param repository - SaleRepository implementation
 * @returns Use case function
 */
export const createAddSaleItemUseCase =
	(repository: SaleRepository): AddSaleItemUseCase =>
	async (
		input: AddSaleItemInput,
	): Promise<Result<Sale, AddSaleItemUseCaseError>> => {
		// Step 1: Validate and create SaleId
		const saleIdResult = createSaleId(input.saleId);
		if (!saleIdResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `SaleId validation failed: ${saleIdResult.error}`,
			});
		}

		// Step 2: Load existing sale
		const findResult = await repository.findById(saleIdResult.value);
		if (!findResult.ok) {
			if (findResult.error.type === "NOT_FOUND") {
				return ResultUtils.err({
					type: "SALE_NOT_FOUND",
					saleId: input.saleId,
				});
			}
			return ResultUtils.err({
				type: "REPOSITORY_ERROR",
				repositoryError: findResult.error,
			});
		}

		const sale = findResult.value;

		// Step 3: Validate ProductId
		const productIdResult = createProductId(input.productId);
		if (!productIdResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `ProductId validation failed: ${productIdResult.error}`,
			});
		}

		// Step 4: Validate Price (unitPrice)
		const priceResult = createPrice(input.unitPrice);
		if (!priceResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `Price validation failed: ${priceResult.error}`,
			});
		}

		// Step 5: Create SaleItem
		const saleItemResult = createSaleItem({
			productId: productIdResult.value,
			quantity: input.quantity,
			unitPrice: priceResult.value,
		});

		if (!saleItemResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `SaleItem validation failed: ${saleItemResult.error}`,
			});
		}

		// Step 6: Add item to sale
		const updatedSaleResult = addItemToSale(sale, saleItemResult.value);
		if (!updatedSaleResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `Failed to add item to sale: ${updatedSaleResult.error}`,
			});
		}

		// Step 7: Save updated sale
		const saveResult = await repository.save(updatedSaleResult.value);
		if (!saveResult.ok) {
			return ResultUtils.err({
				type: "REPOSITORY_ERROR",
				repositoryError: saveResult.error,
			});
		}

		return ResultUtils.ok(saveResult.value);
	};
