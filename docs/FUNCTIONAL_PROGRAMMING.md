# Programação Funcional - Sistema POS NFC-e

Este documento define os padrões e práticas de programação funcional obrigatórios para o projeto.

## 🎯 Princípios Fundamentais

### 1. Sem Classes - Apenas Funções

```typescript
// ❌ NÃO FAZER - Orientação a Objetos
class ProductService {
  constructor(private repository: ProductRepository) {}

  async createProduct(data: CreateProductInput): Promise<Product> {
    return this.repository.save(data)
  }
}

// ✅ FAZER - Programação Funcional
type CreateProduct = (
  repository: ProductRepository
) => (input: CreateProductInput) => Promise<Product>

const createProduct: CreateProduct = (repository) => async (input) => {
  return repository.save(input)
}
```

### 2. Imutabilidade

```typescript
// ❌ NÃO FAZER - Mutação
function addItem(cart: Cart, item: Item): Cart {
  cart.items.push(item) // Mutação!
  cart.total += item.price
  return cart
}

// ✅ FAZER - Imutável
function addItem(cart: Cart, item: Item): Cart {
  return {
    ...cart,
    items: [...cart.items, item],
    total: cart.total + item.price,
  }
}
```

### 3. Funções Puras

```typescript
// ❌ NÃO FAZER - Efeitos colaterais
let total = 0
function addToTotal(value: number): void {
  total += value // Efeito colateral!
}

// ✅ FAZER - Função pura
function addToTotal(currentTotal: number, value: number): number {
  return currentTotal + value
}
```

### 4. Composição de Funções

```typescript
// ✅ Composição
const pipe = <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduce((acc, fn) => fn(acc), value)

const compose = <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduceRight((acc, fn) => fn(acc), value)

// Exemplo de uso
const processPrice = pipe(
  applyDiscount(10),
  applyTax(0.15),
  roundToTwoDecimals
)

const finalPrice = processPrice(100) // 96.90
```

## 📋 Regras Obrigatórias

### ✅ SEMPRE FAZER

1. **Use `const` para tudo**: Nunca use `let` ou `var`
2. **Funções puras primeiro**: Evite efeitos colaterais
3. **Imutabilidade**: Use spread operator, não mude objetos
4. **Type-safe**: Aproveite o sistema de tipos do TypeScript
5. **Currying**: Quebre funções em funções menores
6. **Composição**: Combine funções pequenas
7. **Higher-Order Functions**: Funções que retornam funções
8. **Pattern Matching**: Use discriminated unions

### ❌ NUNCA FAZER

1. **Sem `class`**: Zero classes no código
2. **Sem `this`**: Não existe contexto `this`
3. **Sem mutação**: Não modifique arrays/objetos existentes
4. **Sem `let`**: Use `const` e crie novas variáveis
5. **Sem loops imperativos**: Use `map`, `filter`, `reduce`
6. **Sem `void` functions**: Sempre retorne algo
7. **Sem `any`**: TypeScript strict mode obrigatório

## 🏗️ Padrões Funcionais

### 1. Dependency Injection Funcional

```typescript
// Definir dependências como parâmetros
type Dependencies = {
  readonly productRepository: ProductRepository
  readonly logger: Logger
}

// Use Case com DI
type CreateProductUseCase = (
  deps: Dependencies
) => (input: CreateProductInput) => Promise<Result<Product, Error>>

const createProductUseCase: CreateProductUseCase =
  ({ productRepository, logger }) =>
  async (input) => {
    try {
      logger.info('Creating product', { input })
      const product = await productRepository.save(input)
      return Result.ok(product)
    } catch (error) {
      return Result.err(new Error('Failed to create product'))
    }
  }

// Uso
const createProduct = createProductUseCase({
  productRepository,
  logger,
})

const result = await createProduct({ name: 'Product', price: 100 })
```

### 2. Result Type (Either/Result Pattern)

```typescript
// Definição do Result type
type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E }

const Result = {
  ok: <T>(value: T): Result<T, never> =>
    ({ ok: true, value }),

  err: <E>(error: E): Result<never, E> =>
    ({ ok: false, error }),

  isOk: <T, E>(result: Result<T, E>): result is { ok: true; value: T } =>
    result.ok === true,

  isErr: <T, E>(result: Result<T, E>): result is { ok: false; error: E } =>
    result.ok === false,

  map: <T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => U
  ): Result<U, E> => {
    if (result.ok) {
      return Result.ok(fn(result.value))
    }
    return result
  },

  flatMap: <T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>
  ): Result<U, E> => {
    if (result.ok) {
      return fn(result.value)
    }
    return result
  },
}

// Uso
function parsePrice(input: string): Result<number, string> {
  const price = Number.parseFloat(input)
  if (Number.isNaN(price)) {
    return Result.err('Invalid price')
  }
  return Result.ok(price)
}

function validatePrice(price: number): Result<number, string> {
  if (price <= 0) {
    return Result.err('Price must be positive')
  }
  return Result.ok(price)
}

// Composição
const processPrice = (input: string): Result<number, string> =>
  Result.flatMap(parsePrice(input), validatePrice)
```

