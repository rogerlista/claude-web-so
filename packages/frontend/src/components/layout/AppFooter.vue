<script setup lang="ts">
/**
 * AppFooter Component
 *
 * Application footer with copyright, version, and optional links.
 * Responsive design with mobile-first approach.
 *
 * @example
 * ```vue
 * <AppFooter
 *   company-name="My Company"
 *   version="1.0.0"
 * >
 *   <template #links>
 *     <a href="/privacy">Privacy Policy</a>
 *     <a href="/terms">Terms of Service</a>
 *   </template>
 * </AppFooter>
 * ```
 */

import { computed } from "vue";

export interface AppFooterProps {
	/** Company name for copyright */
	companyName?: string;
	/** Application version */
	version?: string;
}

withDefaults(defineProps<AppFooterProps>(), {
	companyName: "POS NFC-e",
});

// Current year for copyright
const currentYear = computed(() => new Date().getFullYear());
</script>

<template>
  <footer class="app-footer" role="contentinfo">
    <div class="app-footer__container">
      <!-- Links Slot -->
      <div v-if="$slots['links']" class="app-footer__links">
        <slot name="links" />
      </div>

      <!-- Copyright -->
      <div class="app-footer__copyright">
        © {{ currentYear }} {{ companyName }}. Todos os direitos reservados.
      </div>

      <!-- Version -->
      <div v-if="version" class="app-footer__version">
        Versão {{ version }}
      </div>
    </div>
  </footer>
</template>

<style scoped>
/**
 * AppFooter Styles
 * Using design system tokens
 */

.app-footer {
  background-color: var(--bg-secondary);
  border-top: var(--border-width) solid var(--border-primary);
  padding: var(--space-6) var(--space-4);
  margin-top: auto;
}

.app-footer__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  max-width: 1400px;
  margin: 0 auto;
}

/* Links */
.app-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  justify-content: center;
}

.app-footer__links :deep(a) {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  transition: color var(--transition-fast);
}

.app-footer__links :deep(a:hover) {
  color: var(--color-primary-600);
  text-decoration: underline;
}

.app-footer__links :deep(a:focus-visible) {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Copyright */
.app-footer__copyright {
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  text-align: center;
}

/* Version */
.app-footer__version {
  color: var(--text-tertiary);
  font-size: var(--text-xs);
  text-align: center;
}

/* Responsive */
@media (min-width: 768px) {
  .app-footer__container {
    flex-direction: row;
    justify-content: space-between;
  }

  .app-footer__links {
    order: 1;
  }

  .app-footer__copyright {
    order: 2;
  }

  .app-footer__version {
    order: 3;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .app-footer__links :deep(a) {
    transition: none;
  }
}
</style>
