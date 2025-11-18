<template>
  <div class="pos-checkout-view">
    <!-- Header -->
    <div class="checkout-header">
      <button class="back-button" @click="handleBack">
        ← Voltar
      </button>
      <h1>Finalizar Venda</h1>
      <div class="sale-id">{{ saleId }}</div>
    </div>

    <!-- Error Display -->
    <div v-if="salesStore.error" class="error-message">
      {{ salesStore.error }}
    </div>

    <div v-if="!sale" class="loading-state">
      <p>Carregando venda...</p>
    </div>

    <div v-else class="checkout-content">
      <!-- Sale Summary -->
      <div class="sale-summary">
        <h2>Resumo da Venda</h2>

        <div class="summary-section">
          <h3>Itens ({{ sale.items.length }})</h3>
          <div class="items-list">
            <div v-for="(item, index) in sale.items" :key="item.productId" class="summary-item">
              <span class="item-number">{{ index + 1 }}.</span>
              <span class="item-name">{{ item.productName || item.productId }}</span>
              <span class="item-qty">{{ item.quantity }}x</span>
              <span class="item-price">{{ formatCurrency(item.unitPrice) }}</span>
              <span class="item-total">{{ formatCurrency(item.subtotal) }}</span>
            </div>
          </div>
        </div>

        <div class="summary-totals">
          <div class="total-line">
            <span>Subtotal:</span>
            <span>{{ formatCurrency(sale.grossTotal) }}</span>
          </div>
          <div v-if="sale.discount > 0" class="total-line discount">
            <span>Desconto:</span>
            <span>-{{ formatCurrency(sale.discount) }}</span>
          </div>
          <div v-if="sale.addition > 0" class="total-line addition">
            <span>Acréscimo:</span>
            <span>+{{ formatCurrency(sale.addition) }}</span>
          </div>
          <div class="total-line total">
            <span>Total:</span>
            <span>{{ formatCurrency(sale.netTotal) }}</span>
          </div>
        </div>
      </div>

      <!-- Discount/Surcharge Section -->
      <div class="adjustment-section">
        <h2>Desconto e Acréscimo</h2>
        <p class="section-description">Ajuste o valor da venda antes do pagamento</p>

        <div class="adjustment-grid">
          <div class="adjustment-group">
            <label for="discount-input">Desconto (R$)</label>
            <div class="input-with-button">
              <input
                id="discount-input"
                v-model.number="discountInput"
                type="number"
                min="0"
                :max="sale.grossTotal"
                step="0.01"
                placeholder="0.00"
                class="form-input"
              />
              <BaseButton
                variant="secondary"
                size="sm"
                :disabled="salesStore.loading || !discountInput || discountInput <= 0"
                @click="handleApplyDiscount"
              >
                Aplicar
              </BaseButton>
            </div>
            <p v-if="sale.discount > 0" class="current-value">
              Desconto atual: {{ formatCurrency(sale.discount) }}
            </p>
          </div>

          <div class="adjustment-group">
            <label for="surcharge-input">Acréscimo (R$)</label>
            <div class="input-with-button">
              <input
                id="surcharge-input"
                v-model.number="surchargeInput"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                class="form-input"
              />
              <BaseButton
                variant="secondary"
                size="sm"
                :disabled="salesStore.loading || !surchargeInput || surchargeInput <= 0"
                @click="handleApplySurcharge"
              >
                Aplicar
              </BaseButton>
            </div>
            <p v-if="sale.addition > 0" class="current-value">
              Acréscimo atual: {{ formatCurrency(sale.addition) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Customer Information Section -->
      <div class="customer-section">
        <h2>Informações do Cliente</h2>
        <p class="section-description">Opcional - Para emissão de NFC-e</p>

        <form class="customer-form" @submit.prevent="handleSaveCustomerInfo">
          <div class="form-group">
            <label for="cpf">CPF</label>
            <input
              id="cpf"
              v-model="customerCpf"
              type="text"
              placeholder="000.000.000-00"
              maxlength="14"
              class="form-input"
              @input="formatCpf"
              @blur="validateCpf"
            />
            <span v-if="cpfError" class="field-error">{{ cpfError }}</span>
          </div>

          <div class="form-group">
            <label for="email">E-mail</label>
            <input
              id="email"
              v-model="customerEmail"
              type="email"
              placeholder="cliente@exemplo.com"
              class="form-input"
              @blur="validateEmail"
            />
            <span v-if="emailError" class="field-error">{{ emailError }}</span>
          </div>

          <BaseButton
            type="submit"
            variant="secondary"
            :disabled="salesStore.loading || (!!cpfError && !!customerCpf) || (!!emailError && !!customerEmail)"
          >
            Salvar Informações
          </BaseButton>
        </form>
      </div>

      <!-- Payment Section -->
      <div class="payment-section">
        <POSPaymentPanel
          :payments="sale.payments"
          :total="sale.netTotal"
          @add-payment="handleAddPayment"
          @remove-payment="handleRemovePayment"
          @complete="handleComplete"
        />
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal-overlay">
      <div class="success-modal">
        <div class="success-icon">✓</div>
        <h2>Venda Finalizada!</h2>
        <p class="sale-id-display">Venda: {{ saleId }}</p>
        <p class="sale-total">Total: {{ formatCurrency(sale?.netTotal || 0) }}</p>

        <div class="modal-actions">
          <BaseButton variant="secondary" @click="handlePrintReceipt">
            🖨️ Imprimir Cupom
          </BaseButton>
          <BaseButton variant="primary" @click="handleNewSale">
            Nova Venda
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * POSCheckoutView - Checkout/Payment View
 * Phase 6: T041-T042 - Tela de finalização de venda
 */

import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSalesStore } from "../../stores/sales";
import BaseButton from "../../components/base/BaseButton.vue";
import POSPaymentPanel from "./components/POSPaymentPanel.vue";

const route = useRoute();
const router = useRouter();
const salesStore = useSalesStore();

const saleId = computed(() => route.params.id as string);
const sale = computed(() => salesStore.currentSale);
const showSuccessModal = ref(false);

// Customer information
const customerCpf = ref("");
const customerEmail = ref("");
const cpfError = ref("");
const emailError = ref("");

// Discount and surcharge
const discountInput = ref<number>(0);
const surchargeInput = ref<number>(0);

const formatCurrency = (value: number): string => {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
};

// CPF formatting and validation
const formatCpf = (): void => {
	// Remove non-digits
	let cpf = customerCpf.value.replace(/\D/g, "");

	// Apply mask: 000.000.000-00
	if (cpf.length > 9) {
		cpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
	} else if (cpf.length > 6) {
		cpf = cpf.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
	} else if (cpf.length > 3) {
		cpf = cpf.replace(/(\d{3})(\d{0,3})/, "$1.$2");
	}

	customerCpf.value = cpf;
	cpfError.value = "";
};

const validateCpf = (): void => {
	if (!customerCpf.value) {
		cpfError.value = "";
		return;
	}

	const cpfDigits = customerCpf.value.replace(/\D/g, "");

	if (cpfDigits.length !== 11) {
		cpfError.value = "CPF deve ter 11 dígitos";
		return;
	}

	// Check if all digits are the same
	if (/^(\d)\1+$/.test(cpfDigits)) {
		cpfError.value = "CPF inválido";
		return;
	}

	cpfError.value = "";
};

// Email validation
const validateEmail = (): void => {
	if (!customerEmail.value) {
		emailError.value = "";
		return;
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(customerEmail.value)) {
		emailError.value = "E-mail inválido";
		return;
	}

	emailError.value = "";
};

// Save customer information
const handleSaveCustomerInfo = async (): Promise<void> => {
	validateCpf();
	validateEmail();

	if (cpfError.value || emailError.value) {
		return;
	}

	const cpfDigits = customerCpf.value
		? customerCpf.value.replace(/\D/g, "")
		: undefined;
	const email = customerEmail.value || undefined;

	const success = await salesStore.updateCustomerInfo(cpfDigits, email);
	if (success) {
		// Show success feedback
		cpfError.value = "";
		emailError.value = "";
	}
};

const handleBack = (): void => {
	router.push("/pos");
};

const handleAddPayment = async (
	paymentMethodCode: string,
	amount: number,
): Promise<void> => {
	await salesStore.addPayment(paymentMethodCode, amount);
};

const handleRemovePayment = async (index: number): Promise<void> => {
	await salesStore.removePayment(index);
};

const handleApplyDiscount = async (): Promise<void> => {
	if (discountInput.value > 0) {
		const success = await salesStore.applyDiscount(discountInput.value);
		if (success) {
			discountInput.value = 0;
		}
	}
};

const handleApplySurcharge = async (): Promise<void> => {
	if (surchargeInput.value > 0) {
		const success = await salesStore.applySurcharge(surchargeInput.value);
		if (success) {
			surchargeInput.value = 0;
		}
	}
};

const handleComplete = async (): Promise<void> => {
	const success = await salesStore.finalizeSale();
	if (success) {
		showSuccessModal.value = true;
	}
};

const handlePrintReceipt = (): void => {
	// TODO: Implement receipt printing
	window.print();
};

const handleNewSale = async (): Promise<void> => {
	salesStore.clearSale();
	await router.push("/pos");
};

onMounted(async () => {
	// Load sale if not in store
	if (!sale.value || sale.value.id !== saleId.value) {
		await salesStore.getSale(saleId.value);
	}

	// Load existing customer info if available
	if (sale.value) {
		if (sale.value.customerCpf) {
			// Format CPF for display
			const cpf = sale.value.customerCpf;
			customerCpf.value = cpf.replace(
				/(\d{3})(\d{3})(\d{3})(\d{2})/,
				"$1.$2.$3-$4",
			);
		}
		if (sale.value.customerEmail) {
			customerEmail.value = sale.value.customerEmail;
		}
	}
});
</script>

<style scoped>
.pos-checkout-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.checkout-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem 2rem;
  background-color: #fff;
  border-bottom: 2px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button {
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.back-button:hover {
  background-color: #e0e0e0;
}

.checkout-header h1 {
  margin: 0;
  flex: 1;
  font-size: 1.5rem;
  color: #333;
}

.sale-id {
  padding: 0.5rem 1rem;
  background-color: #4caf50;
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

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #999;
  font-style: italic;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
  flex: 1;
}

.sale-summary,
.adjustment-section,
.customer-section,
.payment-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  height: fit-content;
}

.sale-summary h2,
.adjustment-section h2,
.customer-section h2,
.payment-section h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.2rem;
  color: #333;
}

