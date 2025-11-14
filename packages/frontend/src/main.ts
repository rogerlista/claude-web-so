/**
 * @pos-nfce/frontend - Entry Point
 *
 * Phase 4: Product Management Implementation
 * - Vue Router for navigation
 * - Pinia for state management
 * - Custom Design System with Vue 3 + TypeScript
 */

import { createPinia } from "pinia";
import { createApp } from "vue";
import { createWebHistory } from "vue-router";
import App from "./App.vue";
import { createRouter } from "./router";

// Import Design System CSS
import "./styles/tokens.css";
import "./styles/reset.css";
import "./styles/utilities.css";

// Initialize Service Worker (PWA)
import { registerServiceWorker } from "./infrastructure/service-worker/sw-manager";

const app = createApp(App);
const pinia = createPinia();
const router = createRouter(createWebHistory());

app.use(pinia);
app.use(router);

app.mount("#app");

// Register Service Worker
registerServiceWorker();
