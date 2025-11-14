# 🔴 PROBLEMAS CRÍTICOS - BLOQUEADORES DE PRODUÇÃO

**Data:** 2025-11-14
**Total:** 11 problemas críticos identificados

---

## 1. Desktop (Tauri) NÃO Implementado

**Fase:** 1 - Setup e Infraestrutura Base
**Tarefa:** T004
**Prioridade:** 🔴 CRÍTICA
**Impacto:** BLOQUEADOR - Fase 1 incompleta
**Estimativa:** 8-12 horas

### Descrição
O módulo Desktop (Tauri) não foi implementado. Apenas existe um README.md placeholder.

### O que falta:
- [ ] Estrutura básica Tauri v2
- [ ] Arquivo `tauri.conf.json`
- [ ] Diretório `src-tauri/` com código Rust
- [ ] `Cargo.toml` - Configuração Rust
- [ ] `package.json` com dependências Tauri
- [ ] Integração com monorepo pnpm
- [ ] Scripts de build e dev
- [ ] Clippy configurado para Rust

### Arquivos Afetados:
- `packages/desktop/` (todo o diretório)

### Como Resolver:
1. Inicializar projeto Tauri v2 no diretório desktop
2. Configurar integração com frontend Vue.js
3. Configurar sistema de atualização automática
4. Configurar build e empacotamento para Windows/Linux
5. Integrar com workspace do monorepo
6. Adicionar scripts ao package.json raiz

### Critérios de Aceite:
- [ ] `pnpm --filter desktop dev` inicia aplicação desktop
- [ ] `pnpm --filter desktop build` gera executável
- [ ] Integração com frontend funcional
- [ ] Sistema de auto-update configurado
- [ ] Clippy sem warnings

---

## 2. BaseDialog/Modal NÃO Implementado

**Fase:** 3 - Interface e Componentes Base
**Tarefa:** T020
**Prioridade:** 🔴 CRÍTICA
**Impacto:** BLOQUEADOR - Componente essencial para confirmações e popups
**Estimativa:** 6-8 horas

### Descrição
Componente BaseDialog/Modal não existe. Necessário para confirmações de ações críticas (cancelar venda, excluir produto, etc).

### O que falta:
- [ ] Componente `BaseDialog.vue`
- [ ] Overlay com backdrop semi-transparente
- [ ] Header, Body, Footer slots
- [ ] Botão close
- [ ] Escape key handler
- [ ] Focus trap (foco preso no modal)
- [ ] Scroll lock (body não rola quando modal aberto)
- [ ] ARIA (role="dialog", aria-modal="true", aria-labelledby)
- [ ] Transições de entrada/saída
- [ ] Prop para controlar visibilidade (v-model)
- [ ] Props para tamanhos (sm, md, lg, xl)
- [ ] Prop para backdrop dismissible
- [ ] Testes completos (Vitest + Vue Test Utils)

### Arquivos a Criar:
- `packages/frontend/src/components/base/BaseDialog.vue`
- `packages/frontend/src/components/base/BaseDialog.test.ts`

### Como Resolver:
```vue
<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="modelValue" class="dialog-overlay" @click="handleBackdropClick">
        <div
          ref="dialogRef"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="headerId"
          class="dialog-container"
          @click.stop
        >
          <header v-if="$slots.header || title" :id="headerId" class="dialog-header">
            <slot name="header">{{ title }}</slot>
            <button
              v-if="closable"
              type="button"
              class="dialog-close"
              aria-label="Fechar"
              @click="close"
            >×</button>
          </header>
          <div class="dialog-body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="dialog-footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
```

### Critérios de Aceite:
- [ ] Modal exibe corretamente
- [ ] ESC fecha modal
- [ ] Backdrop dismiss funciona se enabled
- [ ] Focus trap implementado
- [ ] Body scroll lock funcional
- [ ] ARIA completo
- [ ] Testes cobrem todos os casos
- [ ] Integrado com design system (tokens CSS)

---

## 3. BaseSelect NÃO Implementado

**Fase:** 3 - Interface e Componentes Base
**Tarefa:** T020
**Prioridade:** 🔴 ALTA
**Impacto:** Necessário para formulários completos
**Estimativa:** 4-6 horas

### Descrição
Componente BaseSelect não existe. Formulários usam select nativo ou não têm dropdown.

### O que falta:
- [ ] Componente `BaseSelect.vue`
- [ ] Dropdown customizado com lista de opções
- [ ] Single/multiple selection
- [ ] Search/filter integrado
- [ ] Keyboard navigation (Arrow keys, Enter, Esc, Home, End)
- [ ] ARIA (role="listbox", role="option", aria-selected)
- [ ] Disabled e error states
- [ ] Placeholder
- [ ] Clear button (quando allowClear=true)
- [ ] Loading state
- [ ] Empty state
- [ ] Testes completos

