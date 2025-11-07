import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import type { Product } from '../../domain/product/product'
import type { ProductRepository, RepositoryError } from '../ports/product-repository'

/**
 * Find All Products Use Case
 *
 * Business Rules:
 * - Returns paginated list of products
 * - Default page: 1
 * - Default page size: 10
 * - Maximum page size: 100
 * - Page must be > 0
 * - Page size must be between 1 and 100
 *
 * Functional Programming:
 * - Pure functions with immutable data
 * - Currying for dependency injection
 * - Railway-oriented programming with Result type
 */

export type FindAllProductsInput = {
  readonly page?: number
  readonly pageSize?: number
}

export type PaginatedProducts = {
  readonly data: readonly Product[]
  readonly total: number
  readonly page: number
  readonly pageSize: number
  readonly totalPages: number
}

type FindAllProductsDeps = {
  readonly repository: ProductRepository
}

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 100

/**
 * Creates a find all products function with injected dependencies
 *
 * @param deps - Dependencies (repository)
 * @returns A function that finds all products with pagination
 *
 * @example
 * ```typescript
 * const findAllProducts = createFindAllProducts({ repository })
 *
 * // Get first page with default size (10)
 * const result1 = await findAllProducts({})
 *
 * // Get second page with 20 items
 * const result2 = await findAllProducts({ page: 2, pageSize: 20 })
 *
 * if (result1.ok) {
 *   console.log(result1.value.data) // Product[]
 *   console.log(result1.value.total) // Total count
 *   console.log(result1.value.totalPages) // Total pages
 * }
 * ```
 */
export const createFindAllProducts =
  (deps: FindAllProductsDeps) =>
  async (input: FindAllProductsInput): Promise<Result<PaginatedProducts, string>> => {
    // Validate and normalize pagination parameters
    const page = input.page ?? DEFAULT_PAGE
    const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE

    // Validation
    if (page <= 0) {
      return ResultUtils.err('Page must be greater than 0')
    }

    if (pageSize <= 0 || pageSize > MAX_PAGE_SIZE) {
      return ResultUtils.err(`Page size must be between 1 and ${MAX_PAGE_SIZE}`)
    }

    // Find all products
    const findResult = await deps.repository.findAll()

    if (!findResult.ok) {
      return ResultUtils.err(formatRepositoryError(findResult.error))
    }

    const allProducts = findResult.value

    // Calculate pagination
    const total = allProducts.length
    const totalPages = Math.ceil(total / pageSize)

    // Apply pagination
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = allProducts.slice(startIndex, endIndex)

    return ResultUtils.ok({
      data: paginatedData,
      total,
      page,
      pageSize: paginatedData.length,
      totalPages: total === 0 ? 0 : totalPages,
    })
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
