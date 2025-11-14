import type { Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import { createProductId } from "../../domain/product/product-id";
import type {
	InventoryRepository,
	RepositoryError,
	StockInfo,
} from "../ports/inventory-repository";

/**
 * Input for getting stock
 */
export type GetStockInput = {
	readonly productId: string;
};

/**
 * Use case error types
 */
export type GetStockError =
	| { readonly type: "VALIDATION_ERROR"; readonly message: string }
	| {
			readonly type: "REPOSITORY_ERROR";
			readonly repositoryError: RepositoryError;
	  };

/**
 * GetStock use case function type
 */
export type GetStockUseCase = (
	input: GetStockInput,
) => Promise<Result<StockInfo, GetStockError>>;

/**
 * Create the GetStock use case
 *
 * @param repository - InventoryRepository implementation
 * @returns Use case function
 */
export const getStockUseCase =
	(repository: InventoryRepository): GetStockUseCase =>
	async (input: GetStockInput): Promise<Result<StockInfo, GetStockError>> => {
		// Validate and create ProductId
		const productIdResult = createProductId(input.productId);
		if (!productIdResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `ProductId validation failed: ${productIdResult.error}`,
			});
		}

		// Get stock from repository
		const stockResult = await repository.getStock(productIdResult.value);

		if (!stockResult.ok) {
			return ResultUtils.err({
				type: "REPOSITORY_ERROR",
				repositoryError: stockResult.error,
			});
		}

		return ResultUtils.ok(stockResult.value);
	};
