import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import type { GTIN } from '../../domain/product/gtin'
import { createGTIN } from '../../domain/product/gtin'
import { createPrice } from '../../domain/product/price'
import { createProduct } from '../../domain/product/product'
import type { Product } from '../../domain/product/product'
import { createProductId } from '../../domain/product/product-id'
import type { SKU } from '../../domain/product/sku'
import { createSKU } from '../../domain/product/sku'
import type { ProductRepository, RepositoryError } from '../ports/product-repository'

/**
 * CreateProduct Use Case
 *
 * Application layer use case for creating a new product.
 * Follows Clean Architecture and functional programming principles.
 *
 * Responsibilities:
 * - Validate raw input data
 * - Create domain value objects
 * - Create product entity
 * - Orchestrate repository save operation
 * - Handle errors gracefully
 */

/**
 * Input for creating a product (raw data from presentation layer)
 */
export type CreateProductInput = {
  readonly id: string
  readonly description: string
  readonly price: number
  readonly sku?: string
  readonly gtin?: string
}

/**
 * Use case error types
 */
export type CreateProductUseCaseError =
  | { readonly type: 'VALIDATION_ERROR'; readonly message: string }
  | { readonly type: 'REPOSITORY_ERROR'; readonly repositoryError: RepositoryError }

/**
 * CreateProduct use case function type
 */
export type CreateProductUseCase = (
  input: CreateProductInput
) => Promise<Result<Product, CreateProductUseCaseError>>

/**
 * Create the CreateProduct use case
 *
 * Factory function that creates a use case with injected dependencies.
 * This enables dependency injection and testability.
 *
 * @param repository - ProductRepository implementation
 * @returns Use case function
 */
export const createProductUseCase =
  (repository: ProductRepository): CreateProductUseCase =>
  async (input: CreateProductInput): Promise<Result<Product, CreateProductUseCaseError>> => {
    // Step 1: Validate and create ProductId
    const productIdResult = createProductId(input.id)
    if (!productIdResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `ProductId validation failed: ${productIdResult.error}`,
      })
    }

    // Step 2: Validate and create Price
    const priceResult = createPrice(input.price)
    if (!priceResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `Price validation failed: ${priceResult.error}`,
      })
    }

    // Step 3: Validate and create SKU (if provided)
    let sku: SKU | undefined
    if (input.sku !== undefined) {
      const skuResult = createSKU(input.sku)
      if (!skuResult.ok) {
        return ResultUtils.err({
          type: 'VALIDATION_ERROR',
          message: `SKU validation failed: ${skuResult.error}`,
        })
      }
      sku = skuResult.value
    }

    // Step 4: Validate and create GTIN (if provided)
    let gtin: GTIN | undefined
    if (input.gtin !== undefined) {
      const gtinResult = createGTIN(input.gtin)
      if (!gtinResult.ok) {
        return ResultUtils.err({
          type: 'VALIDATION_ERROR',
          message: `GTIN validation failed: ${gtinResult.error}`,
        })
      }
      gtin = gtinResult.value
    }

    // Step 5: Create Product entity
    const productResult = createProduct({
      id: productIdResult.value,
      description: input.description,
      price: priceResult.value,
      ...(sku !== undefined && { sku }),
      ...(gtin !== undefined && { gtin }),
    })

    if (!productResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `Product validation failed: ${productResult.error}`,
      })
    }

    // Step 6: Save product using repository
    const saveResult = await repository.save(productResult.value)

    if (!saveResult.ok) {
      return ResultUtils.err({
        type: 'REPOSITORY_ERROR',
        repositoryError: saveResult.error,
      })
    }

    // Step 7: Return saved product
    return ResultUtils.ok(saveResult.value)
  }
