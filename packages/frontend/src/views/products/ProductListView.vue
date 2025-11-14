<script setup lang="ts">
/**
 * Product List View - T026
 * TDD Phase: GREEN - Implementation to pass tests
 */

import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import type { Column } from "../../components/base/BaseDataTable.vue";
import type { Product } from "../../stores/products";
import { useProductsStore } from "../../stores/products";

const router = useRouter();
const productsStore = useProductsStore();

const searchQuery = ref("");
const statusFilter = ref<"todos" | "ativo" | "inativo">("todos");

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(20);

const _columns: readonly Column[] = [
	{ key: "sku", label: "SKU" },
	{ key: "descricao", label: "Descrição" },
	{ key: "preco_unitario", label: "Preço" },
	{ key: "status", label: "Status" },
] as const;

const filteredProducts = computed(() => {
	let products = productsStore.products;

	// Filter by status
	if (statusFilter.value !== "todos") {
		products = products.filter((p) => p.status === statusFilter.value);
	}

	return products;
});

const totalPages = computed(() => {
	return Math.ceil(filteredProducts.value.length / itemsPerPage.value);
});

const _paginatedProducts = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage.value;
	const end = start + itemsPerPage.value;
	return filteredProducts.value.slice(start, end);
});

const _goToPage = (page: number): void => {
	if (page >= 1 && page <= totalPages.value) {
		currentPage.value = page;
		window.scrollTo({ top: 0, behavior: "smooth" });
	}
};

const _handleRowClick = (row: Record<string, unknown>): void => {
	const product = row as unknown as Product;
	router.push(`/products/${product.id}/edit`);
};

const _handleCreateProduct = (): void => {
	router.push("/products/create");
};

const handleSearch = (): void => {
	if (searchQuery.value.trim()) {
		productsStore.searchProducts(searchQuery.value);
	} else {
		productsStore.fetchProducts();
	}
};

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
	if (searchTimeout) {
		clearTimeout(searchTimeout);
	}

	searchTimeout = setTimeout(() => {
		handleSearch();
	}, 300);
});

// Reset to first page when filters change
watch([searchQuery, statusFilter], () => {
	currentPage.value = 1;
});

const _setStatusFilter = (status: "todos" | "ativo" | "inativo"): void => {
	statusFilter.value = status;
};

onMounted(() => {
	productsStore.fetchProducts();
});
</script>

<template>
  <div class="product-list-view">
    <div class="header">
      <div class="header-content">
        <div>
          <h1>Produtos</h1>
          <p class="subtitle">Gerencie seu catálogo de produtos</p>
        </div>
        <BaseButton
          data-testid="create-button"
          variant="primary"
          size="md"
          @click="handleCreateProduct"
        >
          + Novo Produto
        </BaseButton>
      </div>
    </div>

    <BaseCard elevation="md">
      <div class="filters">
        <div class="search-box">
          <BaseInput
            v-model="searchQuery"
            type="text"
            placeholder="Buscar produtos por SKU, descrição, GTIN..."
          />
        </div>

        <div class="status-filters">
          <button
            :class="{ active: statusFilter === 'todos' }"
            class="filter-button"
            @click="setStatusFilter('todos')"
          >
            Todos
          </button>
          <button
            :class="{ active: statusFilter === 'ativo' }"
            class="filter-button"
            data-testid="filter-ativo"
            @click="setStatusFilter('ativo')"
          >
            Ativos
          </button>
          <button
            :class="{ active: statusFilter === 'inativo' }"
            class="filter-button"
            @click="setStatusFilter('inativo')"
          >
            Inativos
          </button>
        </div>
      </div>

      <BaseDataTable
        :columns="columns"
        :rows="paginatedProducts"
        :loading="productsStore.loading"
        :striped="true"
        :hoverable="true"
        @row-click="handleRowClick"
      >
        <template #cell-preco_unitario="{ value }">
          {{ new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(value as number) }}
        </template>

        <template #cell-status="{ value }">
          <span :class="['status-badge', value]">
            {{ value === 'ativo' ? 'Ativo' : 'Inativo' }}
          </span>
        </template>
      </BaseDataTable>

      <div v-if="filteredProducts.length > 0" class="pagination-controls">
        <div class="pagination-info">
          Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a
          {{ Math.min(currentPage * itemsPerPage, filteredProducts.length) }}
          de {{ filteredProducts.length }} produtos
        </div>
        <div class="pagination-buttons">
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            ← Anterior
          </BaseButton>
          <div class="page-numbers">
            <button
              v-for="page in totalPages"
              :key="page"
              :class="['page-button', { active: page === currentPage }]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            Próximo →
          </BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.product-list-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-6);
}

.header {
  margin-bottom: var(--space-6);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

h1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.subtitle {
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.search-box {
  flex: 1;
  max-width: 500px;
}

.status-filters {
  display: flex;
  gap: var(--space-2);
}

.filter-button {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border-primary);
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-button:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-500);
}

.filter-button.active {
  background: var(--primary-500);
  color: white;
  border-color: var(--primary-500);
}

.status-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
}

.status-badge.ativo {
  background: var(--success-100);
  color: var(--success-700);
}

.status-badge.inativo {
  background: var(--neutral-100);
  color: var(--neutral-700);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: 100%;
  }

  .status-filters {
    flex-wrap: wrap;
  }
}

/* Pagination Styles */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-primary);
  gap: var(--space-4);
}

.pagination-info {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.page-numbers {
  display: flex;
  gap: var(--space-1);
}

.page-button {
  min-width: 36px;
  height: 36px;
  padding: var(--space-2);
  border: 1px solid var(--border-primary);
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.15s ease;
}

.page-button:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-500);
}

.page-button.active {
  background: var(--primary-500);
  color: white;
  border-color: var(--primary-500);
}

@media (max-width: 768px) {
  .pagination-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-info {
    text-align: center;
  }

  .pagination-buttons {
    justify-content: center;
  }

  .page-numbers {
    overflow-x: auto;
    max-width: 100%;
  }
}
</style>
