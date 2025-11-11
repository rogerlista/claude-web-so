/**
 * Inventory Store
 * TDD Phase: GREEN - Implementation to pass tests
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface InventoryMovement {
  readonly id: string
  readonly productId: string
  readonly quantity: number
  readonly type: 'entrada' | 'saida' | 'ajuste'
  readonly date: string
  readonly description?: string
}

export interface StockInfo {
  readonly productId: string
  readonly currentQuantity: number
  readonly lastMovementDate?: string
}

export interface RegisterMovementInput {
  readonly productId: string
  readonly quantity: number
  readonly type: 'entrada' | 'saida' | 'ajuste'
  readonly description?: string
}

export const useInventoryStore = defineStore('inventory', () => {
  const movements = ref<readonly InventoryMovement[]>([])
  const stock = ref<StockInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const registerMovement = async (input: RegisterMovementInput): Promise<InventoryMovement | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/estoque/movimentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: `mov-${Date.now()}`,
          productId: input.productId,
          quantity: input.quantity,
          type: input.type,
          date: new Date().toISOString(),
          description: input.description,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to register movement')
      }

      const movement = (await response.json()) as InventoryMovement
      return movement
    } catch (_err) {
      error.value = 'Erro ao registrar movimentação'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchStock = async (productId: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/estoque/stock/${productId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch stock')
      }

      const data = (await response.json()) as StockInfo
      stock.value = data
    } catch (_err) {
      error.value = 'Erro ao buscar estoque'
      stock.value = null
    } finally {
      loading.value = false
    }
  }

  const fetchMovements = async (productId: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/api/estoque/movimentos/${productId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch movements')
      }

      const data = (await response.json()) as { data: readonly InventoryMovement[]; total: number }
      movements.value = data.data
    } catch (_err) {
      error.value = 'Erro ao buscar movimentações'
      movements.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    movements,
    stock,
    loading,
    error,
    registerMovement,
    fetchStock,
    fetchMovements,
  }
})
