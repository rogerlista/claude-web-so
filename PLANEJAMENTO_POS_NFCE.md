# 📋 Planejamento de Implementação - Sistema POS com NFC-e

**Projeto:** Sistema de Ponto de Venda com Emissão de NFC-e
**Data de Criação:** 2025-11-04
**Status:** Planejamento

---

## 📊 Visão Geral

Este documento contém todas as tarefas necessárias para implementar o sistema POS completo conforme especificado no PRD.

### Stack Tecnológica (Latest Versions)

**Backend:**
- Framework: Hono.js (latest)
- Runtime: Node.js (latest LTS)
- Linguagem: TypeScript (latest)
- Build Tool: Vite (latest)
- ORM: **Drizzle ORM** (latest)
- Banco de Dados: SQLite (latest)
- Migrations: Drizzle Kit (latest)
- Testing: Vitest (latest)
- Lint/Format: **Biome.js** (latest)

**Frontend:**
- Framework: Vue.js 3 (latest)
- Build Tool: Vite (latest)
- State Management: Pinia (latest)
- Linguagem: TypeScript (latest)
- PWA: Workbox (latest)
- Testing: Vitest (latest) + Vue Test Utils (latest)
- E2E: Playwright (latest)
- Lint/Format: **Biome.js** (latest)

**Desktop:**
- Framework: Tauri (latest v2)
- Linguagem: Rust (latest stable) + TypeScript (latest)
- Lint: Clippy + **Biome.js** (para TS)

**Qualidade & DevOps:**
- **Git Hooks:** Lefthook (latest)
- **Commit Validation:** commitlint (latest) + Conventional Commits 1.0.0
- **Linter/Formatter:** Biome.js (latest) - substitui ESLint + Prettier
- **Testing:** Vitest (latest) com coverage 100% obrigatório
- **TypeScript:** Modo strict com zero `any`
- **CI/CD:** GitHub Actions (latest)
- **Architecture:** Clean Architecture + DDD + TDD First

---

## 🎯 Princípios de Qualidade e Desenvolvimento

### Regras Não Negociáveis

#### 1. TDD First - Ciclo RED-GREEN-REFACTOR Obrigatório

**Para TODA funcionalidade implementada:**

1. **RED (Teste Falhando)**
   - ❌ Escrever teste que falha ANTES de qualquer código
   - Definir comportamento esperado
   - Validar que o teste realmente falha
   - Commit: `test: add failing test for [feature]`

2. **GREEN (Implementação Mínima)**
   - ✅ Escrever código MÍNIMO para passar o teste
   - Não adicionar funcionalidades extras
   - Validar que o teste passa
   - Commit: `feat: implement [feature] to pass test`

3. **REFACTOR (Melhorar Código)**
   - ♻️ Refatorar código mantendo testes verdes
   - Aplicar Clean Code e SOLID
   - Eliminar duplicação
   - Melhorar legibilidade
   - Commit: `refactor: improve [feature] implementation`

**Validação Automática:**
- Script `npm run tdd:validate` verifica se o ciclo foi seguido
- Lefthook bloqueia commits que não seguem o padrão
- CI/CD valida histórico de commits

#### 2. Coverage 100% - Sem Exceções

- ✅ **100% de coverage** em branches, functions, lines, statements
- ❌ **Zero arquivos sem testes**
- ❌ **Zero linhas não cobertas**
- ❌ **Sem comentários de ignore coverage** (/* istanbul ignore */)
- Pre-push hook bloqueia se coverage < 100%
- CI/CD falha se coverage < 100%

**Estratégia de Testes:**
- **Unitários:** 70% - Lógica de negócio, utils, helpers
- **Integração:** 20% - APIs, banco de dados, serviços
- **E2E:** 10% - Fluxos críticos do usuário

#### 3. TypeScript Strict - Zero `any`

**Configuração Obrigatória:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

**Regras:**
- ❌ Proibido usar `any` (usar `unknown` quando necessário)
- ❌ Proibido `@ts-ignore` ou `@ts-expect-error`
- ✅ Todos os tipos devem ser explícitos
- ✅ Inferência de tipos quando óbvia
- Typecheck executado em pre-commit e CI/CD

#### 4. Programação Funcional - ZERO Classes

**REGRA ABSOLUTA: SEM CLASSES - APENAS FUNÇÕES**

**Proibições:**
- ❌ **ZERO uso de `class` keyword**
- ❌ **ZERO uso de `this` keyword**
- ❌ **ZERO Orientação a Objetos**
- ❌ **ZERO `let` ou `var` (apenas `const`)**
- ❌ **ZERO mutação de objetos/arrays**
- ❌ **ZERO loops imperativos (`for`, `while`) - usar `map`, `filter`, `reduce`**
- ❌ **ZERO funções `void` - sempre retornar algo**

**Obrigatório:**
- ✅ **Apenas funções puras no domínio**
- ✅ **Imutabilidade total**
- ✅ **Result/Option types para erros**
- ✅ **Branded types para type safety**
- ✅ **Currying para Dependency Injection**
- ✅ **Composição de funções (pipe/compose)**
- ✅ **Higher-Order Functions**
- ✅ **Pattern Matching com Discriminated Unions**

**Padrões Funcionais Obrigatórios:**

1. **Result Type (Railway-Oriented Programming)**
```typescript
type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E }
```

2. **Option Type (Maybe Pattern)**
```typescript
type Option<T> =
  | { readonly some: true; readonly value: T }
  | { readonly some: false }
```

3. **Branded Types**
```typescript
type Brand<K, T> = K & { readonly __brand: T }
type ProductId = Brand<string, 'ProductId'>
type Price = Brand<number, 'Price'>
```

4. **Dependency Injection via Currying**
```typescript
type CreateProduct = (
  deps: { readonly repository: ProductRepository }
) => (input: CreateProductInput) => Promise<Result<Product, Error>>

const createProduct: CreateProduct = ({ repository }) => async (input) => {
  // Implementation
}
```

5. **Composição de Funções**
```typescript
const processPrice = pipe(
  applyDiscount(10),
  applyTax(0.15),
  roundToTwoDecimals
)
```

**Documentação:**
- Ver: `docs/FUNCTIONAL_PROGRAMMING.md`
- Ver: `docs/CLEAN_ARCHITECTURE_FUNCTIONAL.md`

**Validação:**
- Biome bloqueia uso de `class`
- Code review rejeita qualquer OOP
- Todos os exemplos devem ser funcionais

#### 5. Clean Architecture Funcional + Hexagonal - Camadas Bem Definidas

**Backend (Camadas de fora para dentro):**
```
presentation → application → domain
      ↓             ↓           ↑
infrastructure ←←←←←←←←←←←←←←←
```

**Regras de Dependência:**
- Domain: **zero dependências externas**
- Application: depende apenas de domain
- Infrastructure: implementa interfaces de application
- Presentation: orquestra application

**Padrões Obrigatórios (Funcionais):**
- **Types e Branded Types** (domain)
- **Funções Puras** (domain - business rules)
- **Smart Constructors** (domain - validação)
- **Use Cases** (application - funções com currying para DI)
- **Portas** (domain - interfaces como types)
- **Adapters** (infrastructure - factory functions)
- **DTOs** para transferência de dados
- **Dependency Injection via Currying**

**Estrutura de Camadas:**
```typescript
// DOMAIN - Tipos, constructors, regras puras
export type Product = { readonly id: ProductId; readonly price: Price }
export const Price = {
  create: (value: number): Result<Price, string> => { /* validação */ }
}
export const calculateDiscount = (pct: number) => (price: Price): Result<Price, string>

// APPLICATION - Use cases com DI
export type CreateProduct = (deps: Dependencies) => (input: Input) => Promise<Result<Product, Error>>

// INFRASTRUCTURE - Adapters (factory functions)
export const createProductRepository = (db: Database): ProductRepository => ({ /* impl */ })

// PRESENTATION - Controllers (factory functions)
export const createProductController = (useCase: UseCase): Hono => { /* impl */ }
```

