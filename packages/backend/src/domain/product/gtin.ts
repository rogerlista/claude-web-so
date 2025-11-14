import type { Brand, Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'

/**
 * GTIN - Global Trade Item Number (Barcode) branded type
 *
 * Domain Rules:
 * - Must be 8, 12, 13, or 14 digits
 * - Numeric only
 * - Must pass GS1 check digit validation
 * - Leading zeros preserved
 *
 * Supports:
 * - GTIN-8 (8 digits)
 * - GTIN-12 (UPC - 12 digits)
 * - GTIN-13 (EAN - 13 digits)
 * - GTIN-14 (14 digits)
 */
export type GTIN = Brand<string, 'GTIN'>

/**
 * Calculate GS1 check digit for GTIN
 * Uses the standard GS1 algorithm
 *
 * @param digits - Array of digits (without check digit)
 * @returns Check digit (0-9)
 */
const calculateCheckDigit = (digits: number[]): number => {
  let sum = 0

  // Start from the right, alternating multipliers 3 and 1
  for (let i = digits.length - 1; i >= 0; i--) {
    const digit = digits[i]
    /* c8 ignore next 3 */
    if (digit === undefined) {
      throw new Error('Unexpected undefined digit in GTIN calculation')
    }
    const position = digits.length - 1 - i
    const multiplier = position % 2 === 0 ? 3 : 1
    sum += digit * multiplier
  }

  const remainder = sum % 10
  return remainder === 0 ? 0 : 10 - remainder
}

/**
 * Validate GTIN check digit
 *
 * @param gtin - GTIN string
 * @returns true if check digit is valid
 */
const validateCheckDigit = (gtin: string): boolean => {
  const digits = gtin.split('').map(Number)
  const checkDigit = digits[digits.length - 1]
  /* c8 ignore next 3 */
  if (checkDigit === undefined) {
    return false
  }
  const dataDigits = digits.slice(0, -1)

  const expectedCheckDigit = calculateCheckDigit(dataDigits)

  return checkDigit === expectedCheckDigit
}

/**
 * Create a GTIN from a string
 *
 * @param value - The string value to convert to GTIN
 * @returns Result with GTIN or error message
 */
export const createGTIN = (value: string): Result<GTIN, string> => {
  const trimmed = value.trim()

  // Validate non-empty
  if (trimmed.length === 0) {
    return ResultUtils.err('GTIN cannot be empty')
  }

  // Validate numeric only
  if (!/^\d+$/.test(trimmed)) {
    return ResultUtils.err('GTIN must contain only digits')
  }

  // Validate length (8, 12, 13, or 14 digits)
  const validLengths = [8, 12, 13, 14]
  if (!validLengths.includes(trimmed.length)) {
    return ResultUtils.err('GTIN must be 8, 12, 13, or 14 digits')
  }

  // Validate check digit
  if (!validateCheckDigit(trimmed)) {
    return ResultUtils.err('GTIN has invalid check digit')
  }

  return ResultUtils.ok(trimmed as GTIN)
}
