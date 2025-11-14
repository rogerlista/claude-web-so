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
          <div class="total-line total">
            <span>Total:</span>
            <span>{{ formatCurrency(sale.netTotal) }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Section -->
      <div class="payment-section">
        <POSPaymentPanel
          :payments="sale.payments"
          :total="sale.netTotal"
          @add-payment="handleAddPayment"
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

import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../../components/base/BaseButton.vue'
import { useSalesStore } from '../../stores/sales'
import POSPaymentPanel from './components/POSPaymentPanel.vue'

const route = useRoute()
const router = useRouter()
const salesStore = useSalesStore()

const saleId = computed(() => route.params.id as string)
const sale = computed(() => salesStore.currentSale)
const showSuccessModal = ref(false)

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const handleBack = (): void => {
  router.push('/pos')
}

const handleAddPayment = async (paymentMethodCode: string, amount: number): Promise<void> => {
  await salesStore.addPayment(paymentMethodCode, amount)
}

const handleComplete = async (): Promise<void> => {
  const success = await salesStore.finalizeSale()
  if (success) {
    showSuccessModal.value = true
  }
}

const handlePrintReceipt = (): void => {
  // TODO: Implement receipt printing
  window.print()
}

const handleNewSale = async (): Promise<void> => {
  salesStore.clearSale()
  await router.push('/pos')
}

onMounted(async () => {
  // Load sale if not in store
  if (!sale.value || sale.value.id !== saleId.value) {
    await salesStore.getSale(saleId.value)
  }
})
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
.payment-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  height: fit-content;
}

.sale-summary h2,
.payment-section h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.2rem;
  color: #333;
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

.total-line.total {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 2px solid #333;
  font-size: 1.5rem;
  font-weight: bold;
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
