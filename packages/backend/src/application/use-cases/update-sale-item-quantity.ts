import type { Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import { type Sale, updateItemQuantity } from "../../domain/sale/sale";
import { createSaleId } from "../../domain/sale/sale-id";
import type { RepositoryError, SaleRepository } from "../ports/sale-repository";

/**
 * UpdateSaleItemQuantity Use Case
 *
 * Updates the quantity of an item in an existing sale.
 */

export type UpdateSaleItemQuantityInput = {
	readonly saleId: string;
	readonly productId: string;
	readonly quantity: number;
};

export type UpdateSaleItemQuantityUseCaseError =
	| { readonly type: "VALIDATION_ERROR"; readonly message: string }
	| {
			readonly type: "REPOSITORY_ERROR";
			readonly repositoryError: RepositoryError;
	  }
	| { readonly type: "SALE_NOT_FOUND"; readonly saleId: string };

export type UpdateSaleItemQuantityUseCase = (
	input: UpdateSaleItemQuantityInput,
) => Promise<Result<Sale, UpdateSaleItemQuantityUseCaseError>>;

export const createUpdateSaleItemQuantityUseCase =
	(repository: SaleRepository): UpdateSaleItemQuantityUseCase =>
	async (
		input: UpdateSaleItemQuantityInput,
	): Promise<Result<Sale, UpdateSaleItemQuantityUseCaseError>> => {
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

		// Update item quantity
		const updatedSaleResult = updateItemQuantity(
			sale,
			input.productId,
			input.quantity,
		);
		if (!updatedSaleResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `Failed to update item quantity: ${updatedSaleResult.error}`,
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
