# TDD Workflow - RED-GREEN-REFACTOR

Este documento descreve o fluxo de trabalho TDD (Test-Driven Development) obrigatório para este projeto.

## 📋 Princípios Fundamentais

### 1. TDD First - SEMPRE
- **NUNCA** escreva código de produção antes de ter um teste falhando
- **SEMPRE** comece com um teste RED (falhando)
- **SEMPRE** mantenha 100% de cobertura de testes

### 2. Ciclo RED-GREEN-REFACTOR

```
┌─────────────────────────────────────────────────────┐
│                  CICLO TDD                          │
│                                                     │
│  🔴 RED                                            │
│  ├─ Escreva um teste que FALHA                    │
│  ├─ Teste deve falhar porque o código não existe  │
│  └─ Valide que o teste realmente falha            │
│                                                     │
│  🟢 GREEN                                          │
│  ├─ Escreva o MÍNIMO de código necessário         │
│  ├─ Faça o teste passar                           │
│  └─ NÃO otimize ainda                             │
│                                                     │
│  🔵 REFACTOR                                       │
│  ├─ Melhore o código (design, clareza)            │
│  ├─ Mantenha os testes VERDES                     │
│  └─ Execute testes após cada mudança              │
│                                                     │
│  ↻ REPETIR                                         │
└─────────────────────────────────────────────────────┘
```

## 🚀 Como Usar

### Iniciar um Novo Ciclo TDD

```bash
# Exibe o guia do workflow TDD
pnpm tdd:start
```

### Validar o Trabalho

```bash
# Executa todas as validações de qualidade
pnpm tdd:validate
```

Este comando valida:
- ✅ Linting (Biome.js)
- ✅ Type checking (TypeScript strict)
- ✅ Testes passando
- ✅ Cobertura 100%

## 📝 Exemplo Prático

### Passo 1: RED - Escreva o Teste Falhando

**packages/backend/src/domain/user/user.test.ts**
```typescript
import { describe, expect, it } from 'vitest'
import { createUser } from './user'

describe('User Domain', () => {
  it('should create a user with valid data', () => {
    const user = createUser({
      name: 'John Doe',
      email: 'john@example.com'
    })

    expect(user.name).toBe('John Doe')
    expect(user.email).toBe('john@example.com')
  })
})
```

**Execute:**
```bash
pnpm test
# ❌ Deve FALHAR - função createUser não existe
```

### Passo 2: GREEN - Faça o Teste Passar

**packages/backend/src/domain/user/user.ts**
```typescript
export interface User {
  name: string
  email: string
}

export function createUser(data: User): User {
  return data
}
```

**Execute:**
```bash
pnpm test
# ✅ Deve PASSAR - teste GREEN
```

### Passo 3: REFACTOR - Melhore o Código

**packages/backend/src/domain/user/user.ts**
```typescript
export interface User {
  name: string
  email: string
}

interface CreateUserInput {
  name: string
  email: string
}

export function createUser(input: CreateUserInput): User {
  // Validação e normalização
  const name = input.name.trim()
  const email = input.email.toLowerCase().trim()

  return { name, email }
}
```

**Execute:**
```bash
pnpm test
# ✅ Deve continuar VERDE após refatoração
```

### Passo 4: VALIDAR - Garanta Qualidade Total

```bash
pnpm tdd:validate
# Executa todos os gates de qualidade
```

## 🎯 Regras de Ouro

### ✅ FAÇA

1. **Escreva o teste PRIMEIRO**
2. **Faça o teste falhar ANTES de implementar**
3. **Escreva o código MÍNIMO para passar**
4. **Refatore SEMPRE mantendo testes verdes**
5. **Execute testes APÓS cada mudança**
6. **Mantenha 100% de cobertura SEM EXCEÇÕES**

### ❌ NÃO FAÇA

1. **Nunca** escreva código antes do teste
2. **Nunca** pule a fase RED
3. **Nunca** commite sem 100% de cobertura
4. **Nunca** ignore testes quebrados
5. **Nunca** use `any` no TypeScript
6. **Nunca** desabilite regras de linting

## 🔒 Quality Gates Automáticos

### Pre-commit (via Lefthook)
- ✅ Linting (Biome.js auto-fix)
- ✅ Type checking (TypeScript strict)

### Commit-msg (via Lefthook)
- ✅ Conventional Commits validation

### Pre-push (via Lefthook)
- ✅ Todos os testes passando
- ✅ 100% de cobertura

## 📊 Verificação de Cobertura

### Ver Relatório de Cobertura

```bash
# Backend
cd packages/backend
pnpm test:coverage

# Frontend
cd packages/frontend
pnpm test:coverage
```

### Relatórios Gerados

- **Terminal**: Tabela de cobertura
- **HTML**: `coverage/index.html` (navegável)
- **LCOV**: `coverage/lcov.info` (para CI/CD)
- **JSON**: `coverage/coverage-final.json` (para análise)

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento com TDD
pnpm test:watch           # Modo watch para TDD
pnpm test:ui              # Interface visual de testes

# Validações
pnpm tdd:validate         # Valida tudo
pnpm lint                 # Apenas linting
pnpm lint:fix             # Corrige linting
pnpm typecheck            # Apenas typecheck
pnpm test:coverage        # Testes + cobertura

# Build
pnpm build                # Build de produção
```

## 🎓 Recursos

- [Test-Driven Development (TDD)](https://en.wikipedia.org/wiki/Test-driven_development)
- [Red-Green-Refactor](https://www.codecademy.com/article/tdd-red-green-refactor)
- [Vitest Documentation](https://vitest.dev/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## ⚠️ Troubleshooting

### Teste não falha na fase RED
- Verifique se realmente implementou o código antes
- Delete a implementação e execute novamente
- Confirme que o teste está testando o comportamento correto

### Cobertura abaixo de 100%
- Execute `pnpm test:coverage` para ver o que falta
- Abra `coverage/index.html` para detalhes visuais
- Adicione testes para linhas/branches não cobertas

### Lefthook bloqueou o commit
- Execute `pnpm tdd:validate` para ver todos os erros
- Corrija os problemas reportados
- Use `git commit --no-verify` APENAS em emergências

---

**Lembre-se**: TDD não é opcional neste projeto. É uma prática obrigatória para garantir a qualidade do código.