#### 6. Clean Code Funcional - Padrões de Código

**Nomenclatura:**
- ❌ ~~Classes~~ (NÃO EXISTEM)
- Funções: `camelCase`
- Tipos/Branded Types: `PascalCase`
- Constantes: `SCREAMING_SNAKE_CASE`
- Type aliases: `PascalCase`
- Arquivos: `kebab-case.ts`

**Funções:**
- ✅ Máximo 15 linhas (funções puras devem ser pequenas)
- ✅ **Único propósito** (Single Responsibility)
- ✅ **Máximo 2 parâmetros** (use currying ou object params)
- ✅ **ZERO efeitos colaterais** em funções puras
- ✅ **Sempre retornar algo** (nunca `void`)
- ✅ Nome descritivo e verbo no infinitivo
- ✅ **Funções puras no domínio**

**Arquivos:**
- ✅ Máximo 200 linhas
- ✅ Uma responsabilidade por arquivo
- ✅ Imports organizados (Biome sort)
- ✅ Separar types, constructors, rules

**Comentários:**
- ❌ Evitar comentários óbvios
- ✅ Comentar apenas "porquê", não "o quê"
- ✅ JSDoc para funções públicas (especialmente types complexos)

**Exemplo de Estrutura:**
```
domain/product/
  ├── product.types.ts      # Branded types e entidades
  ├── product.constructors.ts # Smart constructors com validação
  ├── product.rules.ts      # Regras de negócio puras
  └── product.ports.ts      # Interfaces (Repository, Services)
```

#### 7. Princípios Funcionais (Adaptação de SOLID)

- **S** - Single Responsibility: Uma função, uma responsabilidade
- **O** - Open/Closed: Extensão via composição, não modificação
- **L** - Liskov Substitution: Funções substituíveis com mesma assinatura
- **I** - Interface Segregation: Types específicos, não genéricos
- **D** - Dependency Inversion: Dependa de types/interfaces, não de implementações

**Princípios Funcionais Adicionais:**
- **Pure Functions**: Sem efeitos colaterais
- **Immutability**: Dados imutáveis sempre
- **Composition**: Combine funções simples
- **Type Safety**: Use branded types e Result/Option

#### 8. Git e Commits - Conventional Commits Rigoroso

**Formato Obrigatório (Conventional Commits 1.0.0):**
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types Permitidos (validado por commitlint):**
- `feat`: Nova funcionalidade (user-facing)
- `fix`: Correção de bug
- `test`: Adicionar/modificar testes (TDD RED phase)
- `refactor`: Refatoração sem mudança de comportamento (TDD REFACTOR phase)
- `docs`: Documentação apenas
- `style`: Formatação, missing semi colons, etc (não afeta código)
- `perf`: Melhoria de performance
- `build`: Mudanças no sistema de build ou dependências externas
- `ci`: Mudanças em arquivos e scripts de CI
- `chore`: Outras mudanças que não modificam src ou test
- `revert`: Reverte um commit anterior

**Scopes Sugeridos por Módulo:**
- `backend`: Mudanças no backend
- `frontend`: Mudanças no frontend
- `desktop`: Mudanças no Tauri desktop
- `db`: Mudanças no schema do banco de dados
- `api`: Mudanças em endpoints/routers
- `domain`: Mudanças na camada de domínio
- `infra`: Mudanças na infraestrutura
- `produto`: Funcionalidade relacionada a produtos
- `venda`: Funcionalidade relacionada a vendas
- `caixa`: Funcionalidade relacionada ao caixa
- `nfce`: Funcionalidade relacionada a NFC-e

**Exemplos Válidos:**
```bash
# Feature nova
feat(produto): add product search by GTIN

# Bug fix
fix(venda): correct discount calculation

# TDD - RED phase
test(caixa): add failing test for cash opening

# TDD - GREEN phase
feat(caixa): implement cash opening to pass test

# TDD - REFACTOR phase
refactor(caixa): improve cash opening logic

# Breaking change
feat(api)!: change product endpoint response format

BREAKING CHANGE: The product API now returns snake_case instead of camelCase

# Multiple scopes
feat(frontend,backend): add authentication system
```

**Regras Rigorosas:**
- ✅ Type obrigatório (lowercase)
- ✅ Scope opcional mas recomendado (lowercase)
- ✅ Description obrigatória (lowercase, imperativo)
- ✅ Máximo 72 caracteres no header
- ✅ Subject em imperativo ("add" não "added" ou "adds")
- ✅ Sem ponto final no subject
- ✅ Body separado por linha em branco
- ✅ Footer para breaking changes e issues
- ❌ Não commitar código comentado
- ❌ Não commitar console.log/debugger
- ❌ Não commitar arquivos de configuração local

**Validação Automática:**
- **commitlint** valida formato no commit-msg hook
- **Lefthook** bloqueia commits inválidos
- **CI/CD** valida histórico de commits no PR

**Breaking Changes:**
Adicionar `!` após o type/scope ou adicionar `BREAKING CHANGE:` no footer:
```bash
feat(api)!: remove deprecated endpoint
# ou
feat(api): update authentication

BREAKING CHANGE: JWT tokens now expire in 1 hour instead of 24 hours
```

#### 8. Code Review Checklist

Antes de aprovar um PR, validar:
- [ ] Todos os testes passando
- [ ] Coverage 100%
- [ ] Biome check passando
- [ ] TypeCheck sem erros
- [ ] Seguiu TDD (histórico de commits RED-GREEN-REFACTOR)
- [ ] Clean Architecture respeitada
- [ ] SOLID aplicado
- [ ] Código limpo e legível
- [ ] Sem `any`, `@ts-ignore`, ou console.log
- [ ] Documentação atualizada (se necessário)
- [ ] Sem quebra de funcionalidades existentes

---

## 🏗️ Fase 1: Setup e Infraestrutura Base

### 1.1 Configuração do Projeto

- [ ] **T001** - Criar estrutura de monorepo (Backend + Frontend + Desktop)
  - Configurar workspace com pnpm ou yarn workspaces
  - Definir estrutura de diretórios: `/packages/backend`, `/packages/frontend`, `/packages/desktop`

- [ ] **T002** - Configurar Backend (Hono + Node.js + TypeScript)
  - Inicializar projeto Node.js com TypeScript (latest)
  - Configurar Hono framework (latest)
  - Configurar Vite como build tool (latest)
  - Configurar arquivo tsconfig.json com modo STRICT (sem any)

- [ ] **T002A** - Configurar Drizzle ORM no Backend (latest)
  - Instalar Drizzle ORM (`drizzle-orm@latest`)
  - Instalar driver SQLite (`better-sqlite3@latest` ou `@libsql/client@latest`)
  - Instalar Drizzle Kit (`drizzle-kit@latest`)
  - Criar arquivo de configuração `drizzle.config.ts`
  - Configurar conexão com SQLite
  - Configurar estrutura de diretórios: `/src/db/schema`, `/src/db/migrations`
  - Configurar scripts no package.json (generate, migrate, studio)

- [ ] **T003** - Configurar Frontend (Vue.js + PWA)
  - Inicializar projeto Vue.js 3 (latest) com Vite (latest)
  - Configurar TypeScript (latest) em modo STRICT
  - Configurar Vue Router (latest)
  - Configurar Pinia (latest)
  - Configurar arquivo tsconfig.json com modo STRICT (sem any)

- [ ] **T004** - Configurar Desktop (Tauri)
  - Inicializar projeto Tauri v2 (latest)
  - Configurar integração com Frontend Vue.js
  - Configurar sistema de atualização automática
  - Configurar build e empacotamento
  - Configurar Clippy para Rust

- [ ] **T005** - Configurar versionamento e CI/CD
  - Configurar conventional commits
  - Configurar semantic-release ou similar (latest)
  - Configurar GitHub Actions (latest)
  - Configurar builds automáticos
  - Configurar gates de qualidade (testes, lint, typecheck)

