<script setup lang="ts">
/**
 * AppLayout Component
 *
 * Main application layout integrating Header, Sidebar, Footer and main content area.
 */

</script>

<template>
  <div class="app-layout">
    <AppHeader />
    <main class="app-layout__main">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-layout__main {
  flex: 1;
  padding: var(--space-6) var(--space-4);
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}
</style>
