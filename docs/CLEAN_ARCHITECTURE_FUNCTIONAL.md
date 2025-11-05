# Clean Architecture Funcional + Hexagonal - Sistema POS NFC-e

Este documento descreve a arquitetura limpa com paradigma funcional e padrões hexagonais, SEM uso de classes.

## 🎯 Princípios Fundamentais

### 1. Arquitetura Hexagonal (Ports & Adapters)

```
┌──────────────────────────────────────────────────┐
│                                                  │
│            ADAPTERS (Externos)                   │
│   ┌────────────────────────────────────┐        │
│   │     HTTP │ CLI │ Queue │ GraphQL   │        │
│   └─────────────┬──────────────────────┘        │
│                 │                                │
│   ┌─────────────▼──────────────────────┐        │
│   │         PORTS (Interfaces)         │        │
│   └─────────────┬──────────────────────┘        │
│                 │                                │
│   ┌─────────────▼──────────────────────┐        │
│   │      APPLICATION (Use Cases)       │        │
│   │     (Funções com Dependencies)     │        │
│   └─────────────┬──────────────────────┘        │
│                 │                                │
│   ┌─────────────▼──────────────────────┐        │
│   │      DOMAIN (Business Logic)       │        │
│   │   (Funções Puras, Types, Rules)    │        │
│   └────────────────────────────────────┘        │
│                                                  │
│   ┌────────────────────────────────────┐        │
│   │     PORTS (Repository Interfaces)  │        │
│   └─────────────┬──────────────────────┘        │
│                 │                                │
│   ┌─────────────▼──────────────────────┐        │
│   │   ADAPTERS (Implementações)        │        │
│   │  Database │ API │ FileSystem │ etc │        │
│   └────────────────────────────────────┘        │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 2. Regras de Ouro

1. **Domínio no Centro**: Regras de negócio puras, sem dependências
2. **Portas definem contratos**: Interfaces/types no domínio
3. **Adapters implementam portas**: Infra implementa contratos
4. **Injeção de Dependência**: Via parâmetros de função (currying)
5. **Imutabilidade Total**: Sem mutação em nenhuma camada
6. **Funções Puras no Domínio**: Zero efeitos colaterais

## 🏗️ Camadas Funcionais

### 📦 DOMAIN (Núcleo Funcional)

**Responsabilidades**:
- Types e Branded Types
- Funções puras de regras de negócio
- Constructors (smart constructors)
- Validações puras
- Portas (interfaces como types)

**Características**:
- ✅ Apenas funções puras
- ✅ Imutabilidade total
- ✅ Result/Option types
- ✅ Branded types
- ❌ ZERO dependências externas
- ❌ ZERO classes
- ❌ ZERO I/O

**Exemplo Completo**:

```typescript
// ===== TYPES =====
// domain/product/product.types.ts
import type { Brand } from '@shared/types'

export type ProductId = Brand<string, 'ProductId'>
export type ProductName = Brand<string, 'ProductName'>
export type Price = Brand<number, 'Price'>
export type Barcode = Brand<string, 'Barcode'>

export type Product = {
  readonly id: ProductId
  readonly name: ProductName
  readonly price: Price
  readonly barcode: Barcode
  readonly createdAt: Date
}

// ===== CONSTRUCTORS =====
// domain/product/product.constructors.ts
import type { Result } from '@shared/types'
import { Result as R } from '@shared/utils/result'

export const ProductId = {
  create: (value: string): Result<ProductId, string> => {
    if (value.length === 0) {
      return R.err('ProductId cannot be empty')
    }
    if (!/^[a-f0-9-]{36}$/i.test(value)) {
      return R.err('ProductId must be a valid UUID')
    }
    return R.ok(value as ProductId)
  },

  unsafe: (value: string): ProductId => value as ProductId,
}

export const ProductName = {
  create: (value: string): Result<ProductName, string> => {
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      return R.err('Product name cannot be empty')
    }
    if (trimmed.length > 100) {
      return R.err('Product name too long (max 100 characters)')
    }
    return R.ok(trimmed as ProductName)
  },
}

export const Price = {
  create: (value: number): Result<Price, string> => {
    if (!Number.isFinite(value)) {
      return R.err('Price must be a finite number')
    }
    if (value <= 0) {
      return R.err('Price must be positive')
    }
    if (value > 1_000_000) {
      return R.err('Price too high (max 1.000.000)')
    }
    return R.ok(value as Price)
  },
}