---

### 1.2 Qualidade de Código e TDD First

- [ ] **T006A** - Configurar Biome.js em todos os projetos
  - Instalar Biome.js (`@biomejs/biome@latest`) no monorepo
  - Criar `biome.json` na raiz do monorepo
  - Configurar regras de linting rigorosas
  - Configurar formatação (substituindo Prettier)
  - Configurar import sorting
  - Adicionar scripts: `lint`, `format`, `check`
  - Integrar com VSCode (extensão Biome)
  - Validar que ESLint e Prettier não estejam instalados

- [ ] **T006B** - Configurar TypeScript Strict em todos os projetos
  - Backend: tsconfig.json com `strict: true`
  - Frontend: tsconfig.json com `strict: true`
  - Desktop: tsconfig.json com `strict: true`
  - Configurar regras adicionais:
    - `noImplicitAny: true`
    - `strictNullChecks: true`
    - `strictFunctionTypes: true`
    - `strictBindCallApply: true`
    - `strictPropertyInitialization: true`
    - `noImplicitThis: true`
    - `alwaysStrict: true`
    - `noUnusedLocals: true`
    - `noUnusedParameters: true`
    - `noImplicitReturns: true`
    - `noFallthroughCasesInSwitch: true`
    - `noUncheckedIndexedAccess: true`
  - Adicionar script `typecheck` em todos os projetos
  - Validar que não existam erros de tipo

- [ ] **T006C** - Configurar Vitest para TDD com coverage 100%
  - Instalar Vitest (`vitest@latest`) em backend e frontend
  - Criar `vitest.config.ts` em cada projeto
  - Configurar coverage com c8/istanbul
  - Definir thresholds de coverage: 100% (branches, functions, lines, statements)
  - Configurar watch mode para TDD
  - Configurar UI mode do Vitest
  - Adicionar scripts: `test`, `test:watch`, `test:ui`, `test:coverage`
  - Configurar para falhar se coverage < 100%

- [ ] **T006D** - Configurar commitlint para Conventional Commits
  - Instalar commitlint (`@commitlint/cli@latest`)
  - Instalar config conventional (`@commitlint/config-conventional@latest`)
  - Criar `commitlint.config.js` na raiz do monorepo
  - Configurar regras rigorosas:
    - `type-enum`: apenas types permitidos
    - `type-case`: lowercase obrigatório
    - `type-empty`: type obrigatório
    - `scope-case`: lowercase
    - `subject-case`: lowercase, imperativo
    - `subject-empty`: subject obrigatório
    - `subject-full-stop`: sem ponto final
    - `header-max-length`: 72 caracteres
    - `body-leading-blank`: linha em branco antes do body
    - `footer-leading-blank`: linha em branco antes do footer
  - Configurar scopes sugeridos (backend, frontend, desktop, api, etc)
  - Adicionar script `npm run commit` com commitizen (opcional)
  - Testar validação: `echo "invalid message" | npx commitlint`

- [ ] **T006E** - Configurar Lefthook para Git Hooks
  - Instalar Lefthook (`lefthook@latest`)
  - Criar `lefthook.yml` na raiz do monorepo
  - **Pre-commit hooks:**
    - Executar Biome lint nos staged files
    - Executar Biome format check nos staged files
    - Executar typecheck em todos os projetos
    - Executar testes relacionados aos staged files
    - Bloquear commit se houver erros
  - **Commit-msg hook:**
    - Executar commitlint para validar formato
    - Validar Conventional Commits 1.0.0
    - Bloquear se mensagem inválida
    - Mostrar exemplos de mensagens válidas em caso de erro
  - **Pre-push hooks:**
    - Executar todos os testes
    - Executar coverage check (100% obrigatório)
    - Executar typecheck completo em todos os projetos
    - Executar Biome check completo
    - Validar que todos os commits seguem Conventional Commits
    - Bloquear push se houver qualquer falha
  - Instalar hooks: `lefthook install`
  - Adicionar script no package.json: `"prepare": "lefthook install"`
  - Testar todos os hooks manualmente

- [ ] **T006F** - Criar workflow de TDD e validação de ciclo RED-GREEN-REFACTOR
  - Criar script `scripts/tdd-validator.ts` para validar ciclo TDD
  - Validações do ciclo:
    1. RED: Deve existir teste falhando antes de implementar
    2. GREEN: Implementação mínima para passar o teste
    3. REFACTOR: Código refatorado mantendo testes verdes
  - Criar template de teste comentado com instruções TDD
  - Criar comando `npm run tdd:start <feature>` que:
    - Cria arquivo de teste a partir do template
    - Inicia Vitest em watch mode
    - Monitora ciclo TDD
    - Gera relatório de conformidade
  - Documentar processo TDD no README
  - Criar checklist de TDD para cada feature

- [ ] **T006G** - Configurar Clean Architecture e estrutura de pastas
  - Definir estrutura de camadas (Backend):
    - `/src/domain` - Entities, Value Objects, Domain Events
    - `/src/application` - Use Cases, DTOs, Interfaces
    - `/src/infrastructure` - Repositories, External Services, DB
    - `/src/presentation` - Controllers, Routes, Middleware
    - `/src/shared` - Utilities, Common Types
  - Definir estrutura de camadas (Frontend):
    - `/src/domain` - Models, Business Logic
    - `/src/application` - Use Cases, Services
    - `/src/infrastructure` - API Clients, Storage
    - `/src/presentation` - Components, Views, Composables
    - `/src/shared` - Utils, Types, Constants
  - Criar templates para cada camada
  - Documentar responsabilidades de cada camada
  - Configurar path aliases no tsconfig
  - Validar dependências entre camadas (domain não depende de infra)

- [ ] **T006H** - Configurar CI/CD com gates de qualidade
  - Criar workflow GitHub Actions `.github/workflows/ci.yml`
  - Jobs paralelos:
    1. **Lint & Format:** Biome check em todos os projetos
    2. **TypeCheck:** TypeScript check em todos os projetos
    3. **Tests:** Rodar todos os testes com coverage
    4. **Build:** Build de todos os projetos
    5. **Commits:** Validar Conventional Commits no histórico
  - Gates obrigatórios (blocking):
    - Biome check deve passar (zero erros)
    - TypeCheck deve passar (zero erros)
    - Coverage deve ser 100% (sem exceções)
    - Todos os testes devem passar
    - Build deve ser bem-sucedido
    - Todos os commits devem seguir Conventional Commits
  - Executar em: pull requests, pushes para main/develop
  - Status checks obrigatórios no GitHub
  - Bloquear merge se algum gate falhar
  - Adicionar badge de status no README

- [ ] **T006I** - Criar documentação de padrões e boas práticas
  - Criar `CONTRIBUTING.md` com:
    - Guia de TDD First (ciclo RED-GREEN-REFACTOR)
    - Padrões de código (Clean Code)
    - Clean Architecture explicada
    - Como rodar testes
    - Como usar Biome
    - Como usar Lefthook
    - Conventional Commits
  - Criar `ARCHITECTURE.md` com:
    - Diagrama de camadas
    - Fluxo de dados
    - Padrões de design utilizados
    - Exemplos práticos
  - Criar `TESTING.md` com:
    - Estratégia de testes
    - Pirâmide de testes
    - Exemplos de testes unitários
    - Exemplos de testes de integração
    - Como alcançar 100% coverage

---

## 🗄️ Fase 2: Banco de Dados e Persistência

> **⚠️ IMPORTANTE - TDD FIRST:**
> Antes de implementar qualquer schema ou funcionalidade nesta fase:
> 1. Escrever testes que falham (RED)
> 2. Implementar código mínimo para passar (GREEN)
> 3. Refatorar mantendo testes verdes (REFACTOR)
>
> Coverage obrigatório: 100% - sem exceções

### 2.1 Estrutura do Banco de Dados SQLite com Drizzle ORM

