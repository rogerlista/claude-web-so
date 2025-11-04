<script setup lang="ts">
import { ref } from 'vue'

const message = ref('POS NFC-e - Sistema de Ponto de Venda')
const version = ref('0.0.0')
</script>

<template>
  <div class="home">
    <h1>{{ message }}</h1>
    <p>Versão: {{ version }}</p>
    <p>Frontend configurado com:</p>
    <ul>
      <li>✅ Vue 3 (Composition API)</li>
      <li>✅ TypeScript Strict Mode</li>
      <li>✅ Vue Router</li>
      <li>✅ Pinia</li>
      <li>✅ Vite</li>
      <li>✅ PWA (Offline First)</li>
      <li>✅ Clean Architecture</li>
    </ul>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

p {
  font-size: 1.1rem;
  margin: 1rem 0;
  color: #666;
}

ul {
  list-style: none;
  padding: 0;
  margin: 2rem 0;
}

li {
  padding: 0.5rem;
  font-size: 1rem;
  color: #42b983;
}
</style>
