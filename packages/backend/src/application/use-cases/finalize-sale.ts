import type { Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import { createInventoryId } from "../../domain/inventory/inventory-id";
import { createInventoryMovement } from "../../domain/inventory/inventory-movement";
import {
	finalizeSale as finalizeSaleDomain,
	type Sale,
} from "../../domain/sale/sale";
import { createSaleId } from "../../domain/sale/sale-id";
import type { InventoryRepository } from "../ports/inventory-repository";
import type { RepositoryError, SaleRepository } from "../ports/sale-repository";

/**
 * FinalizeSale Use Case
 *
 * Finalizes a sale (changes status to COMPLETED).
 * Validates that the sale has items and is fully paid.
 */

export type FinalizeSaleInput = {
	readonly saleId: string;
};

export type FinalizeSaleUseCaseError =
	| { readonly type: "VALIDATION_ERROR"; readonly message: string }
	| {
			readonly type: "REPOSITORY_ERROR";
			readonly repositoryError: RepositoryError;
	  }
	| { readonly type: "SALE_NOT_FOUND"; readonly saleId: string };

export type FinalizeSaleUseCase = (
	input: FinalizeSaleInput,
) => Promise<Result<Sale, FinalizeSaleUseCaseError>>;

/**
 * Dependencies for FinalizeSale use case
 */
export type FinalizeSaleDeps = {
	readonly saleRepository: SaleRepository;
	readonly inventoryRepository: InventoryRepository;
};

export const createFinalizeSaleUseCase =
	(deps: FinalizeSaleDeps): FinalizeSaleUseCase =>
	async (
		input: FinalizeSaleInput,
	): Promise<Result<Sale, FinalizeSaleUseCaseError>> => {
		// Validate SaleId
		const saleIdResult = createSaleId(input.saleId);
		if (!saleIdResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `SaleId validation failed: ${saleIdResult.error}`,
			});
		}

		// Load existing sale
		const findResult = await deps.saleRepository.findById(saleIdResult.value);
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

		// Finalize sale (domain validation happens here)
		const finalizedSaleResult = finalizeSaleDomain(sale);
		if (!finalizedSaleResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `Failed to finalize sale: ${finalizedSaleResult.error}`,
			});
		}

		// Save finalized sale
		const saveResult = await deps.saleRepository.save(finalizedSaleResult.value);
		if (!saveResult.ok) {
			return ResultUtils.err({
				type: "REPOSITORY_ERROR",
				repositoryError: saveResult.error,
			});
		}

		// After finalizing sale, decrease stock for each item
		// Note: Stock exit failures are logged but don't block sale finalization
		for (const item of finalizedSaleResult.value.items) {
			const movementIdResult = createInventoryId(
				`sale-${finalizedSaleResult.value.id}-${item.productId}`,
			);
			const movementResult =
				movementIdResult.ok &&
				createInventoryMovement({
					id: movementIdResult.value,
					productId: item.productId,
					quantity: item.quantity,
					type: "saida",
					date: new Date(),
					description: `Venda #${finalizedSaleResult.value.id} finalizada`,
				});

			if (movementResult && movementResult.ok) {
				const exitResult =
					await deps.inventoryRepository.saveMovement(movementResult.value);

				if (!exitResult.ok) {
					// Log error but don't block sale completion
					console.error(
						`[FinalizeSale] Failed to decrease stock for product ${item.productId}:`,
						exitResult.error,
					);
				}
			}
		}

		return ResultUtils.ok(saveResult.value);
	};
