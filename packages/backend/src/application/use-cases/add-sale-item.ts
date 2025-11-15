import type { Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import { createPrice } from "../../domain/product/price";
import { createProductId } from "../../domain/product/product-id";
import { addItemToSale, type Sale } from "../../domain/sale/sale";
import { createSaleId } from "../../domain/sale/sale-id";
import { createSaleItem } from "../../domain/sale/sale-item";
import type { InventoryRepository } from "../ports/inventory-repository";
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
	| { readonly type: "SALE_NOT_FOUND"; readonly saleId: string }
	| {
			readonly type: "INSUFFICIENT_STOCK";
			readonly available: number;
			readonly requested: number;
	  }
	| { readonly type: "NO_STOCK"; readonly productId: string };

/**
 * AddSaleItem use case function type
 */
export type AddSaleItemUseCase = (
	input: AddSaleItemInput,
) => Promise<Result<Sale, AddSaleItemUseCaseError>>;

/**
 * Dependencies for AddSaleItem use case
 */
export type AddSaleItemDeps = {
	readonly saleRepository: SaleRepository;
	readonly inventoryRepository: InventoryRepository;
};

/**
 * Create the AddSaleItem use case
 *
 * @param deps - Dependencies (repositories)
 * @returns Use case function
 */
export const createAddSaleItemUseCase =
	(deps: AddSaleItemDeps): AddSaleItemUseCase =>
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

		// Step 3: Validate ProductId
		const productIdResult = createProductId(input.productId);
		if (!productIdResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `ProductId validation failed: ${productIdResult.error}`,
			});
		}

		// Step 4: Check stock availability
		const stockResult = await deps.inventoryRepository.getStock(
			productIdResult.value,
		);

		if (!stockResult.ok) {
			// If stock not found, product has no inventory record
			if (stockResult.error.type === "NOT_FOUND") {
				return ResultUtils.err({
					type: "NO_STOCK",
					productId: input.productId,
				});
			}
			// Other repository errors - convert to validation error
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `Failed to check stock: ${stockResult.error.type === "UNKNOWN" ? stockResult.error.message : "Unknown error"}`,
			});
		}

		// Step 5: Validate sufficient stock
		const currentStock = stockResult.value.currentQuantity;
		const requestedQuantity = input.quantity;

		if (currentStock < requestedQuantity) {
			return ResultUtils.err({
				type: "INSUFFICIENT_STOCK",
				available: currentStock,
				requested: requestedQuantity,
			});
		}

		// Step 6: Validate Price (unitPrice)
		const priceResult = createPrice(input.unitPrice);
		if (!priceResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `Price validation failed: ${priceResult.error}`,
			});
		}

		// Step 7: Create SaleItem
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

		// Step 8: Add item to sale
		const updatedSaleResult = addItemToSale(sale, saleItemResult.value);
		if (!updatedSaleResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `Failed to add item to sale: ${updatedSaleResult.error}`,
			});
		}

		// Step 9: Save updated sale
		const saveResult = await deps.saleRepository.save(updatedSaleResult.value);
		if (!saveResult.ok) {
			return ResultUtils.err({
				type: "REPOSITORY_ERROR",
				repositoryError: saveResult.error,
			});
		}

		return ResultUtils.ok(saveResult.value);
	};
