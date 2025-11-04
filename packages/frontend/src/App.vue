<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('🚀 POS NFC-e Frontend Started')
})
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style scoped>
#app {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}
</style>
