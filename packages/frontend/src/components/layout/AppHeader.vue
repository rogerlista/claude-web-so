<script setup lang="ts">
/**
 * AppHeader Component
 *
 * Main application header with logo, title, menu toggle, and user section.
 * Responsive design with mobile-first approach.
 *
 * @example
 * ```vue
 * <AppHeader
 *   title="POS NFC-e"
 *   :show-menu-toggle="true"
 *   :user="currentUser"
 *   @toggle-menu="handleMenuToggle"
 *   @logout="handleLogout"
 * />
 * ```
 */

export interface AppHeaderUser {
	name: string;
	email: string;
}

export interface AppHeaderProps {
	/** Header title */
	title?: string;
	/** Show menu toggle button for mobile */
	showMenuToggle?: boolean;
	/** Current user information */
	user?: AppHeaderUser;
}

withDefaults(defineProps<AppHeaderProps>(), {
	title: "POS NFC-e",
	showMenuToggle: false,
});

const emit = defineEmits<{
	"toggle-menu": [];
	logout: [];
}>();

const handleMenuToggle = () => {
	emit("toggle-menu");
};

const handleLogout = () => {
	emit("logout");
};
</script>

<template>
  <header class="app-header" role="banner">
    <div class="app-header__container">
      <!-- Menu Toggle (Mobile) -->
      <button
        v-if="showMenuToggle"
        type="button"
        class="app-header__menu-toggle"
        aria-label="Abrir menu"
        @click="handleMenuToggle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          width="24"
          height="24"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <!-- Logo & Title -->
      <div class="app-header__logo">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="32"
          height="32"
        >
          <path
            d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm9 12v2l-4-3 4-3v2h5v2H12z"
          />
        </svg>
        <h1 class="app-header__title">{{ title }}</h1>
      </div>

      <!-- Actions Slot -->
      <div v-if="$slots['actions']" class="app-header__actions">
        <slot name="actions" />
      </div>

      <!-- User Section -->
      <div v-if="user" class="app-header__user">
        <span class="app-header__user-name">{{ user.name }}</span>
        <button
          type="button"
          class="app-header__logout"
          aria-label="Sair"
          @click="handleLogout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="20"
            height="20"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
/**
 * AppHeader Styles
 * Using design system tokens
 */

.app-header {
  background-color: var(--color-primary-600);
  color: var(--text-on-primary);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: var(--z-header);
}

.app-header__container {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  max-width: 1400px;
  margin: 0 auto;
}

/* Menu Toggle */
.app-header__menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
  background: transparent;
  border: none;
  color: var(--text-on-primary);
  cursor: pointer;
  border-radius: var(--radius-base);
  transition: background-color var(--transition-fast);
}

.app-header__menu-toggle:hover {
  background-color: var(--color-primary-700);
}

.app-header__menu-toggle:focus-visible {
  outline: var(--focus-ring-width) solid var(--text-on-primary);
  outline-offset: 2px;
}

/* Logo & Title */
.app-header__logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
}

.app-header__title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  margin: 0;
  color: var(--text-on-primary);
}

/* Actions */
.app-header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* User Section */
.app-header__user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-primary-700);
  border-radius: var(--radius-full);
}

.app-header__user-name {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  display: none;
}

.app-header__logout {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1);
  background: transparent;
  border: none;
  color: var(--text-on-primary);
  cursor: pointer;
  border-radius: var(--radius-base);
  transition: opacity var(--transition-fast);
}

.app-header__logout:hover {
  opacity: 0.8;
}

.app-header__logout:focus-visible {
  outline: var(--focus-ring-width) solid var(--text-on-primary);
  outline-offset: 2px;
}

/* Responsive */
@media (min-width: 640px) {
  .app-header__user-name {
    display: block;
  }

  .app-header__title {
    font-size: var(--text-2xl);
  }
}

@media (min-width: 768px) {
  .app-header__menu-toggle {
    display: none;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .app-header__menu-toggle,
  .app-header__logout {
    transition: none;
  }
}
</style>
