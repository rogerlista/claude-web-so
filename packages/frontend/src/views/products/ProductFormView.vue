<script setup lang="ts">
/**
 * Product Form View - T027
 * TDD Phase: GREEN - Implementation with all required fields
 */

import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "../../presentation/composables/useToast";
import type { CreateProductInput } from "../../stores/products";
import { useProductsStore } from "../../stores/products";
import BaseCard from "../../components/base/BaseCard.vue";
import BaseInput from "../../components/base/BaseInput.vue";
import BaseButton from "../../components/base/BaseButton.vue";

interface Props {
	readonly id?: string;
}

const props = defineProps<Props>();
const route = useRoute();
const router = useRouter();
const productsStore = useProductsStore();
const toast = useToast();

// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signatures
const isEditMode = computed(() => !!props.id || !!route.params["id"]);
const pageTitle = computed(() =>
	isEditMode.value ? "Editar Produto" : "Novo Produto",
);

const origemTributariaOptions = [
	{ value: "0", label: "0 - Nacional" },
	{ value: "1", label: "1 - Estrangeira - Importação direta" },
	{ value: "2", label: "2 - Estrangeira - Adquirida no mercado interno" },
	{ value: "3", label: "3 - Nacional com conteúdo de importação > 40%" },
	{
		value: "4",
		label: "4 - Nacional produzida através de processos produtivos básicos",
	},
	{ value: "5", label: "5 - Nacional com conteúdo de importação <= 40%" },
	{
		value: "6",
		label: "6 - Estrangeira - Importação direta sem similar nacional",
	},
	{
		value: "7",
		label:
			"7 - Estrangeira - Adquirida no mercado interno sem similar nacional",
	},
	{ value: "8", label: "8 - Nacional com conteúdo de importação > 70%" },
];

// Form state
const form = ref<CreateProductInput>({
	sku: "",
	descricao: "",
	preco_unitario: 0,
	status: "ativo",
	gtin: "",
	codigo: "",
	unidade_medida: "UN",
	ncm: "",
	cest: "",
	dun14: "",
	codigo_balanca: "",
	origem_tributaria: "",
	cst: "",
	aliquota_icms: 0,
	preco_promocional_inicio: "",
	preco_promocional_fim: "",
});

const errors = ref<Partial<Record<keyof CreateProductInput, string>>>({});
const isSubmitting = ref(false);

const validateForm = (): boolean => {
	errors.value = {};

	// Basic validations
	if (!form.value.sku.trim()) {
		errors.value.sku = "SKU é obrigatório";
	}

	if (!form.value.descricao.trim()) {
		errors.value.descricao = "Descrição é obrigatório";
	}

	if (form.value.preco_unitario <= 0) {
		errors.value.preco_unitario = "Preço deve ser maior que zero";
	}

	// GTIN validation (8-13 digits)
	if (form.value.gtin?.trim()) {
		if (!/^\d{8,13}$/.test(form.value.gtin)) {
			errors.value.gtin = "GTIN deve ter entre 8 e 13 dígitos";
		}
	}

	// DUN-14 validation (14 digits)
	if (form.value.dun14?.trim()) {
		if (!/^\d{14}$/.test(form.value.dun14)) {
			errors.value.dun14 = "DUN-14 deve ter exatamente 14 dígitos";
		}
	}

	// NCM validation (exactly 8 digits)
	if (form.value.ncm?.trim()) {
		if (!/^\d{8}$/.test(form.value.ncm)) {
			errors.value.ncm = "NCM deve ter exatamente 8 dígitos";
		}
	}

	// CEST validation (exactly 7 digits)
	if (form.value.cest?.trim()) {
		if (!/^\d{7}$/.test(form.value.cest)) {
			errors.value.cest = "CEST deve ter exatamente 7 dígitos";
		}
	}

	// ICMS validation (0-100%)
	if (
		form.value.aliquota_icms !== undefined &&
		form.value.aliquota_icms !== null
	) {
		if (form.value.aliquota_icms < 0 || form.value.aliquota_icms > 100) {
			errors.value.aliquota_icms = "Alíquota ICMS deve estar entre 0 e 100";
		}
	}

	// Promotional price validation
	if (
		form.value.preco_promocional !== undefined &&
		form.value.preco_promocional !== null
	) {
		if (form.value.preco_promocional >= form.value.preco_unitario) {
			errors.value.preco_promocional =
				"Preço promocional deve ser menor que o preço normal";
		}
	}

	// Promotional dates validation
	if (form.value.preco_promocional_inicio && form.value.preco_promocional_fim) {
		const inicio = new Date(form.value.preco_promocional_inicio);
		const fim = new Date(form.value.preco_promocional_fim);

		if (inicio >= fim) {
			errors.value.preco_promocional_fim =
				"Data fim deve ser posterior à data início";
		}
	}

	return Object.keys(errors.value).length === 0;
};

const handleSubmit = async (): Promise<void> => {
	if (!validateForm()) {
		toast.error("Por favor, corrija os erros no formulário");
		return;
	}

	isSubmitting.value = true;

	try {
		if (isEditMode.value) {
			// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signatures
			const productId = props.id || (route.params["id"] as string);
			await productsStore.updateProduct(productId, form.value);

			if (!productsStore.error) {
				toast.success("Produto atualizado com sucesso!");
				await router.push("/products");
			} else {
				toast.error(productsStore.error || "Erro ao atualizar produto");
			}
		} else {
			await productsStore.createProduct(form.value);

			if (!productsStore.error) {
				toast.success("Produto criado com sucesso!");
				await router.push("/products");
			} else {
				toast.error(productsStore.error || "Erro ao criar produto");
			}
		}
	} catch (_error) {
		toast.error("Erro ao salvar produto");
	} finally {
		isSubmitting.value = false;
	}
};

