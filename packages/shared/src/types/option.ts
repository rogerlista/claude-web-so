/**
 * Option Type (Maybe Pattern)
 *
 * Represents an optional value that may or may not be present.
 * This is a type-safe alternative to null/undefined.
 *
 * @example
 * function findUser(id: string): Option<User> {
 *   const user = users.find(u => u.id === id)
 *   if (user === undefined) {
 *     return { some: false }
 *   }
 *   return { some: true, value: user }
 * }
 */
export type Option<T> = { readonly some: true; readonly value: T } | { readonly some: false }
