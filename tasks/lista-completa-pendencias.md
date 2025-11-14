# 📋 LISTA COMPLETA DE PENDÊNCIAS - FASES 1 A 6

**Data:** 2025-11-14
**Total de Pendências:** 61 itens

---

## LEGENDA

- 🔴 **CRÍTICO** - Bloqueador de produção
- ⚠️ **IMPORTANTE** - Funcionalidade limitada
- 🟢 **MELHORIA** - Nice to have

---

## FASE 1: SETUP E INFRAESTRUTURA BASE

### 🔴 Crítico (1)

- [ ] **T004** - Implementar Desktop (Tauri) completo (12h)
  - Estrutura básica Tauri v2
  - Configurações Rust (Cargo.toml)
  - tauri.conf.json
  - Integração com monorepo
  - Scripts de build e dev

### ⚠️ Importante (1)

- [ ] Adicionar assets PWA (2h)
  - Diretório `public/`
  - Ícones PWA (192x192, 512x512)
  - favicon.ico
  - robots.txt
  - apple-touch-icon.png

### 🟢 Melhoria (1)

- [ ] Atualizar comentário Lefthook sobre thresholds (5min)
  - Linha 42: Atualizar "currently 90%/75%" para "100%"

---

## FASE 2: BANCO DE DADOS E PERSISTÊNCIA

### ✅ SEM PENDÊNCIAS

Fase completamente implementada e testada.

---

## FASE 3: INTERFACE E COMPONENTES BASE

### 🔴 Crítico (2)

- [ ] **T020** - Criar BaseDialog/Modal (8h)
  - Componente completo
  - Overlay com backdrop
  - Header/Body/Footer slots
  - Escape key handler
  - Focus trap
  - Scroll lock
  - ARIA completo
  - Transições
  - Testes completos

- [ ] **T020** - Criar BaseSelect (6h)
  - Dropdown customizado
  - Single/multiple selection
  - Search/filter
  - Keyboard navigation
  - ARIA completo
  - Testes completos

### 🟢 Melhorias (3)

- [ ] Separar BaseContainer (2h)
  - Atualmente integrado em AppLayout
  - Criar componente independente

- [ ] Expandir BaseDataTable (6h)
  - Adicionar paginação
  - Adicionar ordenação
  - Testes atualizados

- [ ] Virtualização no ProductLookup (4h)
  - Para listas grandes (1000+ produtos)
  - Melhor performance

---

## FASE 4: MÓDULO DE PRODUTOS

### 🔴 Crítico (7)

- [ ] **T024** - Criar DUN14 Value Object (2h)
  - Validação 13-14 dígitos
  - Apenas números
  - Branded type
  - Testes completos

- [ ] **T024** - Validar unicidade SKU/GTIN no repository (3h)
  - Verificar antes de save
  - Retornar erro específico
  - Testes de duplicação

- [ ] **T024** - Validar origem tributária (1h)
  - Valores 0-8 conforme SEFAZ
  - Value Object ou validação

- [ ] **T024** - Validar tributação/CST (1h)
  - Formato válido
  - Value Object ou validação

- [ ] **T024** - Validar alíquota ICMS (1h)
  - Range 0-100%
  - Value Object

- [ ] **T024** - Validar preço promocional (1h)
  - Promocional < normal
  - Testes

- [ ] **T024** - Validar datas de promoção (1h)
  - Início < fim
  - Testes

### ⚠️ Importante (8)

- [ ] **T027** - Adicionar campo DUN-14 no formulário (1h)
  - Input com validação
  - Enviar para API

- [ ] **T027** - Adicionar campo Código de Balança no formulário (1h)
  - Input text
  - Enviar para API

- [ ] **T027** - Adicionar campos fiscais completos (3h)
  - Origem tributária (select)
  - Tributação/CST
  - Alíquota ICMS

- [ ] **T027** - Adicionar datas de promoção (1h)
  - Data início
  - Data fim
  - Validação

- [ ] **T027** - Implementar validações de formato avançadas (2h)
  - GTIN check digit
  - NCM 8 dígitos
  - CEST 7 dígitos

- [ ] **T027** - Adicionar feedback toast (2h)
  - Sucesso ao salvar
  - Erro ao salvar
  - Mensagens claras

- [ ] **T025** - Adicionar busca por DUN-14 e Código Balança (2h)
  - Atualizar método search do repository
  - Testes

- [ ] **T025** - Criar índices no banco (2h)
  - Índices para campos de busca
  - Migration
  - Performance < 100ms

### 🟢 Melhorias (3)

- [ ] **T026** - Implementar paginação frontend (4h)
  - Controles de navegação
  - Itens por página
  - Total de registros

