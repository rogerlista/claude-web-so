/**
 * Compose - Function Composition (Right to Left)
 *
 * Applies functions in sequence from right to left (mathematical composition).
 * Creates a new function that applies each function in reverse order.
 *
 * @example
 * const transform = compose(
 *   round,       // 3. Round
 *   multiply(2), // 2. Multiply by 2
 *   add(5)       // 1. Add 5
 * )
 * transform(10) // 30
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export function compose<A>(fn1: (a: A) => A): (a: A) => A
export function compose<A, B>(fn2: (b: B) => A, fn1: (a: A) => B): (a: A) => A
export function compose<A, B, C>(fn3: (c: C) => A, fn2: (b: B) => C, fn1: (a: A) => B): (a: A) => A
export function compose<A, B, C, D>(
  fn4: (d: D) => A,
  fn3: (c: C) => D,
  fn2: (b: B) => C,
  fn1: (a: A) => B
): (a: A) => A
export function compose<A, B, C, D, E>(
  fn5: (e: E) => A,
  fn4: (d: D) => E,
  fn3: (c: C) => D,
  fn2: (b: B) => C,
  fn1: (a: A) => B
): (a: A) => A
export function compose<A, B, C, D, E, F>(
  fn6: (f: F) => A,
  fn5: (e: E) => F,
  fn4: (d: D) => E,
  fn3: (c: C) => D,
  fn2: (b: B) => C,
  fn1: (a: A) => B
): (a: A) => A
export function compose<A, B, C, D, E, F, G>(
  fn7: (g: G) => A,
  fn6: (f: F) => G,
  fn5: (e: E) => F,
  fn4: (d: D) => E,
  fn3: (c: C) => D,
  fn2: (b: B) => C,
  fn1: (a: A) => B
): (a: A) => A
export function compose<A, B, C, D, E, F, G, H>(
  fn8: (h: H) => A,
  fn7: (g: G) => H,
  fn6: (f: F) => G,
  fn5: (e: E) => F,
  fn4: (d: D) => E,
  fn3: (c: C) => D,
  fn2: (b: B) => C,
  fn1: (a: A) => B
): (a: A) => A
export function compose(...fns: Array<(arg: unknown) => unknown>): (arg: unknown) => unknown {
  return (value: unknown) => fns.reduceRight((acc, fn) => fn(acc), value)
}