- [ ] **T007** - [TDD] Criar schema base do banco de dados com Drizzle
  - **RED:** Escrever testes para validação de schemas
  - **GREEN:** Definir estrutura de schemas no Drizzle
  - Configurar tipos TypeScript strict
  - Gerar migration inicial
  - **REFACTOR:** Otimizar estrutura se necessário
  - Validar coverage 100%

- [ ] **T008** - [TDD] Implementar schema `produtos` com Drizzle
  - Campos: id (uuid/text primary key), codigo, sku, gtin, dun14, codigo_balanca, status, descricao, unidade_medida
  - Campos de preço: preco_unitario, preco_promocional, preco_promocional_inicio, preco_promocional_fim
  - Campos fiscais: origem_tributaria, ncm, cest, tributacao, aliquota_icms
  - Timestamps: created_at, updated_at, deleted_at (soft delete)
  - Índices únicos: sku, gtin
  - Gerar migration com `drizzle-kit generate`

- [ ] **T008** - Implementar schema `estoque` com Drizzle
  - Campos: id, produto_id (foreign key), quantidade, data_movimento, tipo_movimento, observacao
  - Relacionamento com produtos
  - Índices apropriados
  - Gerar migration

- [ ] **T009** - Implementar schema `vendas` com Drizzle
  - Campos: id, numero_venda, data_hora, usuario_id, status, total_bruto, desconto, acrescimo, total_liquido
  - Campos do cliente: cpf_cliente, email_cliente
  - Campos NFC-e: chave_nfce, numero_nfce, serie_nfce, status_nfce
  - Timestamps
  - Relacionamento com usuários
  - Gerar migration

- [ ] **T010** - Implementar schema `venda_itens` com Drizzle
  - Campos: id, venda_id, produto_id, numero_item, codigo, descricao, quantidade, valor_unitario, total_item
  - Relacionamentos (foreign keys): venda_id → vendas, produto_id → produtos
  - Índices compostos
  - Gerar migration

- [ ] **T011** - Implementar schema `venda_pagamentos` com Drizzle
  - Campos: id, venda_id (foreign key), meio_pagamento, codigo_meio_pagamento, valor
  - Relacionamento com vendas
  - Enum para código_meio_pagamento (01-99 conforme SEFAZ)
  - Gerar migration

- [ ] **T012** - Implementar schema `movimentos_caixa` com Drizzle
  - Campos: id, usuario_id, data_abertura, data_fechamento, suprimento_inicial, status
  - Campos de totais: venda_bruta, cancelamentos, descontos, acrescimos, venda_liquida
  - Campos de movimentação: sangria, despesas, suprimento_adicional, resultado
  - Relacionamento com usuários
  - Enum para status (aberto, fechado)
  - Gerar migration

- [ ] **T013** - Implementar schema `movimentacoes_caixa` com Drizzle
  - Campos: id, movimento_caixa_id, tipo, descricao, valor, data_hora, usuario_id
  - Enum para tipo: suprimento, despesa, sangria
  - Relacionamentos: movimento_caixa_id → movimentos_caixa, usuario_id → usuarios
  - Campo opcional: meio_pagamento_id (para sangria)
  - Gerar migration

- [ ] **T014** - Implementar schema `usuarios` com Drizzle
  - Campos: id, nome, login (unique), senha_hash, perfil, ativo
  - Enum para perfil (admin, gerente, operador)
  - Campos de auditoria: created_at, updated_at
  - Índice único: login
  - Gerar migration

- [ ] **T015** - Implementar schema `auditoria` com Drizzle
  - Campos: id, usuario_id, tabela, operacao, registro_id, dados_anteriores (json), dados_novos (json), data_hora
  - Relacionamento com usuários
  - Índices: usuario_id, tabela, data_hora
  - Gerar migration

- [ ] **T015A** - Executar migrations e validar banco de dados
  - Executar `drizzle-kit migrate` para aplicar todas as migrations
  - Validar estrutura do banco criado
  - Testar conexões e queries básicas
  - Configurar seed inicial (usuário admin)

### 2.2 Configuração de Persistência Offline

- [ ] **T016** - Configurar SQLite + Drizzle no Frontend (PWA)
  - Instalar Drizzle ORM para frontend
  - Configurar driver SQLite web-friendly (SQL.js ou @op-engineering/op-sqlite)
  - Reutilizar schemas do backend
  - Configurar Drizzle Client para frontend
  - Implementar migrations locais com Drizzle Kit
  - Sincronizar schema entre backend e frontend

- [ ] **T017** - Implementar Service Worker para PWA
  - Configurar Workbox
  - Implementar estratégia de cache
  - Implementar offline fallback
  - Configurar sincronização em background

- [ ] **T018** - Implementar sistema de sincronização de dados
  - Detectar estado online/offline
  - Implementar fila de sincronização
  - Resolver conflitos de dados
  - Implementar retry automático

---

## 🎨 Fase 3: Interface e Componentes Base

### 3.1 Design System e Componentes UI

- [ ] **T019** - Configurar biblioteca de componentes UI
  - Escolher e configurar (Vuetify, PrimeVue, Element Plus ou criar custom)
  - Definir paleta de cores
  - Definir tipografia
  - Configurar tema claro/escuro (opcional)

- [ ] **T020** - Criar componentes base reutilizáveis
  - Button
  - Input
  - Select
  - Dialog/Modal
  - Table/DataTable
  - Card
  - Alert/Notification
  - Loading/Spinner

- [ ] **T021** - Criar layout principal
  - Header/AppBar
  - Sidebar/Navigation (se aplicável)
  - Footer
  - Container principal
  - Layout responsivo (Mobile First)

- [ ] **T022** - Criar componente de autenticação
  - Input de usuário
  - Input de senha
  - Botão de login
  - Feedback de erros
  - Loading state

---

## 🛍️ Fase 4: Módulo de Produtos

### 4.1 Backend - API de Produtos

- [ ] **T023** - Criar endpoints REST para produtos
  - POST /api/produtos - Criar produto
  - GET /api/produtos - Listar produtos (com paginação e filtros)
  - GET /api/produtos/:id - Buscar produto por ID
  - PUT /api/produtos/:id - Atualizar produto
  - DELETE /api/produtos/:id - Deletar produto (soft delete)

- [ ] **T024** - Implementar validações de produtos
  - Validar campos obrigatórios
  - Validar formatos (GTIN, NCM, CEST)
  - Validar unicidade (SKU, GTIN)
  - Validar valores numéricos

- [ ] **T025** - Implementar busca inteligente de produtos
  - Busca por descrição (fuzzy search)
  - Busca por GTIN/EAN/UPC
  - Busca por SKU
  - Busca por DUN-14
  - Busca por código de balança
  - Indexação para performance

### 4.2 Frontend - Telas de Produtos

- [ ] **T026** - Criar tela de listagem de produtos
  - DataTable com produtos
  - Paginação
  - Filtros (status, descrição, códigos)
  - Botão adicionar produto
  - Ações por item (editar, excluir)

- [ ] **T027** - Criar formulário de cadastro de produto
  - Seção: Informações básicas
  - Seção: Códigos (SKU, GTIN, DUN-14, Código balança)
  - Seção: Preços (unitário, promocional, por quantidade)
  - Seção: Informações fiscais (NCM, CEST, tributação, alíquota)
  - Validações client-side
  - Feedback de sucesso/erro

- [ ] **T028** - Criar componente Lookup de Produtos
  - Input de busca com autocomplete
  - Filtros múltiplos (descrição, GTIN, SKU, DUN14)
  - Exibição dos resultados em lista
  - Seleção de produto
  - Performance otimizada (debounce, virtualização)

---

## 📦 Fase 5: Módulo de Estoque

### 5.1 Backend - API de Estoque

