# 🧾 Sistema POS com NFC-e

Sistema completo de Ponto de Venda com emissão de NFC-e (Nota Fiscal do Consumidor Eletrônica).

## 📦 Estrutura do Monorepo

```
pos-nfce-system/
├── packages/
│   ├── backend/      # API Hono.js + Drizzle ORM + SQLite
│   ├── frontend/     # PWA Vue.js 3 + Pinia
│   └── desktop/      # Tauri v2 Desktop App
├── scripts/          # Scripts utilitários
└── docs/            # Documentação
```

## 🚀 Tecnologias

### Backend
- **Hono.js** - Framework web ultrarrápido
- **Drizzle ORM** - TypeScript ORM type-safe
- **SQLite** - Banco de dados local
- **Vite** - Build tool
- **Vitest** - Testing framework

### Frontend
- **Vue.js 3** - Framework progressivo
- **Pinia** - State management
- **Vite** - Build tool
- **Workbox** - PWA offline-first
- **Vitest** - Testing framework

### Desktop
- **Tauri v2** - Desktop app framework
- **Rust** - Backend nativo
- **Vue.js 3** - UI

### Qualidade
- **Biome.js** - Lint + Format (ESLint + Prettier replacement)
- **TypeScript** - Modo strict (zero `any`)
- **Vitest** - Coverage 100% obrigatório
- **Lefthook** - Git hooks rigorosos
- **commitlint** - Conventional Commits 1.0.0
- **Clean Architecture** - Separação de camadas

## 📋 Pré-requisitos

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Rust** (para Tauri desktop)

## 🛠️ Instalação

```bash
# Instalar pnpm globalmente (se necessário)
npm install -g pnpm

# Instalar dependências
pnpm install

# Instalar git hooks (Lefthook)
pnpm prepare
```

## 💻 Desenvolvimento

```bash
# Iniciar todos os projetos em modo dev
pnpm dev

# Iniciar projeto específico
pnpm --filter backend dev
pnpm --filter frontend dev
pnpm --filter desktop dev
```

## 🧪 Testes

```bash
# Rodar todos os testes
pnpm test

# Testes em modo watch
pnpm test:watch

# Testes com UI
pnpm test:ui

# Coverage (100% obrigatório)
pnpm test:coverage
```

## 🎨 Qualidade de Código

```bash
# Lint com Biome
pnpm lint

# Format com Biome
pnpm format

# TypeCheck
pnpm typecheck

# Validar tudo antes de commit
pnpm lint && pnpm typecheck && pnpm test
```

## 📝 Commits

Este projeto utiliza **Conventional Commits 1.0.0** com validação rigorosa via commitlint.

### Formato

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Exemplos

```bash
feat(produto): add product search by GTIN
fix(venda): correct discount calculation
test(caixa): add failing test for cash opening
refactor(caixa): improve cash opening logic
docs(readme): update installation instructions
```

### Commit Interativo

```bash
pnpm commit
```

## 🏗️ Arquitetura

O projeto segue **Clean Architecture** com separação clara de camadas:

- **Domain** - Entities, Value Objects, Business Rules
- **Application** - Use Cases, DTOs, Interfaces
- **Infrastructure** - Repositories, External Services, Database
- **Presentation** - Controllers, Views, Components

Ver [ARCHITECTURE.md](./docs/ARCHITECTURE.md) para detalhes.

## 📚 Documentação

- [Planejamento Completo](./PLANEJAMENTO_POS_NFCE.md)
- [Guia de Contribuição](./docs/CONTRIBUTING.md)
- [Arquitetura](./docs/ARCHITECTURE.md)
- [Guia de Testes](./docs/TESTING.md)

## 🎯 Padrões de Qualidade

- ✅ **TDD First** - Ciclo RED-GREEN-REFACTOR obrigatório
- ✅ **Coverage 100%** - Sem exceções
- ✅ **TypeScript Strict** - Zero `any`
- ✅ **Clean Architecture** - Camadas bem definidas
- ✅ **SOLID Principles** - Aplicação rigorosa
- ✅ **Conventional Commits** - Validado automaticamente

## 📄 Licença

UNLICENSED - Uso privado

## 👥 Equipe

Desenvolvido seguindo as melhores práticas de engenharia de software.
