import type { Result } from '@pos-nfce/shared'
import { ResultUtils } from '@pos-nfce/shared'

/**
 * PaymentMethod - Value Object for payment methods
 *
 * Based on SEFAZ codes for NFC-e
 *
 * Domain Rules:
 * - Must be one of the valid SEFAZ payment method codes
 * - Each code represents a specific payment type
 *
 * SEFAZ Payment Method Codes:
 * 01 - Dinheiro (Cash)
 * 02 - Cheque (Check)
 * 03 - Cartão de Crédito (Credit Card)
 * 04 - Cartão de Débito (Debit Card)
 * 05 - Crédito Loja (Store Credit)
 * 10 - Vale Alimentação (Food Voucher)
 * 11 - Vale Refeição (Meal Voucher)
 * 12 - Vale Presente (Gift Card)
 * 13 - Vale Combustível (Fuel Voucher)
 * 15 - Boleto Bancário (Bank Slip)
 * 17 - PIX (Instant Payment)
 * 18 - Transferência bancária (Bank Transfer)
 * 19 - Programa de fidelidade, Cashback, Crédito Virtual (Loyalty Program)
 * 90 - Sem pagamento (No Payment)
 * 99 - Outros (Others)
 */
export type PaymentMethodCode =
  | '01' // Dinheiro
  | '02' // Cheque
  | '03' // Cartão de Crédito
  | '04' // Cartão de Débito
  | '05' // Crédito Loja
  | '10' // Vale Alimentação
  | '11' // Vale Refeição
  | '12' // Vale Presente
  | '13' // Vale Combustível
  | '15' // Boleto Bancário
  | '17' // PIX
  | '18' // Transferência bancária
  | '19' // Programa de fidelidade
  | '90' // Sem pagamento
  | '99' // Outros

/**
 * Payment method type with code and description
 */
export type PaymentMethod = {
  readonly code: PaymentMethodCode
  readonly description: string
}

/**
 * Valid payment method codes
 */
const VALID_PAYMENT_METHODS: readonly PaymentMethodCode[] = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '10',
  '11',
  '12',
  '13',
  '15',
  '17',
  '18',
  '19',
  '90',
  '99',
]

/**
 * Payment method descriptions mapping
 */
const PAYMENT_METHOD_DESCRIPTIONS: Record<PaymentMethodCode, string> = {
  '01': 'Dinheiro',
  '02': 'Cheque',
  '03': 'Cartão de Crédito',
  '04': 'Cartão de Débito',
  '05': 'Crédito Loja',
  '10': 'Vale Alimentação',
  '11': 'Vale Refeição',
  '12': 'Vale Presente',
  '13': 'Vale Combustível',
  '15': 'Boleto Bancário',
  '17': 'PIX',
  '18': 'Transferência bancária',
  '19': 'Programa de fidelidade',
  '90': 'Sem pagamento',
  '99': 'Outros',
}

/**
 * Type guard to check if a string is a valid PaymentMethodCode
 *
 * @param value - String to check
 * @returns true if value is a valid PaymentMethodCode
 */
export const isPaymentMethodCode = (value: string): value is PaymentMethodCode => {
  return VALID_PAYMENT_METHODS.includes(value as PaymentMethodCode)
}

/**
 * Create a PaymentMethod from a code
 *
 * @param code - The payment method code (SEFAZ)
 * @returns Result with PaymentMethod or error message
 */
export const createPaymentMethod = (code: string): Result<PaymentMethod, string> => {
  if (!isPaymentMethodCode(code)) {
    return ResultUtils.err(
      `Invalid payment method code: ${code}. Must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`
    )
  }

  return ResultUtils.ok({
    code,
    description: PAYMENT_METHOD_DESCRIPTIONS[code],
  })
}

/**
 * Get all available payment methods
 *
 * @returns Array of all payment methods
 */
export const getAllPaymentMethods = (): readonly PaymentMethod[] => {
  return VALID_PAYMENT_METHODS.map((code) => ({
    code,
    description: PAYMENT_METHOD_DESCRIPTIONS[code],
  }))
}

/**
 * Get payment method description by code
 *
 * @param code - The payment method code
 * @returns Description or undefined if code is invalid
 */
export const getPaymentMethodDescription = (code: string): string | undefined => {
  if (isPaymentMethodCode(code)) {
    return PAYMENT_METHOD_DESCRIPTIONS[code]
  }
  return undefined
}