const handleCancel = (): void => {
	router.back();
};

const loadProduct = async (id: string): Promise<void> => {
	const response = await fetch(`http://localhost:3000/api/produtos/${id}`);

	if (response.ok) {
		const data = (await response.json()) as {
			data: CreateProductInput & { id: string };
		};
		form.value = {
			sku: data.data.sku,
			descricao: data.data.descricao,
			preco_unitario: data.data.preco_unitario,
			status: data.data.status,
			...(data.data.gtin && { gtin: data.data.gtin }),
			...(data.data.codigo && { codigo: data.data.codigo }),
			...(data.data.unidade_medida && {
				unidade_medida: data.data.unidade_medida,
			}),
			...(data.data.preco_promocional !== undefined && {
				preco_promocional: data.data.preco_promocional,
			}),
			...(data.data.ncm && { ncm: data.data.ncm }),
			...(data.data.cest && { cest: data.data.cest }),
			...(data.data.dun14 && { dun14: data.data.dun14 }),
			...(data.data.codigo_balanca && {
				codigo_balanca: data.data.codigo_balanca,
			}),
			...(data.data.origem_tributaria && {
				origem_tributaria: data.data.origem_tributaria,
			}),
			...(data.data.cst && { cst: data.data.cst }),
			...(data.data.aliquota_icms !== undefined && {
				aliquota_icms: data.data.aliquota_icms,
			}),
			...(data.data.preco_promocional_inicio && {
				preco_promocional_inicio: data.data.preco_promocional_inicio,
			}),
			...(data.data.preco_promocional_fim && {
				preco_promocional_fim: data.data.preco_promocional_fim,
			}),
		};
	}
};

onMounted(() => {
	if (isEditMode.value) {
		// biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signatures
		const productId = props.id || (route.params["id"] as string);
		if (productId) {
			loadProduct(productId);
		}
	}
});
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
              :error="errors.preco_promocional"
            />
            <span v-if="errors.preco_promocional" class="error-message">{{
              errors.preco_promocional
            }}</span>
          </div>

          <div class="form-group">
            <label for="preco_promocional_inicio">Início da Promoção</label>
            <BaseInput
              id="preco_promocional_inicio"
              v-model="form.preco_promocional_inicio"
              name="preco_promocional_inicio"
              type="date"
              :error="errors.preco_promocional_inicio"
            />
            <span v-if="errors.preco_promocional_inicio" class="error-message">{{
              errors.preco_promocional_inicio
            }}</span>
          </div>

          <div class="form-group">
            <label for="preco_promocional_fim">Fim da Promoção</label>
            <BaseInput
              id="preco_promocional_fim"
              v-model="form.preco_promocional_fim"
              name="preco_promocional_fim"
              type="date"
              :error="errors.preco_promocional_fim"
            />
            <span v-if="errors.preco_promocional_fim" class="error-message">{{
              errors.preco_promocional_fim
            }}</span>
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
              maxlength="13"
              :error="errors.gtin"
            />
            <span v-if="errors.gtin" class="error-message">{{ errors.gtin }}</span>
          </div>

          <div class="form-group">
            <label for="dun14">DUN-14</label>
            <BaseInput
              id="dun14"
              v-model="form.dun14"
              name="dun14"
              type="text"
              placeholder="Digite o código DUN-14 (14 dígitos)"
              maxlength="14"
              :error="errors.dun14"
            />
            <span v-if="errors.dun14" class="error-message">{{ errors.dun14 }}</span>
          </div>

          <div class="form-group">
            <label for="codigo_balanca">Código de Balança</label>
            <BaseInput
              id="codigo_balanca"
              v-model="form.codigo_balanca"
              name="codigo_balanca"
              type="text"
              placeholder="Digite o código de balança"
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
              maxlength="8"
              :error="errors.ncm"
            />
            <span v-if="errors.ncm" class="error-message">{{ errors.ncm }}</span>
          </div>

          <div class="form-group">
            <label for="cest">CEST</label>
            <BaseInput
              id="cest"
              v-model="form.cest"
              name="cest"
              type="text"
              placeholder="Ex: 1234567"
              maxlength="7"
              :error="errors.cest"
            />
            <span v-if="errors.cest" class="error-message">{{ errors.cest }}</span>
          </div>

          <div class="form-group">
            <label for="origem_tributaria">Origem Tributária</label>
            <select
              id="origem_tributaria"
              v-model="form.origem_tributaria"
              name="origem_tributaria"
            >
              <option value="">Selecione...</option>
              <option
                v-for="option in origemTributariaOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="cst">CST</label>
            <BaseInput
              id="cst"
              v-model="form.cst"
              name="cst"
              type="text"
              placeholder="Ex: 00"
            />
          </div>

          <div class="form-group">
            <label for="aliquota_icms">Alíquota ICMS (%)</label>
            <BaseInput
              id="aliquota_icms"
              v-model.number="form.aliquota_icms"
              name="aliquota_icms"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="0.00"
              :error="errors.aliquota_icms"
            />
            <span v-if="errors.aliquota_icms" class="error-message">{{
              errors.aliquota_icms
            }}</span>
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
