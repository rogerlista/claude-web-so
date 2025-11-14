import type { Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import { applyAddition, type Sale } from "../../domain/sale/sale";
import { createSaleId } from "../../domain/sale/sale-id";
import type { RepositoryError, SaleRepository } from "../ports/sale-repository";

/**
 * ApplySaleSurcharge Use Case
 *
 * Applies a surcharge (addition) to an existing sale.
 */

export type ApplySaleSurchargeInput = {
	readonly saleId: string;
	readonly surcharge: number;
};

export type ApplySaleSurchargeUseCaseError =
	| { readonly type: "VALIDATION_ERROR"; readonly message: string }
	| {
			readonly type: "REPOSITORY_ERROR";
			readonly repositoryError: RepositoryError;
	  }
	| { readonly type: "SALE_NOT_FOUND"; readonly saleId: string };

export type ApplySaleSurchargeUseCase = (
	input: ApplySaleSurchargeInput,
) => Promise<Result<Sale, ApplySaleSurchargeUseCaseError>>;

export const createApplySaleSurchargeUseCase =
	(repository: SaleRepository): ApplySaleSurchargeUseCase =>
	async (
		input: ApplySaleSurchargeInput,
	): Promise<Result<Sale, ApplySaleSurchargeUseCaseError>> => {
		// Validate surcharge is not negative
		if (input.surcharge < 0) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: "Surcharge cannot be negative",
			});
		}

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

		// Apply surcharge (addition)
		const updatedSaleResult = applyAddition(sale, input.surcharge);
		if (!updatedSaleResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `Failed to apply surcharge: ${updatedSaleResult.error}`,
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
