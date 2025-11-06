/**
 * @pos-nfce/frontend - Entry Point
 *
 * Phase 3: Interface and Component Implementation
 * Custom Design System with Vue 3 + TypeScript
 */

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'

// Import Design System CSS
import './styles/tokens.css'
import './styles/reset.css'
import './styles/utilities.css'

// Initialize Service Worker (PWA)
import { registerServiceWorker } from './infrastructure/service-worker/sw-manager'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

app.mount('#app')

// Register Service Worker
registerServiceWorker()
