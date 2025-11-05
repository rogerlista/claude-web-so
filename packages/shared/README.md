# @pos-nfce/shared

**SINGLE SOURCE OF TRUTH** para código compartilhado entre backend e frontend.

## 📦 O que contém

Este pacote contém **TODO** o código que é usado por mais de um pacote:

- ✅ **Types compartilhados** (Product, Customer, Sale, etc.)
- ✅ **Branded Types** para type safety
- ✅ **Result/Option types** para error handling
- ✅ **Utilitários funcionais puros** (pipe, compose, etc.)
- ✅ **Validações de domínio**
- ✅ **Constantes e configurações**
- ✅ **Formatadores e parsers**

## 🚫 O que NÃO contém

- ❌ Código específico de backend (DB, Hono, Node.js)
- ❌ Código específico de frontend (Vue, DOM, Browser APIs)
- ❌ Código com dependências de frameworks pesados

## 📖 Como Usar

### Importação

```typescript
// Types
import type { Product, ProductId, Price } from '@pos-nfce/shared'

// Utilities
import { ResultUtils, OptionUtils, pipe, compose } from '@pos-nfce/shared'

// Ou importar tudo
import * as Shared from '@pos-nfce/shared'
```

### Exemplos

```typescript
// Result type
import { ResultUtils } from '@pos-nfce/shared'

const result = ResultUtils.ok(42)
const mapped = ResultUtils.map(result, (x) => x * 2)

// Option type
import { OptionUtils } from '@pos-nfce/shared'

const option = OptionUtils.some('hello')
const value = OptionUtils.unwrapOr(option, 'default')

// Pipe
import { pipe } from '@pos-nfce/shared'

const result = pipe(
  10,
  (x) => x * 2,    // 20
  (x) => x + 5,    // 25
  (x) => x / 5     // 5
)
```

## 🧪 Testes

Este pacote tem **100% de coverage obrigatório**.

```bash
# Executar testes
pnpm test

# Com coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## 📝 Contribuindo

### Quando adicionar código aqui?

1. **O código é usado em backend E frontend?** → SIM, adicione aqui
2. **O código é uma função pura?** → Provavelmente sim
3. **O código tem zero dependências de frameworks?** → SIM, adicione aqui

### Checklist

Antes de adicionar código:

- [ ] É realmente compartilhado entre pacotes?
- [ ] É uma função pura (sem efeitos colaterais)?
- [ ] Não depende de frameworks específicos?
- [ ] Tem testes com 100% coverage?
- [ ] Está bem documentado (JSDoc)?
- [ ] Segue programação funcional (sem classes)?

## 📁 Estrutura

```
src/
├── types/           # Types, branded types, interfaces
│   ├── brand.ts     # Branded types utility
│   ├── result.ts    # Result<T, E> type
│   ├── option.ts    # Option<T> type
│   └── index.ts     # Re-exports
│
├── utils/           # Pure utility functions
│   ├── result.ts    # ResultUtils functions
│   ├── option.ts    # OptionUtils functions
│   ├── pipe.ts      # Pipe composition
│   ├── compose.ts   # Compose composition
│   └── index.ts     # Re-exports
│
└── index.ts         # Main entry point
```

## 🔒 Regras

1. **ZERO dependências externas** (exceto peer deps do TypeScript)
2. **100% coverage obrigatório** - sem exceções
3. **Apenas funções puras** - sem efeitos colaterais
4. **Imutabilidade total** - sem mutação
5. **TypeScript strict mode** - zero `any`
6. **Programação funcional** - zero classes

## 📚 Documentação

- [DRY Principles](../../docs/DRY_PRINCIPLES.md)
- [Functional Programming](../../docs/FUNCTIONAL_PROGRAMMING.md)
- [Clean Architecture](../../docs/CLEAN_ARCHITECTURE_FUNCTIONAL.md)

---

**IMPORTANTE**: Este pacote é o coração da reutilização de código. Mantenha-o limpo, bem testado e livre de dependências externas.