export const Barcode = {
  create: (value: string): Result<Barcode, string> => {
    if (value.length === 0) {
      return R.err('Barcode cannot be empty')
    }
    if (!/^\d{8,13}$/.test(value)) {
      return R.err('Barcode must be 8-13 digits')
    }
    return R.ok(value as Barcode)
  },
}

// ===== BUSINESS RULES =====
// domain/product/product.rules.ts
import type { Result } from '@shared/types'
import { pipe } from '@shared/utils/pipe'

export const calculateDiscount =
  (percentage: number) =>
  (price: Price): Result<Price, string> => {
    if (percentage < 0 || percentage > 100) {
      return R.err('Discount must be between 0 and 100')
    }

    const discountedPrice = (price as number) * (1 - percentage / 100)
    return Price.create(discountedPrice)
  }

export const applyTax =
  (taxRate: number) =>
  (price: Price): Result<Price, string> => {
    if (taxRate < 0) {
      return R.err('Tax rate cannot be negative')
    }

    const priceWithTax = (price as number) * (1 + taxRate)
    return Price.create(priceWithTax)
  }

export const calculateFinalPrice = (
  basePrice: Price,
  discountPercentage: number,
  taxRate: number
): Result<Price, string> => {
  return pipe(
    R.ok(basePrice),
    R.flatMap(calculateDiscount(discountPercentage)),
    R.flatMap(applyTax(taxRate))
  )
}

// ===== PORTS (Interfaces) =====
// domain/product/product.ports.ts
import type { Option } from '@shared/types'

export type ProductRepository = {
  readonly findById: (id: ProductId) => Promise<Option<Product>>
  readonly findByBarcode: (barcode: Barcode) => Promise<Option<Product>>
  readonly save: (product: Product) => Promise<Result<Product, Error>>
  readonly update: (product: Product) => Promise<Result<Product, Error>>
  readonly delete: (id: ProductId) => Promise<Result<void, Error>>
  readonly findAll: () => Promise<readonly Product[]>
}

export type ProductEventPublisher = {
  readonly productCreated: (product: Product) => Promise<void>
  readonly productUpdated: (product: Product) => Promise<void>
  readonly productDeleted: (id: ProductId) => Promise<void>
}
```

### 🔧 APPLICATION (Use Cases)

**Responsabilidades**:
- Use cases (funções com dependências injetadas)
- Orquestração de lógica de domínio
- DTOs (Input/Output types)
- Validações de aplicação

**Características**:
- ✅ Funções com currying para DI
- ✅ Composição de funções de domínio
- ✅ Result/Option types
- ✅ Async operations
- ❌ Sem lógica de negócio
- ❌ Sem detalhes de infra

**Exemplo Completo**:

```typescript
// ===== INPUT/OUTPUT TYPES =====
// application/use-cases/create-product/create-product.types.ts
export type CreateProductInput = {
  readonly name: string
  readonly price: number
  readonly barcode: string
}

export type CreateProductOutput = Product

export type CreateProductError =
  | { readonly type: 'validation'; readonly message: string }
  | { readonly type: 'duplicate'; readonly message: string }
  | { readonly type: 'unknown'; readonly error: Error }

// ===== DEPENDENCIES =====
// application/use-cases/create-product/create-product.deps.ts
export type CreateProductDependencies = {
  readonly productRepository: ProductRepository
  readonly eventPublisher: ProductEventPublisher
  readonly logger: Logger
  readonly idGenerator: () => string
}

// ===== USE CASE =====
// application/use-cases/create-product/create-product.ts
export type CreateProductUseCase = (
  deps: CreateProductDependencies
) => (
  input: CreateProductInput
) => Promise<Result<CreateProductOutput, CreateProductError>>

export const createProductUseCase: CreateProductUseCase =
  ({ productRepository, eventPublisher, logger, idGenerator }) =>
  async (input) => {
    // 1. Validate and create domain types
    const nameResult = ProductName.create(input.name)
    if (R.isErr(nameResult)) {
      return R.err({
        type: 'validation',
        message: nameResult.error,
      })
    }

    const priceResult = Price.create(input.price)
    if (R.isErr(priceResult)) {
      return R.err({
        type: 'validation',
        message: priceResult.error,
      })
    }

    const barcodeResult = Barcode.create(input.barcode)
    if (R.isErr(barcodeResult)) {
      return R.err({
        type: 'validation',
        message: barcodeResult.error,
      })
    }

    // 2. Check if barcode already exists
    const existingProduct = await productRepository.findByBarcode(
      barcodeResult.value
    )
    if (Option.isSome(existingProduct)) {
      return R.err({
        type: 'duplicate',
        message: 'Product with this barcode already exists',
      })
    }

    // 3. Create product
    const product: Product = {
      id: ProductId.unsafe(idGenerator()),
      name: nameResult.value,
      price: priceResult.value,
      barcode: barcodeResult.value,
      createdAt: new Date(),
    }

    // 4. Save product
    logger.info('Creating product', { productId: product.id })
    const saveResult = await productRepository.save(product)

    if (R.isErr(saveResult)) {
      logger.error('Failed to save product', { error: saveResult.error })
      return R.err({
        type: 'unknown',
        error: saveResult.error,
      })
    }

    // 5. Publish event
    await eventPublisher.productCreated(product)

    logger.info('Product created successfully', { productId: product.id })
    return R.ok(product)
  }
