# ⚠️ PROBLEMAS IMPORTANTES - MELHORIAS NECESSÁRIAS

**Data:** 2025-11-14
**Total:** 9 problemas importantes identificados

Estes problemas **não bloqueiam produção** mas limitam funcionalidades e devem ser corrigidos antes do release.

---

## 1. Formulário de Produto Incompleto

**Fase:** 4 - Módulo de Produtos
**Tarefa:** T027
**Prioridade:** ⚠️ ALTA
**Impacto:** Campos obrigatórios faltando
**Completude:** 75%
**Estimativa:** 6-8 horas

### Descrição
Formulário de cadastro de produto não tem todos os campos especificados.

### Campos Faltando:

#### Seção de Códigos:
- [ ] **DUN-14** (14 dígitos)
- [ ] **Código de Balança** (texto)

#### Seção Fiscal:
- [ ] **Origem Tributária** (select com opções 0-8)
  - 0 - Nacional
  - 1 - Estrangeira - Importação direta
  - 2 - Estrangeira - Adquirida no mercado interno
  - 3 - Nacional com conteúdo de importação > 40%
  - 4 - Nacional produzida através de processos produtivos básicos
  - 5 - Nacional com conteúdo de importação <= 40%
  - 6 - Estrangeira - Importação direta sem similar nacional
  - 7 - Estrangeira - Adquirida no mercado interno sem similar nacional
  - 8 - Nacional com conteúdo de importação > 70%

- [ ] **Tributação/CST** (select ou input text)
- [ ] **Alíquota ICMS** (número 0-100%)

#### Seção de Preços:
- [ ] **Data Início Promoção** (date input)
- [ ] **Data Fim Promoção** (date input)
- [ ] **Validação:** início < fim

### Validações Client-Side Faltando:
- [ ] GTIN: validar check digit
- [ ] NCM: validar exatamente 8 dígitos
- [ ] CEST: validar exatamente 7 dígitos
- [ ] Preço promocional: validar que é menor que preço normal

### Feedback Visual:
- [ ] Toast de sucesso após salvar
- [ ] Toast de erro se falhar
- [ ] Mensagens de erro da API exibidas

### Arquivo Afetado:
- `packages/frontend/src/views/products/ProductFormView.vue`

### Como Implementar:

```vue
<!-- Adicionar na seção de códigos -->
<div class="form-group">
  <BaseInput
    v-model="form.dun14"
    label="DUN-14"
    type="text"
    placeholder="Digite o código DUN-14 (14 dígitos)"
    maxlength="14"
    :error="errors.dun14"
  />
</div>

<div class="form-group">
  <BaseInput
    v-model="form.codigoBalanca"
    label="Código de Balança"
    type="text"
    placeholder="Digite o código de balança"
    :error="errors.codigoBalanca"
  />
</div>

<!-- Adicionar na seção fiscal -->
<div class="form-group">
  <BaseSelect
    v-model="form.origemTributaria"
    label="Origem Tributária"
    :options="origemTributariaOptions"
    :error="errors.origemTributaria"
  />
</div>

<div class="form-group">
  <BaseInput
    v-model="form.aliquotaIcms"
    label="Alíquota ICMS (%)"
    type="number"
    min="0"
    max="100"
    step="0.01"
    :error="errors.aliquotaIcms"
  />
</div>

<!-- Adicionar na seção de preços -->
<div class="form-group">
  <BaseInput
    v-model="form.precoPromocionalInicio"
    label="Início da Promoção"
    type="date"
    :error="errors.precoPromocionalInicio"
  />
</div>

<div class="form-group">
  <BaseInput
    v-model="form.precoPromocionalFim"
    label="Fim da Promoção"
    type="date"
    :error="errors.precoPromocionalFim"
  />
</div>
```

### Critérios de Aceite:
- [ ] Todos os campos adicionados
- [ ] Validações client-side funcionando
- [ ] Dados enviados para API corretamente
- [ ] Toast de sucesso/erro implementado
- [ ] Testes atualizados

---

## 2. Busca Inteligente Incompleta

**Fase:** 4 - Módulo de Produtos
**Tarefa:** T025
**Prioridade:** ⚠️ MÉDIA
**Impacto:** Busca limitada
**Completude:** 60%
**Estimativa:** 10-12 horas

### Descrição
Busca de produtos não implementa fuzzy search e faltam campos de busca.

### Features Faltando:

#### 1. Busca por DUN-14 e Código de Balança
**Arquivo:** `packages/backend/src/infrastructure/repositories/product-repository-drizzle.ts`

```typescript
// Adicionar no método search (linha ~340)
const searchPattern = `%${query}%`;

const results = await this.db
  .select()
  .from(products)
  .where(
    or(
      like(products.description, searchPattern),
      like(products.sku, searchPattern),
      like(products.gtin, searchPattern),
      like(products.dun14, searchPattern),          // ADICIONAR
      like(products.codigoBalanca, searchPattern),  // ADICIONAR
    ),
  );
```