- [ ] **T025** - Implementar fuzzy search (8h)
  - Algoritmo Levenshtein
  - Tolerância a erros
  - Score de relevância

- [ ] **T025** - Ordenação por relevância (4h)
  - Priorizar matches exatos
  - Score ponderado

---

## FASE 5: MÓDULO DE ESTOQUE

### 🔴 Crítico (3)

- [ ] **T030** - Integrar `register-stock-exit` na API (2h)
  - Modificar inventory-routes.ts
  - Usar quando type === "saida"
  - Validar estoque
  - Testes

- [ ] **T031** - Criar testes InventoryMovementView (4h)
  - Render, form, validações
  - Submit, loading, errors
  - Cobertura > 80%

- [ ] **T032** - Criar testes InventoryCountView (4h)
  - Render, contagem, ajustes
  - Comparação, divergências
  - Cobertura > 80%

### ⚠️ Importante (2)

- [ ] **T029** - Padronizar endpoints (4h)
  - POST /entrada
  - POST /saida
  - POST /inventario
  - Como wrappers do /movimentos

- [ ] **T031** - Validar estoque no frontend (2h)
  - Verificar antes de saída
  - Feedback ao usuário

---

## FASE 6: MÓDULO DE PDV

### 🔴 Crítico (8)

- [ ] **T033/T035** - Integrar validação estoque em add-sale-item (4h)
  - Verificar disponibilidade
  - Retornar erro se insuficiente
  - Testes

- [ ] **T044** - Integrar baixa de estoque na finalização (3h)
  - Chamar register-stock-exit
  - Para cada item vendido
  - Testes

- [ ] **T036-T044** - Criar teste POSView.vue (4h)
  - Render, state, events
  - Keyboard shortcuts
  - Cobertura > 80%

- [ ] **T036-T044** - Criar teste POSCheckoutView.vue (3h)
  - Render, payment, finalize
  - Validações
  - Cobertura > 80%

- [ ] **T036-T044** - Criar teste POSProductSearch.vue (3h)
  - Busca, resultados, seleção
  - Debounce, keyboard
  - Cobertura > 80%

- [ ] **T036-T044** - Criar teste POSItemList.vue (2h)
  - Lista, controles, remoção
  - Quantidade
  - Cobertura > 80%

- [ ] **T036-T044** - Criar teste POSDiscountModal.vue (2h)
  - Inputs, validação, submit
  - Cobertura > 80%

- [ ] **T036-T044** - Criar teste POSPaymentPanel.vue (3h)
  - Pagamentos, múltiplos meios
  - Validações, troco
  - Cobertura > 80%

- [ ] **T036-T044** - Criar teste Sales store (2h)
  - Ações, mutations
  - API calls
  - Cobertura > 80%

- [ ] **T035** - Adicionar customerCpf à Sale entity (2h)
  - Campo opcional
  - Value Object Cpf
  - Migration
  - Testes

- [ ] **T035** - Adicionar customerEmail à Sale entity (2h)
  - Campo opcional
  - Value Object Email
  - Migration
  - Testes

### ⚠️ Importante (6)

- [ ] **T033** - Criar endpoint POST /api/vendas/:id/surcharge (3h)
  - Use case apply-sale-surcharge
  - Validações
  - Testes

- [ ] **T041** - Adicionar inputs CPF/Email no checkout (2h)
  - Campos opcionais
  - Validações client-side
  - Enviar na finalização

- [ ] **T041** - Permitir desconto/acréscimo no checkout (4h)
  - Inputs de desconto % e R$
  - Input de acréscimo
  - Recalcular total
  - Chamar APIs

- [ ] **T042** - Implementar remoção de pagamento (2h)
  - Botão X em cada pagamento
  - Endpoint DELETE
  - Store atualizada

- [ ] **T039** - Indicador de status de conexão (2h)
  - Visual online/offline
  - Header do app
  - Listeners de eventos

- [ ] **T035** - Validar CPF (formato) (1h)
  - Value Object Cpf
  - Algoritmo de validação
  - Testes

- [ ] **T035** - Validar Email (formato) (1h)
  - Value Object Email
  - Regex validação
  - Testes

### 🟢 Melhorias (2)

- [ ] **T044** - Template cupom fiscal impressão (4h)
  - Layout específico
  - CSS @media print
  - Dados completos

- [ ] **T044** - Geração de NFC-e (Fase 7)
  - Não escopo atual
  - Implementar na Fase 7

---

## RESUMO GERAL

### Por Prioridade

| Prioridade | Quantidade | Horas Estimadas |
|------------|-----------|-----------------|
| 🔴 Crítico | 24 | 85-95h |
| ⚠️ Importante | 20 | 42-48h |
| 🟢 Melhoria | 9 | 30-35h |
| **TOTAL** | **53** | **157-178h** |

