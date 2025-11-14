# Desktop - Tauri v2

Aplicação desktop nativa do sistema POS NFC-e.

## Stack

- **Tauri v2** (latest) - Framework para aplicações desktop
- **Rust** (latest stable) - Backend da aplicação
- **Vue.js 3** - Frontend (compartilhado com a versão web)
- **Vite** - Build tool

## Pré-requisitos

### Rust

```bash
# Linux/macOS
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Windows
# Baixe e instale de: https://rustup.rs/
```

### Dependências do Sistema

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

**macOS:**
```bash
# Xcode Command Line Tools
xcode-select --install
```

**Windows:**
- Visual Studio Build Tools 2019 ou superior
- WebView2 (geralmente já instalado no Windows 11)

## Instalação

```bash
# Na raiz do projeto
pnpm install

# Ou especificamente no pacote desktop
cd packages/desktop
pnpm install
```

## Desenvolvimento

```bash
# Modo desenvolvimento (hot-reload)
pnpm dev

# Ou a partir da raiz do projeto
pnpm --filter @pos-nfce/desktop dev
```

Isso irá:
1. Iniciar o servidor de desenvolvimento do frontend (Vite) na porta 5173
2. Abrir a janela desktop do Tauri conectada ao servidor

## Build

```bash
# Build de produção
pnpm build

# Ou a partir da raiz do projeto
pnpm --filter @pos-nfce/desktop build
```

Os binários serão gerados em:
- **Linux**: `src-tauri/target/release/bundle/`
- **macOS**: `src-tauri/target/release/bundle/`
- **Windows**: `src-tauri/target/release/bundle/`

## Estrutura

```
packages/desktop/
├── src-tauri/          # Código Rust (backend)
│   ├── src/
│   │   └── main.rs     # Ponto de entrada
│   ├── icons/          # Ícones da aplicação
│   ├── Cargo.toml      # Dependências Rust
│   ├── tauri.conf.json # Configuração do Tauri
│   └── build.rs        # Build script
├── package.json        # Dependências Node.js
└── README.md
```

## Características

### Desktop-First Features

- ✅ **Janela Nativa**: Interface nativa do sistema operacional
- ✅ **Performance**: Usa menos recursos que Electron
- ✅ **Offline-First**: Funciona sem conexão à internet
- ✅ **Segurança**: Sandbox de segurança robusto
- ✅ **Tamanho Reduzido**: Binários menores (~20MB vs ~100MB do Electron)

### Funcionalidades Específicas do Desktop

- **Atalhos de Teclado Globais**: F1-F12 para ações rápidas
- **Impressão Direta**: Suporte a impressoras térmicas
- **Notificações do Sistema**: Alertas nativos
- **Auto-Update**: Atualizações automáticas (em desenvolvimento)
- **Tray Icon**: Ícone na bandeja do sistema (em desenvolvimento)

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto frontend:

```env
VITE_API_URL=http://localhost:3000
```

### Customização da Janela

Edite `src-tauri/tauri.conf.json`:

```json
{
  "app": {
    "windows": [
      {
        "title": "POS NFC-e",
        "width": 1280,
        "height": 800,
        "resizable": true,
        "fullscreen": false
      }
    ]
  }
}
```

## Troubleshooting

### Erro ao compilar (Linux)

```bash
# Instale as dependências de desenvolvimento
sudo apt install pkg-config libssl-dev
```

### Erro de WebView2 (Windows)

Baixe e instale o WebView2 Runtime:
https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### Erro de certificado (macOS)

```bash
# Assine o aplicativo localmente (apenas para desenvolvimento)
codesign --force --deep --sign - path/to/app.app
```

## Scripts Disponíveis

- `pnpm dev` - Inicia o modo de desenvolvimento
- `pnpm build` - Cria o build de produção
- `pnpm tauri` - Acesso direto ao CLI do Tauri

## Documentação

- [Tauri v2 Docs](https://v2.tauri.app/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Vue.js 3 Docs](https://vuejs.org/)

## Status

✅ **Configuração Inicial Completa**

Próximos passos:
- [ ] Configurar ícones da aplicação
- [ ] Implementar shortcuts de teclado
- [ ] Configurar auto-update
- [ ] Adicionar suporte a impressoras térmicas
- [ ] Implementar tray icon
- [ ] Configurar CI/CD para builds automáticos
