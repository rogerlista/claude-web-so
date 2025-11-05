import type { Brand, Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'

/**
 * CPF - Cadastro de Pessoa Física (Brazilian Tax ID) branded type
 *
 * Domain Rules:
 * - Must be 11 digits
 * - Must pass check digit validation
 * - Cannot be all same digits
 * - Stored without formatting (digits only)
 *
 * Format: XXX.XXX.XXX-XX (formatted) or XXXXXXXXXXX (stored)
 */
export type CPF = Brand<string, 'CPF'>

/**
 * Calculate CPF check digit
 *
 * @param digits - Array of digits (9 for first check, 10 for second)
 * @returns Check digit (0-9)
 */
const calculateCheckDigit = (digits: number[]): number => {
  const factor = digits.length + 1
  let sum = 0

  for (let i = 0; i < digits.length; i++) {
    const digit = digits[i]!
    sum += digit * (factor - i)
  }

  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

/**
 * Validate CPF check digits
 *
 * @param cpf - CPF string (11 digits)
 * @returns true if check digits are valid
 */
const validateCheckDigits = (cpf: string): boolean => {
  const digits = cpf.split('').map(Number)

  // First check digit (10th position)
  const firstNine = digits.slice(0, 9)
  const firstCheckDigit = calculateCheckDigit(firstNine)
  if (digits[9] !== firstCheckDigit) {
    return false
  }

  // Second check digit (11th position)
  const firstTen = digits.slice(0, 10)
  const secondCheckDigit = calculateCheckDigit(firstTen)
  if (digits[10] !== secondCheckDigit) {
    return false
  }

  return true
}

/**
 * Create a CPF from a string
 *
 * @param value - The string value to convert to CPF (formatted or unformatted)
 * @returns Result with CPF or error message
 */
export const createCPF = (value: string): Result<CPF, string> => {
  // Trim and remove all non-digit characters
  const trimmed = value.trim()
  const digitsOnly = trimmed.replace(/\D/g, '')

  // Validate non-empty
  if (digitsOnly.length === 0) {
    return ResultUtils.err('CPF cannot be empty')
  }

  // Validate length
  if (digitsOnly.length !== 11) {
    return ResultUtils.err('CPF must have 11 digits')
  }

  // Validate not all same digits
  const allSame = digitsOnly.split('').every((digit) => digit === digitsOnly[0])
  if (allSame) {
    return ResultUtils.err('CPF cannot have all same digits')
  }

  // Validate check digits
  if (!validateCheckDigits(digitsOnly)) {
    return ResultUtils.err('CPF has invalid check digits')
  }

  return ResultUtils.ok(digitsOnly as CPF)
}
