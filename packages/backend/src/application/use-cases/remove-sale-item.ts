import type { Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import { createProductId } from "../../domain/product/product-id";
import { removeItemFromSale, type Sale } from "../../domain/sale/sale";
import { createSaleId } from "../../domain/sale/sale-id";
import type { RepositoryError, SaleRepository } from "../ports/sale-repository";

/**
 * RemoveSaleItem Use Case
 *
 * Removes an item from an existing sale.
 */

export type RemoveSaleItemInput = {
	readonly saleId: string;
	readonly productId: string;
};

export type RemoveSaleItemUseCaseError =
	| { readonly type: "VALIDATION_ERROR"; readonly message: string }
	| {
			readonly type: "REPOSITORY_ERROR";
			readonly repositoryError: RepositoryError;
	  }
	| { readonly type: "SALE_NOT_FOUND"; readonly saleId: string };

export type RemoveSaleItemUseCase = (
	input: RemoveSaleItemInput,
) => Promise<Result<Sale, RemoveSaleItemUseCaseError>>;

export const createRemoveSaleItemUseCase =
	(repository: SaleRepository): RemoveSaleItemUseCase =>
	async (
		input: RemoveSaleItemInput,
	): Promise<Result<Sale, RemoveSaleItemUseCaseError>> => {
		// Validate SaleId
		const saleIdResult = createSaleId(input.saleId);
		if (!saleIdResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `SaleId validation failed: ${saleIdResult.error}`,
			});
		}

		// Load existing sale
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

		// Validate ProductId
		const productIdResult = createProductId(input.productId);
		if (!productIdResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `ProductId validation failed: ${productIdResult.error}`,
			});
		}

		// Remove item from sale
		const updatedSaleResult = removeItemFromSale(sale, input.productId);
		if (!updatedSaleResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `Failed to remove item from sale: ${updatedSaleResult.error}`,
			});
		}

		// Save updated sale
		const saveResult = await repository.save(updatedSaleResult.value);
		if (!saveResult.ok) {
			return ResultUtils.err({
				type: "REPOSITORY_ERROR",
				repositoryError: saveResult.error,
			});
		}

		return ResultUtils.ok(saveResult.value);
	};
