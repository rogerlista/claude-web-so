import type { Brand, Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'

/**
 * Email branded type
 *
 * Domain Rules:
 * - Must follow basic email format (local@domain)
 * - Stored as lowercase
 * - No spaces allowed
 */
export type Email = Brand<string, 'Email'>

/**
 * Email validation regex
 * Basic validation - checks for format like: user@domain.com
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Create an Email from a string
 *
 * @param value - The string value to convert to Email
 * @returns Result with Email or error message
 */
export const createEmail = (value: string): Result<Email, string> => {
  const trimmed = value.trim().toLowerCase()

  // Validate non-empty
  if (trimmed.length === 0) {
    return ResultUtils.err('Email cannot be empty')
  }

  // Validate email format
  if (!EMAIL_REGEX.test(trimmed)) {
    return ResultUtils.err('Email must be in valid format (e.g., user@example.com)')
  }

  return ResultUtils.ok(trimmed as Email)
}
