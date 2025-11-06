<script setup lang="ts">
/**
 * App.vue - Root Component
 *
 * Main application component with design system integration
 */
</script>

<template>
  <div id="app">
    <h1>POS NFC-e</h1>
    <p>Sistema de Ponto de Venda com Emissão de NFC-e</p>
  </div>
</template>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

h1 {
  color: var(--color-primary-600);
  margin-bottom: var(--space-4);
}

p {
  color: var(--text-secondary);
}
</style>