#### 2. Índices de Performance
**Arquivo:** `packages/backend/src/infrastructure/database/schema.ts`

```typescript
export const products = sqliteTable("products", {
  // ... campos existentes
}, (table) => ({
  skuIdx: index("products_sku_idx").on(table.sku),
  gtinIdx: index("products_gtin_idx").on(table.gtin),
  descriptionIdx: index("products_description_idx").on(table.description),
  dun14Idx: index("products_dun14_idx").on(table.dun14),
  codigoBalancaIdx: index("products_balanca_idx").on(table.codigoBalanca),
}));
```

Gerar nova migration após alteração.

#### 3. Fuzzy Search (Opcional - Prioridade Baixa)
Implementar algoritmo de similaridade (Levenshtein Distance) para tolerar erros de digitação.

**Biblioteca recomendada:** `fuse.js` ou implementação custom

```typescript
import Fuse from 'fuse.js';

const fuse = new Fuse(products, {
  keys: ['description', 'sku', 'gtin'],
  threshold: 0.3,
  includeScore: true,
});

const results = fuse.search(query);
```

#### 4. Ordenação por Relevância
Priorizar matches exatos sobre parciais:
- Exact match em SKU/GTIN: score 100
- Exact match em descrição: score 90
- Partial match início: score 70
- Partial match meio: score 50

### Critérios de Aceite:
- [ ] Busca por DUN-14 implementada
- [ ] Busca por Código de Balança implementada
- [ ] Índices criados no banco
- [ ] Performance < 100ms com 1000+ produtos
- [ ] Testes cobrem todos os campos de busca

---

## 3. Endpoint de Acréscimo Faltando

**Fase:** 6 - Módulo de PDV
**Tarefa:** T033
**Prioridade:** ⚠️ MÉDIA
**Impacto:** Não pode aplicar acréscimo durante venda
**Estimativa:** 3 horas

### Descrição
Não existe endpoint dedicado para aplicar acréscimo em venda. Campo `addition` existe mas só pode ser definido na criação.

### O que Implementar:

#### Backend
**Arquivo:** `packages/backend/src/presentation/routes/sale-routes.ts`

```typescript
// Adicionar endpoint
app.post("/api/vendas/:id/surcharge", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  if (typeof body.amount !== 'number' || body.amount < 0) {
    return c.json({ error: 'Invalid surcharge amount' }, 400);
  }

  const result = await applySaleSurcharge({
    saleId: id,
    amount: body.amount,
  });

  if (!result.ok) {
    return c.json({ error: result.error }, 400);
  }

  return c.json(result.value, 200);
});
```

**Criar Use Case:**
`packages/backend/src/application/use-cases/apply-sale-surcharge.ts`

```typescript
export type ApplySaleSurcharge = (deps: Dependencies) => (input: {
  readonly saleId: SaleId;
  readonly amount: number;
}) => Promise<Result<Sale, string>>;

export const applySaleSurcharge: ApplySaleSurcharge = ({ repository }) => async (input) => {
  // 1. Buscar venda
  const saleResult = await repository.findById(input.saleId);
  if (!saleResult.ok) return saleResult;

  const sale = saleResult.value;

  // 2. Validar status
  if (sale.status !== 'PENDING') {
    return ResultUtils.err('Cannot apply surcharge to non-pending sale');
  }

  // 3. Aplicar acréscimo
  const updatedSale = {
    ...sale,
    addition: input.amount,
    netTotal: sale.grossTotal - sale.discount + input.amount,
  };

  // 4. Salvar
  return repository.save(updatedSale);
};
```

#### Frontend
**Arquivo:** `packages/frontend/src/views/pos/POSView.vue`

Adicionar botão "Acréscimo" similar ao botão "Desconto".

### Critérios de Aceite:
- [ ] Endpoint POST /api/vendas/:id/surcharge criado
- [ ] Use case criado e testado
- [ ] Frontend tem botão/modal para acréscimo
- [ ] Testes cobrem aplicação de acréscimo

---

## 4. Remover Pagamento Individual

**Fase:** 6 - Módulo de PDV
**Tarefa:** T042
**Prioridade:** ⚠️ MÉDIA
**Impacto:** Não pode desfazer pagamento específico
**Estimativa:** 2 horas

### Descrição
Componente POSPaymentPanel não tem botão para remover pagamento individual da lista.

### Arquivo Afetado:
- `packages/frontend/src/views/pos/components/POSPaymentPanel.vue`

### Como Implementar:

```vue
<!-- Adicionar botão X em cada item da lista -->
<div v-for="(payment, index) in payments" :key="index" class="payment-item">
  <span class="payment-method">{{ getPaymentMethodLabel(payment.method) }}</span>
  <span class="payment-amount">{{ formatCurrency(payment.amount) }}</span>
  <button
    type="button"
    class="btn-remove"
    aria-label="Remover pagamento"
    @click="removePayment(index)"
  >
    ✕
  </button>
</div>
```

```typescript
const removePayment = (index: number) => {
  // Remover da store
  salesStore.removePayment(currentSaleId.value, index);
};
```

**Backend:** Criar endpoint DELETE `/api/vendas/:id/payments/:paymentId`

### Critérios de Aceite:
- [ ] Botão de remover em cada pagamento
- [ ] Endpoint DELETE criado
- [ ] Store atualizada
- [ ] Testes cobrem remoção

---

## 5. Desconto/Acréscimo Durante Checkout

**Fase:** 6 - Módulo de PDV
**Tarefa:** T041
**Prioridade:** ⚠️ MÉDIA
**Impacto:** Fluxo menos flexível
**Estimativa:** 4 horas

### Descrição
Desconto só pode ser aplicado na tela principal (POSView), não na finalização (POSCheckoutView).

### Arquivo Afetado:
- `packages/frontend/src/views/pos/POSCheckoutView.vue`

### Como Implementar:

```vue
<!-- Adicionar seção de desconto/acréscimo -->
<div class="adjustment-section">
  <h3>Ajustes</h3>

  <div class="form-group">
    <label>Desconto</label>
    <div class="input-group">
      <BaseInput
        v-model.number="discountPercent"
        type="number"
        placeholder="% desconto"
        min="0"
        max="100"
        @input="applyDiscountPercent"
      />
      <span>ou</span>
      <BaseInput
        v-model.number="discountAmount"
        type="number"
        placeholder="R$ valor"
        min="0"
        :max="sale.grossTotal"
        @input="applyDiscountAmount"
      />
    </div>
  </div>

  <div class="form-group">
    <label>Acréscimo</label>
    <BaseInput
      v-model.number="surchargeAmount"
      type="number"
      placeholder="R$ valor"
      min="0"
      @input="applySurcharge"
    />
  </div>
</div>
```

### Critérios de Aceite:
- [ ] Inputs de desconto % e R$ na finalização
- [ ] Input de acréscimo na finalização
- [ ] Recalcula total automaticamente
- [ ] Chama APIs corretas

---

## 6. PWA Assets Faltantes

**Fase:** 1 - Setup e Infraestrutura Base
**Tarefa:** T003
**Prioridade:** ⚠️ BAIXA
**Impacto:** PWA incompleto
**Estimativa:** 1-2 horas

### Descrição
Diretório `public/` e assets PWA não existem.

### O que Criar:

```
packages/frontend/public/
├── favicon.ico
├── robots.txt
├── apple-touch-icon.png (180x180)
├── pwa-192x192.png
├── pwa-512x512.png
└── manifest.webmanifest (opcional - vite gera)
```

### Gerar Ícones:
Usar ferramenta: https://realfavicongenerator.net/

### robots.txt:
```
User-agent: *
Allow: /
```

### Critérios de Aceite:
- [ ] Diretório public/ criado
- [ ] Todos os ícones gerados
- [ ] PWA passa no Lighthouse
- [ ] Install prompt funciona

---

## 7. Status de Conexão Visual

**Fase:** 6 - Módulo de PDV
**Tarefa:** T039
**Prioridade:** ⚠️ BAIXA
**Impacto:** UX - usuário não sabe se está offline
**Estimativa:** 2 horas

### Descrição
Não há indicador visual de status de conexão (online/offline) no header.

### Arquivo Afetado:
- `packages/frontend/src/components/layout/AppHeader.vue`

### Como Implementar:

```vue
<template>
  <header class="app-header">
    <!-- ... conteúdo existente -->

    <div class="connection-status" :class="{ offline: !isOnline }">
      <span class="status-icon">{{ isOnline ? '🟢' : '🔴' }}</span>
      <span class="status-text">{{ isOnline ? 'Online' : 'Offline' }}</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isOnline = ref(navigator.onLine);

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
};

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>
```

### Critérios de Aceite:
- [ ] Indicador exibido no header
- [ ] Muda de online para offline automaticamente
- [ ] Visual claro (verde/vermelho)
- [ ] Responsivo

---

## 8. Paginação no Frontend

**Fase:** 4 - Módulo de Produtos
**Tarefa:** T026
**Prioridade:** ⚠️ BAIXA
**Impacto:** Performance com muitos produtos
**Estimativa:** 4 horas

### Descrição
Backend suporta paginação mas frontend não renderiza controles.

### Arquivo Afetado:
- `packages/frontend/src/views/products/ProductListView.vue`

### Como Implementar:

