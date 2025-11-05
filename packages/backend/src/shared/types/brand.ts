/**
 * Branded Types for Type Safety
 *
 * Branded types prevent mixing of primitive types that have the same
 * underlying type but different semantic meanings.
 *
 * @example
 * type UserId = Brand<string, 'UserId'>
 * type ProductId = Brand<string, 'ProductId'>
 *
 * const userId: UserId = 'abc' as UserId
 * const productId: ProductId = 'abc' as ProductId
 *
 * // ❌ Type error: UserId is not assignable to ProductId
 * const id: ProductId = userId
 */
export type Brand<K, T> = K & { readonly __brand: T }
