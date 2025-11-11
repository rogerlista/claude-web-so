import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import type { Product } from '../../domain/product/product'
import { createProductId } from '../../domain/product/product-id'
import type { ProductRepository, RepositoryError } from '../ports/product-repository'

/**
 * Find Product By ID Use Case
 *
 * Business Rules:
 * - Product ID must be valid
 * - Returns product if found, error otherwise
 *
 * Functional Programming:
 * - Pure functions with immutable data
 * - Currying for dependency injection
 * - Railway-oriented programming with Result type
 */

export type FindProductByIdInput = {
  readonly id: string
}

type FindProductByIdDeps = {
  readonly repository: ProductRepository
}

/**
 * Creates a find product by ID function with injected dependencies
 *
 * @param deps - Dependencies (repository)
 * @returns A function that finds a product by ID
 *
 * @example
 * ```typescript
 * const findProductById = createFindProductById({ repository })
 * const result = await findProductById({ id: 'prod-123' })
 *
 * if (result.ok) {
 *   console.log(result.value) // Product
 * } else {
 *   console.error(result.error) // Error message
 * }
 * ```
 */
export const createFindProductById =
  (deps: FindProductByIdDeps) =>
  async (input: FindProductByIdInput): Promise<Result<Product, string>> => {
    // Validate and create ProductId
    const productIdResult = createProductId(input.id)

    if (!productIdResult.ok) {
      return ResultUtils.err(productIdResult.error)
    }

    // Find product in repository
    const findResult = await deps.repository.findById(productIdResult.value)

    if (!findResult.ok) {
      return ResultUtils.err(formatRepositoryError(findResult.error))
    }

    return ResultUtils.ok(findResult.value)
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
    case 'DUPLICATE' /* c8 ignore start */:
      return `Duplicate product with id ${error.id}`
    case 'UNKNOWN':
      return `Unknown error: ${error.message}` /* c8 ignore stop */
  }
}
