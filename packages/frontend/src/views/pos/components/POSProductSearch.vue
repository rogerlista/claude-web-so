<template>
  <div class="pos-product-search">
    <div class="search-header">
      <h2>Adicionar Produtos</h2>
    </div>

    <div class="search-box">
      <BaseInput
        v-model="searchQuery"
        placeholder="Buscar por SKU, código de barras ou descrição... (F1)"
        :disabled="loading"
        @keyup.enter="handleSearch"
      />
      <BaseButton
        variant="primary"
        :loading="loading"
        @click="handleSearch"
      >
        Buscar
      </BaseButton>
    </div>

    <div v-if="searchResults.length > 0" class="search-results">
      <div
        v-for="product in searchResults"
        :key="product.id"
        class="product-item"
        @click="handleSelectProduct(product)"
      >
        <div class="product-info">
          <div class="product-name">{{ product.descricao }}</div>
          <div class="product-details">
            <span class="product-sku">SKU: {{ product.sku }}</span>
            <span v-if="product.gtin" class="product-gtin">
              GTIN: {{ product.gtin }}
            </span>
          </div>
        </div>
        <div class="product-price">
          {{ formatCurrency(product.preco_unitario) }}
        </div>
      </div>
    </div>

    <div v-else-if="searchQuery && !loading" class="no-results">
      Nenhum produto encontrado
    </div>

    <!-- Quantity Modal -->
    <div v-if="showQuantityModal" class="modal-overlay" @click.self="closeQuantityModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ selectedProduct?.descricao }}</h3>
          <button class="close-button" @click="closeQuantityModal">×</button>
        </div>

        <div class="modal-body">
          <div class="product-price-display">
            Preço: {{ formatCurrency(selectedProduct?.preco_unitario || 0) }}
          </div>

          <div class="form-group">
            <label for="quantity-input">Quantidade</label>
            <input
              id="quantity-input"
              v-model.number="quantity"
              type="number"
              class="form-control"
              placeholder="Digite a quantidade"
              :min="1"
              :step="1"
              autofocus
              @keyup.enter="handleAddToSale"
            />
          </div>

          <div class="subtotal">
            Subtotal: {{ formatCurrency((selectedProduct?.preco_unitario || 0) * quantity) }}
          </div>
        </div>

        <div class="modal-actions">
          <BaseButton variant="secondary" @click="closeQuantityModal">
            Cancelar
          </BaseButton>
          <BaseButton
            variant="primary"
            :disabled="quantity <= 0"
            @click="handleAddToSale"
          >
            Adicionar
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * POSProductSearch - Product Search Component
 * Phase 6: T039 - Busca de produtos no PDV
 */

import { onMounted, onUnmounted, ref } from "vue";
import type { Product } from "../../../stores/products";
import { useProductsStore } from "../../../stores/products";
import BaseInput from "../../../components/base/BaseInput.vue";
import BaseButton from "../../../components/base/BaseButton.vue";

interface ProductAddEvent {
	id: string;
	price: number;
	quantity: number;
}

const emit = defineEmits<{
	"add-product": [product: ProductAddEvent];
}>();

const productsStore = useProductsStore();

const searchQuery = ref("");
const searchResults = ref<readonly Product[]>([]);
const loading = ref(false);
const showQuantityModal = ref(false);
const selectedProduct = ref<Product | null>(null);
const quantity = ref(1);

const formatCurrency = (value: number): string => {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
};

const handleSearch = async (): Promise<void> => {
	if (!searchQuery.value.trim()) {
		searchResults.value = [];
		return;
	}

	loading.value = true;
	try {
		await productsStore.searchProducts(searchQuery.value);
		searchResults.value = productsStore.products;
	} finally {
		loading.value = false;
	}
};

const handleSelectProduct = (product: Product): void => {
	if (product.status !== "ativo") {
		alert("Este produto está inativo e não pode ser vendido.");
		return;
	}

	selectedProduct.value = product;
	quantity.value = 1;
	showQuantityModal.value = true;
};

const handleAddToSale = (): void => {
	if (selectedProduct.value && quantity.value > 0) {
		emit("add-product", {
			id: selectedProduct.value.id,
			price: selectedProduct.value.preco_unitario,
			quantity: quantity.value,
		});

		// Clear search and close modal
		closeQuantityModal();
		searchQuery.value = "";
		searchResults.value = [];
	}
};

const closeQuantityModal = (): void => {
	showQuantityModal.value = false;
	selectedProduct.value = null;
	quantity.value = 1;
};

// Keyboard shortcuts
const handleKeyPress = (event: KeyboardEvent): void => {
	// F1 - Focus search
	if (event.key === "F1") {
		event.preventDefault();
		const input = document.querySelector(
			".search-box input",
		) as HTMLInputElement;
		input?.focus();
	}
};

onMounted(() => {
	window.addEventListener("keydown", handleKeyPress);
});

onUnmounted(() => {
	window.removeEventListener("keydown", handleKeyPress);
});
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #2196f3;
}

.pos-product-search {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.search-header {
  padding: 1rem 1.5rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.search-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.search-box {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background-color: #fff;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
  border-top: 1px solid #e0e0e0;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.product-item:hover {
  background-color: #f5f5f5;
}

.product-item:last-child {
  border-bottom: none;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
}

.product-details {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #666;
}

.product-sku,
.product-gtin {
  display: inline-block;
}

.product-price {
  font-weight: 600;
  font-size: 1.1rem;
  color: #4caf50;
  margin-left: 1rem;
}

.no-results {
  padding: 2rem;
  text-align: center;
  color: #999;
  font-style: italic;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.product-price-display {
  font-size: 1.2rem;
  font-weight: 600;
  color: #4caf50;
  margin-bottom: 1.5rem;
}

.subtotal {
  margin-top: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  text-align: right;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  justify-content: flex-end;
}
</style>
