<template>
  <div class="pos-view">
    <!-- Header -->
    <div class="pos-header">
      <h1>PDV - Ponto de Venda</h1>
      <div class="sale-info">
        <span v-if="salesStore.currentSale" class="sale-id">
          Venda: {{ salesStore.currentSale.id }}
        </span>
        <span v-else class="no-sale">Nenhuma venda iniciada</span>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="salesStore.error" class="error-message">
      {{ salesStore.error }}
    </div>

    <!-- Main Content -->
    <div class="pos-content">
      <!-- Left Panel: Product Search and List -->
      <div class="pos-left-panel">
        <POSProductSearch @add-product="handleAddProduct" />
        <POSItemList
          :items="salesStore.currentSale?.items || []"
          :loading="salesStore.loading"
          @update-quantity="handleUpdateQuantity"
          @remove-item="handleRemoveItem"
        />
      </div>

      <!-- Right Panel: Totals and Actions -->
      <div class="pos-right-panel">
        <div class="pos-totals">
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span class="total-value">
              {{ formatCurrency(salesStore.currentSale?.grossTotal || 0) }}
            </span>
          </div>

          <div v-if="salesStore.currentSale && salesStore.currentSale.discount > 0" class="total-row discount">
            <span class="total-label">Desconto:</span>
            <span class="total-value">
              -{{ formatCurrency(salesStore.currentSale.discount) }}
            </span>
          </div>

          <div class="total-row total">
            <span class="total-label">Total:</span>
            <span class="total-value">
              {{ formatCurrency(salesStore.currentSale?.netTotal || 0) }}
            </span>
          </div>

          <div class="total-row items-count">
            <span class="total-label">Itens:</span>
            <span class="total-value">{{ salesStore.totalItems }}</span>
          </div>
        </div>

        <div class="pos-actions">
          <BaseButton
            v-if="!salesStore.currentSale"
            variant="primary"
            size="lg"
            :loading="salesStore.loading"
            @click="handleNewSale"
          >
            Nova Venda
          </BaseButton>

          <template v-else>
            <BaseButton
              variant="secondary"
              :disabled="!salesStore.hasItems || salesStore.loading"
              @click="handleApplyDiscount"
            >
              Aplicar Desconto
            </BaseButton>

            <BaseButton
              variant="primary"
              size="lg"
              :disabled="!salesStore.hasItems || salesStore.loading"
              @click="handleCheckout"
            >
              Finalizar Venda (F2)
            </BaseButton>

            <BaseButton
              variant="danger"
              :disabled="salesStore.loading"
              @click="handleCancelSale"
            >
              Cancelar Venda
            </BaseButton>
          </template>
        </div>
      </div>
    </div>

    <!-- Discount Modal -->
    <POSDiscountModal
      v-if="showDiscountModal"
      :current-discount="salesStore.currentSale?.discount || 0"
      :max-discount="salesStore.currentSale?.grossTotal || 0"
      @apply="handleDiscountApply"
      @close="showDiscountModal = false"
    />

    <!-- Password Modal for Cancel Sale -->
    <PasswordModal
      v-model="showPasswordModal"
      title="Autenticação Necessária"
      message="Digite sua senha para cancelar a venda"
      :loading="isValidatingPassword"
      :error="passwordError"
      @confirm="handlePasswordConfirm"
      @cancel="handlePasswordCancel"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * POSView - Point of Sale Main View
 * Phase 6: T036-T037 - Tela PDV componente principal
 */

import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import PasswordModal from "../../components/auth/PasswordModal.vue";
import BaseButton from "../../components/base/BaseButton.vue";
import { useAuthStore } from "../../stores/auth";
import { useSalesStore } from "../../stores/sales";
import POSDiscountModal from "./components/POSDiscountModal.vue";
import POSItemList from "./components/POSItemList.vue";
import POSProductSearch from "./components/POSProductSearch.vue";

const router = useRouter();
const salesStore = useSalesStore();
const authStore = useAuthStore();
const showDiscountModal = ref(false);

// Password Modal State
const showPasswordModal = ref(false);
const isValidatingPassword = ref(false);
const passwordError = ref("");

// biome-ignore lint/correctness/noUnusedVariables: used in template
const formatCurrency = (value: number): string => {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
};

