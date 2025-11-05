import type { Brand, Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'

/**
 * Phone - Brazilian phone number branded type
 *
 * Domain Rules:
 * - Must be 10-13 digits
 * - 10 digits: (DDD) XXXX-XXXX (landline)
 * - 11 digits: (DDD) 9XXXX-XXXX (mobile)
 * - 12 digits: 0800 XXX XXXX (toll-free)
 * - 13 digits: +55 (DDD) 9XXXX-XXXX (with country code)
 * - Stored as digits only (no formatting)
 *
 * Formats accepted: (11) 98765-4321, 11987654321, +55 11 98765-4321
 */
export type Phone = Brand<string, 'Phone'>

/**
 * Create a Phone from a string
 *
 * @param value - The string value to convert to Phone (formatted or unformatted)
 * @returns Result with Phone or error message
 */
export const createPhone = (value: string): Result<Phone, string> => {
  // Trim and remove all non-digit characters
  const trimmed = value.trim()
  const digitsOnly = trimmed.replace(/\D/g, '')

  // Validate non-empty
  if (digitsOnly.length === 0) {
    return ResultUtils.err('Phone cannot be empty')
  }

  // Validate length (10-13 digits for Brazilian phones)
  const validLengths = [10, 11, 12, 13]
  if (!validLengths.includes(digitsOnly.length)) {
    return ResultUtils.err('Phone must have 10, 11, 12, or 13 digits (Brazilian format)')
  }

  return ResultUtils.ok(digitsOnly as Phone)
}
