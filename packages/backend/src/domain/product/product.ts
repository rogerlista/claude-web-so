import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import type { Price } from './price'
import type { ProductId } from './product-id'

/**
 * Product Entity
 *
 * Domain invariants:
 * - Must have id, description, and price
 * - Description must be non-empty
 * - All fields are immutable (readonly)
 */
export type Product = {
  readonly id: ProductId
  readonly description: string
  readonly price: Price
}

/**
 * Input for creating a Product
 */
export type CreateProductInput = {
  readonly id: ProductId
  readonly description: string
  readonly price: Price
}

/**
 * Create a Product entity
 *
 * @param input - Product data
 * @returns Result with Product or error message
 */
export const createProduct = (input: CreateProductInput): Result<Product, string> => {
  // Validate description
  const trimmedDescription = input.description.trim()

  if (trimmedDescription.length === 0) {
    return ResultUtils.err('Description cannot be empty')
  }

  // Create immutable product
  const product: Product = {
    id: input.id,
    description: trimmedDescription,
    price: input.price,
  }

  return ResultUtils.ok(product)
}
