<script setup lang="ts">
/**
 * BaseButton Component
 *
 * A customizable button component with multiple variants and states.
 * Follows design system tokens and accessibility guidelines.
 *
 * @example
 * ```vue
 * <BaseButton variant="primary" @click="handleClick">
 *   Click Me
 * </BaseButton>
 * ```
 */

import { computed } from "vue";

export interface BaseButtonProps {
	/** Button variant style */
	variant?: "primary" | "secondary" | "danger" | "ghost";
	/** Button size */
	size?: "sm" | "md" | "lg";
	/** Button type attribute */
	type?: "button" | "submit" | "reset";
	/** Disabled state */
	disabled?: boolean;
	/** Loading state - shows spinner and disables interaction */
	loading?: boolean;
	/** Makes button full width */
	fullWidth?: boolean;
}

const props = withDefaults(defineProps<BaseButtonProps>(), {
	variant: "primary",
	size: "md",
	type: "button",
	disabled: false,
	loading: false,
	fullWidth: false,
});

const emit = defineEmits<{
	click: [event: MouseEvent];
	focus: [event: FocusEvent];
	blur: [event: FocusEvent];
}>();

const handleClick = (event: MouseEvent) => {
	if (!props.disabled && !props.loading) {
		emit("click", event);
	}
};

const handleFocus = (event: FocusEvent) => {
	emit("focus", event);
};

const handleBlur = (event: FocusEvent) => {
	emit("blur", event);
};

const isDisabled = computed(() => props.disabled || props.loading);
</script>

<template>
  <button
    :type="type"
    :disabled="isDisabled"
    :aria-disabled="isDisabled"
    :aria-busy="loading"
    :class="[
      'base-button',
      `base-button--${variant}`,
      `base-button--${size}`,
      {
        'base-button--disabled': isDisabled,
        'base-button--loading': loading,
        'base-button--full-width': fullWidth,
      },
    ]"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <span v-if="loading" class="base-button__spinner" aria-hidden="true"></span>
    <span v-if="$slots['icon']" class="base-button__icon">
      <slot name="icon" />
    </span>
    <span class="base-button__content">
      <slot />
    </span>
  </button>
</template>

<style scoped>
/**
 * BaseButton Styles
 * Using design system tokens for consistency
 */

.base-button {
  /* Reset */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-weight: var(--font-medium);
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  transition: all var(--transition-fast);

  /* Base styles */
  border-radius: var(--radius-md);
  outline: none;
}

/* Sizes */
.base-button--sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
  line-height: var(--leading-tight);
  min-height: 32px;
}

.base-button--md {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  min-height: 40px;
}

.base-button--lg {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-lg);
  line-height: var(--leading-normal);
  min-height: 48px;
}

/* Variant: Primary */
.base-button--primary {
  background-color: var(--color-primary-600);
  color: var(--text-on-primary);
}

.base-button--primary:hover:not(:disabled) {
  background-color: var(--color-primary-700);
  box-shadow: var(--shadow-md);
}

.base-button--primary:active:not(:disabled) {
  background-color: var(--color-primary-800);
  box-shadow: var(--shadow-sm);
}

.base-button--primary:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* Variant: Secondary */
.base-button--secondary {
  background-color: var(--color-gray-200);
  color: var(--text-primary);
  border: var(--border-width) solid var(--border-primary);
}

.base-button--secondary:hover:not(:disabled) {
  background-color: var(--color-gray-300);
  border-color: var(--border-secondary);
  box-shadow: var(--shadow-sm);
}

.base-button--secondary:active:not(:disabled) {
  background-color: var(--color-gray-400);
}

.base-button--secondary:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* Variant: Danger */
.base-button--danger {
  background-color: var(--color-error-600);
  color: var(--text-on-primary);
}

.base-button--danger:hover:not(:disabled) {
  background-color: var(--color-error-700);
  box-shadow: var(--shadow-md);
}

.base-button--danger:active:not(:disabled) {
  background-color: var(--color-error-800);
  box-shadow: var(--shadow-sm);
}

.base-button--danger:focus-visible {
  outline: var(--focus-ring-width) solid var(--color-error-500);
  outline-offset: var(--focus-ring-offset);
}

/* Variant: Ghost */
.base-button--ghost {
  background-color: transparent;
  color: var(--text-primary);
}

.base-button--ghost:hover:not(:disabled) {
  background-color: var(--color-gray-100);
}

.base-button--ghost:active:not(:disabled) {
  background-color: var(--color-gray-200);
}

.base-button--ghost:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* Disabled State */
.base-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Loading State */
.base-button--loading {
  cursor: wait;
  position: relative;
}

.base-button__spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Full Width */
.base-button--full-width {
  width: 100%;
}

/* Icon */
.base-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Content */
.base-button__content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .base-button {
    transition: none;
  }

  .base-button__spinner {
    animation-duration: 0.01ms;
  }
}
</style>
