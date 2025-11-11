<script setup lang="ts">
/**
 * ProductLookup Component - T028
 * TDD Phase: GREEN - Implementation to pass tests
 * Quick product search with autocomplete dropdown
 */

import { onMounted, onUnmounted, ref, watch } from 'vue'
import type { Product } from '../../stores/products'
import BaseInput from '../base/BaseInput.vue'
import BaseLoading from '../base/BaseLoading.vue'

interface Props {
  readonly placeholder?: string
}

type Emits = (e: 'select', product: Product) => void

const { placeholder } = withDefaults(defineProps<Props>(), {
  placeholder: 'Buscar produto por SKU, GTIN, descrição...',
})

const emit = defineEmits<Emits>()

const searchQuery = ref('')
const results = ref<readonly Product[]>([])
const isLoading = ref(false)
const showDropdown = ref(false)
const selectedIndex = ref(-1)
const dropdownRef = ref<HTMLElement | null>(null)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const searchProducts = async (query: string): Promise<void> => {
  if (!query.trim()) {
    results.value = []
    showDropdown.value = false
    return
  }

  isLoading.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/api/produtos?q=${encodeURIComponent(query)}`)

    if (response.ok) {
      const data = (await response.json()) as { data: readonly Product[] }
      results.value = data.data
      showDropdown.value = true
    }
  } catch (error) {
    results.value = []
  } finally {
    isLoading.value = false
  }
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (newQuery) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = setTimeout(() => {
    searchProducts(newQuery)
  }, 300)
})

const handleSelect = (product: Product): void => {
  emit('select', product)
  searchQuery.value = ''
  results.value = []
  showDropdown.value = false
  selectedIndex.value = -1
}

const handleKeyDown = (event: KeyboardEvent): void => {
  if (!showDropdown.value) {
    return
  }

  switch (event.key) {
    case 'Escape':
      showDropdown.value = false
      selectedIndex.value = -1
      break

    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
      break

    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break

    case 'Enter': {
      event.preventDefault()
      const selectedProduct = results.value[selectedIndex.value]
      if (selectedIndex.value >= 0 && selectedProduct) {
        handleSelect(selectedProduct)
      }
      break
    }
  }
}

const handleClickOutside = (event: MouseEvent): void => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}
</script>

<template>
  <div ref="dropdownRef" class="product-lookup">
    <BaseInput
      v-model="searchQuery"
      type="text"
      :placeholder="placeholder"
      @keydown="handleKeyDown"
    />

    <div v-if="showDropdown" data-testid="results-dropdown" class="dropdown">
      <div v-if="isLoading" data-testid="loading-indicator" class="loading">
        <BaseLoading size="sm" />
        <span>Buscando...</span>
      </div>

      <div v-else-if="results.length === 0" data-testid="empty-state" class="empty-state">
        <p>Nenhum produto encontrado</p>
      </div>

      <div v-else class="results">
        <div
          v-for="(product, index) in results"
          :key="product.id"
          :class="['result-item', { selected: index === selectedIndex }]"
          data-testid="result-item"
          @click="handleSelect(product)"
        >
          <div class="product-info">
            <div class="product-header">
              <span class="product-sku">{{ product.sku }}</span>
              <span class="product-price">{{ formatPrice(product.preco_unitario) }}</span>
            </div>
            <div class="product-description">{{ product.descricao }}</div>
            <div v-if="product.gtin" class="product-gtin">GTIN: {{ product.gtin }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-lookup {
  position: relative;
  width: 100%;
}

.dropdown {
  position: absolute;
  top: calc(100% + var(--space-1));
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.empty-state {
  padding: var(--space-4);
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.results {
  padding: var(--space-2);
}

.result-item {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.result-item:hover,
.result-item.selected {
  background: var(--bg-secondary);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-sku {
  font-weight: var(--font-semibold);
  color: var(--primary-600);
  font-size: var(--text-sm);
}

.product-price {
  font-weight: var(--font-bold);
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.product-description {
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.product-gtin {
  color: var(--text-secondary);
  font-size: var(--text-xs);
}

@media (max-width: 768px) {
  .dropdown {
    max-height: 300px;
  }
}
</style>
