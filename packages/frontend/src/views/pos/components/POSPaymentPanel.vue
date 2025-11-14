<template>
  <div class="pos-payment-panel">
    <h2>Pagamento</h2>

    <!-- Payment Summary -->
    <div class="payment-summary">
      <div class="summary-row">
        <span class="label">Total da Venda:</span>
        <span class="value">{{ formatCurrency(total) }}</span>
      </div>
      <div class="summary-row paid">
        <span class="label">Valor Pago:</span>
        <span class="value">{{ formatCurrency(paidAmount) }}</span>
      </div>
      <div class="summary-row remaining" :class="{ complete: isFullyPaid }">
        <span class="label">{{ isFullyPaid ? 'Troco:' : 'Restante:' }}</span>
        <span class="value">{{ formatCurrency(Math.abs(remainingAmount)) }}</span>
      </div>
    </div>

    <!-- Payment List -->
    <div v-if="payments.length > 0" class="payments-list">
      <h3>Pagamentos Registrados</h3>
      <div
        v-for="(payment, index) in payments"
        :key="index"
        class="payment-item"
      >
        <span class="payment-method">{{ payment.paymentMethod.description }}</span>
        <span class="payment-amount">{{ formatCurrency(payment.amount) }}</span>
      </div>
    </div>

    <!-- Add Payment Form -->
    <div class="add-payment-form">
      <h3>Adicionar Pagamento</h3>

      <div class="form-group">
        <label for="payment-method">Forma de Pagamento</label>
        <select
          id="payment-method"
          v-model="selectedPaymentMethod"
          class="form-control"
          :disabled="isFullyPaid"
        >
          <option value="">Selecione...</option>
          <option
            v-for="method in PAYMENT_METHODS"
            :key="method.code"
            :value="method.code"
          >
            {{ method.description }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="payment-amount">Valor</label>
        <div class="amount-input-group">
          <input
            id="payment-amount"
            v-model.number="paymentAmount"
            type="number"
            class="form-control"
            placeholder="0,00"
            :min="0"
            :step="0.01"
            :disabled="isFullyPaid"
            @keyup.enter="handleAddPayment"
          />
          <button
            class="quick-amount-btn"
            :disabled="isFullyPaid"
            @click="paymentAmount = remainingAmount"
          >
            Restante
          </button>
        </div>
      </div>

      <div class="form-actions">
        <BaseButton
          variant="primary"
          :disabled="!canAddPayment"
          @click="handleAddPayment"
        >
          Adicionar Pagamento
        </BaseButton>
      </div>
    </div>

    <!-- Complete Sale Button -->
    <div class="complete-section">
      <BaseButton
        variant="primary"
        size="lg"
        :disabled="!isFullyPaid"
        @click="handleComplete"
      >
        {{ isFullyPaid ? 'Finalizar Venda ✓' : 'Pagamento Incompleto' }}
      </BaseButton>

      <p v-if="!isFullyPaid" class="help-text">
        Complete o pagamento para finalizar a venda
      </p>
      <p v-else class="help-text success">
        Pagamento completo! Clique para finalizar
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * POSPaymentPanel - Payment Management Panel
 * Phase 6: T043 - Seleção de métodos de pagamento
 */

import { computed, ref } from "vue";
import type { SalePayment } from "../../../stores/sales";

interface Props {
	payments: readonly SalePayment[];
	total: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	"add-payment": [paymentMethodCode: string, amount: number];
	complete: [];
}>();

const PAYMENT_METHODS = [
	{ code: "01", description: "Dinheiro" },
	{ code: "03", description: "Cartão de Crédito" },
	{ code: "04", description: "Cartão de Débito" },
	{ code: "05", description: "Crédito Loja" },
	{ code: "10", description: "Vale Alimentação" },
	{ code: "11", description: "Vale Refeição" },
	{ code: "12", description: "Vale Presente" },
	{ code: "13", description: "Vale Combustível" },
	{ code: "15", description: "Boleto Bancário" },
	{ code: "17", description: "PIX" },
	{ code: "99", description: "Outros" },
] as const;

const selectedPaymentMethod = ref("");
const paymentAmount = ref<number>(0);

const paidAmount = computed(() => {
	return props.payments.reduce((sum, payment) => sum + payment.amount, 0);
});

const remainingAmount = computed(() => {
	return props.total - paidAmount.value;
});

const isFullyPaid = computed(() => {
	return paidAmount.value >= props.total;
});

const canAddPayment = computed(() => {
	return (
		selectedPaymentMethod.value !== "" &&
		paymentAmount.value > 0 &&
		!isFullyPaid.value
	);
});

const formatCurrency = (value: number): string => {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
};

const handleAddPayment = (): void => {
	if (canAddPayment.value) {
		emit("add-payment", selectedPaymentMethod.value, paymentAmount.value);

		// Reset form
		selectedPaymentMethod.value = "";
		paymentAmount.value = 0;
	}
};

const handleComplete = (): void => {
	if (isFullyPaid.value) {
		emit("complete");
	}
};
</script>

<style scoped>
.pos-payment-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.pos-payment-panel h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.pos-payment-panel h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #666;
}

.payment-summary {
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 1rem;
}

.summary-row.paid {
  color: #4caf50;
}

.summary-row.remaining {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 2px solid #ddd;
  font-size: 1.3rem;
  font-weight: bold;
  color: #f44336;
}

.summary-row.remaining.complete {
  color: #4caf50;
}

.summary-row .label {
  font-weight: 500;
}

.summary-row .value {
  font-weight: 600;
}

.payments-list {
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.payment-item:last-child {
  margin-bottom: 0;
}

.payment-method {
  font-weight: 500;
  color: #333;
}

.payment-amount {
  font-weight: 600;
  color: #4caf50;
}

.add-payment-form {
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 2px dashed #ddd;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group:last-child {
  margin-bottom: 0;
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

.form-control:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.amount-input-group {
  display: flex;
  gap: 0.5rem;
}

.amount-input-group input {
  flex: 1;
}

.quick-amount-btn {
  padding: 0.75rem 1rem;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.quick-amount-btn:hover:not(:disabled) {
  background-color: #1976d2;
}

.quick-amount-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.form-actions {
  margin-top: 1rem;
}

.complete-section {
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  text-align: center;
}

.help-text {
  margin: 1rem 0 0 0;
  font-size: 0.9rem;
  color: #999;
}

.help-text.success {
  color: #4caf50;
  font-weight: 500;
}
</style>
