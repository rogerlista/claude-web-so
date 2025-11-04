<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = (): void => {
  router.push('/')
}
</script>

<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Página não encontrada</p>
    <button @click="goHome">
      Voltar para o início
    </button>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: 6rem;
  margin: 0;
  color: #e74c3c;
}

p {
  font-size: 1.5rem;
  margin: 1rem 0 2rem;
  color: #666;
}

button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  color: white;
  background-color: #42b983;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #35a372;
}
</style>
