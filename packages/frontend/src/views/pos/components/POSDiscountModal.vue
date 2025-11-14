<template>
  <div class="modal-overlay" @click.self="handleClose">
    <div class="modal">
      <div class="modal-header">
        <h3>Aplicar Desconto</h3>
        <button class="close-button" @click="handleClose">×</button>
      </div>

      <div class="modal-body">
        <div class="discount-info">
          <div class="info-row">
            <span class="label">Desconto Atual:</span>
            <span class="value">{{ formatCurrency(currentDiscount) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Valor Máximo:</span>
            <span class="value">{{ formatCurrency(maxDiscount) }}</span>
          </div>
        </div>

        <div class="discount-types">
          <button
            :class="['type-button', { active: discountType === 'value' }]"
            @click="discountType = 'value'"
          >
            Valor (R$)
          </button>
          <button
            :class="['type-button', { active: discountType === 'percentage' }]"
            @click="discountType = 'percentage'"
          >
            Percentual (%)
          </button>
        </div>

        <div class="form-group">
          <label for="discount-input">
            {{ discountType === 'value' ? 'Valor do Desconto (R$)' : 'Percentual do Desconto (%)' }}
          </label>
          <input
            id="discount-input"
            v-model.number="discountInput"
            type="number"
            class="form-control"
            :placeholder="discountType === 'value' ? '0,00' : '0'"
            :min="0"
            :max="discountType === 'value' ? maxDiscount : 100"
            :step="discountType === 'value' ? 0.01 : 1"
            autofocus
            @keyup.enter="handleApply"
          />
        </div>

        <div v-if="calculatedDiscount > 0" class="calculated-discount">
          <div class="info-row">
            <span class="label">Desconto calculado:</span>
            <span class="value highlight">{{ formatCurrency(calculatedDiscount) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Novo total:</span>
            <span class="value highlight">{{ formatCurrency(maxDiscount - calculatedDiscount) }}</span>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>

      <div class="modal-actions">
        <BaseButton variant="secondary" @click="handleClose">
          Cancelar
        </BaseButton>
        <BaseButton
          variant="primary"
          :disabled="!isValid"
          @click="handleApply"
        >
          Aplicar Desconto
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * POSDiscountModal - Discount Modal Component
 * Phase 6: T040 - Aplicação de descontos
 */

import { computed, ref } from "vue";

interface Props {
	currentDiscount: number;
	maxDiscount: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	apply: [discount: number];
	close: [];
}>();

const discountType = ref<"value" | "percentage">("value");
const discountInput = ref<number>(0);
const errorMessage = ref("");

const calculatedDiscount = computed(() => {
	if (discountInput.value <= 0) {
		return 0;
	}

	if (discountType.value === "value") {
		return discountInput.value;
	}

	// Percentage
	return (props.maxDiscount * discountInput.value) / 100;
});

const isValid = computed(() => {
	if (discountInput.value <= 0) {
		errorMessage.value = "";
		return false;
	}

	if (discountType.value === "percentage" && discountInput.value > 100) {
		errorMessage.value = "Percentual não pode ser maior que 100%";
		return false;
	}

	if (calculatedDiscount.value > props.maxDiscount) {
		errorMessage.value = "Desconto não pode ser maior que o valor total";
		return false;
	}

	errorMessage.value = "";
	return true;
});

const formatCurrency = (value: number): string => {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
};

const handleApply = (): void => {
	if (isValid.value) {
		emit("apply", calculatedDiscount.value);
	}
};

const handleClose = (): void => {
	emit("close");
};
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

.discount-info {
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.info-row .label {
  font-weight: 500;
  color: #666;
}

.info-row .value {
  font-weight: 600;
  color: #333;
}

.info-row .value.highlight {
  color: #f44336;
  font-size: 1.1rem;
}

.discount-types {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.type-button {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.type-button:hover {
  border-color: #2196f3;
}

.type-button.active {
  background-color: #2196f3;
  border-color: #2196f3;
  color: white;
}

.calculated-discount {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #fff3e0;
  border-left: 4px solid #ff9800;
  border-radius: 4px;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
  justify-content: flex-end;
}
</style>
