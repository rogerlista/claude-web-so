# Princípio DRY - Don't Repeat Yourself

Este documento define as regras obrigatórias para evitar duplicação de código no projeto.

## 🎯 Regra de Ouro

**ZERO DUPLICAÇÃO DE CÓDIGO - SINGLE SOURCE OF TRUTH**

> "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."
> — The Pragmatic Programmer

## 📦 Estrutura de Pacotes

```
packages/
├── shared/          # ✅ ÚNICA FONTE DE CÓDIGO COMUM
│   ├── types/       # Types, Branded Types, interfaces
│   └── utils/       # Utilitários funcionais puros
│
├── backend/         # Backend específico apenas
│   ├── domain/      # Lógica de negócio backend
│   ├── application/ # Use cases backend
│   └── infrastructure/
│
└── frontend/        # Frontend específico apenas
    ├── domain/      # Lógica de negócio frontend
    ├── application/ # Use cases frontend (stores)
    └── presentation/
```

## ✅ O que VAI para @pos-nfce/shared

### 1. Types Comuns
```typescript
// ✅ Branded Types
export type ProductId = Brand<string, 'ProductId'>
export type Price = Brand<number, 'Price'>
export type Email = Brand<string, 'Email'>

// ✅ Domain Types Compartilhados
export type Product = {
  readonly id: ProductId
  readonly name: string
  readonly price: Price
}

// ✅ Result/Option Types
export type Result<T, E> = ...
export type Option<T> = ...
```

### 2. Utilitários Puros
```typescript
// ✅ Functional utilities
export const ResultUtils = { ok, err, map, flatMap, ... }
export const OptionUtils = { some, none, map, flatMap, ... }
export const pipe = ...
export const compose = ...

// ✅ Pure functions
export const formatCurrency = (value: number): string => ...
export const validateEmail = (email: string): boolean => ...
export const calculateTax = (price: Price, rate: number): Price => ...
```

### 3. Constantes
```typescript
// ✅ Constantes compartilhadas
export const API_TIMEOUT = 30000
export const MAX_RETRIES = 3
export const DEFAULT_PAGE_SIZE = 20

// ✅ Regex patterns
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
```

### 4. Validações Puras
```typescript
// ✅ Domain validations
export const validateProductName = (name: string): Result<ProductName, string> => ...
export const validatePrice = (value: number): Result<Price, string> => ...
export const validateCPF = (cpf: string): Result<CPF, string> => ...
```

### 5. Transformações Puras
```typescript
// ✅ Data transformations
export const toCurrency = (value: number): string => ...
export const toPercentage = (value: number): string => ...
export const slugify = (text: string): string => ...
```

## ❌ O que NÃO VAI para @pos-nfce/shared

### 1. Código Específico de Backend
```typescript
// ❌ NÃO - Database específico
const db = drizzle(...)

// ❌ NÃO - HTTP server específico
const app = new Hono()

// ❌ NÃO - Node.js específico
import { readFile } from 'node:fs/promises'
```

### 2. Código Específico de Frontend
```typescript
// ❌ NÃO - Vue específico
import { ref, computed } from 'vue'

// ❌ NÃO - Browser APIs
const data = localStorage.getItem('key')

// ❌ NÃO - DOM manipulation
document.querySelector('.btn')
```

### 3. Dependências Externas Pesadas
```typescript
// ❌ NÃO - Framework específico
import { Hono } from 'hono'
import { createPinia } from 'pinia'

// ✅ SIM - Apenas se for REALMENTE compartilhado e leve
import { z } from 'zod' // OK se usado em backend E frontend
```

## 🔍 Como Identificar Código Duplicado

### Checklist Antes de Criar Código

1. **Este código já existe em outro pacote?**
   - ✅ Se SIM → Mova para `@pos-nfce/shared`
   - ✅ Se NÃO → Continue

2. **Este código será usado por backend E frontend?**
   - ✅ Se SIM → Crie em `@pos-nfce/shared`
   - ✅ Se NÃO → Crie no pacote específico

3. **Este código depende de frameworks (Hono, Vue)?**
   - ✅ Se SIM → Crie no pacote específico
   - ✅ Se NÃO → Pode ir para `@pos-nfce/shared`

4. **Este código é uma função pura?**
   - ✅ Se SIM e compartilhado → `@pos-nfce/shared`
   - ✅ Se NÃO → Pacote específico

### Ferramentas para Detectar Duplicação

```bash
# Buscar código duplicado com jscpd
pnpm jscpd packages/

# Buscar funções similares
grep -r "function nameOfFunction" packages/

# Verificar imports duplicados
grep -r "import.*from '@pos-nfce/shared'" packages/ | sort | uniq -d
```

## 📋 Processo de Refatoração

### Quando Encontrar Duplicação

1. **Identificar o código duplicado**
```typescript
// packages/backend/src/utils/format.ts
export const formatPrice = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// packages/frontend/src/utils/format.ts
export const formatPrice = (value: number): string => {  // ❌ DUPLICADO!
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
```

2. **Mover para shared**
```typescript
// packages/shared/src/utils/format.ts
export const formatPrice = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
```

3. **Atualizar imports**
```typescript
// packages/backend/src/...
import { formatPrice } from '@pos-nfce/shared'

// packages/frontend/src/...
import { formatPrice } from '@pos-nfce/shared'
```

4. **Deletar código duplicado**
```bash
rm packages/backend/src/utils/format.ts
rm packages/frontend/src/utils/format.ts
```

5. **Adicionar testes em shared**
```typescript
// packages/shared/src/utils/format.test.ts
import { describe, expect, it } from 'vitest'
import { formatPrice } from './format'

describe('formatPrice', () => {
  it('should format price in BRL', () => {
    expect(formatPrice(1000)).toBe('R$ 1.000,00')
  })
})
```

