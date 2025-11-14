<script setup lang="ts">
/**
 * Inventory Count View - T032
 * Tela de inventário/contagem de estoque
 */

import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import { useInventoryStore } from '../../stores/inventory'
import { useProductsStore } from '../../stores/products'

const router = useRouter()
const inventoryStore = useInventoryStore()
const productsStore = useProductsStore()

interface ProductCount {
  id: string
  descricao: string
  sku: string
  systemQuantity: number | null
  countedQuantity: number
  difference: number
  needsAdjustment: boolean
}

const productCounts = ref<ProductCount[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const isProcessing = ref(false)

const loadProducts = async (): Promise<void> => {
  loading.value = true
  error.value = null

  try {
    await productsStore.fetchProducts()

    if (productsStore.products.length === 0) {
      error.value = 'Nenhum produto encontrado'
      return
    }

    // Initialize count for each product
    productCounts.value = await Promise.all(
      productsStore.products.map(async (product) => {
        // Fetch current stock
        await inventoryStore.fetchStock(product.id)
        const systemQuantity = inventoryStore.stock?.currentQuantity ?? null

        return {
          id: product.id,
          descricao: product.descricao,
          sku: product.sku,
          systemQuantity,
          countedQuantity: systemQuantity ?? 0,
          difference: 0,
          needsAdjustment: false,
        }
      })
    )
  } catch (err) {
    error.value = 'Erro ao carregar produtos'
  } finally {
    loading.value = false
  }
}

const updateDifference = (product: ProductCount): void => {
  if (product.systemQuantity === null) {
    product.difference = product.countedQuantity
    product.needsAdjustment = product.countedQuantity !== 0
  } else {
    product.difference = product.countedQuantity - product.systemQuantity
    product.needsAdjustment = product.difference !== 0
  }
}

const handleCountChange = (product: ProductCount): void => {
  updateDifference(product)
}

const adjustmentsNeeded = ref<ProductCount[]>([])

const processAdjustments = async (): Promise<void> => {
  adjustmentsNeeded.value = productCounts.value.filter((p) => p.needsAdjustment)

  if (adjustmentsNeeded.value.length === 0) {
    successMessage.value = 'Nenhum ajuste necessário. Estoque está correto!'
    return
  }

  isProcessing.value = true
  error.value = null
  successMessage.value = null

  try {
    // Register adjustments for products with differences
    for (const product of adjustmentsNeeded.value) {
      await inventoryStore.registerMovement({
        productId: product.id,
        quantity: product.countedQuantity,
        type: 'ajuste',
        description: `Ajuste de inventário. Diferença: ${product.difference > 0 ? '+' : ''}${product.difference}`,
      })

      if (inventoryStore.error) {
        throw new Error(`Erro ao ajustar ${product.descricao}`)
      }
    }

    successMessage.value = `Inventário processado com sucesso! ${adjustmentsNeeded.value.length} ajuste(s) realizado(s).`

    // Reload products after adjustments
    setTimeout(() => {
      loadProducts()
    }, 2000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao processar ajustes'
  } finally {
    isProcessing.value = false
  }
}

const handleCancel = (): void => {
  router.push('/inventory')
}

onMounted(() => {
  loadProducts()
})
</script>

<template>
  <div class="inventory-count-view">
    <BaseCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold">Inventário de Estoque</h1>
          <BaseButton
            v-if="productCounts.length > 0"
            type="button"
            @click="processAdjustments"
            :disabled="isProcessing || loading"
          >
            {{ isProcessing ? 'Processando...' : 'Processar Ajustes' }}
          </BaseButton>
        </div>
      </template>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-600">Carregando produtos...</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        {{ successMessage }}
      </div>

      <!-- Products Table -->
      <div v-if="!loading && productCounts.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Produto
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Estoque Sistema
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Quantidade Contada
              </th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Diferença
              </th>
              <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="product in productCounts"
              :key="product.id"
              :class="{ 'bg-yellow-50': product.needsAdjustment }"
            >
              <td class="px-4 py-3 text-sm">{{ product.sku }}</td>
              <td class="px-4 py-3 text-sm">{{ product.descricao }}</td>
              <td class="px-4 py-3 text-sm text-right">
                {{ product.systemQuantity !== null ? product.systemQuantity.toFixed(4) : '-' }}
              </td>
              <td class="px-4 py-3 text-sm">
                <BaseInput
                  v-model.number="product.countedQuantity"
                  type="number"
                  step="0.0001"
                  min="0"
                  class="w-32 text-right"
                  :disabled="isProcessing"
                  @input="handleCountChange(product)"
                />
              </td>
              <td
                class="px-4 py-3 text-sm text-right font-medium"
                :class="{
                  'text-red-600': product.difference < 0,
                  'text-green-600': product.difference > 0,
                  'text-gray-600': product.difference === 0,
                }"
              >
                {{ product.difference > 0 ? '+' : '' }}{{ product.difference.toFixed(4) }}
              </td>
              <td class="px-4 py-3 text-sm text-center">
                <span
                  v-if="product.needsAdjustment"
                  class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-200 text-yellow-800"
                >
                  Ajuste Necessário
                </span>
                <span
                  v-else
                  class="px-2 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800"
                >
                  OK
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary -->
      <div
        v-if="!loading && productCounts.length > 0"
        class="mt-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center"
      >
        <div>
          <p class="text-sm text-gray-600">
            Total de produtos: <span class="font-semibold">{{ productCounts.length }}</span>
          </p>
          <p class="text-sm text-gray-600">
            Ajustes necessários:
            <span class="font-semibold text-yellow-600">
              {{ productCounts.filter((p) => p.needsAdjustment).length }}
            </span>
          </p>
        </div>
        <BaseButton type="button" variant="secondary" @click="handleCancel" :disabled="isProcessing">
          Voltar
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.inventory-count-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.75rem 1rem;
}

tr:hover {
  background-color: #f9fafb;
}
</style>
