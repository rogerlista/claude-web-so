import type { Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import { removePaymentFromSale, type Sale } from "../../domain/sale/sale";
import { createSaleId } from "../../domain/sale/sale-id";
import type { RepositoryError, SaleRepository } from "../ports/sale-repository";

/**
 * RemoveSalePayment Use Case
 *
 * Removes a payment from an existing sale by index.
 * Task 2.1: Create use case remove-sale-payment
 */

export type RemoveSalePaymentInput = {
	readonly saleId: string;
	readonly paymentIndex: number;
};

export type RemoveSalePaymentUseCaseError =
	| { readonly type: "VALIDATION_ERROR"; readonly message: string }
	| {
			readonly type: "REPOSITORY_ERROR";
			readonly repositoryError: RepositoryError;
	  }
	| { readonly type: "SALE_NOT_FOUND"; readonly saleId: string };

export type RemoveSalePaymentUseCase = (
	input: RemoveSalePaymentInput,
) => Promise<Result<Sale, RemoveSalePaymentUseCaseError>>;

export const createRemoveSalePaymentUseCase =
	(repository: SaleRepository): RemoveSalePaymentUseCase =>
	async (
		input: RemoveSalePaymentInput,
	): Promise<Result<Sale, RemoveSalePaymentUseCaseError>> => {
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

		// Remove payment from sale (domain function validates index)
		const updatedSaleResult = removePaymentFromSale(sale, input.paymentIndex);
		if (!updatedSaleResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `Failed to remove payment from sale: ${updatedSaleResult.error}`,
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
