import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'
import type { GTIN } from './gtin'
import type { Price } from './price'
import type { ProductId } from './product-id'
import type { SKU } from './sku'

/**
 * Product Entity
 *
 * Domain invariants:
 * - Must have id, description, and price
 * - Description must be non-empty
 * - SKU and GTIN are optional identifiers
 * - All fields are immutable (readonly)
 */
export type Product = {
  readonly id: ProductId
  readonly description: string
  readonly price: Price
  readonly sku?: SKU
  readonly gtin?: GTIN
}

/**
 * Input for creating a Product
 */
export type CreateProductInput = {
  readonly id: ProductId
  readonly description: string
  readonly price: Price
  readonly sku?: SKU
  readonly gtin?: GTIN
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
    ...(input.sku !== undefined && { sku: input.sku }),
    ...(input.gtin !== undefined && { gtin: input.gtin }),
  }

  return ResultUtils.ok(product)
}