### Arquivos a Criar:
- `packages/frontend/src/components/base/BaseSelect.vue`
- `packages/frontend/src/components/base/BaseSelect.test.ts`

### Critérios de Aceite:
- [ ] Dropdown abre/fecha corretamente
- [ ] Seleção única funcional
- [ ] Seleção múltipla funcional (se implementado)
- [ ] Busca filtra opções
- [ ] Keyboard navigation completo
- [ ] ARIA completo
- [ ] Testes cobrem todos os casos

---

## 4. Integração Estoque ↔ Vendas Ausente

**Fase:** 5 e 6
**Tarefas:** T030, T035, T044
**Prioridade:** 🔴 CRÍTICA
**Impacto:** BLOQUEADOR DE PRODUÇÃO - Estoque desatualizado
**Estimativa:** 6-8 horas

### Descrição
O código de validação de estoque existe (`register-stock-exit`), mas não é usado nas vendas. Vendas não validam disponibilidade ao adicionar item nem dão baixa no estoque ao finalizar.

### Problemas:
1. **Validação não integrada:** Use case `register-stock-exit` não é chamado pela API
2. **Sem validação ao adicionar item:** API permite adicionar produto sem verificar estoque
3. **Sem baixa na finalização:** Venda finalizada não reduz estoque automaticamente

### Arquivos Afetados:
- `packages/backend/src/presentation/routes/inventory-routes.ts`
- `packages/backend/src/application/use-cases/add-sale-item.ts`
- `packages/backend/src/application/use-cases/finalize-sale.ts`

### Como Resolver:

**Passo 1: Integrar validação na API de estoque**
```typescript
// inventory-routes.ts - linha 42
if (body.type === 'saida') {
  const exitResult = await registerStockExit({
    productId: body.productId,
    quantity: body.quantity,
    description: body.description,
  });

  if (!exitResult.ok) {
    return c.json({ error: exitResult.error }, 400);
  }

  return c.json(exitResult.value, 201);
} else {
  // entrada ou ajuste - usar register-movement
  const result = await registerMovement({ ... });
}
```

**Passo 2: Validar estoque ao adicionar item na venda**
```typescript
// add-sale-item.ts - adicionar antes de adicionar item
import { getStock } from './get-stock';

export const addSaleItem: AddSaleItem = (deps) => async (input) => {
  // 1. Buscar estoque atual
  const stockResult = await getStock(deps)({ productId: input.productId });

  if (!stockResult.ok) {
    return ResultUtils.err({ type: 'STOCK_CHECK_FAILED', message: stockResult.error });
  }

  // 2. Validar disponibilidade
  if (stockResult.value.quantity < input.quantity) {
    return ResultUtils.err({
      type: 'INSUFFICIENT_STOCK',
      message: `Estoque insuficiente. Disponível: ${stockResult.value.quantity}`,
    });
  }

  // 3. Adicionar item normalmente
  // ... código existente
};
```

**Passo 3: Dar baixa no estoque ao finalizar venda**
```typescript
// finalize-sale.ts - adicionar após finalizar venda
import { registerStockExit } from './register-stock-exit';

export const finalizeSale: FinalizeSale = (deps) => async (input) => {
  // ... código existente de finalização

  // Após finalizar, dar baixa no estoque de cada item
  for (const item of sale.items) {
    const stockExitResult = await registerStockExit(deps)({
      productId: item.productId,
      quantity: item.quantity,
      description: `Venda #${sale.id} finalizada`,
    });

    if (!stockExitResult.ok) {
      // Log erro mas não bloqueia (venda já finalizada)
      console.error(`Erro ao dar baixa no estoque: ${stockExitResult.error}`);
    }
  }

  return ResultUtils.ok(sale);
};
```

### Critérios de Aceite:
- [ ] API POST /estoque/movimentos valida estoque ao registrar saída
- [ ] Retorna erro 400 se estoque insuficiente
- [ ] Use case `add-sale-item` valida estoque antes de adicionar
- [ ] Use case `finalize-sale` dá baixa automática no estoque
- [ ] Testes cobrem todos os cenários (estoque ok, insuficiente, sem estoque)
- [ ] Erros têm mensagens claras com quantidade disponível

---

## 5. Testes de Frontend PDV Ausentes

**Fase:** 6 - Módulo de PDV
**Tarefas:** T036-T044
**Prioridade:** 🔴 CRÍTICA
**Impacto:** BLOQUEADOR DE QUALIDADE - Zero testes em componentes críticos
**Estimativa:** 16-20 horas

### Descrição
TODOS os componentes de PDV estão sem testes. Cobertura de testes: 0%.

### Componentes Sem Testes:
- [ ] `POSView.vue` - Tela principal do PDV
- [ ] `POSCheckoutView.vue` - Tela de finalização
- [ ] `POSProductSearch.vue` - Busca de produtos
- [ ] `POSItemList.vue` - Lista de itens da venda
- [ ] `POSDiscountModal.vue` - Modal de desconto
- [ ] `POSPaymentPanel.vue` - Painel de pagamentos
- [ ] `stores/sales.ts` - Store de vendas

### Arquivos a Criar:
- `packages/frontend/src/views/pos/POSView.test.ts`
- `packages/frontend/src/views/pos/POSCheckoutView.test.ts`
- `packages/frontend/src/views/pos/components/POSProductSearch.test.ts`
- `packages/frontend/src/views/pos/components/POSItemList.test.ts`
- `packages/frontend/src/views/pos/components/POSDiscountModal.test.ts`
- `packages/frontend/src/views/pos/components/POSPaymentPanel.test.ts`
- `packages/frontend/src/stores/sales.test.ts`

### Template de Teste:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import POSView from './POSView.vue';

describe('POSView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should render correctly', () => {
    const wrapper = mount(POSView);
    expect(wrapper.exists()).toBe(true);
  });

  it('should create new sale on mount', async () => {
    // ... test
  });

  it('should add product to sale', async () => {
    // ... test
  });

  it('should handle product search', async () => {
    // ... test
  });

  it('should apply discount', async () => {
    // ... test
  });

  it('should navigate to checkout', async () => {
    // ... test
  });

  it('should handle keyboard shortcuts', async () => {
    // F1, F2, F3, F4
  });
});
```

