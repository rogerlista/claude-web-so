import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import { createProductId } from '../../domain/product/product-id'
import type { ProductRepository, RepositoryError } from '../ports/product-repository'

/**
 * Delete Product Use Case
 *
 * Business Rules:
 * - Product ID must be valid
 * - Returns success if deleted, error otherwise
 *
 * Functional Programming:
 * - Pure functions with immutable data
 * - Currying for dependency injection
 * - Railway-oriented programming with Result type
 */

export type DeleteProductInput = {
  readonly id: string
}

type DeleteProductDeps = {
  readonly repository: ProductRepository
}

/**
 * Creates a delete product function with injected dependencies
 *
 * @param deps - Dependencies (repository)
 * @returns A function that deletes a product by ID
 *
 * @example
 * ```typescript
 * const deleteProduct = createDeleteProduct({ repository })
 * const result = await deleteProduct({ id: 'prod-123' })
 *
 * if (result.ok) {
 *   console.log('Product deleted successfully')
 * } else {
 *   console.error(result.error) // Error message
 * }
 * ```
 */
export const createDeleteProduct =
  (deps: DeleteProductDeps) =>
  async (input: DeleteProductInput): Promise<Result<void, string>> => {
    // Validate and create ProductId
    const productIdResult = createProductId(input.id)

    if (!productIdResult.ok) {
      return ResultUtils.err(productIdResult.error)
    }

    // Delete product from repository
    const deleteResult = await deps.repository.delete(productIdResult.value)

    if (!deleteResult.ok) {
      return ResultUtils.err(formatRepositoryError(deleteResult.error))
    }

    return ResultUtils.ok(undefined)
  }

/**
 * Formats repository error to user-friendly message
 */
const formatRepositoryError = (error: RepositoryError): string => {
  switch (error.type) {
    case 'NOT_FOUND':
      return `Product with id ${error.id} not found`
    case 'DATABASE_ERROR':
      return `Database error: ${error.message}`
    case 'DUPLICATE':
      return `Duplicate product with id ${error.id}`
    case 'UNKNOWN':
      return `Unknown error: ${error.message}`
  }
}
