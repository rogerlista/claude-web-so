import type { Result } from "@pos-nfce/shared";
import type { Customer } from "../../domain/customer/customer";
import type { CustomerId } from "../../domain/customer/customer-id";

/**
 * CustomerRepository Port (Interface)
 *
 * Defines the contract for customer persistence operations.
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
	| { readonly type: "NOT_FOUND"; readonly id: string }
	| { readonly type: "DUPLICATE"; readonly id: string }
	| { readonly type: "DATABASE_ERROR"; readonly message: string }
	| { readonly type: "UNKNOWN"; readonly message: string };

/**
 * CustomerRepository interface
 *
 * All methods return Result for railway-oriented programming
 */
export type CustomerRepository = {
	/**
	 * Save a customer (create or update)
	 *
	 * @param customer - Customer to save
	 * @returns Result with saved Customer or RepositoryError
	 */
	readonly save: (
		customer: Customer,
	) => Promise<Result<Customer, RepositoryError>>;

	/**
	 * Find a customer by ID
	 *
	 * @param id - Customer ID to search for
	 * @returns Result with Customer or NOT_FOUND error
	 */
	readonly findById: (
		id: CustomerId,
	) => Promise<Result<Customer, RepositoryError>>;

	/**
	 * Find all customers
	 *
	 * @returns Result with array of Customers or RepositoryError
	 */
	readonly findAll: () => Promise<Result<readonly Customer[], RepositoryError>>;

	/**
	 * Delete a customer by ID
	 *
	 * @param id - Customer ID to delete
	 * @returns Result with void or RepositoryError
	 */
	readonly delete: (id: CustomerId) => Promise<Result<void, RepositoryError>>;

	/**
	 * Find customer by CPF
	 *
	 * @param cpf - CPF to search for
	 * @returns Result with Customer or NOT_FOUND error
	 */
	readonly findByCPF: (
		cpf: string,
	) => Promise<Result<Customer, RepositoryError>>;

	/**
	 * Find customer by email
	 *
	 * @param email - Email to search for
	 * @returns Result with Customer or NOT_FOUND error
	 */
	readonly findByEmail: (
		email: string,
	) => Promise<Result<Customer, RepositoryError>>;
};
