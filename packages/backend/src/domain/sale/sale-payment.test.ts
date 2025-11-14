import { describe, expect, it } from 'vitest'
import { createPaymentMethod } from './payment-method'
import { createSalePayment } from './sale-payment'

describe('SalePayment', () => {
  describe('createSalePayment', () => {
    it('should create a valid sale payment with cash', () => {
      const paymentMethodResult = createPaymentMethod('01')
      expect(paymentMethodResult.ok).toBe(true)

      if (paymentMethodResult.ok) {
        const result = createSalePayment({
          paymentMethod: paymentMethodResult.value,
          amount: 50.0,
        })

        expect(result.ok).toBe(true)
        if (result.ok) {
          expect(result.value.paymentMethod.code).toBe('01')
          expect(result.value.paymentMethod.description).toBe('Dinheiro')
          expect(result.value.amount).toBe(50.0)
        }
      }
    })

    it('should create a valid sale payment with PIX', () => {
      const paymentMethodResult = createPaymentMethod('17')
      expect(paymentMethodResult.ok).toBe(true)

      if (paymentMethodResult.ok) {
        const result = createSalePayment({
          paymentMethod: paymentMethodResult.value,
          amount: 123.45,
        })

        expect(result.ok).toBe(true)
        if (result.ok) {
          expect(result.value.paymentMethod.code).toBe('17')
          expect(result.value.paymentMethod.description).toBe('PIX')
          expect(result.value.amount).toBe(123.45)
        }
      }
    })

    it('should create a valid sale payment with credit card', () => {
      const paymentMethodResult = createPaymentMethod('03')
      expect(paymentMethodResult.ok).toBe(true)

      if (paymentMethodResult.ok) {
        const result = createSalePayment({
          paymentMethod: paymentMethodResult.value,
          amount: 1000.0,
        })

        expect(result.ok).toBe(true)
        if (result.ok) {
          expect(result.value.paymentMethod.code).toBe('03')
          expect(result.value.amount).toBe(1000.0)
        }
      }
    })

    it('should fail for zero amount', () => {
      const paymentMethodResult = createPaymentMethod('01')
      expect(paymentMethodResult.ok).toBe(true)

      if (paymentMethodResult.ok) {
        const result = createSalePayment({
          paymentMethod: paymentMethodResult.value,
          amount: 0,
        })

        expect(result.ok).toBe(false)
        if (!result.ok) {
          expect(result.error).toContain('Payment amount validation failed')
        }
      }
    })

    it('should fail for negative amount', () => {
      const paymentMethodResult = createPaymentMethod('01')
      expect(paymentMethodResult.ok).toBe(true)

      if (paymentMethodResult.ok) {
        const result = createSalePayment({
          paymentMethod: paymentMethodResult.value,
          amount: -10.0,
        })

        expect(result.ok).toBe(false)
        if (!result.ok) {
          expect(result.error).toContain('Payment amount validation failed')
        }
      }
    })

    it('should fail for amount with more than 2 decimal places', () => {
      const paymentMethodResult = createPaymentMethod('01')
      expect(paymentMethodResult.ok).toBe(true)

      if (paymentMethodResult.ok) {
        const result = createSalePayment({
          paymentMethod: paymentMethodResult.value,
          amount: 10.123,
        })

        expect(result.ok).toBe(false)
        if (!result.ok) {
          expect(result.error).toContain('Payment amount validation failed')
        }
      }
    })

    it('should create payment with amount having 1 decimal place', () => {
      const paymentMethodResult = createPaymentMethod('01')
      expect(paymentMethodResult.ok).toBe(true)

      if (paymentMethodResult.ok) {
        const result = createSalePayment({
          paymentMethod: paymentMethodResult.value,
          amount: 10.5,
        })

        expect(result.ok).toBe(true)
        if (result.ok) {
          expect(result.value.amount).toBe(10.5)
        }
      }
    })

    it('should create payment with integer amount', () => {
      const paymentMethodResult = createPaymentMethod('01')
      expect(paymentMethodResult.ok).toBe(true)

      if (paymentMethodResult.ok) {
        const result = createSalePayment({
          paymentMethod: paymentMethodResult.value,
          amount: 100,
        })

        expect(result.ok).toBe(true)
        if (result.ok) {
          expect(result.value.amount).toBe(100)
        }
      }
    })
  })
})
