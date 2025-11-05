import type { Option } from '../types/option'
import type { Result } from '../types/result'

/**
 * Option Utilities
 *
 * Helper functions for working with Option types.
 */

export const OptionUtils = {
  /**
   * Create an Option with a value
   */
  some: <T>(value: T): Option<T> => ({ some: true, value }),

  /**
   * Create an empty Option
   */
  none: <T>(): Option<T> => ({ some: false }),

  /**
   * Create Option from nullable value
   */
  fromNullable: <T>(value: T | null | undefined): Option<T> => {
    if (value === null || value === undefined) {
      return OptionUtils.none()
    }
    return OptionUtils.some(value)
  },

  /**
   * Check if option has a value
   */
  isSome: <T>(option: Option<T>): option is { some: true; value: T } =>
    option.some === true,

  /**
   * Check if option is empty
   */
  isNone: <T>(option: Option<T>): option is { some: false } =>
    option.some === false,

  /**
   * Map the value if Some
   */
  map: <T, U>(option: Option<T>, fn: (value: T) => U): Option<U> => {
    if (option.some) {
      return OptionUtils.some(fn(option.value))
    }
    return OptionUtils.none()
  },

  /**
   * FlatMap (chain) - apply function that returns Option
   */
  flatMap: <T, U>(option: Option<T>, fn: (value: T) => Option<U>): Option<U> => {
    if (option.some) {
      return fn(option.value)
    }
    return OptionUtils.none()
  },

  /**
   * Get value or throw error
   */
  unwrap: <T>(option: Option<T>): T => {
    if (option.some) {
      return option.value
    }
    throw new Error('Called unwrap on None')
  },

  /**
   * Get value or return default
   */
  unwrapOr: <T>(option: Option<T>, defaultValue: T): T => {
    if (option.some) {
      return option.value
    }
    return defaultValue
  },

  /**
   * Get value or compute default
   */
  unwrapOrElse: <T>(option: Option<T>, fn: () => T): T => {
    if (option.some) {
      return option.value
    }
    return fn()
  },

  /**
   * Match pattern - execute function based on option
   */
  match: <T, R>(
    option: Option<T>,
    handlers: {
      readonly some: (value: T) => R
      readonly none: () => R
    }
  ): R => {
    if (option.some) {
      return handlers.some(option.value)
    }
    return handlers.none()
  },

  /**
   * Convert Option to Result
   */
  toResult: <T, E>(option: Option<T>, error: E): Result<T, E> => {
    if (option.some) {
      return { ok: true, value: option.value }
    }
    return { ok: false, error }
  },

  /**
   * Filter option by predicate
   */
  filter: <T>(option: Option<T>, predicate: (value: T) => boolean): Option<T> => {
    if (option.some && predicate(option.value)) {
      return option
    }
    return OptionUtils.none()
  },

  /**
   * Combine two Options into tuple
   */
  zip: <T, U>(optionT: Option<T>, optionU: Option<U>): Option<readonly [T, U]> => {
    if (optionT.some && optionU.some) {
      return OptionUtils.some([optionT.value, optionU.value])
    }
    return OptionUtils.none()
  },
}