```vue
<!-- Adicionar componente de paginação -->
<div class="pagination">
  <button
    :disabled="currentPage === 1"
    @click="goToPage(currentPage - 1)"
  >
    Anterior
  </button>

  <span>Página {{ currentPage }} de {{ totalPages }}</span>

  <button
    :disabled="currentPage === totalPages"
    @click="goToPage(currentPage + 1)"
  >
    Próxima
  </button>

  <select v-model.number="pageSize" @change="fetchProducts">
    <option :value="10">10 por página</option>
    <option :value="25">25 por página</option>
    <option :value="50">50 por página</option>
    <option :value="100">100 por página</option>
  </select>
</div>
```

```typescript
const currentPage = ref(1);
const pageSize = ref(25);
const totalItems = ref(0);

const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value));

const goToPage = (page: number) => {
  currentPage.value = page;
  fetchProducts();
};

const fetchProducts = async () => {
  const response = await productsStore.fetchProducts({
    page: currentPage.value,
    pageSize: pageSize.value,
  });

  totalItems.value = response.total;
};
```

### Critérios de Aceite:
- [ ] Controles de paginação renderizados
- [ ] Navegação entre páginas funcional
- [ ] Seleção de itens por página
- [ ] Total de registros exibido

---

## 9. Feedback de Sucesso/Erro (Toasts)

**Fase:** 4 e 6
**Tarefas:** T027, vários
**Prioridade:** ⚠️ MÉDIA
**Impacto:** UX - usuário não sabe se ação foi bem-sucedida
**Estimativa:** 6 horas

### Descrição
Não há sistema de notificações toast para feedback de ações.

### O que Implementar:

#### 1. Criar Componente Toast
**Arquivo:** `packages/frontend/src/components/base/BaseToast.vue`

```vue
<template>
  <Transition name="toast">
    <div v-if="visible" :class="['toast', `toast--${variant}`]" role="alert">
      <span class="toast__icon">{{ icon }}</span>
      <p class="toast__message">{{ message }}</p>
      <button
        v-if="dismissible"
        type="button"
        class="toast__close"
        @click="close"
      >✕</button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Props {
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  dismissible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  duration: 3000,
  dismissible: true,
});

const emit = defineEmits<{
  close: [];
}>();

const visible = ref(true);

const icon = computed(() => {
  switch (props.variant) {
    case 'success': return '✓';
    case 'error': return '✕';
    case 'warning': return '⚠';
    case 'info': return 'ℹ';
  }
});

const close = () => {
  visible.value = false;
  emit('close');
};

onMounted(() => {
  if (props.duration > 0) {
    setTimeout(close, props.duration);
  }
});
</script>
```

#### 2. Criar Composable useToast
**Arquivo:** `packages/frontend/src/composables/useToast.ts`

```typescript
import { ref } from 'vue';

interface Toast {
  id: number;
  message: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

export const useToast = () => {
  const show = (message: string, variant: Toast['variant'] = 'info', duration = 3000) => {
    const id = nextId++;
    toasts.value.push({ id, message, variant, duration });

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }
  };

  const remove = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const success = (message: string) => show(message, 'success');
  const error = (message: string) => show(message, 'error');
  const warning = (message: string) => show(message, 'warning');
  const info = (message: string) => show(message, 'info');

  return {
    toasts,
    show,
    remove,
    success,
    error,
    warning,
    info,
  };
};
```

#### 3. Usar nos Componentes

```typescript
// Em ProductFormView.vue
import { useToast } from '@/composables/useToast';

const toast = useToast();

const handleSubmit = async () => {
  try {
    await productsStore.saveProduct(form);
    toast.success('Produto salvo com sucesso!');
    router.push('/products');
  } catch (error) {
    toast.error('Erro ao salvar produto');
  }
};
```

### Critérios de Aceite:
- [ ] Componente BaseToast criado
- [ ] Composable useToast criado
- [ ] Integrado em formulários principais
- [ ] Posicionamento fixo (top-right)
- [ ] Testes criados

---

## 📋 RESUMO

**Total de Problemas Importantes:** 9
**Estimativa Total:** 42-48 horas (~1-1.5 semanas)

### Por Categoria:
- **Formulários:** 1 (Produto incompleto)
- **Funcionalidades:** 4 (Busca, Acréscimo, Remover Pagamento, Desconto Checkout)
- **UX/Visual:** 3 (PWA Assets, Status Conexão, Toasts)
- **Performance:** 1 (Paginação)

### Priorização Sugerida:
1. **Alta:** Itens 1, 3 (Formulário Produto, Endpoint Acréscimo)
2. **Média:** Itens 2, 4, 5, 9 (Busca, Remover Pagamento, Desconto Checkout, Toasts)
3. **Baixa:** Itens 6, 7, 8 (PWA Assets, Status Conexão, Paginação)

---

**Última Atualização:** 2025-11-14