- [ ] **T029** - Criar endpoints REST para estoque
  - POST /api/estoque/entrada - Registrar entrada
  - POST /api/estoque/saida - Registrar saída
  - GET /api/estoque/produto/:id - Consultar estoque de produto
  - GET /api/estoque/movimentacoes - Listar movimentações
  - POST /api/estoque/inventario - Realizar inventário

- [ ] **T030** - Implementar lógica de movimentação de estoque
  - Validar disponibilidade antes de saída
  - Atualizar quantidade automaticamente
  - Registrar histórico de movimentações
  - Calcular estoque atual

### 5.2 Frontend - Telas de Estoque

- [ ] **T031** - Criar tela de movimentação de estoque
  - Formulário de entrada de produtos
  - Formulário de saída de produtos
  - Seleção de produto via Lookup
  - Input de quantidade
  - Observações
  - Confirmação e feedback

- [ ] **T032** - Criar tela de inventário
  - Lista de produtos para contagem
  - Input de quantidade contada
  - Comparação estoque sistema vs. contagem
  - Ajuste automático
  - Relatório de divergências

---

## 💰 Fase 6: Módulo de PDV (Ponto de Venda)

### 6.1 Backend - API de Vendas

- [ ] **T033** - Criar endpoints REST para vendas
  - POST /api/vendas - Criar nova venda
  - POST /api/vendas/:id/itens - Adicionar item à venda
  - DELETE /api/vendas/:id/itens/:item_id - Cancelar item
  - PUT /api/vendas/:id/desconto - Aplicar desconto
  - PUT /api/vendas/:id/acrescimo - Aplicar acréscimo
  - POST /api/vendas/:id/finalizar - Finalizar venda
  - DELETE /api/vendas/:id - Cancelar venda
  - GET /api/vendas - Listar vendas
  - GET /api/vendas/:id - Buscar venda por ID

- [ ] **T034** - Implementar lógica de cálculos de venda
  - Calcular subtotal por item
  - Calcular total da venda
  - Aplicar descontos (percentual e valor)
  - Aplicar acréscimos (percentual e valor)
  - Calcular total final
  - Validar formas de pagamento

- [ ] **T035** - Implementar validações de venda
  - Validar estoque disponível
  - Validar valores de desconto/acréscimo
  - Validar meios de pagamento
  - Validar total recebido vs. total venda
  - Validar CPF do cliente (opcional)

### 6.2 Frontend - Tela Principal de PDV

- [ ] **T036** - Criar layout da tela de PDV
  - Área de busca/entrada de produto
  - Display de produto atual
  - Lista de itens da venda
  - Painel de totais
  - Área de mensagens/avisos
  - Botões de ação (cancelar item, cancelar venda, finalizar)

- [ ] **T037** - Implementar entrada de produtos no PDV
  - Input de código (GTIN, SKU, DUN14, código balança)
  - Busca automática ao digitar código
  - Busca via Lookup modal
  - Input de quantidade
  - Adicionar item à lista
  - Feedback visual e sonoro

- [ ] **T038** - Implementar lista de itens da venda
  - DataTable responsiva com itens
  - Exibir: nº item, código, descrição, quantidade, valor unit., total
  - Ação de cancelar item (com confirmação e senha)
  - Highlight do item atual
  - Scroll automático
  - Totalizador em destaque

- [ ] **T039** - Implementar painel de totais e mensagens
  - Display do total acumulado (grande e visível)
  - Área de mensagens contextuais
  - Alertas de estoque, promoções, etc.
  - Status da conexão (online/offline)

- [ ] **T040** - Implementar ações do PDV
  - Botão cancelar item (com senha)
  - Botão cancelar venda (com confirmação e senha)
  - Botão finalizar venda (abre modal de finalização)
  - Atalhos de teclado (F-keys)

### 6.3 Frontend - Tela de Finalização e Pagamento

- [ ] **T041** - Criar modal de finalização de venda
  - Exibir total da compra
  - Inputs de desconto (% e R$)
  - Inputs de acréscimo (% e R$)
  - Recalcular total final automaticamente
  - Input CPF do cliente
  - Input e-mail do cliente

- [ ] **T042** - Implementar seleção de meios de pagamento
  - Dropdown com todos os meios conforme SEFAZ
  - Input de valor para cada meio
  - Adicionar meio à lista
  - Remover meio da lista
  - Exibir total recebido vs. total a receber
  - Calcular troco (se dinheiro)

- [ ] **T043** - Implementar validações de finalização
  - Validar que total recebido = total venda
  - Validar CPF (se informado)
  - Validar e-mail (se informado)
  - Validar meios de pagamento selecionados
  - Bloquear finalização se inválido

- [ ] **T044** - Implementar conclusão da venda
  - Confirmar finalização
  - Registrar venda no banco
  - Dar baixa no estoque
  - Acionar emissão de NFC-e
  - Exibir feedback de sucesso
  - Opção de imprimir comprovante
  - Limpar tela para nova venda

---

## 🏦 Fase 7: Módulo de Caixa

### 7.1 Backend - API de Movimento de Caixa

- [ ] **T045** - Criar endpoints REST para movimento de caixa
  - POST /api/caixa/abertura - Abrir movimento
  - POST /api/caixa/suprimento - Registrar suprimento
  - POST /api/caixa/despesa - Registrar despesa
  - POST /api/caixa/sangria - Registrar sangria
  - POST /api/caixa/fechamento - Fechar movimento
  - GET /api/caixa/movimento-atual - Buscar movimento em aberto
  - GET /api/caixa/movimentos - Listar movimentos históricos

- [ ] **T046** - Implementar lógica de abertura de movimento
  - Validar que não existe movimento aberto
  - Autenticar usuário (login + senha)
  - Registrar suprimento inicial
  - Criar registro de movimento
  - Registrar em auditoria

- [ ] **T047** - Implementar lógica de movimentações
  - Suprimento: adicionar valor ao caixa
  - Despesa: registrar saída com descrição
  - Sangria: retirar valores por meio de pagamento
  - Validar movimento aberto
  - Atualizar totais do movimento

- [ ] **T048** - Implementar lógica de fechamento
  - Calcular totais (vendas, cancelamentos, descontos, acréscimos)
  - Calcular venda líquida
  - Calcular resultado final
  - Listar totais por meio de pagamento
  - Listar sangrias e despesas
  - Autenticar usuário (senha)
  - Fechar movimento
  - Gerar relatório

### 7.2 Frontend - Telas de Caixa

- [ ] **T049** - Criar modal de abertura de movimento
  - Input de usuário (login)
  - Input de senha
  - Input de suprimento inicial (valor)
  - Botão confirmar
  - Validações
  - Feedback

- [ ] **T050** - Criar modal de suprimento
  - Input de valor
  - Botão confirmar
  - Validações
  - Feedback
  - Atualizar saldo em tela

- [ ] **T051** - Criar modal de despesa
  - Input de descrição
  - Input de valor
  - Botão confirmar
  - Validações
  - Feedback

- [ ] **T052** - Criar modal de sangria
  - Lista de meios de pagamento com saldos
  - Input de valor para cada meio
  - Validar que valor não excede saldo
  - Botão confirmar
  - Feedback

- [ ] **T053** - Criar tela de fechamento de movimento
  - Seção: Resumo de vendas (bruta, cancelamentos, descontos, acréscimos, líquida)
  - Seção: Totais por meio de pagamento (tabela)
  - Seção: Sangrias (lista com valores)
  - Seção: Despesas (lista com valores)
  - Seção: Resultado final
  - Input de usuário e senha
  - Botão fechar movimento
  - Opção de imprimir relatório

---

## 🧾 Fase 8: Integração NFC-e

### 8.1 Backend - Infraestrutura NFC-e

- [ ] **T054** - Configurar certificado digital A1
  - Armazenar certificado de forma segura
  - Implementar leitura do certificado
  - Validar validade do certificado
  - Renovação automática (se possível)

