/**
 * Result Type (Either/Result Pattern)
 *
 * Represents the result of an operation that can either succeed or fail.
 * This is a type-safe alternative to throwing exceptions.
 *
 * @example
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) {
 *     return { ok: false, error: 'Division by zero' }
 *   }
 *   return { ok: true, value: a / b }
 * }
 */
export type Result<T, E> =
	| { readonly ok: true; readonly value: T }
	| { readonly ok: false; readonly error: E };
