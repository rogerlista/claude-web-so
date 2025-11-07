import type { Brand, Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'

/**
 * NCM (Nomenclatura Comum do Mercosul) Value Object
 *
 * Domain Rules:
 * - Must be exactly 8 digits
 * - Must contain only numeric characters
 * - Cannot be empty
 * - Whitespace is trimmed
 *
 * Example: 12345678
 *
 * Branded type to prevent accidental string assignment
 */

export type NCM = Brand<string, 'NCM'>

/**
 * Creates a validated NCM value object
 *
 * @param value - The NCM string to validate
 * @returns Result with NCM or error message
 *
 * @example
 * ```typescript
 * const ncm = createNCM('12345678')
 * if (ncm.ok) {
 *   console.log(ncm.value) // '12345678' as NCM
 * }
 * ```
 */
export const createNCM = (value: string): Result<NCM, string> => {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    return ResultUtils.err('NCM cannot be empty')
  }

  // Check if contains only digits
  if (!/^\d+$/.test(trimmed)) {
    return ResultUtils.err('NCM must contain only digits')
  }

  // Check if has exactly 8 digits
  if (trimmed.length !== 8) {
    return ResultUtils.err('NCM must have exactly 8 digits')
  }

  return ResultUtils.ok(trimmed as NCM)
}
