import type { Result } from '../types/result'

/**
 * Result Utilities
 *
 * Helper functions for working with Result types.
 */

export const ResultUtils = {
  /**
   * Create a successful result
   */
  ok: <T>(value: T): Result<T, never> => ({ ok: true, value }),

  /**
   * Create an error result
   */
  err: <E>(error: E): Result<never, E> => ({ ok: false, error }),

  /**
   * Check if result is Ok
   */
  isOk: <T, E>(result: Result<T, E>): result is { ok: true; value: T } => result.ok === true,

  /**
   * Check if result is Err
   */
  isErr: <T, E>(result: Result<T, E>): result is { ok: false; error: E } => result.ok === false,

  /**
   * Map the value if Ok
   */
  map: <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> => {
    if (result.ok) {
      return ResultUtils.ok(fn(result.value))
    }
    return result
  },

  /**
   * Map the error if Err
   */
  mapErr: <T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> => {
    if (result.ok) {
      return result
    }
    return ResultUtils.err(fn(result.error))
  },

  /**
   * FlatMap (chain) - apply function that returns Result
   */
  flatMap: <T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> => {
    if (result.ok) {
      return fn(result.value)
    }
    return result
  },

  /**
   * Get value or throw error
   */
  unwrap: <T, E>(result: Result<T, E>): T => {
    if (result.ok) {
      return result.value
    }
    throw result.error
  },

  /**
   * Get value or return default
   */
  unwrapOr: <T, E>(result: Result<T, E>, defaultValue: T): T => {
    if (result.ok) {
      return result.value
    }
    return defaultValue
  },

  /**
   * Match pattern - execute function based on result
   */
  match: <T, E, R>(
    result: Result<T, E>,
    handlers: {
      readonly ok: (value: T) => R
      readonly err: (error: E) => R
    }
  ): R => {
    if (result.ok) {
      return handlers.ok(result.value)
    }
    return handlers.err(result.error)
  },

  /**
   * Convert Result to Option (discards error)
   */
  toOption: <T, E>(result: Result<T, E>): import('../types/option').Option<T> => {
    if (result.ok) {
      return { some: true, value: result.value }
    }
    return { some: false }
  },

  /**
   * Combine multiple Results into one
   */
  all: <T, E>(results: readonly Result<T, E>[]): Result<readonly T[], E> => {
    const values: T[] = []

    for (const result of results) {
      if (!result.ok) {
        return result
      }
      values.push(result.value)
    }

    return ResultUtils.ok(values)
  },

  /**
   * Try to execute a function, catching any errors
   */
  tryCatch: <T>(fn: () => T | Promise<T>): Result<T, unknown> | Promise<Result<T, unknown>> => {
    try {
      const result = fn()

      // Check if result is a Promise
      if (result instanceof Promise) {
        return result
          .then((value) => ResultUtils.ok(value))
          .catch((error) => ResultUtils.err(error))
      }

      return ResultUtils.ok(result)
    } catch (error) {
      return ResultUtils.err(error)
    }
  },
}
