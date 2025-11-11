<script setup lang="ts">
/**
 * Home/Dashboard View
 */
import BaseCard from '../components/base/BaseCard.vue'
</script>

<template>
  <div class="home-view">
    <h1>Dashboard</h1>
    <p class="subtitle">Sistema POS com NFC-e</p>

    <div class="features-grid">
      <BaseCard title="Produtos" elevation="md">
        <p>Gerencie seu catálogo de produtos</p>
        <router-link to="/products" class="card-link">
          Ver produtos →
        </router-link>
      </BaseCard>

      <BaseCard title="PDV" elevation="md">
        <p>Ponto de venda</p>
        <span class="card-link disabled">Em breve</span>
      </BaseCard>

      <BaseCard title="Caixa" elevation="md">
        <p>Controle de caixa</p>
        <span class="card-link disabled">Em breve</span>
      </BaseCard>

      <BaseCard title="NFC-e" elevation="md">
        <p>Notas fiscais</p>
        <span class="card-link disabled">Em breve</span>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6);
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
}

.card-link {
  display: inline-block;
  margin-top: var(--space-4);
  color: var(--primary-600);
  text-decoration: none;
  font-weight: var(--font-medium);
}

.card-link:hover:not(.disabled) {
  color: var(--primary-700);
  text-decoration: underline;
}

.card-link.disabled {
  color: var(--text-disabled);
  cursor: not-allowed;
}
</style>
