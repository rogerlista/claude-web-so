<script setup lang="ts">
/**
 * BaseCard Component
 *
 * A versatile card container component for grouping related content.
 * Supports header, footer, elevation, and clickable states.
 *
 * @example
 * ```vue
 * <BaseCard title="Product" subtitle="Details">
 *   <p>Product information</p>
 *   <template #footer>
 *     <BaseButton>View Details</BaseButton>
 *   </template>
 * </BaseCard>
 * ```
 */

export interface BaseCardProps {
	/** Card title (alternative to header slot) */
	title?: string;
	/** Card subtitle */
	subtitle?: string;
	/** Remove default padding */
	noPadding?: boolean;
	/** Shadow elevation level */
	elevation?: "none" | "sm" | "md" | "lg";
	/** Make card clickable (adds hover effects) */
	clickable?: boolean;
	/** Add border instead of shadow */
	bordered?: boolean;
}

const props = withDefaults(defineProps<BaseCardProps>(), {
	noPadding: false,
	elevation: "sm",
	clickable: false,
	bordered: false,
});

const emit = defineEmits<{
	click: [event: MouseEvent | KeyboardEvent];
}>();

const handleClick = (event: MouseEvent) => {
	if (props.clickable) {
		emit("click", event);
	}
};

const handleKeydown = (event: KeyboardEvent) => {
	if (props.clickable && (event.key === "Enter" || event.key === " ")) {
		event.preventDefault();
		emit("click", event);
	}
};
</script>

<template>
  <div
    :class="[
      'base-card',
      `base-card--elevation-${elevation}`,
      {
        'base-card--no-padding': noPadding,
        'base-card--clickable': clickable,
        'base-card--bordered': bordered,
      },
    ]"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- Header Slot or Title/Subtitle -->
    <div v-if="$slots['header'] || title || subtitle" class="base-card__header">
      <slot name="header">
        <h3 v-if="title" class="base-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="base-card__subtitle">{{ subtitle }}</p>
      </slot>
    </div>

    <!-- Main Content -->
    <div class="base-card__content">
      <slot />
    </div>

    <!-- Footer Slot -->
    <div v-if="$slots['footer']" class="base-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
/**
 * BaseCard Styles
 * Using design system tokens for consistency
 */

.base-card {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);
}

/* Elevation Variants */
.base-card--elevation-none {
  box-shadow: none;
}

.base-card--elevation-sm {
  box-shadow: var(--shadow-sm);
}

.base-card--elevation-md {
  box-shadow: var(--shadow-md);
}

.base-card--elevation-lg {
  box-shadow: var(--shadow-lg);
}

/* Bordered Variant */
.base-card--bordered {
  border: var(--border-width) solid var(--border-primary);
  box-shadow: none;
}

/* Header */
.base-card__header {
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-bottom: var(--border-width) solid var(--border-primary);
}

.base-card--no-padding .base-card__header {
  padding: 0;
  border-bottom: none;
}

.base-card__title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.base-card__subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: var(--space-1) 0 0;
}

/* Content */
.base-card__content {
  padding: var(--space-4);
  flex: 1;
}

.base-card--no-padding .base-card__content {
  padding: 0;
}

/* Footer */
.base-card__footer {
  padding: var(--space-3) var(--space-4) var(--space-4);
  border-top: var(--border-width) solid var(--border-primary);
}

.base-card--no-padding .base-card__footer {
  padding: 0;
  border-top: none;
}

/* Clickable State */
.base-card--clickable {
  cursor: pointer;
  user-select: none;
}

.base-card--clickable:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.base-card--clickable.base-card--bordered:hover {
  border-color: var(--border-secondary);
  box-shadow: var(--shadow-sm);
}

.base-card--clickable:active {
  transform: translateY(0);
}

.base-card--clickable:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* Remove elevation increase on hover for cards with no elevation */
.base-card--clickable.base-card--elevation-none:hover {
  box-shadow: var(--shadow-sm);
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .base-card {
    transition: none;
  }

  .base-card--clickable:hover {
    transform: none;
  }
}
</style>