### 3. Option/Maybe Type

```typescript
type Option<T> =
  | { readonly some: true; readonly value: T }
  | { readonly some: false }

const Option = {
  some: <T>(value: T): Option<T> =>
    ({ some: true, value }),

  none: <T>(): Option<T> =>
    ({ some: false }),

  isSome: <T>(option: Option<T>): option is { some: true; value: T } =>
    option.some === true,

  isNone: <T>(option: Option<T>): option is { some: false } =>
    option.some === false,

  map: <T, U>(option: Option<T>, fn: (value: T) => U): Option<U> => {
    if (option.some) {
      return Option.some(fn(option.value))
    }
    return Option.none()
  },

  flatMap: <T, U>(
    option: Option<T>,
    fn: (value: T) => Option<U>
  ): Option<U> => {
    if (option.some) {
      return fn(option.value)
    }
    return Option.none()
  },

  getOrElse: <T>(option: Option<T>, defaultValue: T): T => {
    if (option.some) {
      return option.value
    }
    return defaultValue
  },
}

// Uso
function findProductById(
  products: readonly Product[],
  id: string
): Option<Product> {
  const product = products.find((p) => p.id === id)
  return product !== undefined ? Option.some(product) : Option.none()
}
```

### 4. Branded Types (Type Safety)

```typescript
// Branded types para evitar mixing de tipos primitivos
type Brand<K, T> = K & { readonly __brand: T }

type ProductId = Brand<string, 'ProductId'>
type UserId = Brand<string, 'UserId'>
type Email = Brand<string, 'Email'>
type PositiveNumber = Brand<number, 'PositiveNumber'>

// Smart constructors
const ProductId = {
  create: (value: string): Result<ProductId, string> => {
    if (value.length === 0) {
      return Result.err('ProductId cannot be empty')
    }
    return Result.ok(value as ProductId)
  },

  unsafe: (value: string): ProductId => value as ProductId,
}

const Email = {
  create: (value: string): Result<Email, string> => {
    if (!value.includes('@')) {
      return Result.err('Invalid email format')
    }
    return Result.ok(value as Email)
  },
}

const PositiveNumber = {
  create: (value: number): Result<PositiveNumber, string> => {
    if (value <= 0) {
      return Result.err('Number must be positive')
    }
    return Result.ok(value as PositiveNumber)
  },
}

// Uso - Type safety garantido!
type Product = {
  readonly id: ProductId
  readonly name: string
  readonly price: PositiveNumber
}

// ❌ Isso NÃO compila
const product: Product = {
  id: 'some-id', // Error: Type 'string' is not assignable to type 'ProductId'
  name: 'Product',
  price: 100, // Error: Type 'number' is not assignable to type 'PositiveNumber'
}

// ✅ Isso compila
const productIdResult = ProductId.create('some-id')
const priceResult = PositiveNumber.create(100)

if (Result.isOk(productIdResult) && Result.isOk(priceResult)) {
  const product: Product = {
    id: productIdResult.value,
    name: 'Product',
    price: priceResult.value,
  }
}
```

### 5. Discriminated Unions (Pattern Matching)

```typescript
// Definir estados como unions
type PaymentStatus =
  | { readonly type: 'pending' }
  | { readonly type: 'processing'; readonly transactionId: string }
  | { readonly type: 'completed'; readonly transactionId: string; readonly date: Date }
  | { readonly type: 'failed'; readonly reason: string }

// Pattern matching com type guards
function handlePayment(status: PaymentStatus): string {
  switch (status.type) {
    case 'pending':
      return 'Waiting for payment'
    case 'processing':
      return `Processing transaction ${status.transactionId}`
    case 'completed':
      return `Payment completed on ${status.date.toISOString()}`
    case 'failed':
      return `Payment failed: ${status.reason}`
  }
}

// Outro exemplo com Result
type LoadingState<T> =
  | { readonly type: 'idle' }
  | { readonly type: 'loading' }
  | { readonly type: 'success'; readonly data: T }
  | { readonly type: 'error'; readonly error: Error }
```

