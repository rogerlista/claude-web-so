import type { Result } from '@pos-nfce/shared'
import type { CustomerId } from '../../domain/customer/customer-id'
import type { Sale } from '../../domain/sale/sale'
import type { SaleId } from '../../domain/sale/sale-id'
import type { SaleStatus } from '../../domain/sale/sale-status'

/**
 * SaleRepository Port (Interface)
 *
 * Defines the contract for sale persistence operations.
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
 * SaleRepository interface
 *
 * All methods return Result for railway-oriented programming
 */
export type SaleRepository = {
  /**
   * Save a sale (create or update)
   *
   * @param sale - Sale to save
   * @returns Result with saved Sale or RepositoryError
   */
  readonly save: (sale: Sale) => Promise<Result<Sale, RepositoryError>>

  /**
   * Find a sale by ID
   *
   * @param id - Sale ID to search for
   * @returns Result with Sale or NOT_FOUND error
   */
  readonly findById: (id: SaleId) => Promise<Result<Sale, RepositoryError>>

  /**
   * Find all sales
   *
   * @returns Result with array of Sales or RepositoryError
   */
  readonly findAll: () => Promise<Result<readonly Sale[], RepositoryError>>

  /**
   * Delete a sale by ID
   *
   * @param id - Sale ID to delete
   * @returns Result with void or RepositoryError
   */
  readonly delete: (id: SaleId) => Promise<Result<void, RepositoryError>>

  /**
   * Find sales by customer ID
   *
   * @param customerId - Customer ID to search for
   * @returns Result with array of Sales or RepositoryError
   */
  readonly findByCustomerId: (
    customerId: CustomerId
  ) => Promise<Result<readonly Sale[], RepositoryError>>

  /**
   * Find sales by status
   *
   * @param status - Sale status to search for
   * @returns Result with array of Sales or RepositoryError
   */
  readonly findByStatus: (status: SaleStatus) => Promise<Result<readonly Sale[], RepositoryError>>
}
