# Database - Drizzle ORM

Estrutura de banco de dados usando Drizzle ORM com SQLite.

## Estrutura

```
db/
├── schema/              # Schemas do Drizzle
│   ├── index.ts         # Exporta todos os schemas
│   └── *.schema.ts      # Arquivos de schema individuais
├── migrations/          # Migrations geradas pelo Drizzle Kit
├── connection.ts        # Conexão com o banco
└── README.md           # Este arquivo
```

## Scripts Disponíveis

```bash
# Gerar migration a partir dos schemas
pnpm db:generate

# Aplicar migrations no banco
pnpm db:migrate

# Push schema direto (dev only, sem criar migration)
pnpm db:push

# Abrir Drizzle Studio (GUI visual)
pnpm db:studio

# Drop migration
pnpm db:drop

# Check migrations
pnpm db:check
```

## Uso

### Definir um Schema

```typescript
// src/infrastructure/db/schema/users.schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const usersTable = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export type User = typeof usersTable.$inferSelect
export type NewUser = typeof usersTable.$inferInsert
```

### Usar o Schema

```typescript
import { db, schema } from '@infrastructure/db/connection'

// Insert
const newUser = await db
  .insert(schema.usersTable)
  .values({ name: 'John', email: 'john@example.com' })
  .returning()

// Select
const users = await db.select().from(schema.usersTable)

// Select com where
const user = await db
  .select()
  .from(schema.usersTable)
  .where(eq(schema.usersTable.email, 'john@example.com'))

// Update
await db
  .update(schema.usersTable)
  .set({ name: 'John Doe' })
  .where(eq(schema.usersTable.id, 1))

// Delete
await db
  .delete(schema.usersTable)
  .where(eq(schema.usersTable.id, 1))
```

## Migrations

### Workflow

1. Criar/modificar schema em `schema/*.schema.ts`
2. Exportar no `schema/index.ts`
3. Gerar migration: `pnpm db:generate`
4. Revisar migration gerada em `migrations/`
5. Aplicar migration: `pnpm db:migrate`

### Dev Mode

Durante desenvolvimento, você pode usar `pnpm db:push` para aplicar mudanças direto no banco sem criar migrations. **Não use em produção!**

## Drizzle Studio

Acesse uma interface visual do banco de dados:

```bash
pnpm db:studio
```

Abrirá em `https://local.drizzle.studio`

## Configuração

A configuração está em `drizzle.config.ts` na raiz do backend.

```typescript
export default {
  schema: './src/infrastructure/db/schema/index.ts',
  out: './src/infrastructure/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env['DATABASE_URL'] || './data/pos-nfce.db',
  },
} satisfies Config
```

## Conexão

A conexão é criada em `connection.ts` com as seguintes configurações:

- **Foreign Keys:** Habilitados
- **Journal Mode:** WAL (Write-Ahead Logging) para melhor concorrência

## Type Safety

Drizzle é completamente type-safe. Todos os tipos são inferidos automaticamente dos schemas:

```typescript
// Tipo inferido automaticamente
const users: User[] = await db.select().from(schema.usersTable)

// NewUser não inclui 'id' nem 'createdAt' (gerados automaticamente)
const newUser: NewUser = {
  name: 'John',
  email: 'john@example.com'
}
```

## Próximos Passos

Nas próximas fases, serão criados os schemas reais do sistema:

- `produtos.schema.ts`
- `vendas.schema.ts`
- `caixa.schema.ts`
- `usuarios.schema.ts`
- `nfce.schema.ts`
- etc.