- [ ] **T055** - Implementar geração de XML NFC-e (Modelo 65)
  - Estrutura básica do XML conforme schema SEFAZ
  - Seção: Identificação da NFC-e
  - Seção: Emitente
  - Seção: Destinatário (cliente)
  - Seção: Produtos (detalhes dos itens)
  - Seção: Impostos (ICMS, PIS, COFINS)
  - Seção: Total da NFC-e
  - Seção: Formas de pagamento
  - Assinar XML com certificado

- [ ] **T056** - Implementar comunicação com SEFAZ
  - Endpoint de autorização (envio do XML)
  - Endpoint de consulta de protocolo
  - Endpoint de inutilização
  - Endpoint de cancelamento
  - Tratamento de respostas
  - Retry automático em caso de falha temporária

- [ ] **T057** - Implementar validações de NFC-e
  - Validar XML conforme schema
  - Validar regras de negócio da SEFAZ
  - Validar sequência de numeração
  - Validar série
  - Validar valores e impostos

### 8.2 Backend - Emissão e Gestão de NFC-e

- [ ] **T058** - Criar endpoints REST para NFC-e
  - POST /api/nfce/emitir - Emitir NFC-e para uma venda
  - POST /api/nfce/cancelar/:id - Cancelar NFC-e
  - GET /api/nfce/:id - Consultar NFC-e
  - GET /api/nfce/:id/xml - Baixar XML
  - GET /api/nfce/:id/danfe - Gerar DANFE (PDF)
  - POST /api/nfce/:id/enviar-email - Enviar por e-mail

- [ ] **T059** - Implementar fluxo de emissão de NFC-e
  - Buscar dados da venda
  - Gerar próximo número de NFC-e
  - Gerar XML
  - Assinar XML
  - Enviar para SEFAZ
  - Processar retorno (autorizada/rejeitada)
  - Atualizar venda com chave e protocolo
  - Armazenar XML autorizado
  - Registrar em auditoria

- [ ] **T060** - Implementar fluxo de cancelamento de NFC-e
  - Validar prazo de cancelamento (24h)
  - Gerar evento de cancelamento
  - Assinar evento
  - Enviar para SEFAZ
  - Processar retorno
  - Atualizar status da NFC-e
  - Registrar em auditoria

- [ ] **T061** - Implementar modo de contingência
  - Detectar falha na comunicação com SEFAZ
  - Gerar NFC-e em contingência offline
  - Armazenar NFC-e para transmissão posterior
  - Implementar fila de transmissão
  - Transmitir automaticamente quando conexão restaurada

### 8.3 Backend - DANFE e Impressão

- [ ] **T062** - Implementar geração de DANFE NFC-e
  - Criar template HTML/CSS do cupom fiscal
  - Incluir QR Code
  - Incluir chave de acesso
  - Incluir dados do emitente
  - Incluir itens da venda
  - Incluir totais e formas de pagamento
  - Incluir mensagem fiscal
  - Gerar PDF do DANFE

- [ ] **T063** - Implementar comunicação com impressora
  - Suporte a impressoras térmicas (ESC/POS)
  - Comandos de formatação
  - Impressão de QR Code
  - Corte automático de papel
  - Detecção de status da impressora

- [ ] **T064** - Implementar envio de NFC-e por e-mail
  - Template de e-mail
  - Anexar XML
  - Anexar PDF do DANFE
  - Incluir QR Code
  - Configurar SMTP
  - Fila de envio assíncrona

### 8.4 Frontend - Interface NFC-e

- [ ] **T065** - Criar tela de consulta de NFC-e
  - Listar NFC-es emitidas
  - Filtros (data, status, cliente, valor)
  - Exibir detalhes da NFC-e
  - Ações: visualizar DANFE, baixar XML, reenviar e-mail, cancelar

- [ ] **T066** - Implementar visualização de DANFE
  - Modal ou nova aba com DANFE
  - Opção de imprimir
  - Opção de baixar PDF
  - QR Code clicável

- [ ] **T067** - Implementar modal de cancelamento de NFC-e
  - Exibir dados da NFC-e
  - Input de justificativa (mínimo 15 caracteres)
  - Validar prazo
  - Confirmação
  - Feedback de sucesso/erro

---

## 🔐 Fase 9: Autenticação e Segurança

### 9.1 Backend - Autenticação

- [ ] **T068** - Implementar sistema de autenticação JWT
  - Endpoint POST /api/auth/login
  - Validar credenciais
  - Gerar token JWT
  - Refresh token
  - Endpoint POST /api/auth/logout

- [ ] **T069** - Implementar middleware de autenticação
  - Verificar token em requisições
  - Validar expiração
  - Validar assinatura
  - Extrair dados do usuário

- [ ] **T070** - Implementar controle de permissões
  - Definir perfis/roles (admin, operador, gerente)
  - Middleware de autorização
  - Validar permissões por endpoint
  - Validar permissões por operação

- [ ] **T071** - Implementar hash de senhas
  - Usar bcrypt ou argon2
  - Hash na criação de usuário
  - Comparação no login
  - Política de senhas fortes

### 9.2 Frontend - Autenticação

- [ ] **T072** - Criar tela de login
  - Input de usuário
  - Input de senha
  - Botão entrar
  - Validações
  - Feedback de erro
  - Loading state

- [ ] **T073** - Implementar gerenciamento de sessão
  - Armazenar token (localStorage ou sessionStorage)
  - Incluir token em requisições (interceptor)
  - Detectar expiração
  - Redirecionar para login se não autenticado
  - Logout

- [ ] **T074** - Implementar modal de autenticação para operações sensíveis
  - Input de senha
  - Validar senha atual do usuário
  - Usar para: cancelamento de venda, fechamento de caixa, sangria, etc.

---

## 📱 Fase 10: PWA e Offline

### 10.1 Configuração PWA

- [ ] **T075** - Configurar manifest.json
  - Nome da aplicação
  - Ícones (vários tamanhos)
  - Tema de cores
  - Display mode (standalone)
  - Orientação
  - Start URL

- [ ] **T076** - Configurar Service Worker
  - Estratégias de cache (Network First, Cache First, Stale While Revalidate)
  - Cache de assets estáticos
  - Cache de dados dinâmicos
  - Precache de rotas principais
  - Background sync

- [ ] **T077** - Implementar detecção de status online/offline
  - Event listeners (online/offline)
  - Indicador visual na UI
  - Notificar usuário sobre mudanças
  - Ajustar comportamento conforme status

- [ ] **T078** - Implementar sincronização em background
  - Fila de operações pendentes
  - Sincronizar quando ficar online
  - Resolver conflitos
  - Notificar sucesso/falha

### 10.2 Otimizações de Performance

- [ ] **T079** - Implementar lazy loading de rotas
  - Dividir código por rotas
  - Carregar apenas o necessário
  - Prefetch de rotas prováveis

- [ ] **T080** - Implementar virtualização de listas
  - Usar virtual scroll para listas grandes
  - Otimizar renderização de produtos
  - Otimizar lista de itens da venda

- [ ] **T081** - Otimizar bundle size
  - Tree shaking
  - Code splitting
  - Minificação
  - Compressão (gzip/brotli)
  - Análise de bundle

- [ ] **T082** - Implementar otimizações de imagem
  - Lazy loading de imagens
  - Formatos modernos (WebP)
  - Responsive images
  - Placeholder/skeleton

---

## 🖥️ Fase 11: Desktop (Tauri)

### 11.1 Configuração e Integração

- [ ] **T083** - Configurar comunicação Frontend-Backend via Tauri
  - Implementar Tauri commands
  - Integrar com SQLite nativo usando Drizzle ORM
  - Configurar better-sqlite3 ou rusqlite
  - Reutilizar schemas do backend
  - Integrar com sistema de arquivos para armazenamento local

- [ ] **T084** - Implementar funcionalidades nativas
  - Integração com impressora (via Rust)
  - Leitura de certificado A1
  - Acesso a hardware (leitor de código de barras, gaveta)

