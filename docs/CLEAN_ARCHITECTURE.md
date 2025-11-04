# Clean Architecture - Sistema POS NFC-e

Este documento descreve a arquitetura limpa (Clean Architecture) utilizada no projeto, suas camadas, responsabilidades e regras de dependência.

## 📐 Princípios Fundamentais

### 1. Regra de Dependência

```
┌─────────────────────────────────────────────────┐
│           PRESENTATION                          │
│  (Views, Components, Controllers, Routes)       │
│                    ↓                             │
│           APPLICATION                            │
│     (Use Cases, Stores, Services)               │
│                    ↓                             │
│           INFRASTRUCTURE                         │
│  (Database, API Clients, External Services)     │
│                    ↓                             │
│             DOMAIN                               │
│   (Entities, Business Rules, Interfaces)        │
└─────────────────────────────────────────────────┘

REGRA: Camadas externas dependem de camadas internas.
       Camadas internas NUNCA dependem de camadas externas.
```

### 2. Independência

- **Framework Independence**: O domínio não conhece Vue, Hono, etc
- **UI Independence**: Regras de negócio não conhecem a UI
- **Database Independence**: Regras de negócio não conhecem o banco
- **External Services Independence**: Regras de negócio são isoladas

## 🏗️ Estrutura de Camadas

### 📦 1. DOMAIN (Núcleo - Camada Mais Interna)

**Localização**: `src/domain/`

**Responsabilidades**:
- Entidades do negócio
- Regras de negócio puras
- Interfaces (contratos) para repositórios e serviços
- Value Objects
- Domain Events
- Exceções de domínio

**Características**:
- ✅ ZERO dependências externas
- ✅ TypeScript puro
- ✅ Testável em isolamento
- ❌ NÃO importa nada de outras camadas
- ❌ NÃO conhece frameworks

**Exemplo - Backend**:
```typescript
// src/domain/product/product.entity.ts
export interface Product {
  id: string
  name: string
  price: number
  barcode: string
}

export interface ProductRepository {
  findById(id: string): Promise<Product | null>
  save(product: Product): Promise<void>
}

// src/domain/product/product.rules.ts
export function calculateDiscount(price: number, percentage: number): number {
  if (percentage < 0 || percentage > 100) {
    throw new Error('Invalid discount percentage')
  }
  return price * (1 - percentage / 100)
}
```

**Exemplo - Frontend**:
```typescript
// src/domain/sale/sale.entity.ts
export interface SaleItem {
  productId: string
  quantity: number
  unitPrice: number
}

export interface Sale {
  id: string
  items: SaleItem[]
  total: number
  status: 'pending' | 'completed' | 'cancelled'
}

// src/domain/sale/sale.calculator.ts
export function calculateTotal(items: SaleItem[]): number {
  return items.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice
  }, 0)
}
```

### 🔧 2. APPLICATION (Casos de Uso)

**Localização**: `src/application/`

**Responsabilidades**:
- Casos de uso (Use Cases)
- Lógica de aplicação
- Orquestração de entidades
- DTOs (Data Transfer Objects)
- Application Services
- Stores (Frontend - Pinia)

**Características**:
- ✅ Depende APENAS do Domain
- ✅ Orquestra entidades e serviços
- ✅ Define interfaces para infraestrutura
- ❌ NÃO conhece frameworks de UI
- ❌ NÃO conhece detalhes de persistência

**Exemplo - Backend**:
```typescript
// src/application/use-cases/create-product.use-case.ts
import type { Product, ProductRepository } from '@domain/product'

export interface CreateProductInput {
  name: string
  price: number
  barcode: string
}

export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: CreateProductInput): Promise<Product> {
    const product: Product = {
      id: crypto.randomUUID(),
      name: input.name,
      price: input.price,
      barcode: input.barcode,
    }

    await this.productRepository.save(product)
    return product
  }
}
```

**Exemplo - Frontend**:
```typescript
// src/application/stores/sale.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Sale, SaleItem } from '@domain/sale'
import { calculateTotal } from '@domain/sale'

export const useSaleStore = defineStore('sale', () => {
  const currentSale = ref<Sale | null>(null)
  const items = ref<SaleItem[]>([])

  const total = computed(() => calculateTotal(items.value))

  function addItem(item: SaleItem): void {
    items.value.push(item)
  }

  return { currentSale, items, total, addItem }
})
```

