import type { Result } from '@pos-nfce/shared'
import type { Product } from '../../domain/product/product'
import type { ProductId } from '../../domain/product/product-id'

/**
 * ProductRepository Port (Interface)
 *
 * Defines the contract for product persistence operations.
 * This is a port in the Hexagonal Architecture - adapters will implement this.
 *
 * Following functional programming principles:
 * - Pure interface definition (type, not class)
 * - All operations return Result<T, E> for error handling
 * - Immutable data structures
 */

/**
 * Error types for repository operations
 */
export type RepositoryError =
  | { readonly type: 'NOT_FOUND'; readonly id: string }
  | { readonly type: 'DUPLICATE'; readonly id: string }
  | { readonly type: 'DATABASE_ERROR'; readonly message: string }
  | { readonly type: 'UNKNOWN'; readonly message: string }

/**
 * ProductRepository interface
 *
 * All methods return Result for railway-oriented programming
 */
export type ProductRepository = {
  /**
   * Save a product (create or update)
   *
   * @param product - Product to save
   * @returns Result with saved Product or RepositoryError
   */
  readonly save: (product: Product) => Promise<Result<Product, RepositoryError>>

  /**
   * Find a product by ID
   *
   * @param id - Product ID to search for
   * @returns Result with Product or NOT_FOUND error
   */
  readonly findById: (id: ProductId) => Promise<Result<Product, RepositoryError>>

  /**
   * Find all products
   *
   * @returns Result with array of Products or RepositoryError
   */
  readonly findAll: () => Promise<Result<readonly Product[], RepositoryError>>

  /**
   * Delete a product by ID
   *
   * @param id - Product ID to delete
   * @returns Result with void or RepositoryError
   */
  readonly delete: (id: ProductId) => Promise<Result<void, RepositoryError>>

  /**
   * Find products by SKU
   *
   * @param sku - SKU to search for
   * @returns Result with array of Products or RepositoryError
   */
  readonly findBySKU: (sku: string) => Promise<Result<readonly Product[], RepositoryError>>

  /**
   * Find product by GTIN
   *
   * @param gtin - GTIN to search for
   * @returns Result with Product or NOT_FOUND error
   */
  readonly findByGTIN: (gtin: string) => Promise<Result<Product, RepositoryError>>
}
