<template>
  <div class="pos-item-list">
    <div class="list-header">
      <h2>Itens da Venda</h2>
      <span v-if="items.length > 0" class="item-count">
        {{ items.length }} {{ items.length === 1 ? 'item' : 'itens' }}
      </span>
    </div>

    <div v-if="loading" class="loading">
      Carregando...
    </div>

    <div v-else-if="items.length === 0" class="empty-state">
      <div class="empty-icon">🛒</div>
      <p>Nenhum item adicionado</p>
      <p class="empty-hint">Use F1 para buscar produtos</p>
    </div>


    <div v-else class="items-container">
      <div
        v-for="(item, index) in items"
        :key="item.productId"
        class="item-row"
      >
        <div class="item-number">{{ index + 1 }}</div>

        <div class="item-info">
          <div class="item-name">
            {{ item.productName || item.productId }}
          </div>
          <div class="item-details">
            <span class="item-price">
              {{ formatCurrency(item.unitPrice) }} × {{ item.quantity }}
            </span>
          </div>
        </div>

        <div class="item-actions">
          <button
            class="quantity-button"
            title="Diminuir quantidade"
            :disabled="item.quantity <= 1"
            @click="handleDecreaseQuantity(item)"
          >
            −
          </button>

          <input
            :value="item.quantity"
            type="number"
            class="quantity-input"
            :min="1"
            @change="handleQuantityChange(item, $event)"
          />

          <button
            class="quantity-button"
            title="Aumentar quantidade"
            @click="handleIncreaseQuantity(item)"
          >
            +
          </button>

          <button
            class="remove-button"
            title="Remover item"
            @click="handleRemove(item)"
          >
            🗑️
          </button>
        </div>

        <div class="item-subtotal">
          {{ formatCurrency(item.subtotal) }}
        </div>
      </div>
    </div>

    <!-- Password Modal for Remove Item -->
    <PasswordModal
      v-model="showPasswordModal"
      title="Cancelar Item"
      message="Digite sua senha para cancelar este item da venda"
      :loading="isValidatingPassword"
      :error="passwordError"
      @confirm="handlePasswordConfirm"
      @cancel="handlePasswordCancel"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * POSItemList - Sale Items List Component
 * Phase 6: T038 - Lista de itens no PDV
 */

import { ref } from "vue";
import PasswordModal from "../../../components/auth/PasswordModal.vue";
import { useAuthStore } from "../../../stores/auth";
import type { SaleItem } from "../../../stores/sales";

interface Props {
	items: readonly SaleItem[];
	loading?: boolean;
}

// Props are used in template by Vue
withDefaults(defineProps<Props>(), {
	loading: false,
});

const emit = defineEmits<{
	"update-quantity": [productId: string, quantity: number];
	"remove-item": [productId: string];
}>();

// Password Modal State
const showPasswordModal = ref(false);
const isValidatingPassword = ref(false);
const passwordError = ref("");
const pendingRemoveItem = ref<SaleItem | null>(null);

const authStore = useAuthStore();

// biome-ignore lint/correctness/noUnusedVariables: used in template
const formatCurrency = (value: number): string => {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
};

// biome-ignore lint/correctness/noUnusedVariables: used in template
const handleIncreaseQuantity = (item: SaleItem): void => {
	emit("update-quantity", item.productId, item.quantity + 1);
};

// biome-ignore lint/correctness/noUnusedVariables: used in template
const handleDecreaseQuantity = (item: SaleItem): void => {
	if (item.quantity > 1) {
		emit("update-quantity", item.productId, item.quantity - 1);
	}
};

// biome-ignore lint/correctness/noUnusedVariables: used in template
const handleQuantityChange = (item: SaleItem, event: Event): void => {
	const target = event.target as HTMLInputElement;
	const newQuantity = Number.parseInt(target.value, 10);

	if (newQuantity > 0 && newQuantity !== item.quantity) {
		emit("update-quantity", item.productId, newQuantity);
	} else {
		// Reset to current quantity if invalid
		target.value = item.quantity.toString();
	}
};

// biome-ignore lint/correctness/noUnusedVariables: used in template
const handleRemove = (item: SaleItem): void => {
	pendingRemoveItem.value = item;
	showPasswordModal.value = true;
};

// biome-ignore lint/correctness/noUnusedVariables: used in template
const handlePasswordConfirm = async (password: string): Promise<void> => {
	if (!pendingRemoveItem.value) {
		return;
	}

	isValidatingPassword.value = true;
	passwordError.value = "";

	try {
		// Validate password with user's password
		const isValid = await authStore.validatePassword(password);

		if (isValid && pendingRemoveItem.value) {
			emit("remove-item", pendingRemoveItem.value.productId);
			showPasswordModal.value = false;
			pendingRemoveItem.value = null;
		} else {
			passwordError.value = "Senha incorreta";
		}
	} catch (_error) {
		passwordError.value = "Erro ao validar senha";
	} finally {
		isValidatingPassword.value = false;
	}
};

// biome-ignore lint/correctness/noUnusedVariables: used in template
const handlePasswordCancel = (): void => {
	pendingRemoveItem.value = null;
	passwordError.value = "";
};
</script>

<style scoped>
.pos-item-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.list-header h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.item-count {
  padding: 0.25rem 0.75rem;
  background-color: #2196f3;
  color: white;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #999;
  font-style: italic;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #999;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.empty-state p {
  margin: 0.5rem 0;
}

.empty-hint {
  font-size: 0.9rem;
  font-style: italic;
}

.items-container {
  flex: 1;
  overflow-y: auto;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.item-row:hover {
  background-color: #f9f9f9;
}

.item-row:last-child {
  border-bottom: none;
}

.item-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: #e0e0e0;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.9rem;
  color: #666;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-details {
  font-size: 0.85rem;
  color: #666;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.quantity-button {
  width: 2rem;
  height: 2rem;
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-button:hover:not(:disabled) {
  background-color: #2196f3;
  border-color: #2196f3;
  color: white;
}

.quantity-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.quantity-input {
  width: 3.5rem;
  height: 2rem;
  padding: 0.25rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
}

.quantity-input:focus {
  outline: none;
  border-color: #2196f3;
}

/* Remove spinner from number input */
.quantity-input::-webkit-inner-spin-button,
.quantity-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-input[type='number'] {
  -moz-appearance: textfield;
}

.remove-button {
  width: 2rem;
  height: 2rem;
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-button:hover {
  background-color: #f44336;
  border-color: #f44336;
}

.item-subtotal {
  font-weight: 600;
  font-size: 1.1rem;
  color: #4caf50;
  min-width: 6rem;
  text-align: right;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .item-row {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .item-number {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.8rem;
  }

  .item-info {
    flex: 1 1 100%;
    order: 2;
  }

  .item-actions {
    order: 3;
  }

  .item-subtotal {
    order: 1;
    margin-left: auto;
  }
}
</style>