## 🚫 Proibições Absolutas

### ❌ NUNCA Copiar e Colar Código

```typescript
// ❌ NUNCA FAÇA ISSO
// Copiou de backend para frontend? ERRADO!
// Copiou de um arquivo para outro? ERRADO!
// Copiou código com pequenas modificações? ERRADO!

// ✅ SEMPRE FAÇA ISSO
// 1. Extraia para função
// 2. Mova para @pos-nfce/shared
// 3. Importe onde necessário
```

### ❌ NUNCA Reimplementar Lógica Existente

```typescript
// ❌ NÃO
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Se já existe em shared, USE:
import { validateEmail } from '@pos-nfce/shared'
```

### ❌ NUNCA Criar Utilitários Locais se Existe em Shared

```typescript
// ❌ packages/backend/src/utils/result.ts  // NÃO CRIE!
// ❌ packages/frontend/src/utils/option.ts // NÃO CRIE!

// ✅ USE @pos-nfce/shared
import { ResultUtils, OptionUtils } from '@pos-nfce/shared'
```

## 📝 Checklist de Code Review

Antes de aprovar PR, verificar:

- [ ] Não há código duplicado entre pacotes?
- [ ] Código comum está em `@pos-nfce/shared`?
- [ ] Não há reimplementação de lógica existente?
- [ ] Imports de `@pos-nfce/shared` estão corretos?
- [ ] Testes para código shared estão em `packages/shared`?
- [ ] Não há copiar-colar de código?
- [ ] Funções puras estão em shared?
- [ ] Types compartilhados estão em shared?

## 🔒 Regras de Import

### ✅ CORRETO

```typescript
// Backend
import { ResultUtils, type Product } from '@pos-nfce/shared'

// Frontend
import { OptionUtils, pipe } from '@pos-nfce/shared'

// Shared (internamente)
import { type Result } from './types/result'
import { ResultUtils } from './utils/result'
```

### ❌ INCORRETO

```typescript
// ❌ Backend importando de frontend
import { Component } from '@pos-nfce/frontend' // ERRO!

// ❌ Frontend importando de backend
import { db } from '@pos-nfce/backend' // ERRO!

// ❌ Imports relativos atravessando pacotes
import { Product } from '../../../shared/types' // ERRO!
```

## 📊 Métricas de Qualidade

### Objetivos

- ✅ **0%** de código duplicado (tolerância: 0 linhas)
- ✅ **100%** de funções puras em shared testadas
- ✅ **0** imports cruzados entre backend/frontend
- ✅ **100%** coverage em `@pos-nfce/shared`

### Monitoramento

```bash
# Verificar duplicação
pnpm jscpd --threshold 0

# Verificar coverage de shared
cd packages/shared && pnpm test:coverage

# Verificar imports corretos
grep -r "from '@pos-nfce/" packages/backend/src | grep -v "@pos-nfce/shared"
grep -r "from '@pos-nfce/" packages/frontend/src | grep -v "@pos-nfce/shared"
```

## 💡 Exemplos Práticos

### Exemplo 1: Validação de CPF

```typescript
// ❌ ANTES (duplicado)
// packages/backend/src/domain/customer/cpf.ts
export const validateCPF = (cpf: string): boolean => { /* ... */ }

// packages/frontend/src/utils/validators.ts
export const validateCPF = (cpf: string): boolean => { /* ... */ }

// ✅ DEPOIS (centralizado)
// packages/shared/src/utils/validators.ts
export const validateCPF = (cpf: string): Result<CPF, string> => { /* ... */ }

// packages/backend/src/domain/customer/cpf.ts
import { validateCPF } from '@pos-nfce/shared'

// packages/frontend/src/presentation/forms/CustomerForm.vue
import { validateCPF } from '@pos-nfce/shared'
```

### Exemplo 2: Formatação de Moeda

```typescript
// ✅ SEMPRE em shared
// packages/shared/src/utils/currency.ts
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const parseCurrency = (text: string): number => {
  return Number.parseFloat(text.replace(/[^\d,-]/g, '').replace(',', '.'))
}

// Usado em QUALQUER lugar
import { formatCurrency, parseCurrency } from '@pos-nfce/shared'
```

### Exemplo 3: Business Rules

```typescript
// ✅ Regras de negócio compartilhadas
// packages/shared/src/domain/product/product.rules.ts
export const calculateDiscount =
  (percentage: number) =>
  (price: Price): Result<Price, string> => {
    if (percentage < 0 || percentage > 100) {
      return ResultUtils.err('Invalid discount')
    }
    const discounted = (price as number) * (1 - percentage / 100)
    return Price.create(discounted)
  }

// Backend usa
import { calculateDiscount } from '@pos-nfce/shared'

// Frontend usa
import { calculateDiscount } from '@pos-nfce/shared'
```

## 🎓 Treinamento

### Para Desenvolvedores

1. Antes de criar código, pergunte:
   - Isso já existe?
   - Onde deve viver?
   - É compartilhável?

2. Se criar algo em backend ou frontend:
   - Pode ser usado no outro? → Mova para shared
   - É função pura? → Mova para shared
   - É type/interface? → Mova para shared

3. Sempre busque antes de criar:
   ```bash
   grep -r "function nomeDaFuncao" packages/
   ```

## 📚 Recursos

- [DRY Principle - Wikipedia](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- [The Pragmatic Programmer](https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/)
- [Code Complete - Steve McConnell](https://www.microsoftpressstore.com/store/code-complete-9780735619678)

---

**Lembre-se**: Código duplicado é um dos maiores inimigos da manutenibilidade. SEMPRE refatore duplicações para `@pos-nfce/shared`.
