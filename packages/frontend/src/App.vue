<script setup lang="ts">
/**
 * App.vue - Root Component
 *
 * Phase 3 Complete: Custom Design System + Base Components + Layout + Auth
 */

import { ref } from 'vue'
import LoginForm from './components/auth/LoginForm.vue'
import BaseCard from './components/base/BaseCard.vue'
import AppLayout from './components/layout/AppLayout.vue'

const isAuthenticated = ref(false)
const isLoading = ref(false)
const loginError = ref('')

const handleLogin = async (credentials: { username: string; password: string }) => {
  isLoading.value = true
  loginError.value = ''

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (credentials.username === 'admin' && credentials.password === 'admin') {
    isAuthenticated.value = true
  } else {
    loginError.value = 'Usuário ou senha inválidos'
  }

  isLoading.value = false
}
</script>

<template>
  <AppLayout>
    <div v-if="!isAuthenticated" class="login-container">
      <LoginForm :loading="isLoading" :error="loginError" @submit="handleLogin" />
    </div>

    <div v-else class="dashboard">
      <h1>POS NFC-e - Sistema Pronto!</h1>
      <p class="subtitle">Fase 3 Completa: Design System + Componentes Base + Layout + Autenticação</p>

      <div class="features-grid">
        <BaseCard title="Design System" elevation="md">
          <ul>
            <li>✅ Paleta de cores customizada</li>
            <li>✅ Tipografia e tokens CSS</li>
            <li>✅ Utilitários e reset CSS</li>
          </ul>
        </BaseCard>

        <BaseCard title="Componentes Base" elevation="md">
          <ul>
            <li>✅ Button, Input, Card</li>
            <li>✅ Alert, Loading</li>
            <li>✅ 100% Test Coverage</li>
          </ul>
        </BaseCard>

        <BaseCard title="Layout" elevation="md">
          <ul>
            <li>✅ AppHeader, AppSidebar</li>
            <li>✅ AppFooter, AppLayout</li>
            <li>✅ Responsive Design</li>
          </ul>
        </BaseCard>

        <BaseCard title="Autenticação" elevation="md">
          <ul>
            <li>✅ LoginForm Component</li>
            <li>✅ Loading & Error States</li>
            <li>✅ Validação Completa</li>
          </ul>
        </BaseCard>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.subtitle {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin-bottom: var(--space-8);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
  margin-top: var(--space-6);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: var(--space-2) 0;
  color: var(--text-secondary);
}
</style>
