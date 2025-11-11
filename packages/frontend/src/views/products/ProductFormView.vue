<script setup lang="ts">
/**
 * Product Form View - T027
 * TDD Phase: GREEN - Implementation to pass tests
 */

import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseInput from '../../components/base/BaseInput.vue'
import type { CreateProductInput } from '../../stores/products'
import { useProductsStore } from '../../stores/products'

interface Props {
  readonly id?: string
}

const props = defineProps<Props>()
const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()

const isEditMode = computed(() => !!props.id || !!route.params.id)
const pageTitle = computed(() => (isEditMode.value ? 'Editar Produto' : 'Novo Produto'))

// Form state
const form = ref<CreateProductInput>({
  sku: '',
  descricao: '',
  preco_unitario: 0,
  status: 'ativo',
  gtin: '',
  codigo: '',
  unidade_medida: 'UN',
  ncm: '',
  cest: '',
})

const errors = ref<Partial<Record<keyof CreateProductInput, string>>>({})
const isSubmitting = ref(false)

const validateForm = (): boolean => {
  errors.value = {}

  if (!form.value.sku.trim()) {
    errors.value.sku = 'SKU é obrigatório'
  }

  if (!form.value.descricao.trim()) {
    errors.value.descricao = 'Descrição é obrigatório'
  }

  if (form.value.preco_unitario <= 0) {
    errors.value.preco_unitario = 'Preço deve ser maior que zero'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    if (isEditMode.value) {
      const productId = props.id || (route.params.id as string)
      await productsStore.updateProduct(productId, form.value)
    } else {
      await productsStore.createProduct(form.value)
    }

    if (!productsStore.error) {
      await router.push('/products')
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = (): void => {
  router.back()
}

const loadProduct = async (id: string): Promise<void> => {
  const response = await fetch(`http://localhost:3000/api/produtos/${id}`)

  if (response.ok) {
    const data = (await response.json()) as { data: CreateProductInput & { id: string } }
    form.value = {
      sku: data.data.sku,
      descricao: data.data.descricao,
      preco_unitario: data.data.preco_unitario,
      status: data.data.status,
      ...(data.data.gtin && { gtin: data.data.gtin }),
      ...(data.data.codigo && { codigo: data.data.codigo }),
      ...(data.data.unidade_medida && { unidade_medida: data.data.unidade_medida }),
      ...(data.data.preco_promocional !== undefined && {
        preco_promocional: data.data.preco_promocional,
      }),
      ...(data.data.ncm && { ncm: data.data.ncm }),
      ...(data.data.cest && { cest: data.data.cest }),
    }
  }
}

onMounted(() => {
  if (isEditMode.value) {
    const productId = props.id || (route.params.id as string)
    if (productId) {
      loadProduct(productId)
    }
  }
})
</script>

<template>
  <div class="product-form-view">
    <div class="header">
      <h1>{{ pageTitle }}</h1>
      <p class="subtitle">Preencha os dados do produto</p>
    </div>

    <form @submit.prevent="handleSubmit">
      <!-- Basic Information Section -->
      <BaseCard title="Informações Básicas" elevation="md" class="form-section">
        <div class="form-grid">
          <div class="form-group">
            <label for="sku">SKU *</label>
            <BaseInput
              id="sku"
              v-model="form.sku"
              name="sku"
              type="text"
              placeholder="Ex: PROD001"
              :error="errors.sku"
            />
            <span v-if="errors.sku" class="error-message">{{ errors.sku }}</span>
          </div>

          <div class="form-group">
            <label for="descricao">Descrição *</label>
            <BaseInput
              id="descricao"
              v-model="form.descricao"
              name="descricao"
              type="text"
              placeholder="Ex: Produto de exemplo"
              :error="errors.descricao"
            />
            <span v-if="errors.descricao" class="error-message">{{ errors.descricao }}</span>
          </div>

          <div class="form-group">
            <label for="unidade_medida">Unidade de Medida</label>
            <select id="unidade_medida" v-model="form.unidade_medida" name="unidade_medida">
              <option value="UN">Unidade (UN)</option>
              <option value="KG">Quilograma (KG)</option>
              <option value="LT">Litro (LT)</option>
              <option value="MT">Metro (MT)</option>
              <option value="CX">Caixa (CX)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="status">Status *</label>
            <select id="status" v-model="form.status" name="status">
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
      </BaseCard>

      <!-- Prices Section -->
      <BaseCard title="Preços" elevation="md" class="form-section">
        <div class="form-grid">
          <div class="form-group">
            <label for="preco_unitario">Preço Unitário *</label>
            <BaseInput
              id="preco_unitario"
              v-model.number="form.preco_unitario"
              name="preco_unitario"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              :error="errors.preco_unitario"
            />
            <span v-if="errors.preco_unitario" class="error-message">{{
              errors.preco_unitario
            }}</span>
          </div>

          <div class="form-group">
            <label for="preco_promocional">Preço Promocional</label>
            <BaseInput
              id="preco_promocional"
              v-model.number="form.preco_promocional"
              name="preco_promocional"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
        </div>
      </BaseCard>

      <!-- Codes Section -->
      <BaseCard title="Códigos" elevation="md" class="form-section">
        <div class="form-grid">
          <div class="form-group">
            <label for="codigo">Código Interno</label>
            <BaseInput
              id="codigo"
              v-model="form.codigo"
              name="codigo"
              type="text"
              placeholder="Código interno do produto"
            />
          </div>

          <div class="form-group">
            <label for="gtin">GTIN/EAN</label>
            <BaseInput
              id="gtin"
              v-model="form.gtin"
              name="gtin"
              type="text"
              placeholder="Ex: 7891234567890"
            />
          </div>
        </div>
      </BaseCard>

      <!-- Fiscal Information Section -->
      <BaseCard title="Informações Fiscais" elevation="md" class="form-section">
        <div class="form-grid">
          <div class="form-group">
            <label for="ncm">NCM</label>
            <BaseInput
              id="ncm"
              v-model="form.ncm"
              name="ncm"
              type="text"
              placeholder="Ex: 12345678"
            />
          </div>

          <div class="form-group">
            <label for="cest">CEST</label>
            <BaseInput
              id="cest"
              v-model="form.cest"
              name="cest"
              type="text"
              placeholder="Ex: 1234567"
            />
          </div>
        </div>
      </BaseCard>

      <!-- Actions -->
      <div class="form-actions">
        <BaseButton
          data-testid="cancel-button"
          type="button"
          variant="secondary"
          size="md"
          :disabled="isSubmitting"
          @click="handleCancel"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          data-testid="save-button"
          type="submit"
          variant="primary"
          size="md"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Salvando...' : 'Salvar Produto' }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.product-form-view {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-6);
}

.header {
  margin-bottom: var(--space-6);
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

.form-section {
  margin-bottom: var(--space-6);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  color: var(--text-primary);
  background: var(--bg-primary);
  transition: border-color 0.15s ease;
}

select:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-message {
  font-size: var(--text-xs);
  color: var(--error-600);
  margin-top: var(--space-1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }
}
</style>
