import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './infrastructure/router'
import App from './App.vue'

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
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration)
      })
      .catch((error) => {
        console.log('SW registration failed:', error)
      })
  })
}