.section-description {
  margin: -0.75rem 0 1.5rem 0;
  font-size: 0.85rem;
  color: #999;
  font-style: italic;
}

.customer-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #4caf50;
}

.form-input::placeholder {
  color: #999;
}

.field-error {
  color: #f44336;
  font-size: 0.85rem;
  margin-top: -0.25rem;
}

.summary-section {
  margin-bottom: 1.5rem;
}

.summary-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #666;
}

.items-list {
  max-height: 300px;
  overflow-y: auto;
}

.summary-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem;
}

.summary-item:last-child {
  border-bottom: none;
}

.item-number {
  color: #999;
  font-weight: 500;
}

.item-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-qty {
  color: #666;
}

.item-price {
  color: #666;
  font-size: 0.85rem;
}

.item-total {
  font-weight: 600;
  color: #4caf50;
  text-align: right;
}

.summary-totals {
  padding-top: 1.5rem;
  border-top: 2px solid #e0e0e0;
}

.total-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 1rem;
}

.total-line.discount {
  color: #f44336;
}

.total-line.addition {
  color: #4caf50;
}

.total-line.total {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 2px solid #333;
  font-size: 1.5rem;
  font-weight: bold;
}

/* Adjustment Section */
.adjustment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.adjustment-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.adjustment-group label {
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
}

.input-with-button input {
  flex: 1;
}

.current-value {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  font-style: italic;
}

/* Success Modal */
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

.success-modal {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  text-align: center;
}

.success-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  background-color: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
}

.success-modal h2 {
  margin: 0 0 1rem 0;
  color: #333;
}

.sale-id-display {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.sale-total {
  margin: 0.5rem 0 2rem 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #4caf50;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@media (max-width: 1024px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
}

@media print {
  .checkout-header,
  .error-message,
  .customer-section,
  .payment-section {
    display: none;
  }

  .checkout-content {
    display: block;
  }

  .sale-summary {
    box-shadow: none;
  }
}
</style>