```

### 🔌 INFRASTRUCTURE (Adapters)

**Responsabilidades**:
- Implementação de portas
- Acesso a banco de dados
- HTTP clients
- File system
- Serviços externos

**Características**:
- ✅ Implementa interfaces de porta
- ✅ Funções factory que retornam implementações
- ✅ Lida com I/O e efeitos colaterais
- ✅ Conversão entre tipos externos e domínio
- ❌ Sem lógica de negócio

**Exemplo Completo**:

```typescript
// ===== DATABASE SCHEMA =====
// infrastructure/db/schema/products.schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const productsTable = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: real('price').notNull(),
  barcode: text('barcode').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

// ===== REPOSITORY ADAPTER =====
// infrastructure/repositories/product.repository.adapter.ts
import type { DrizzleDatabase } from '@infrastructure/db'
import { productsTable } from '@infrastructure/db/schema'
import { eq } from 'drizzle-orm'

type CreateProductRepository = (
  db: DrizzleDatabase
) => ProductRepository

export const createProductRepository: CreateProductRepository = (db) => ({
  findById: async (id) => {
    try {
      const results = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, id as string))
        .limit(1)

      const row = results[0]
      if (row === undefined) {
        return Option.none()
      }

      return Option.some({
        id: row.id as ProductId,
        name: row.name as ProductName,
        price: row.price as Price,
        barcode: row.barcode as Barcode,
        createdAt: row.createdAt,
      })
    } catch (error) {
      return Option.none()
    }
  },

  findByBarcode: async (barcode) => {
    try {
      const results = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.barcode, barcode as string))
        .limit(1)

      const row = results[0]
      if (row === undefined) {
        return Option.none()
      }

      return Option.some({
        id: row.id as ProductId,
        name: row.name as ProductName,
        price: row.price as Price,
        barcode: row.barcode as Barcode,
        createdAt: row.createdAt,
      })
    } catch (error) {
      return Option.none()
    }
  },

  save: async (product) => {
    try {
      await db.insert(productsTable).values({
        id: product.id as string,
        name: product.name as string,
        price: product.price as number,
        barcode: product.barcode as string,
        createdAt: product.createdAt,
      })

      return R.ok(product)
    } catch (error) {
      return R.err(error as Error)
    }
  },

  update: async (product) => {
    try {
      await db
        .update(productsTable)
        .set({
          name: product.name as string,
          price: product.price as number,
          barcode: product.barcode as string,
        })
        .where(eq(productsTable.id, product.id as string))

      return R.ok(product)
    } catch (error) {
      return R.err(error as Error)
    }
  },

  delete: async (id) => {
    try {
      await db
        .delete(productsTable)
        .where(eq(productsTable.id, id as string))

      return R.ok(undefined)
    } catch (error) {
      return R.err(error as Error)
    }
  },

  findAll: async () => {
    try {
      const results = await db.select().from(productsTable)

      return results.map((row) => ({
        id: row.id as ProductId,
        name: row.name as ProductName,
        price: row.price as Price,
        barcode: row.barcode as Barcode,
        createdAt: row.createdAt,
      }))
    } catch {
      return []
    }
  },
})

// ===== EVENT PUBLISHER ADAPTER =====
// infrastructure/events/product-event-publisher.adapter.ts
type CreateProductEventPublisher = (
  config: { readonly topicName: string }
) => ProductEventPublisher

export const createProductEventPublisher: CreateProductEventPublisher =
  ({ topicName }) => ({
    productCreated: async (product) => {
      // Publish to queue/event bus
      console.log(`Event published to ${topicName}:`, {
        type: 'product.created',
        product,
      })
    },

    productUpdated: async (product) => {
      console.log(`Event published to ${topicName}:`, {
        type: 'product.updated',
        product,
      })
    },

    productDeleted: async (id) => {
      console.log(`Event published to ${topicName}:`, {
        type: 'product.deleted',
        id,
      })
    },
  })
