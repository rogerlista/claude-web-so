/**
 * Inventory Movement Type
 *
 * Represents the type of inventory movement:
 * - entrada: Stock in (purchase, return, etc.)
 * - saida: Stock out (sale, loss, etc.)
 * - ajuste: Adjustment (inventory correction)
 */
export type InventoryMovementType = 'entrada' | 'saida' | 'ajuste'

/**
 * All valid inventory movement types
 */
export const INVENTORY_MOVEMENT_TYPES = ['entrada', 'saida', 'ajuste'] as const

/**
 * Type guard to check if a string is a valid InventoryMovementType
 *
 * @param value - The string to validate
 * @returns true if value is a valid InventoryMovementType
 */
export const isValidMovementType = (value: string): value is InventoryMovementType => {
  return INVENTORY_MOVEMENT_TYPES.includes(value as InventoryMovementType)
}
