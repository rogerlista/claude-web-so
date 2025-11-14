import type { Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import { createInventoryId } from "../../domain/inventory/inventory-id";
import type { InventoryMovement } from "../../domain/inventory/inventory-movement";
import { createInventoryMovement } from "../../domain/inventory/inventory-movement";
import type { InventoryMovementType } from "../../domain/inventory/inventory-movement-type";
import { createQuantity } from "../../domain/inventory/quantity";
import { createProductId } from "../../domain/product/product-id";
import type {
	InventoryRepository,
	RepositoryError,
} from "../ports/inventory-repository";

/**
 * Input for registering a stock movement (raw data from presentation layer)
 */
export type RegisterStockMovementInput = {
	readonly id: string;
	readonly productId: string;
	readonly quantity: number;
	readonly type: InventoryMovementType;
	readonly date: Date;
	readonly description?: string;
};

/**
 * Use case error types
 */
export type RegisterStockMovementError =
	| { readonly type: "VALIDATION_ERROR"; readonly message: string }
	| {
			readonly type: "REPOSITORY_ERROR";
			readonly repositoryError: RepositoryError;
	  };

/**
 * RegisterStockMovement use case function type
 */
export type RegisterStockMovementUseCase = (
	input: RegisterStockMovementInput,
) => Promise<Result<InventoryMovement, RegisterStockMovementError>>;

/**
 * Create the RegisterStockMovement use case
 *
 * @param repository - InventoryRepository implementation
 * @returns Use case function
 */
export const registerStockMovementUseCase =
	(repository: InventoryRepository): RegisterStockMovementUseCase =>
	async (
		input: RegisterStockMovementInput,
	): Promise<Result<InventoryMovement, RegisterStockMovementError>> => {
		// Step 1: Validate and create InventoryId
		const inventoryIdResult = createInventoryId(input.id);
		if (!inventoryIdResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `InventoryId validation failed: ${inventoryIdResult.error}`,
			});
		}

		// Step 2: Validate and create ProductId
		const productIdResult = createProductId(input.productId);
		if (!productIdResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `ProductId validation failed: ${productIdResult.error}`,
			});
		}

		// Step 3: Validate and create Quantity
		const quantityResult = createQuantity(input.quantity);
		if (!quantityResult.ok) {
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `Quantity validation failed: ${quantityResult.error}`,
			});
		}

		// Step 4: Create InventoryMovement entity
		const movementResult = createInventoryMovement({
			id: inventoryIdResult.value,
			productId: productIdResult.value,
			quantity: quantityResult.value,
			type: input.type,
			date: input.date,
			...(input.description && { description: input.description }),
		});

		if (!movementResult.ok) {
			/* c8 ignore start */
			return ResultUtils.err({
				type: "VALIDATION_ERROR",
				message: `InventoryMovement creation failed: ${movementResult.error}`,
			});
		} /* c8 ignore stop */

		// Step 5: Save movement using repository
		const saveResult = await repository.saveMovement(movementResult.value);

		if (!saveResult.ok) {
			return ResultUtils.err({
				type: "REPOSITORY_ERROR",
				repositoryError: saveResult.error,
			});
		}

		return ResultUtils.ok(saveResult.value);
	};