### 🔌 3. INFRASTRUCTURE (Implementações)

**Localização**: `src/infrastructure/`

**Responsabilidades**:
- Implementações de repositórios
- Adaptadores de banco de dados
- Clientes HTTP/API
- File System
- External Services
- Framework-specific code

**Características**:
- ✅ Implementa interfaces do Domain
- ✅ Conhece frameworks e bibliotecas
- ✅ Lida com detalhes técnicos
- ⚠️ Depende do Domain (interfaces)
- ❌ NÃO contém lógica de negócio

**Exemplo - Backend**:
```typescript
// src/infrastructure/repositories/product.repository.impl.ts
import type { Product, ProductRepository } from '@domain/product'
import type { DrizzleDatabase } from '@infrastructure/db/connection'
import { products } from '@infrastructure/db/schema'
import { eq } from 'drizzle-orm'

export class ProductRepositoryImpl implements ProductRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async findById(id: string): Promise<Product | null> {
    const result = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1)

    return result[0] ?? null
  }

  async save(product: Product): Promise<void> {
    await this.db.insert(products).values(product)
  }
}
```

**Exemplo - Frontend**:
```typescript
// src/infrastructure/api/product.api.ts
import type { Product } from '@domain/product'

export class ProductApiClient {
  constructor(private readonly baseUrl: string) {}

  async fetchProduct(id: string): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/products/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch product')
    }
    return response.json()
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    })
    if (!response.ok) {
      throw new Error('Failed to create product')
    }
    return response.json()
  }
}
```

### 🎨 4. PRESENTATION (Interface com Usuário)

**Localização**: `src/presentation/`

**Responsabilidades**:
- Controllers (Backend)
- Views e Components (Frontend)
- Rotas e Navigation
- View Models
- Formatadores de UI
- Validação de input

**Características**:
- ✅ Depende de Application e Domain
- ✅ Framework-specific (Vue, Hono)
- ✅ Lida com entrada/saída
- ⚠️ Validação básica apenas
- ❌ NÃO contém lógica de negócio

**Exemplo - Backend**:
```typescript
// src/presentation/controllers/product.controller.ts
import { Hono } from 'hono'
import type { CreateProductUseCase } from '@application/use-cases'

export function createProductController(
  createProductUseCase: CreateProductUseCase
): Hono {
  const app = new Hono()

  app.post('/products', async (c) => {
    const body = await c.req.json()

    // Validação de input
    if (!body.name || !body.price || !body.barcode) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const product = await createProductUseCase.execute({
      name: body.name,
      price: body.price,
      barcode: body.barcode,
    })

    return c.json(product, 201)
  })

  return app
}
```

**Exemplo - Frontend**:
```vue
<!-- src/presentation/views/ProductListView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSaleStore } from '@application/stores/sale.store'
import type { Product } from '@domain/product'

const saleStore = useSaleStore()
const products = ref<Product[]>([])

onMounted(async () => {
  // Carrega produtos via API
})

function addToSale(product: Product): void {
  saleStore.addItem({
    productId: product.id,
    quantity: 1,
    unitPrice: product.price,
  })
}
</script>

<template>
  <div class="product-list">
    <div v-for="product in products" :key="product.id">
      <h3>{{ product.name }}</h3>
      <p>R$ {{ product.price.toFixed(2) }}</p>
      <button @click="addToSale(product)">Adicionar</button>
    </div>
  </div>
</template>
```

### 🔧 5. SHARED (Código Compartilhado)

**Localização**: `src/shared/`

**Responsabilidades**:
- Utilitários puros
- Constantes
- Tipos compartilhados
- Helpers
- Formatadores

**Características**:
- ✅ Sem dependências de camadas
- ✅ Funções puras
- ✅ Reusável em qualquer camada
- ❌ NÃO contém lógica de negócio

**Exemplo**:
```typescript
// src/shared/utils/currency.ts
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// src/shared/constants/api.ts
export const API_TIMEOUT = 30000
export const MAX_RETRIES = 3

// src/shared/types/common.ts
export type UUID = string
export type Timestamp = number
```

## 📁 Estrutura de Diretórios