### Critérios de Aceite:
- [ ] Cada componente tem arquivo .test.ts
- [ ] Cobertura > 80% em cada componente
- [ ] Testes cobrem: render, props, events, state, edge cases
- [ ] Testes cobrem atalhos de teclado
- [ ] Testes cobrem validações
- [ ] Testes cobrem loading states
- [ ] Mocks apropriados (API, stores, router)
- [ ] `pnpm --filter frontend test:coverage` passa

---

## 6. Testes de Frontend Estoque Ausentes

**Fase:** 5 - Módulo de Estoque
**Tarefas:** T031, T032
**Prioridade:** 🔴 ALTA
**Impacto:** BLOQUEADOR DE QUALIDADE - Componentes sem testes
**Estimativa:** 6-8 horas

### Descrição
Componentes de estoque estão sem testes. Store tem testes, mas views não.

### Componentes Sem Testes:
- [ ] `InventoryMovementView.vue`
- [ ] `InventoryCountView.vue`

### Arquivos a Criar:
- `packages/frontend/src/views/inventory/InventoryMovementView.test.ts`
- `packages/frontend/src/views/inventory/InventoryCountView.test.ts`

### Critérios de Aceite:
- [ ] Cada view tem arquivo .test.ts
- [ ] Cobertura > 80%
- [ ] Testes cobrem: render, form submit, validações, loading, errors
- [ ] `pnpm --filter frontend test:coverage` passa

---

## 7. Validação de Estoque em Vendas

**Fase:** 6
**Tarefa:** T035
**Prioridade:** 🔴 CRÍTICA
**Impacto:** Permite vender produto sem estoque
**Estimativa:** 4 horas

### Descrição
Use case `add-sale-item` não verifica estoque antes de adicionar item à venda.

### Arquivos Afetados:
- `packages/backend/src/application/use-cases/add-sale-item.ts`

### Como Resolver:
Ver detalhes no problema #4.

### Critérios de Aceite:
- [ ] Valida estoque antes de adicionar item
- [ ] Retorna erro se estoque insuficiente
- [ ] Erro inclui quantidade disponível
- [ ] Testes cobrem cenários de estoque ok/insuficiente/zerado

---

## 8. Baixa de Estoque na Finalização

**Fase:** 6
**Tarefa:** T044
**Prioridade:** 🔴 CRÍTICA
**Impacto:** Estoque não é atualizado após venda
**Estimativa:** 3 horas

### Descrição
Use case `finalize-sale` não dá baixa no estoque dos produtos vendidos.

### Arquivos Afetados:
- `packages/backend/src/application/use-cases/finalize-sale.ts`

### Como Resolver:
Ver detalhes no problema #4 (Passo 3).

### Critérios de Aceite:
- [ ] Dá baixa automática no estoque ao finalizar venda
- [ ] Registra movimentação de saída para cada item
- [ ] Testes validam baixa de estoque
- [ ] Logs de erro se baixa falhar (não bloqueia venda)

---

## 9. Validações de Produtos Incompletas

**Fase:** 4
**Tarefa:** T024
**Prioridade:** 🔴 ALTA
**Impacto:** Dados inconsistentes no banco
**Estimativa:** 8-10 horas

