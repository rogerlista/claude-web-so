<script setup lang="ts">
/**
 * BaseDataTable Component
 * TDD Phase: GREEN - Implementation to pass tests
 */

import BaseLoading from './BaseLoading.vue'

export interface Column {
  readonly key: string
  readonly label: string
}

type DataRow = Record<string, unknown>

interface Props {
  readonly columns: readonly Column[]
  readonly rows: readonly DataRow[]
  readonly loading?: boolean
  readonly striped?: boolean
  readonly hoverable?: boolean
}

type Emits = (e: 'row-click', row: DataRow) => void

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  striped: false,
  hoverable: true,
})

const emit = defineEmits<Emits>()

const handleRowClick = (row: DataRow): void => {
  emit('row-click', row)
}
</script>

<template>
  <div class="base-data-table">
    <div v-if="loading" data-testid="loading-state" class="loading-container">
      <BaseLoading />
      <p>Carregando...</p>
    </div>

    <div v-else-if="rows.length === 0" data-testid="empty-state" class="empty-state">
      <p>Nenhum registro encontrado</p>
    </div>

    <table
      v-else
      :class="{
        striped: striped,
        hoverable: hoverable,
      }"
    >
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.label }}
          </th>
          <th v-if="$slots.actions" class="actions-header">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="index" @click="handleRowClick(row)">
          <td v-for="column in columns" :key="column.key">
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="actions-cell">
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.base-data-table {
  width: 100%;
  overflow-x: auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  gap: var(--space-4);
}

.loading-container p {
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.empty-state {
  text-align: center;
  padding: var(--space-12);
  color: var(--text-secondary);
}

table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-primary);
}

thead {
  background: var(--bg-secondary);
  border-bottom: 2px solid var(--border-primary);
}

th {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-secondary);
  color: var(--text-primary);
}

tbody tr {
  transition: background-color 0.15s ease;
}

table.striped tbody tr:nth-child(even) {
  background: var(--bg-secondary);
}

table.hoverable tbody tr:hover {
  background: var(--bg-tertiary);
  cursor: pointer;
}

.actions-header {
  text-align: center;
  width: 120px;
}

.actions-cell {
  text-align: center;
  white-space: nowrap;
}

@media (max-width: 768px) {
  th,
  td {
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
  }
}
</style>