### 6. Lenses (Imutabilidade Profunda)

```typescript
// Lens para atualização imutável profunda
type Lens<S, A> = {
  readonly get: (source: S) => A
  readonly set: (value: A) => (source: S) => S
}

const Lens = {
  create: <S, A>(
    get: (source: S) => A,
    set: (value: A) => (source: S) => S
  ): Lens<S, A> => ({ get, set }),

  compose: <S, A, B>(
    outer: Lens<S, A>,
    inner: Lens<A, B>
  ): Lens<S, B> => ({
    get: (source) => inner.get(outer.get(source)),
    set: (value) => (source) =>
      outer.set(inner.set(value)(outer.get(source)))(source),
  }),
}

// Exemplo
type Address = {
  readonly street: string
  readonly city: string
}

type User = {
  readonly name: string
  readonly address: Address
}

// Lenses
const addressLens: Lens<User, Address> = Lens.create(
  (user) => user.address,
  (address) => (user) => ({ ...user, address })
)

const cityLens: Lens<Address, string> = Lens.create(
  (address) => address.city,
  (city) => (address) => ({ ...address, city })
)

const userCityLens = Lens.compose(addressLens, cityLens)

// Uso
const user: User = {
  name: 'John',
  address: { street: 'Main St', city: 'NYC' },
}

const updatedUser = userCityLens.set('LA')(user)
// { name: 'John', address: { street: 'Main St', city: 'LA' } }
```

### 7. Pipe e Compose

```typescript
// Pipe: esquerda para direita (mais natural)
function pipe<A>(value: A): A
function pipe<A, B>(value: A, fn1: (a: A) => B): B
function pipe<A, B, C>(value: A, fn1: (a: A) => B, fn2: (b: B) => C): C
function pipe<A, B, C, D>(
  value: A,
  fn1: (a: A) => B,
  fn2: (b: B) => C,
  fn3: (c: C) => D
): D
function pipe(value: unknown, ...fns: Array<(arg: unknown) => unknown>): unknown {
  return fns.reduce((acc, fn) => fn(acc), value)
}

// Compose: direita para esquerda (matemática)
function compose<A>(fn1: (a: A) => A): (a: A) => A
function compose<A, B>(fn2: (b: B) => A, fn1: (a: A) => B): (a: A) => A
function compose<A, B, C>(
  fn3: (c: C) => A,
  fn2: (b: B) => C,
  fn1: (a: A) => B
): (a: A) => A
function compose(...fns: Array<(arg: unknown) => unknown>): (arg: unknown) => unknown {
  return (value) => fns.reduceRight((acc, fn) => fn(acc), value)
}

// Uso
const addTax = (rate: number) => (price: number): number =>
  price * (1 + rate)

const applyDiscount = (percentage: number) => (price: number): number =>
  price * (1 - percentage / 100)

const round = (decimals: number) => (value: number): number =>
  Number(value.toFixed(decimals))

// Com pipe
const finalPrice = pipe(
  100,
  applyDiscount(10),  // 90
  addTax(0.15),       // 103.5
  round(2)            // 103.50
)

// Com compose
const processPrice = compose(
  round(2),
  addTax(0.15),
  applyDiscount(10)
)

const result = processPrice(100) // 103.50
```

### 8. Currying

```typescript
// Manual currying
const add = (a: number) => (b: number): number => a + b
const multiply = (a: number) => (b: number): number => a * b

const add5 = add(5)
const double = multiply(2)

add5(10) // 15
double(10) // 20

// Generic curry helper
function curry2<A, B, R>(
  fn: (a: A, b: B) => R
): (a: A) => (b: B) => R {
  return (a) => (b) => fn(a, b)
}

function curry3<A, B, C, R>(
  fn: (a: A, b: B, c: C) => R
): (a: A) => (b: B) => (c: C) => R {
  return (a) => (b) => (c) => fn(a, b, c)
}

// Uso
const sumThree = (a: number, b: number, c: number): number =>
  a + b + c

const curriedSum = curry3(sumThree)
const add10 = curriedSum(10)
const add10And20 = add10(20)
const result = add10And20(5) // 35
```

## 📚 Estrutura de Código Funcional

### Domain Layer