### Descrição
Validações críticas de produto estão faltando.

### Validações Faltando:

#### 9.1. DUN14 Value Object
- [ ] Criar `packages/backend/src/domain/product/dun14.ts`
- [ ] Validar formato 13 ou 14 dígitos
- [ ] Apenas números
- [ ] Branded type
- [ ] Testes completos

#### 9.2. Unicidade de SKU/GTIN
- [ ] Verificar no repository antes de save
- [ ] Retornar erro específico se duplicado
- [ ] Testes de duplicação

```typescript
// product-repository-drizzle.ts
export const save = async (product: Product): Promise<Result<Product, RepositoryError>> => {
  try {
    // Verificar SKU duplicado
    if (product.sku) {
      const existingSku = await db
        .select()
        .from(products)
        .where(and(
          eq(products.sku, product.sku),
          ne(products.id, product.id)
        ))
        .limit(1);

      if (existingSku.length > 0) {
        return ResultUtils.err({
          type: 'DUPLICATE_SKU',
          message: `SKU ${product.sku} já existe`,
        });
      }
    }

    // Verificar GTIN duplicado
    if (product.gtin) {
      const existingGtin = await db
        .select()
        .from(products)
        .where(and(
          eq(products.gtin, product.gtin),
          ne(products.id, product.id)
        ))
        .limit(1);

      if (existingGtin.length > 0) {
        return ResultUtils.err({
          type: 'DUPLICATE_GTIN',
          message: `GTIN ${product.gtin} já existe`,
        });
      }
    }

    // Salvar produto
    // ...
  }
};
```

#### 9.3. Validações Fiscais
- [ ] Origem tributária: valores 0-8 (conforme SEFAZ)
- [ ] Alíquota ICMS: 0-100%
- [ ] Criar Value Objects apropriados

#### 9.4. Validações de Preço
- [ ] Preço promocional < preço normal
- [ ] Data início < data fim promoção

### Critérios de Aceite:
- [ ] DUN14 Value Object criado e testado
- [ ] Repository valida unicidade SKU/GTIN
- [ ] Validações fiscais implementadas
- [ ] Validações de preço implementadas
- [ ] Todos os testes passando

---

## 10. CPF/Email na Venda

**Fase:** 6
**Tarefa:** T035, T041
**Prioridade:** 🔴 ALTA
**Impacto:** Não pode registrar CPF na nota
**Estimativa:** 4 horas

### Descrição
Entidade Sale não tem campos para CPF e Email do cliente.

### O que falta:

#### Backend
- [ ] Adicionar campos `customerCpf?: string` e `customerEmail?: string` em `Sale` entity
- [ ] Criar Value Objects `Cpf` e `Email` com validações
- [ ] Adicionar no schema do banco (migration)
- [ ] Testes

#### Frontend
- [ ] Adicionar inputs no `POSCheckoutView.vue`
- [ ] Validações client-side
- [ ] Enviar na finalização

### Critérios de Aceite:
- [ ] Schema tem campos customer_cpf e customer_email (nullable)
- [ ] Value Objects validam formato
- [ ] Frontend tem inputs
- [ ] Dados são salvos corretamente

---

## 11. Validação de Saída Integrada na API

**Fase:** 5
**Tarefa:** T030
**Prioridade:** 🔴 CRÍTICA
**Impacto:** API permite estoque negativo
**Estimativa:** 2 horas

### Descrição
Use case `register-stock-exit` existe mas não é usado no endpoint.

### Arquivos Afetados:
- `packages/backend/src/presentation/routes/inventory-routes.ts`

### Como Resolver:
Ver detalhes no problema #4 (Passo 1).

### Critérios de Aceite:
- [ ] POST /movimentos usa `register-stock-exit` quando type === "saida"
- [ ] Retorna 400 se estoque insuficiente
- [ ] Testes validam comportamento

---

## 📋 RESUMO

**Total de Problemas Críticos:** 11
**Estimativa Total:** 65-85 horas (~2 semanas)

### Por Categoria:
- **Infraestrutura:** 3 (Desktop, BaseDialog, BaseSelect)
- **Integrações:** 3 (Estoque ↔ Vendas)
- **Testes:** 2 (Frontend PDV, Frontend Estoque)
- **Validações:** 3 (Produtos, CPF/Email, Saída API)

### Priorização Sugerida:
1. **Sprint 1 (40h):** Itens 4, 7, 8, 11 (Integrações Estoque ↔ Vendas)
2. **Sprint 2 (40h):** Itens 2, 3, 5, 6 (Componentes e Testes)
3. **Sprint 3 (20h):** Itens 1, 9, 10 (Desktop, Validações, CPF/Email)

---

**Última Atualização:** 2025-11-14
