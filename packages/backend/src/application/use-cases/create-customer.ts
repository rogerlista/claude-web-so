import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import { createCPF } from '../../domain/customer/cpf'
import { createCustomer } from '../../domain/customer/customer'
import { createCustomerId } from '../../domain/customer/customer-id'
import { createEmail } from '../../domain/customer/email'
import { createPhone } from '../../domain/customer/phone'
import type { Customer } from '../../domain/customer/customer'
import type { CustomerRepository, RepositoryError } from '../ports/customer-repository'

/**
 * CreateCustomer Use Case
 *
 * Application layer use case for creating a new customer.
 * Follows Clean Architecture and functional programming principles.
 *
 * Responsibilities:
 * - Validate raw input data
 * - Create domain value objects
 * - Create customer entity
 * - Orchestrate repository save operation
 * - Handle errors gracefully
 */

/**
 * Input for creating a customer (raw data from presentation layer)
 */
export type CreateCustomerInput = {
  readonly id: string
  readonly name: string
  readonly cpf: string
  readonly email?: string
  readonly phone?: string
}

/**
 * Use case error types
 */
export type CreateCustomerUseCaseError =
  | { readonly type: 'VALIDATION_ERROR'; readonly message: string }
  | { readonly type: 'REPOSITORY_ERROR'; readonly repositoryError: RepositoryError }

/**
 * CreateCustomer use case function type
 */
export type CreateCustomerUseCase = (
  input: CreateCustomerInput,
) => Promise<Result<Customer, CreateCustomerUseCaseError>>

/**
 * Create the CreateCustomer use case
 *
 * Factory function that creates a use case with injected dependencies.
 * This enables dependency injection and testability.
 *
 * @param repository - CustomerRepository implementation
 * @returns Use case function
 */
export const createCustomerUseCase =
  (repository: CustomerRepository): CreateCustomerUseCase =>
  async (input: CreateCustomerInput): Promise<Result<Customer, CreateCustomerUseCaseError>> => {
    // Step 1: Validate and create CustomerId
    const customerIdResult = createCustomerId(input.id)
    if (!customerIdResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `CustomerId validation failed: ${customerIdResult.error}`,
      })
    }

    // Step 2: Validate and create CPF
    const cpfResult = createCPF(input.cpf)
    if (!cpfResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `CPF validation failed: ${cpfResult.error}`,
      })
    }

    // Step 3: Validate and create Email (if provided)
    let email
    if (input.email !== undefined) {
      const emailResult = createEmail(input.email)
      if (!emailResult.ok) {
        return ResultUtils.err({
          type: 'VALIDATION_ERROR',
          message: `Email validation failed: ${emailResult.error}`,
        })
      }
      email = emailResult.value
    }

    // Step 4: Validate and create Phone (if provided)
    let phone
    if (input.phone !== undefined) {
      const phoneResult = createPhone(input.phone)
      if (!phoneResult.ok) {
        return ResultUtils.err({
          type: 'VALIDATION_ERROR',
          message: `Phone validation failed: ${phoneResult.error}`,
        })
      }
      phone = phoneResult.value
    }

    // Step 5: Create Customer entity
    const customerResult = createCustomer({
      id: customerIdResult.value,
      name: input.name,
      cpf: cpfResult.value,
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
    })

    if (!customerResult.ok) {
      return ResultUtils.err({
        type: 'VALIDATION_ERROR',
        message: `Customer validation failed: ${customerResult.error}`,
      })
    }

    // Step 6: Save customer using repository
    const saveResult = await repository.save(customerResult.value)

    if (!saveResult.ok) {
      return ResultUtils.err({
        type: 'REPOSITORY_ERROR',
        repositoryError: saveResult.error,
      })
    }

    // Step 7: Return saved customer
    return ResultUtils.ok(saveResult.value)
  }