- [ ] **T085** - Configurar sistema de atualização
  - Tauri updater
  - Verificação automática de atualizações
  - Download e instalação de updates
  - Notificação ao usuário

- [ ] **T086** - Configurar build e empacotamento
  - Build para Windows
  - Build para Linux
  - Build para macOS (se aplicável)
  - Assinatura de executáveis
  - Instaladores

---

## 📊 Fase 12: Relatórios e Consultas

### 12.1 Backend - API de Relatórios

- [ ] **T087** - Criar endpoints de relatórios
  - GET /api/relatorios/vendas - Relatório de vendas (por período, produto, operador)
  - GET /api/relatorios/estoque - Relatório de estoque
  - GET /api/relatorios/caixa - Relatório de movimento de caixa
  - GET /api/relatorios/fiscais - Relatório de NFC-es emitidas

- [ ] **T088** - Implementar agregações e análises
  - Vendas por período
  - Produtos mais vendidos
  - Formas de pagamento mais usadas
  - Desempenho por operador
  - Lucratividade

### 12.2 Frontend - Telas de Relatórios

- [ ] **T089** - Criar tela de relatórios de vendas
  - Filtros (data inicial, data final, produto, operador)
  - Exibir dados em tabela
  - Gráficos (vendas por dia, por produto)
  - Exportar (CSV, PDF)

- [ ] **T090** - Criar tela de relatório de estoque
  - Listar produtos com estoque atual
  - Filtros (baixo estoque, sem movimento)
  - Alertas de ruptura

- [ ] **T091** - Criar dashboard gerencial
  - KPIs principais (vendas do dia, ticket médio, etc.)
  - Gráficos de tendência
  - Top produtos
  - Status do caixa

---

## 🧪 Fase 13: Testes

### 13.1 Testes Backend

- [ ] **T092** - Configurar ambiente de testes
  - Jest ou Vitest
  - Configurar banco de testes
  - Mocks e fixtures

- [ ] **T093** - Implementar testes unitários do backend
  - Testes de validações
  - Testes de lógica de negócio
  - Testes de cálculos
  - Coverage mínimo de 70%

- [ ] **T094** - Implementar testes de integração do backend
  - Testes de endpoints
  - Testes de fluxos completos
  - Testes de banco de dados

- [ ] **T095** - Implementar testes de NFC-e
  - Testes de geração de XML
  - Testes de assinatura
  - Mocks de SEFAZ
  - Testes de contingência

### 13.2 Testes Frontend

- [ ] **T096** - Configurar ambiente de testes frontend
  - Vitest + Vue Test Utils
  - Cypress ou Playwright para E2E

- [ ] **T097** - Implementar testes unitários de componentes
  - Testes de componentes base
  - Testes de validações
  - Testes de computed properties
  - Testes de stores (Pinia)

- [ ] **T098** - Implementar testes E2E
  - Fluxo completo de venda
  - Fluxo de abertura e fechamento de caixa
  - Fluxo de emissão de NFC-e
  - Testes de responsividade

---

## 📚 Fase 14: Documentação

- [ ] **T099** - Documentar API do Backend
  - Usar Swagger/OpenAPI
  - Documentar todos os endpoints
  - Exemplos de requisições e respostas
  - Códigos de erro

- [ ] **T100** - Criar manual do usuário
  - Como usar o PDV
  - Como cadastrar produtos
  - Como abrir e fechar caixa
  - Como consultar NFC-e
  - FAQ

- [ ] **T101** - Criar documentação técnica
  - Arquitetura do sistema
  - Fluxo de dados
  - Decisões técnicas
  - Como executar o projeto
  - Como fazer deploy

- [ ] **T102** - Criar guia de instalação
  - Requisitos do sistema
  - Instalação no Windows
  - Instalação no Linux
  - Configuração inicial
  - Configuração de certificado
  - Configuração de impressora

---

## 🚀 Fase 15: Deploy e Produção

### 15.1 Preparação para Produção

- [ ] **T103** - Configurar variáveis de ambiente
  - Separar configs de dev/staging/prod
  - Secrets e credenciais
  - URLs de APIs

- [ ] **T104** - Configurar logging e monitoramento
  - Implementar logger estruturado
  - Logs de erro
  - Logs de auditoria
  - Monitoramento de performance
  - Alertas

- [ ] **T105** - Implementar backup automático
  - Backup do banco SQLite
  - Backup de XMLs de NFC-e
  - Rotação de backups
  - Restore

- [ ] **T106** - Configurar SSL/TLS
  - Certificado SSL para backend
  - HTTPS obrigatório
  - HSTS

### 15.2 Deploy

- [ ] **T107** - Preparar deploy do Backend
  - Containerização (Docker)
  - Configurar servidor
  - Deploy automatizado
  - Health checks

- [ ] **T108** - Preparar deploy do Frontend (PWA)
  - Build de produção
  - Hospedagem (CDN ou servidor)
  - Cache headers
  - Service worker registration

- [ ] **T109** - Preparar distribuição do Desktop
  - Builds finais
  - Assinatura de código
  - Upload para distribuição
  - Documentação de instalação

- [ ] **T110** - Configurar ambiente de homologação
  - Ambiente de testes integrado
  - Dados de teste
  - Certificado de homologação SEFAZ

---

## ✅ Fase 16: Validação e Aceite

- [ ] **T111** - Testes de aceite - Fluxo completo de venda
  - Adicionar produtos
  - Aplicar descontos
  - Finalizar com múltiplos meios de pagamento
  - Emitir NFC-e
  - Validar na SEFAZ

- [ ] **T112** - Testes de aceite - Movimento de caixa
  - Abrir movimento
  - Realizar vendas
  - Registrar sangrias e despesas
  - Fechar movimento
  - Validar totais

- [ ] **T113** - Testes de aceite - Modo offline
  - Realizar vendas offline
  - Sincronizar quando voltar online
  - Emitir NFC-e em contingência
  - Transmitir NFC-e de contingência

- [ ] **T114** - Testes de aceite - Responsividade
  - Testar em desktop
  - Testar em tablet
  - Testar em mobile
  - Validar usabilidade em todos os tamanhos

- [ ] **T115** - Testes de aceite - Performance
  - Tempo de resposta < 2s
  - Suportar 1000+ produtos
  - Suportar 100+ itens por venda
  - Validar uso de memória

- [ ] **T116** - Testes de aceite - Segurança
  - Validar autenticação
  - Validar autorização
  - Validar criptografia
  - Testes de penetração básicos

- [ ] **T117** - Homologação com SEFAZ
  - Emitir NFC-es em ambiente de homologação
  - Validar XMLs
  - Validar DANFEs
  - Validar cancelamento
  - Obter certificação (se aplicável)

---

## 📝 Observações Importantes

### Priorização

As tarefas estão organizadas em fases, mas algumas podem ser executadas em paralelo:

- **Crítico (MVP):** Fases 1 (completa), 2, 4, 6, 7, 8, 9
- **Importante:** Fases 3, 5, 10, 13
- **Desejável:** Fases 11, 12, 14, 15, 16

### Estimativas Ajustadas com TDD First e Coverage 100%

**Considerando:**
- TDD First obrigatório (RED-GREEN-REFACTOR)
- Coverage 100% sem exceções
- TypeScript strict (zero `any`)
- Clean Architecture
- Code reviews rigorosos
- Validações automáticas (Lefthook + CI/CD)

**Tempos estimados:**
- **Fase 1 (Setup + Qualidade):** 2-3 semanas
- **MVP funcional:** ~12-16 semanas (1 desenvolvedor full-time)
- **Sistema completo:** ~20-26 semanas
- **Homologação e produção:** +3-4 semanas

**Nota:** As estimativas são ~30% maiores devido à rigidez de qualidade, mas resultam em:
- ✅ Código mais confiável e manutenível
- ✅ Menos bugs em produção
- ✅ Facilidade de refatoração
- ✅ Documentação viva (testes)
- ✅ Onboarding mais rápido de novos devs

### Dependências Críticas