```

### 🎨 PRESENTATION (Controllers/Handlers)

**Responsabilidades**:
- HTTP/CLI/GraphQL handlers
- Request/Response transformation
- Validação de input (básica)
- Error handling e formatação

**Características**:
- ✅ Funções factory com dependências
- ✅ Transforma request para input type
- ✅ Transforma output para response
- ✅ Pattern matching em Result/Option
- ❌ Sem lógica de negócio

**Exemplo Completo**:

```typescript
// ===== HTTP CONTROLLER =====
// presentation/http/controllers/product.controller.ts
import { Hono } from 'hono'
import type { CreateProductUseCase } from '@application/use-cases'

type CreateProductControllerDependencies = {
  readonly createProduct: ReturnType<CreateProductUseCase>
}

type CreateProductController = (
  deps: CreateProductControllerDependencies
) => Hono

export const createProductController: CreateProductController = ({
  createProduct,
}) => {
  const app = new Hono()

  app.post('/products', async (c) => {
    // 1. Parse request
    const body = await c.req.json()

    // 2. Basic validation
    if (typeof body.name !== 'string') {
      return c.json({ error: 'name must be a string' }, 400)
    }
    if (typeof body.price !== 'number') {
      return c.json({ error: 'price must be a number' }, 400)
    }
    if (typeof body.barcode !== 'string') {
      return c.json({ error: 'barcode must be a string' }, 400)
    }

    // 3. Execute use case
    const result = await createProduct({
      name: body.name,
      price: body.price,
      barcode: body.barcode,
    })

    // 4. Handle result
    if (R.isErr(result)) {
      const error = result.error

      if (error.type === 'validation') {
        return c.json({ error: error.message }, 400)
      }

      if (error.type === 'duplicate') {
        return c.json({ error: error.message }, 409)
      }

      return c.json({ error: 'Internal server error' }, 500)
    }

    // 5. Format response
    const product = result.value
    return c.json(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        barcode: product.barcode,
        createdAt: product.createdAt.toISOString(),
      },
      201
    )
  })

  return app
}
```

### ⚙️ COMPOSITION ROOT (Dependency Injection)

```typescript
// ===== MAIN =====
// src/index.ts
import { Hono } from 'hono'
import { db } from '@infrastructure/db'
import { createProductRepository } from '@infrastructure/repositories'
import { createProductEventPublisher } from '@infrastructure/events'
import { createLogger } from '@infrastructure/logger'
import { createProductUseCase } from '@application/use-cases'
import { createProductController } from '@presentation/http/controllers'
import { randomUUID } from 'node:crypto'

// 1. Create adapters (infra dependencies)
const productRepository = createProductRepository(db)
const eventPublisher = createProductEventPublisher({ topicName: 'products' })
const logger = createLogger({ level: 'info' })

// 2. Create use cases (inject dependencies)
const createProduct = createProductUseCase({
  productRepository,
  eventPublisher,
  logger,
  idGenerator: randomUUID,
})

// 3. Create controllers (inject use cases)
const productController = createProductController({ createProduct })

// 4. Compose app
const app = new Hono()
app.route('/api', productController)

export default {
  port: 3000,
  fetch: app.fetch,
}
```

## ✅ Checklist Arquitetural

Antes de cada implementação:

### Domain Layer
- [ ] Apenas types e funções puras?
- [ ] Branded types definidos?
- [ ] Smart constructors com validação?
- [ ] Funções de negócio retornam Result/Option?
- [ ] Zero dependências externas?
- [ ] Portas definidas como types?

### Application Layer
- [ ] Use cases são funções curried?
- [ ] Dependências injetadas via parâmetros?
- [ ] Retorna Result com erros tipados?
- [ ] Orquestra lógica de domínio?
- [ ] Sem detalhes de infra?

### Infrastructure Layer
- [ ] Factory functions para criar adapters?
- [ ] Implementa portas do domínio?
- [ ] Conversão type-safe entre layers?
- [ ] Lida com erros de I/O?

### Presentation Layer
- [ ] Factory functions para controllers?
- [ ] Pattern matching em Result/Option?
- [ ] Validação básica de input?
- [ ] Sem lógica de negócio?

## 📚 Recursos

- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Functional Domain Modeling](https://pragprog.com/titles/swdddf/domain-modeling-made-functional/)
- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)

---

**Lembre-se**: Arquitetura é sobre ISOLAMENTO, TESTABILIDADE e MANUTENIBILIDADE através de COMPOSIÇÃO FUNCIONAL.
