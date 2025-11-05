import type { Brand, Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'

/**
 * ProductId - Branded type for Product identifiers
 *
 * Domain Rule: ProductId must be a non-empty string
 * Prevents mixing product IDs with other string identifiers
 */
export type ProductId = Brand<string, 'ProductId'>

/**
 * Create a ProductId from a string
 *
 * @param value - The string value to convert to ProductId
 * @returns Result with ProductId or error message
 */
export const createProductId = (value: string): Result<ProductId, string> => {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return ResultUtils.err('ProductId cannot be empty')
  }

  return ResultUtils.ok(trimmed as ProductId)
}
