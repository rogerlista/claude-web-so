<script setup lang="ts">
/**
 * Inventory Movement View - T031
 * Tela de movimentação de estoque (Entrada/Saída/Ajuste)
 */

import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import type { RegisterMovementInput } from "../../stores/inventory";
import { useInventoryStore } from "../../stores/inventory";
import { useProductsStore } from "../../stores/products";

const router = useRouter();
const inventoryStore = useInventoryStore();
const productsStore = useProductsStore();

// Form state (removing readonly to allow mutations)
type FormState = {
	productId: string;
	quantity: number;
	type: "entrada" | "saida" | "ajuste";
	description?: string;
	productSearch: string;
};

const form = ref<FormState>({
	productId: "",
	quantity: 0,
	type: "entrada",
	description: "",
	productSearch: "",
});

const selectedProduct = ref<{ id: string; descricao: string } | null>(null);
const errors = ref<
	Partial<Record<keyof RegisterMovementInput | "productSearch", string>>
>({});
const isSubmitting = ref(false);
const successMessage = ref<string | null>(null);
const showProductLookup = ref(false);

const pageTitle = computed(() => {
	const titles = {
		entrada: "Entrada de Estoque",
		saida: "Saída de Estoque",
		ajuste: "Ajuste de Estoque",
	};
	return titles[form.value.type];
});

const validateForm = (): boolean => {
	errors.value = {};

	if (!form.value.productId) {
		errors.value.productSearch = "Produto é obrigatório";
	}

	if (form.value.quantity <= 0) {
		errors.value.quantity = "Quantidade deve ser maior que zero";
	}

	return Object.keys(errors.value).length === 0;
};

const handleSubmit = async (): Promise<void> => {
	if (!validateForm()) {
		return;
	}

	isSubmitting.value = true;
	successMessage.value = null;

	try {
		const input: RegisterMovementInput = {
			productId: form.value.productId,
			quantity: form.value.quantity,
			type: form.value.type,
			...(form.value.description && { description: form.value.description }),
		};
		const result = await inventoryStore.registerMovement(input);

		if (result && !inventoryStore.error) {
			successMessage.value = `Movimentação registrada com sucesso! Tipo: ${form.value.type.toUpperCase()}`;

			// Reset form
			form.value = {
				productId: "",
				quantity: 0,
				type: form.value.type, // Keep movement type
				description: "",
				productSearch: "",
			};
			selectedProduct.value = null;

			// Redirect after 2 seconds
			setTimeout(() => {
				router.push("/inventory");
			}, 2000);
		}
	} finally {
		isSubmitting.value = false;
	}
};

const handleCancel = (): void => {
	router.back();
};

const handleProductSearch = async (): Promise<void> => {
	if (!form.value.productSearch.trim()) {
		return;
	}

	await productsStore.searchProducts(form.value.productSearch);
	showProductLookup.value = true;
};

const selectProduct = (product: { id: string; descricao: string }): void => {
	selectedProduct.value = product;
	form.value.productId = product.id;
	form.value.productSearch = product.descricao;
	showProductLookup.value = false;
	delete errors.value.productSearch;
};
</script>

<template>
  <div class="inventory-movement-view">
    <BaseCard>
      <template #header>
        <h1 class="text-2xl font-bold">{{ pageTitle }}</h1>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Movement Type Selector -->
        <div class="form-group">
          <label class="block text-sm font-medium mb-2">Tipo de Movimentação</label>
          <div class="flex gap-4">
            <label class="flex items-center">
              <input
                type="radio"
                v-model="form.type"
                value="entrada"
                class="mr-2"
                :disabled="isSubmitting"
              />
              <span>Entrada</span>
            </label>
            <label class="flex items-center">
              <input
                type="radio"
                v-model="form.type"
                value="saida"
                class="mr-2"
                :disabled="isSubmitting"
              />
              <span>Saída</span>
            </label>
            <label class="flex items-center">
              <input
                type="radio"
                v-model="form.type"
                value="ajuste"
                class="mr-2"
                :disabled="isSubmitting"
              />
              <span>Ajuste</span>
            </label>
          </div>
        </div>

        <!-- Product Search -->
        <div class="form-group">
          <label for="product-search" class="block text-sm font-medium mb-2">Produto</label>
          <div class="flex gap-2">
            <BaseInput
              id="product-search"
              v-model="form.productSearch"
              placeholder="Digite para buscar produto"
              :error="errors.productSearch"
              :disabled="isSubmitting"
              @keyup.enter="handleProductSearch"
            />
            <BaseButton type="button" @click="handleProductSearch" :disabled="isSubmitting">
              Buscar
            </BaseButton>
          </div>
          <p v-if="selectedProduct" class="text-sm text-green-600 mt-1">
            Produto selecionado: {{ selectedProduct.descricao }}
          </p>
        </div>

        <!-- Product Lookup Results -->
        <div v-if="showProductLookup && productsStore.products.length > 0" class="product-lookup">
          <h3 class="text-sm font-medium mb-2">Selecione um produto:</h3>
          <div class="border rounded max-h-60 overflow-y-auto">
            <button
              v-for="product in productsStore.products"
              :key="product.id"
              type="button"
              @click="selectProduct({ id: product.id, descricao: product.descricao })"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
            >
              <div class="font-medium">{{ product.descricao }}</div>
              <div class="text-sm text-gray-600">SKU: {{ product.sku }}</div>
            </button>
          </div>
        </div>

        <!-- Quantity -->
        <div class="form-group">
          <label for="quantity" class="block text-sm font-medium mb-2">Quantidade</label>
          <BaseInput
            id="quantity"
            v-model.number="form.quantity"
            type="number"
            step="0.0001"
            min="0"
            placeholder="0.00"
            :error="errors.quantity"
            :disabled="isSubmitting"
          />
        </div>

        <!-- Description -->
        <div class="form-group">
          <label for="description" class="block text-sm font-medium mb-2">
            Observações (opcional)
          </label>
          <textarea
            id="description"
            v-model="form.description"
            placeholder="Adicione observações sobre esta movimentação"
            class="w-full px-3 py-2 border rounded-md"
            rows="3"
            :disabled="isSubmitting"
          />
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {{ successMessage }}
        </div>

        <!-- Error Message -->
        <div v-if="inventoryStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {{ inventoryStore.error }}
        </div>

        <!-- Actions -->
        <div class="flex gap-4 justify-end">
          <BaseButton type="button" variant="secondary" @click="handleCancel" :disabled="isSubmitting">
            Cancelar
          </BaseButton>
          <BaseButton type="submit" :disabled="isSubmitting || inventoryStore.loading">
            {{ isSubmitting ? 'Registrando...' : 'Registrar Movimentação' }}
          </BaseButton>
        </div>
      </form>
    </BaseCard>
  </div>
</template>

<style scoped>
.inventory-movement-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.product-lookup {
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 0.375rem;
}
</style>
