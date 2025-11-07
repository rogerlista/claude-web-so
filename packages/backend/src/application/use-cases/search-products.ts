import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import type { Product } from '../../domain/product/product'
import type { ProductRepository, RepositoryError } from '../ports/product-repository'

/**
 * SearchProducts Use Case
 *
 * Business Rules:
 * - Query must not be empty
 * - Search is case-insensitive
 * - Search matches partial strings in description, SKU, or GTIN
 * - Returns all matching products
 *
 * Following Clean Architecture:
 * - Use case orchestrates domain logic
 * - Depends on repository port (not implementation)
 * - Returns Result type for error handling
 */

/**
 * Dependencies for the SearchProducts use case
 */
export type SearchProductsDeps = {
  readonly repository: ProductRepository
}

/**
 * Input for searching products
 */
export type SearchProductsInput = {
  readonly query: string
}

/**
 * Search products by query string
 *
 * @param deps - Dependencies (repository)
 * @returns Function that searches products by query
 */
export const createSearchProducts =
  (deps: SearchProductsDeps) =>
  async (input: SearchProductsInput): Promise<Result<readonly Product[], string>> => {
    // Validate query
    const trimmedQuery = input.query.trim()

    if (trimmedQuery.length === 0) {
      return ResultUtils.err('Query cannot be empty')
    }

    // Search products using repository
    const searchResult = await deps.repository.search(trimmedQuery)

    // Map repository errors to user-friendly messages
    if (!searchResult.ok) {
      return ResultUtils.err(mapRepositoryError(searchResult.error))
    }

    return ResultUtils.ok(searchResult.value)
  }

/**
 * Map repository errors to user-friendly error messages
 */
const mapRepositoryError = (error: RepositoryError): string => {
  switch (error.type) {
    case 'DATABASE_ERROR':
      return error.message
    case 'UNKNOWN':
      return error.message
    default:
      return 'An unexpected error occurred'
  }
}
