import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './infrastructure/router'

// Importar estilos globais quando criados
// import './presentation/styles/main.css'

// Criar instância do app
const app = createApp(App)

// Plugins
app.use(createPinia())
app.use(router)

// Montar app
app.mount('#app')

// Service Worker Registration (PWA)
// O plugin vite-plugin-pwa gerencia automaticamente o service worker
// Não é necessário registro manual adicional aqui