### Por Fase

| Fase | Pendências | % Completude Atual |
|------|------------|-------------------|
| Fase 1 | 3 | 92.8% |
| Fase 2 | 0 | 100% ✅ |
| Fase 3 | 5 | 90% |
| Fase 4 | 18 | 80% |
| Fase 5 | 5 | 72.5% |
| Fase 6 | 22 | 75% |

### Por Categoria

| Categoria | Quantidade |
|-----------|-----------|
| Componentes UI | 6 |
| Validações | 10 |
| Testes Frontend | 9 |
| Integrações | 5 |
| Endpoints API | 3 |
| Formulários | 8 |
| UX/Visual | 5 |
| Performance | 3 |
| Desktop | 1 |
| Outros | 3 |

---

## 🎯 PLANO DE EXECUÇÃO SUGERIDO

### Sprint 1: Críticos de Infraestrutura (40h)
**Objetivo:** Resolver bloqueadores de integração e componentes base

1. Criar BaseDialog/Modal (8h)
2. Criar BaseSelect (6h)
3. Integrar validação de estoque em vendas (8h)
4. Integrar baixa de estoque na finalização (3h)
5. Integrar register-stock-exit na API (2h)
6. Adicionar PWA assets (2h)
7. Implementar Desktop Tauri (12h)

### Sprint 2: Testes e Validações (40h)
**Objetivo:** Atingir cobertura de testes e validações completas

8. Testes PDV (POSView, POSCheckoutView, POSProductSearch, etc) (20h)
9. Testes Estoque (InventoryMovementView, InventoryCountView) (8h)
10. Validações de produtos (DUN14, unicidade, fiscais) (10h)
11. Adicionar CPF/Email à Sale entity (4h)

### Sprint 3: Features e Formulários (32h)
**Objetivo:** Completar funcionalidades e formulários

12. Completar formulário de produto (campos faltantes) (8h)
13. Endpoint de acréscimo (3h)
14. Remover pagamento individual (2h)
15. Desconto/acréscimo no checkout (4h)
16. Expandir busca de produtos (DUN-14, balança, índices) (4h)
17. Sistema de toasts (6h)
18. Validações CPF/Email (2h)

### Sprint 4: UX e Melhorias (24h)
**Objetivo:** Polimento e melhorias de UX

19. Paginação frontend (4h)
20. Status de conexão visual (2h)
21. Template cupom fiscal (4h)
22. Expandir BaseDataTable (paginação, ordenação) (6h)
23. Padronizar endpoints de estoque (4h)
24. Validação frontend estoque (2h)
25. Atualizar comentário Lefthook (5min)

### Sprint 5 (Opcional): Melhorias Avançadas (20h)
**Objetivo:** Features não essenciais mas valiosas

26. Fuzzy search (8h)
27. Ordenação por relevância (4h)
28. Virtualização ProductLookup (4h)
29. Separar BaseContainer (2h)

---

## 📊 MÉTRICAS DE PROGRESSO

### Atual
- **Tarefas Implementadas:** ~85%
- **Cobertura Backend:** ~100%
- **Cobertura Frontend:** ~40%
- **Testes Totais:** 74 arquivos
- **Linhas de Código:** ~34.000

### Meta Pós-Pendências
- **Tarefas Implementadas:** 100%
- **Cobertura Backend:** 100%
- **Cobertura Frontend:** >80%
- **Testes Totais:** ~95 arquivos
- **Linhas de Código:** ~40.000

---

## ✅ CRITÉRIOS DE CONCLUSÃO

Para considerar as Fases 1-6 completas, todos os itens abaixo devem ser atendidos:

### Bloqueadores Resolvidos
- [ ] Desktop Tauri implementado
- [ ] BaseDialog/Modal criado
- [ ] BaseSelect criado
- [ ] Integração Estoque ↔ Vendas completa
- [ ] Validações críticas implementadas
- [ ] Testes de frontend PDV criados
- [ ] Testes de frontend Estoque criados

### Qualidade
- [ ] Cobertura backend: 100%
- [ ] Cobertura frontend: >80%
- [ ] Zero erros de TypeScript
- [ ] Zero warnings de Biome
- [ ] CI/CD passando 100%

### Funcionalidades
- [ ] Todos os formulários completos
- [ ] Todas as validações implementadas
- [ ] Todos os endpoints funcionais
- [ ] Feedback visual (toasts) implementado
- [ ] PWA completo com assets

### Documentação
- [ ] README atualizado
- [ ] CHANGELOG criado
- [ ] API documentada
- [ ] Guias de uso criados

---

**Última Atualização:** 2025-11-14
**Próxima Revisão:** Após conclusão dos Sprints 1 e 2
