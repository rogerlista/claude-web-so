import type { Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import { applyDiscount, type Sale } from "../../domain/sale/sale";
import { createSaleId } from "../../domain/sale/sale-id";
import type { RepositoryError, SaleRepository } from "../ports/sale-repository";

/**
 * ApplySaleDiscount Use Case
 *
 * Applies a discount to an existing sale.
 */

export type ApplySaleDiscountInput = {
	readonly saleId: string;
	readonly discount: number;
};

export type ApplySaleDiscountUseCaseError =
	| { readonly type: "VALIDATION_ERROR"; readonly message: string }
	| {
			readonly type: "REPOSITORY_ERROR";
			readonly repositoryError: RepositoryError;
	  }
	| { readonly type: "SALE_NOT_FOUND"; readonly saleId: string };

export type ApplySaleDiscountUseCase = (
	input: ApplySaleDiscountInput,
) => Promise<Result<Sale, ApplySaleDiscountUseCaseError>>;

export const createApplySaleDiscountUseCase =
	(repository: SaleRepository): ApplySaleDiscountUseCase =>
	async (
		input: ApplySaleDiscountInput,
	): Promise<Result<Sale, ApplySaleDiscountUseCaseError>> => {
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

		// Apply discount
		const updatedSaleResult = applyDiscount(sale, input.discount);
		if (!updatedSaleResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `Failed to apply discount: ${updatedSaleResult.error}`,
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