const handleNewSale = async (): Promise<void> => {
	await salesStore.createSale();
};

// biome-ignore lint/correctness/noUnusedVariables: used in template
const handleAddProduct = async (product: {
	id: string;
	price: number;
	quantity: number;
}): Promise<void> => {
	await salesStore.addItem({
		productId: product.id,
		quantity: product.quantity,
		unitPrice: product.price,
	});
};

// biome-ignore lint/correctness/noUnusedVariables: used in template
const handleUpdateQuantity = async (
	productId: string,
	quantity: number,
): Promise<void> => {
	await salesStore.updateItemQuantity(productId, quantity);
};

// biome-ignore lint/correctness/noUnusedVariables: used in template
const handleRemoveItem = async (productId: string): Promise<void> => {
	await salesStore.removeItem(productId);
};

const handleApplyDiscount = (): void => {
	showDiscountModal.value = true;
};

// biome-ignore lint/correctness/noUnusedVariables: used in template
const handleDiscountApply = async (discount: number): Promise<void> => {
	const success = await salesStore.applyDiscount(discount);
	if (success) {
		showDiscountModal.value = false;
	}
};

const handleCheckout = (): void => {
	if (salesStore.currentSale) {
		router.push(`/pos/checkout/${salesStore.currentSale.id}`);
	}
};

// biome-ignore lint/correctness/noUnusedVariables: used in template
const handleCancelSale = (): void => {
	passwordError.value = "";
	showPasswordModal.value = true;
};

// biome-ignore lint/correctness/noUnusedVariables: used in template
const handlePasswordConfirm = async (password: string): Promise<void> => {
	isValidatingPassword.value = true;
	passwordError.value = "";

	const isValid = await authStore.validatePassword(password);

	if (isValid) {
		showPasswordModal.value = false;
		salesStore.clearSale();
	} else {
		passwordError.value = "Senha incorreta";
	}

	isValidatingPassword.value = false;
};

// biome-ignore lint/correctness/noUnusedVariables: used in template
const handlePasswordCancel = (): void => {
	showPasswordModal.value = false;
	passwordError.value = "";
};

// Keyboard shortcuts
const handleKeyPress = (event: KeyboardEvent): void => {
	// F2 - Finalizar venda
	if (event.key === "F2" && salesStore.hasItems && !salesStore.loading) {
		event.preventDefault();
		handleCheckout();
	}

	// F3 - Nova venda
	if (event.key === "F3" && !salesStore.currentSale) {
		event.preventDefault();
		handleNewSale();
	}

	// F4 - Desconto
	if (event.key === "F4" && salesStore.hasItems && !salesStore.loading) {
		event.preventDefault();
		handleApplyDiscount();
	}
};

onMounted(() => {
	window.addEventListener("keydown", handleKeyPress);

	// If there's no current sale, create one automatically
	if (!salesStore.currentSale) {
		handleNewSale();
	}
});

onUnmounted(() => {
	window.removeEventListener("keydown", handleKeyPress);
});
</script>

<style scoped>
.pos-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.pos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  border-bottom: 2px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pos-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.sale-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sale-id {
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.9rem;
}

.no-sale {
  padding: 0.5rem 1rem;
  background-color: #ff9800;
  color: white;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.9rem;
}

.error-message {
  padding: 1rem 2rem;
  background-color: #f44336;
  color: white;
  text-align: center;
  font-weight: 500;
}

.pos-content {
  display: flex;
  flex: 1;
  gap: 1rem;
  padding: 1rem;
  overflow: hidden;
}

.pos-left-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}

.pos-right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 300px;
  max-width: 400px;
}

.pos-totals {
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.total-row:last-child {
  border-bottom: none;
}

.total-row.discount {
  color: #f44336;
}

.total-row.total {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 2px solid #333;
  font-size: 1.5rem;
  font-weight: bold;
}

.total-row.items-count {
  font-size: 0.9rem;
  color: #666;
}

.total-label {
  font-weight: 500;
}

.total-value {
  font-weight: 600;
}

.pos-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1024px) {
  .pos-content {
    flex-direction: column;
  }

  .pos-right-panel {
    max-width: none;
  }
}
</style>