```typescript
// src/domain/product/product.types.ts
export type ProductId = Brand<string, 'ProductId'>
export type ProductName = Brand<string, 'ProductName'>
export type Price = Brand<number, 'Price'>

export type Product = {
  readonly id: ProductId
  readonly name: ProductName
  readonly price: Price
  readonly barcode: string
}

// src/domain/product/product.constructors.ts
export const ProductId = {
  create: (value: string): Result<ProductId, string> => {
    if (value.length === 0) {
      return Result.err('ProductId cannot be empty')
    }
    return Result.ok(value as ProductId)
  },
}

export const Price = {
  create: (value: number): Result<Price, string> => {
    if (value <= 0) {
      return Result.err('Price must be positive')
    }
    if (!Number.isFinite(value)) {
      return Result.err('Price must be finite')
    }
    return Result.ok(value as Price)
  },
}

// src/domain/product/product.rules.ts
export const calculateDiscount =
  (percentage: number) =>
  (price: Price): Result<Price, string> => {
    if (percentage < 0 || percentage > 100) {
      return Result.err('Discount must be between 0 and 100')
    }
    const discounted = (price as number) * (1 - percentage / 100)
    return Price.create(discounted)
  }

// src/domain/product/product.repository.ts (PORT)
export type ProductRepository = {
  readonly findById: (id: ProductId) => Promise<Option<Product>>
  readonly save: (product: Product) => Promise<Result<Product, Error>>
  readonly findAll: () => Promise<readonly Product[]>
}
```

### Application Layer

```typescript
// src/application/use-cases/create-product.ts
type Dependencies = {
  readonly productRepository: ProductRepository
  readonly logger: Logger
}

export type CreateProductInput = {
  readonly name: string
  readonly price: number
  readonly barcode: string
}

export type CreateProduct = (
  deps: Dependencies
) => (input: CreateProductInput) => Promise<Result<Product, Error>>

export const createProduct: CreateProduct =
  ({ productRepository, logger }) =>
  async (input) => {
    // Validate and create domain types
    const priceResult = Price.create(input.price)
    if (Result.isErr(priceResult)) {
      return Result.err(new Error(priceResult.error))
    }

    // Create product
    const product: Product = {
      id: ProductId.unsafe(crypto.randomUUID()),
      name: input.name as ProductName,
      price: priceResult.value,
      barcode: input.barcode,
    }

    // Save
    logger.info('Creating product', { product })
    return productRepository.save(product)
  }
```

### Infrastructure Layer

```typescript
// src/infrastructure/repositories/product.repository.impl.ts
type CreateProductRepository = (
  db: DrizzleDatabase
) => ProductRepository

export const createProductRepository: CreateProductRepository = (db) => ({
  findById: async (id) => {
    const result = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id as string))
      .limit(1)

    const product = result[0]
    return product !== undefined
      ? Option.some(product as Product)
      : Option.none()
  },

  save: async (product) => {
    try {
      await db.insert(productsTable).values({
        id: product.id as string,
        name: product.name,
        price: product.price as number,
        barcode: product.barcode,
      })
      return Result.ok(product)
    } catch (error) {
      return Result.err(error as Error)
    }
  },

  findAll: async () => {
    const results = await db.select().from(productsTable)
    return results as readonly Product[]
  },
})
```

### Presentation Layer

```typescript
// src/presentation/controllers/product.controller.ts
type CreateProductController = (
  createProduct: ReturnType<CreateProduct>
) => Hono

export const createProductController: CreateProductController =
  (createProduct) => {
    const app = new Hono()

    app.post('/products', async (c) => {
      const body = await c.req.json()

      const result = await createProduct({
        name: body.name,
        price: body.price,
        barcode: body.barcode,
      })

      if (Result.isErr(result)) {
        return c.json({ error: result.error.message }, 400)
      }

      return c.json(result.value, 201)
    })

    return app
  }
```

## ✅ Checklist Funcional

Antes de cada commit, verifique:

- [ ] Sem classes (`class` keyword)?
- [ ] Apenas `const`, sem `let` ou `var`?
- [ ] Funções puras (sem efeitos colaterais)?
- [ ] Imutabilidade (sem mutação de objetos)?
- [ ] Branded types para type safety?
- [ ] Result/Option types para erros?
- [ ] Currying quando apropriado?
- [ ] Composição de funções?
- [ ] TypeScript strict mode (sem `any`)?
- [ ] Todas as funções têm tipos explícitos?

## 📖 Recursos

- [Functional Programming in TypeScript](https://gcanti.github.io/fp-ts/)
- [TypeScript Deep Dive - Functional Programming](https://basarat.gitbook.io/typescript/future-javascript/arrow-functions)
- [Mostly Adequate Guide to FP](https://mostly-adequate.gitbook.io/mostly-adequate-guide/)

---

**Lembre-se**: Programação funcional não é apenas sobre sintaxe, é sobre **composição**, **imutabilidade** e **type safety**.
