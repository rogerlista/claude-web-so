# @pos-nfce/backend

Backend API - Sistema POS com NFC-e

## Status

✅ **Phase 1 Complete**: Infrastructure and quality tools configured
⏳ **Phase 2 Pending**: Domain implementation with TDD

## Phase 1 Completed

- [x] Package structure configured
- [x] TypeScript strict mode enabled
- [x] Vitest configured with 100% coverage requirement
- [x] Dependencies installed (Hono, Drizzle ORM, SQLite)
- [x] Quality tools integrated (Biome, commitlint, lefthook)

## Phase 2: TDD Implementation

Following **RED-GREEN-REFACTOR** cycle:

1. Write failing test first (RED)
2. Implement minimum code to pass (GREEN)
3. Refactor while keeping tests green (REFACTOR)

### Domain to Implement

- Products (CRUD with NFC-e integration)
- Customers (CPF/CNPJ validation)
- Sales (cart, payment, NFC-e emission)
- Inventory (stock management)

### Architecture

Clean Architecture + Hexagonal Pattern with Functional Programming:

```
src/
├── domain/           # Pure business logic (functions only)
├── application/      # Use cases (curried functions)
├── infrastructure/   # Adapters (DB, HTTP, etc)
└── presentation/     # Controllers (factory functions)
```

## Commands

```bash
# Development
pnpm dev

# Tests (TDD)
pnpm test
pnpm test:watch
pnpm test:coverage

# Build
pnpm build

# Type check
pnpm typecheck
```

## Next Steps

Start Phase 2 with first domain entity following TDD:

1. `pnpm test:watch`
2. Create `src/domain/product/product.test.ts`
3. Write first failing test
4. Implement to pass
5. Refactor
