# Integração Desktop x Frontend

Este documento descreve como o pacote desktop se integra com o frontend Vue.js.

## Arquitetura

```
┌─────────────────────────────────────┐
│         Desktop App (Tauri)         │
│  ┌───────────────────────────────┐  │
│  │    Window (WebView)            │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  Frontend Vue.js App    │  │  │
│  │  │  (packages/frontend)    │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │    Rust Backend (Tauri Core)  │  │
│  │  - File System Access         │  │
│  │  - Native APIs                │  │
│  │  - System Integration         │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │  Backend API │
    │ (HTTP/REST)  │
    └──────────────┘
```

## Fluxo de Desenvolvimento

### Modo Desenvolvimento

1. **Frontend Dev Server**: Vite inicia na porta 5173
2. **Tauri Window**: Carrega `http://localhost:5173`
3. **Hot Reload**: Mudanças no frontend refletem automaticamente

```bash
# Terminal 1: Frontend dev server (automático via tauri.conf.json)
# Terminal 2: Tauri app
cd packages/desktop
pnpm dev
```

### Modo Produção

1. **Frontend Build**: Vite cria o bundle estático em `dist/`
2. **Tauri Bundle**: Empacota o bundle junto com o binário Rust
3. **Single Binary**: Resultado é um executável standalone

```bash
# Build completo
cd packages/desktop
pnpm build
```

## Comunicação Tauri ↔ Frontend

### Chamadas do Frontend para o Backend Tauri

```typescript
// No frontend Vue.js
import { invoke } from '@tauri-apps/api/core'

// Chamar comando Rust
const result = await invoke('my_command', {
  arg1: 'value1',
  arg2: 'value2'
})
```

```rust
// No backend Rust (src-tauri/src/main.rs)
#[tauri::command]
fn my_command(arg1: String, arg2: String) -> String {
  format!("Received: {} and {}", arg1, arg2)
}

// Registrar no builder
tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![my_command])
  .run(tauri::generate_context!())
```

### Eventos do Backend para o Frontend

```rust
// Rust: Emitir evento
window.emit("my-event", Payload { message: "Hello".into() })?;
```

```typescript
// Vue.js: Escutar evento
import { listen } from '@tauri-apps/api/event'

const unlisten = await listen('my-event', (event) => {
  console.log('Received:', event.payload)
})
```

## Recursos Desktop Disponíveis

### File System (Plugin)

```typescript
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'

// Ler arquivo
const content = await readTextFile('path/to/file.txt')

// Escrever arquivo
await writeTextFile('path/to/file.txt', 'Content')
```

### Dialog (Plugin)

```typescript
import { open, save } from '@tauri-apps/plugin-dialog'

// Abrir arquivo
const selected = await open({
  multiple: false,
  filters: [{
    name: 'JSON',
    extensions: ['json']
  }]
})

// Salvar arquivo
const path = await save({
  filters: [{
    name: 'PDF',
    extensions: ['pdf']
  }]
})
```

### Notifications (Plugin)

```typescript
import { sendNotification } from '@tauri-apps/plugin-notification'

await sendNotification({
  title: 'Venda Finalizada',
  body: 'Venda #123 foi finalizada com sucesso'
})
```

### Shell (Plugin)

```typescript
import { Command } from '@tauri-apps/plugin-shell'

// Executar comando
const command = Command.create('print-receipt', ['--id', '123'])
const output = await command.execute()
```

## Diferenças Web vs Desktop

### Detecção de Ambiente

```typescript
// utils/platform.ts
export const isDesktop = () => {
  return '__TAURI__' in window
}

export const isWeb = () => {
  return !isDesktop()
}

// Uso no componente
if (isDesktop()) {
  // Usar recursos nativos do Tauri
  await invoke('print_receipt', { id: saleId })
} else {
  // Usar API web ou mostrar mensagem
  window.print()
}
```

### Configuração Condicional

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

if (isDesktop()) {
  // Configurações específicas desktop
  app.config.globalProperties.$platform = 'desktop'
} else {
  // Configurações específicas web
  app.config.globalProperties.$platform = 'web'
}

app.mount('#app')
```

## Variáveis de Ambiente

### Frontend (.env)

```env
# Usadas em ambos (web e desktop)
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=POS NFC-e
```

### Tauri (tauri.conf.json)

```json
{
  "build": {
    "beforeDevCommand": "cd ../frontend && npm run dev",
    "devUrl": "http://localhost:5173",
    "beforeBuildCommand": "cd ../frontend && npm run build",
    "frontendDist": "../frontend/dist"
  }
}
```

## Ícones e Assets

### Ícones da Aplicação

- Localização: `src-tauri/icons/`
- Formatos: PNG, ICO (Windows), ICNS (macOS)
- Tamanhos: 32x32, 128x128, 256x256, 512x512, 1024x1024

### Assets do Frontend

- Build do frontend copia automaticamente assets para o bundle
- Assets ficam em `packages/frontend/public/`
- Acessíveis via path relativo no código

## Performance

### Otimizações Desktop

1. **Preload**: Tauri usa preload automático
2. **Bundle Size**: ~20MB (vs ~100MB Electron)
3. **Memory**: Uso reduzido de memória
4. **Startup**: Inicialização mais rápida

### Comparação

| Métrica | Electron | Tauri |
|---------|----------|-------|
| Bundle Size | ~100MB | ~20MB |
| Memory (Idle) | ~150MB | ~50MB |
| Startup Time | ~3s | ~1s |
| CPU Usage | Médio | Baixo |

## Segurança

### Content Security Policy

```json
{
  "app": {
    "security": {
      "csp": "default-src 'self'; connect-src 'self' http://localhost:3000"
    }
  }
}
```

### Permissions

```json
{
  "plugins": {
    "fs": {
      "scope": ["$APP/data/*"]
    }
  }
}
```

## Debugging

### DevTools

```bash
# Ativar DevTools no modo desenvolvimento
# Automaticamente disponível em dev mode
# Atalho: Ctrl+Shift+I (Windows/Linux) ou Cmd+Opt+I (macOS)
```

### Logs

```rust
// Rust
println!("Debug: {:?}", value);
```

```typescript
// TypeScript
console.log('Debug:', value)
```

### Rust Logs

```bash
# Ver logs do Rust
RUST_LOG=debug pnpm dev
```

## Distribuição

### Formatos de Build

- **Windows**: `.exe`, `.msi`
- **macOS**: `.app`, `.dmg`
- **Linux**: `.AppImage`, `.deb`, `.rpm`

### Assinatura de Código

```json
{
  "bundle": {
    "windows": {
      "certificateThumbprint": "YOUR_CERT_THUMBPRINT"
    },
    "macOS": {
      "signingIdentity": "Developer ID Application: YOUR_NAME"
    }
  }
}
```

## Próximos Passos

- [ ] Implementar comandos Tauri customizados
- [ ] Adicionar suporte a impressão nativa
- [ ] Configurar auto-update
- [ ] Implementar sincronização offline
- [ ] Adicionar shortcuts de teclado globais
