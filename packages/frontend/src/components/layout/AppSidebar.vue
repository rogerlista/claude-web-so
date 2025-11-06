<script setup lang="ts">
/**
 * AppSidebar Component
 *
 * Navigation sidebar with menu items, active state, and responsive behavior.
 * Supports mobile overlay mode and desktop always-visible mode.
 *
 * @example
 * ```vue
 * <AppSidebar
 *   :open="sidebarOpen"
 *   :menu-items="navigationItems"
 *   :current-path="currentRoute"
 *   @navigate="handleNavigate"
 *   @close="closeSidebar"
 * />
 * ```
 */

export interface AppSidebarMenuItem {
  label: string
  path: string
  icon?: string
}

export interface AppSidebarProps {
  /** Whether sidebar is open (mobile) */
  open?: boolean
  /** Menu items to display */
  menuItems?: AppSidebarMenuItem[]
  /** Current active path */
  currentPath?: string
}

withDefaults(defineProps<AppSidebarProps>(), {
  open: false,
  menuItems: () => [],
})

const emit = defineEmits<{
  navigate: [path: string]
  close: []
}>()

const handleNavigate = (path: string) => {
  emit('navigate', path)
  emit('close')
}

const handleOverlayClick = () => {
  emit('close')
}

const handleKeydown = (event: KeyboardEvent, path: string) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleNavigate(path)
  }
}
</script>

<template>
  <div>
    <!-- Overlay (Mobile) -->
    <div
      v-if="open"
      class="app-sidebar__overlay"
      @click="handleOverlayClick"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'app-sidebar',
        {
          'app-sidebar--open': open,
        },
      ]"
    >
      <nav class="app-sidebar__nav" role="navigation" aria-label="Menu principal">
        <ul class="app-sidebar__menu">
          <li
            v-for="item in menuItems"
            :key="item.path"
          >
            <button
              type="button"
              :class="[
                'app-sidebar__menu-item',
                {
                  'app-sidebar__menu-item--active': currentPath === item.path,
                },
              ]"
              @click="handleNavigate(item.path)"
              @keydown="(e) => handleKeydown(e, item.path)"
            >
              <span class="app-sidebar__menu-label">{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>

<style scoped>
/**
 * AppSidebar Styles
 * Using design system tokens
 */

.app-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  background-color: var(--bg-primary);
  border-right: var(--border-width) solid var(--border-primary);
  transform: translateX(-100%);
  transition: transform var(--transition-base);
  z-index: var(--z-sidebar);
  overflow-y: auto;
  padding-top: 64px; /* Height of AppHeader */
}

.app-sidebar--open {
  transform: translateX(0);
}

/* Navigation */
.app-sidebar__nav {
  padding: var(--space-4) 0;
}

.app-sidebar__menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Menu Items */
.app-sidebar__menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);
  border-left: 3px solid transparent;
}

.app-sidebar__menu-item:hover {
  background-color: var(--color-gray-100);
  border-left-color: var(--color-primary-600);
}

.app-sidebar__menu-item:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: -2px;
}

.app-sidebar__menu-item--active {
  background-color: var(--color-primary-50);
  color: var(--color-primary-700);
  border-left-color: var(--color-primary-600);
  font-weight: var(--font-semibold);
}

.app-sidebar__menu-item--active:hover {
  background-color: var(--color-primary-100);
}

.app-sidebar__menu-label {
  flex: 1;
}

/* Overlay */
.app-sidebar__overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: calc(var(--z-sidebar) - 1);
  animation: fade-in var(--transition-base);
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Desktop */
@media (min-width: 768px) {
  .app-sidebar {
    transform: translateX(0);
    position: relative;
    z-index: auto;
    padding-top: 0;
  }

  .app-sidebar__overlay {
    display: none;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .app-sidebar {
    transition: none;
  }

  .app-sidebar__menu-item {
    transition: none;
  }

  .app-sidebar__overlay {
    animation: none;
  }
}
</style>