1. Certificado Digital A1 válido
2. Credenciais de acesso à SEFAZ (produção e homologação)
3. Documentação técnica da SEFAZ do estado
4. Impressora térmica compatível (ESC/POS)
5. Leitor de código de barras (recomendado)

### Decisões Técnicas - Drizzle ORM

**Por que Drizzle ORM?**
- **Type-safe:** Tipos TypeScript inferidos automaticamente dos schemas
- **Performance:** Queries SQL otimizadas, sem overhead de runtime
- **Developer Experience:** Syntax intuitiva e familiar para quem conhece SQL
- **Migrations:** Drizzle Kit gera migrations automaticamente a partir dos schemas
- **SQLite Support:** Suporte nativo e otimizado para SQLite
- **Zero Dependencies:** Leve e sem dependências pesadas
- **Drizzle Studio:** Ferramenta visual para explorar e gerenciar o banco

**Estrutura de Arquivos:**
```
packages/backend/
├── src/
│   ├── db/
│   │   ├── schema/           # Schemas Drizzle (produtos.ts, vendas.ts, etc)
│   │   ├── migrations/       # SQL migrations geradas
│   │   ├── index.ts          # Configuração da conexão
│   │   └── seed.ts           # Dados iniciais
│   └── ...
├── drizzle.config.ts         # Configuração Drizzle Kit
└── package.json
```

**Scripts NPM importantes:**
- `npm run db:generate` - Gera migrations a partir dos schemas
- `npm run db:migrate` - Aplica migrations no banco
- `npm run db:studio` - Abre Drizzle Studio (GUI web)
- `npm run db:push` - Push direto do schema (dev apenas)
- `npm run db:seed` - Popula banco com dados iniciais

### Processo de Validação do Ciclo TDD

**Script de Validação:** `scripts/tdd-validator.ts`

O script valida automaticamente se o ciclo RED-GREEN-REFACTOR foi seguido através da análise do histórico de commits:

**Validações Automáticas:**

1. **Validação RED (Teste Falhando)**
   - ✅ Commit com type `test:` existe antes de `feat:`
   - ✅ Teste falhava antes da implementação
   - ✅ Arquivo de teste criado/modificado antes do código
   - ❌ Bloqueia se código foi escrito antes do teste

2. **Validação GREEN (Implementação Mínima)**
   - ✅ Commit com type `feat:` após `test:`
   - ✅ Testes passam após implementação
   - ✅ Coverage aumentou
   - ❌ Bloqueia se testes continuam falhando

3. **Validação REFACTOR (Melhoria)**
   - ✅ Commit com type `refactor:` (opcional)
   - ✅ Testes continuam passando
   - ✅ Coverage mantido ou aumentado
   - ✅ Métricas de qualidade melhoradas (complexidade ciclomática)

**Execução:**
```bash
# Durante desenvolvimento
npm run tdd:start feature-name

# Validação manual
npm run tdd:validate

# Automático no pre-push (Lefthook)
lefthook run pre-push
```

**Relatório Gerado:**
```
TDD Cycle Validation Report
============================

Feature: user-authentication
✅ RED phase: test written first (commit abc123)
✅ GREEN phase: implementation passes (commit def456)
✅ REFACTOR phase: code improved (commit ghi789)

Coverage: 100% ✅
TypeCheck: Pass ✅
Biome Check: Pass ✅

Cycle: VALID ✅
```

**Métricas Acompanhadas:**
- Número de ciclos TDD completos
- Média de commits por feature
- Taxa de conformidade TDD (meta: 100%)
- Tempo médio por ciclo
- Complexidade ciclomática por arquivo

### Exemplo de Configuração commitlint

**Arquivo: `commitlint.config.js`**
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nova funcionalidade
        'fix',      // Correção de bug
        'test',     // Adicionar/modificar testes
        'refactor', // Refatoração
        'docs',     // Documentação
        'style',    // Formatação
        'perf',     // Performance
        'build',    // Build/dependências
        'ci',       // CI/CD
        'chore',    // Manutenção
        'revert',   // Revert de commit
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // Scope
    'scope-case': [2, 'always', 'lower-case'],
    'scope-enum': [
      2,
      'always',
      [
        'backend',
        'frontend',
        'desktop',
        'db',
        'api',
        'domain',
        'infra',
        'produto',
        'venda',
        'caixa',
        'nfce',
        'estoque',
      ],
    ],

    // Subject
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],

    // Header
    'header-max-length': [2, 'always', 72],

    // Body
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 100],

    // Footer
    'footer-leading-blank': [2, 'always'],
  },
};
```

**Teste de validação:**
```bash
# Válido
echo "feat(produto): add product search by GTIN" | npx commitlint

# Inválido - Type em maiúscula
echo "Feat(produto): add product search" | npx commitlint
# ❌ type must be lower-case

# Inválido - Sem type
echo "add product search" | npx commitlint
# ❌ type may not be empty

# Inválido - Subject em maiúscula
echo "feat(produto): Add product search" | npx commitlint
# ❌ subject must be lower-case

# Inválido - Header muito longo
echo "feat(produto): add product search by GTIN with advanced filters and pagination" | npx commitlint
# ❌ header must not be longer than 72 characters
```

### Riscos

**Técnicos:**
- **Integração com SEFAZ:** complexidade técnica alta
- **Modo offline:** sincronização de dados pode ter conflitos
- **Performance:** grandes volumes de dados podem impactar
- **Certificação fiscal:** pode exigir ajustes após homologação

**Qualidade:**
- **Coverage 100%:** pode ser desafiador em algumas situações edge
  - *Mitigação:* Refatorar código para ser testável, usar injeção de dependências
- **TDD First:** requer disciplina da equipe
  - *Mitigação:* Validação automática via Lefthook e CI/CD
- **Clean Architecture:** curva de aprendizado inicial
  - *Mitigação:* Documentação clara, templates, code reviews

---

## 🎯 Próximos Passos

1. Revisar e aprovar este planejamento
2. Definir prioridades e cronograma
3. Alocar recursos (desenvolvedores, designers)
4. Configurar ambiente de desenvolvimento
5. Iniciar Fase 1: Setup e Infraestrutura Base

---

**Documento criado em:** 2025-11-04
**Última atualização:** 2025-11-04
**Versão:** 2.0
**Changelog:**
- v2.0 (2025-11-04): **MAJOR UPDATE - Qualidade e TDD**
  - Todas as bibliotecas/frameworks atualizados para `@latest`
  - Adicionado **commitlint** com Conventional Commits 1.0.0 rigoroso
  - Adicionado Biome.js para Lint/Format (substitui ESLint + Prettier)
  - Adicionado Lefthook para Git Hooks rigorosos
  - Configuração TypeScript Strict (zero `any`)
  - Coverage 100% obrigatório (sem exceções)
  - TDD First com ciclo RED-GREEN-REFACTOR obrigatório
  - Clean Architecture com estrutura de camadas definida
  - Script de validação automática do ciclo TDD
  - Princípios SOLID e Clean Code obrigatórios
  - CI/CD com gates de qualidade rigorosos incluindo validação de commits
  - Documentação completa de padrões e boas práticas
  - Estimativas ajustadas (+30% devido à qualidade)
  - Nova Fase 1.2: Qualidade de Código e TDD First (9 novas tarefas)
  - Seção detalhada de Conventional Commits com exemplos e scopes
  - Validação automática de commits em 3 níveis: commit-msg, pre-push, CI/CD
- v1.1 (2025-11-04): Adicionado Drizzle ORM como stack de banco de dados
- v1.0 (2025-11-04): Versão inicial

**Status:** Aguardando aprovação

**Nota Importante:**
Este planejamento estabelece um padrão de qualidade excepcional. A rigidez nas práticas de TDD, coverage 100% e Clean Architecture garantirá um código robusto, manutenível e livre de bugs. O investimento inicial em qualidade resultará em economia significativa de tempo e recursos no longo prazo.