### Backend (`packages/backend/src/`)
```
src/
├── domain/
│   ├── product/
│   │   ├── product.entity.ts
│   │   ├── product.repository.ts
│   │   └── product.rules.ts
│   ├── sale/
│   └── nfce/
│
├── application/
│   ├── use-cases/
│   │   ├── create-product.use-case.ts
│   │   └── process-sale.use-case.ts
│   └── services/
│
├── infrastructure/
│   ├── db/
│   │   ├── connection.ts
│   │   ├── schema/
│   │   ├── migrations/
│   │   └── repositories/
│   ├── external/
│   │   └── sefaz-api.client.ts
│   └── queue/
│
├── presentation/
│   ├── controllers/
│   │   ├── product.controller.ts
│   │   └── sale.controller.ts
│   └── middlewares/
│
└── shared/
    ├── types/
    ├── utils/
    └── constants/
```

### Frontend (`packages/frontend/src/`)
```
src/
├── domain/
│   ├── product/
│   │   ├── product.entity.ts
│   │   └── product.calculator.ts
│   └── sale/
│
├── application/
│   ├── stores/
│   │   ├── sale.store.ts
│   │   └── product.store.ts
│   └── use-cases/
│
├── infrastructure/
│   ├── api/
│   │   ├── product.api.ts
│   │   └── sale.api.ts
│   ├── storage/
│   │   └── local-storage.adapter.ts
│   └── router/
│       └── index.ts
│
├── presentation/
│   ├── views/
│   │   ├── HomeView.vue
│   │   └── SaleView.vue
│   ├── components/
│   │   ├── ProductCard.vue
│   │   └── SaleCart.vue
│   └── composables/
│       └── useSale.ts
│
└── shared/
    ├── types/
    ├── utils/
    └── constants/
```

## ✅ Regras de Ouro

### ✅ FAÇA

1. **Domain primeiro**: Comece sempre pelo domínio
2. **Interfaces no Domain**: Defina contratos no núcleo
3. **Teste independente**: Cada camada deve ser testável
4. **Injeção de dependência**: Use DI para desacoplar
5. **Single Responsibility**: Uma classe, uma responsabilidade

### ❌ NÃO FAÇA

1. **Domain depende de nada**: NUNCA importe framework no domain
2. **Lógica na UI**: NUNCA coloque regras de negócio na view
3. **Use Cases diretos na UI**: SEMPRE passe pela camada certa
4. **Repositórios no Domain**: Defina interface, implemente em infra
5. **Mix de responsabilidades**: Respeite as camadas

## 🧪 Testando Clean Architecture

### Domain Layer
```typescript
// ✅ Testes puros, sem mocks
describe('calculateDiscount', () => {
  it('should apply 10% discount', () => {
    const result = calculateDiscount(100, 10)
    expect(result).toBe(90)
  })
})
```

### Application Layer
```typescript
// ✅ Mock apenas repositórios (interfaces)
describe('CreateProductUseCase', () => {
  it('should create product', async () => {
    const mockRepo: ProductRepository = {
      save: vi.fn(),
      findById: vi.fn(),
    }

    const useCase = new CreateProductUseCase(mockRepo)
    await useCase.execute({ name: 'Test', price: 100, barcode: '123' })

    expect(mockRepo.save).toHaveBeenCalledOnce()
  })
})
```

### Infrastructure Layer
```typescript
// ✅ Testes de integração com banco real ou in-memory
describe('ProductRepositoryImpl', () => {
  it('should save and retrieve product', async () => {
    const repo = new ProductRepositoryImpl(testDb)
    const product = { id: '1', name: 'Test', price: 100, barcode: '123' }

    await repo.save(product)
    const found = await repo.findById('1')

    expect(found).toEqual(product)
  })
})
```

## 📚 Recursos

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

## 🎯 Checklist de Validação

Antes de criar código, pergunte:

- [ ] Esta classe está na camada correta?
- [ ] As dependências respeitam a regra de dependência?
- [ ] O Domain está livre de frameworks?
- [ ] As interfaces estão no lugar certo?
- [ ] O código é testável isoladamente?
- [ ] Não há lógica de negócio na UI?
- [ ] Os use cases orquestram, não implementam regras?

---

**Lembre-se**: Clean Architecture não é sobre pastas, é sobre DEPENDÊNCIAS e RESPONSABILIDADES.
