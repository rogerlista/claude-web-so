<script setup lang="ts">
/**
 * BaseLoading Component
 *
 * A loading indicator component with multiple variants and sizes.
 * Supports spinner, dots, and pulse animations.
 *
 * @example
 * ```vue
 * <BaseLoading size="lg" text="Loading..." />
 * <BaseLoading fullscreen overlay variant="dots" />
 * ```
 */

export interface BaseLoadingProps {
	/** Loading indicator size */
	size?: "sm" | "md" | "lg" | "xl";
	/** Loading indicator color */
	color?: "primary" | "secondary" | "white";
	/** Loading variant */
	variant?: "spinner" | "dots" | "pulse";
	/** Text to display below indicator */
	text?: string;
	/** Show as fullscreen overlay */
	fullscreen?: boolean;
	/** Add semi-transparent overlay */
	overlay?: boolean;
	/** ARIA label for accessibility */
	ariaLabel?: string;
}

withDefaults(defineProps<BaseLoadingProps>(), {
	size: "md",
	color: "primary",
	variant: "spinner",
	fullscreen: false,
	overlay: false,
	ariaLabel: "Carregando",
});
</script>

<template>
  <div
    :class="[
      'base-loading',
      `base-loading--${size}`,
      `base-loading--${color}`,
      {
        'base-loading--fullscreen': fullscreen,
        'base-loading--overlay': overlay,
      },
    ]"
    role="status"
    aria-live="polite"
    :aria-label="ariaLabel"
  >
    <div class="base-loading__container">
      <!-- Spinner Variant -->
      <div v-if="variant === 'spinner'" class="base-loading__spinner"></div>

      <!-- Dots Variant -->
      <div v-else-if="variant === 'dots'" class="base-loading__dots">
        <span class="base-loading__dot"></span>
        <span class="base-loading__dot"></span>
        <span class="base-loading__dot"></span>
      </div>

      <!-- Pulse Variant -->
      <div v-else-if="variant === 'pulse'" class="base-loading__pulse"></div>

      <!-- Text -->
      <div v-if="$slots['default'] || text" class="base-loading__text">
        <slot>{{ text }}</slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
/**
 * BaseLoading Styles
 * Using design system tokens for consistency
 */

.base-loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Container */
.base-loading__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

/* Fullscreen */
.base-loading--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
}

/* Overlay */
.base-loading--overlay {
  background-color: var(--bg-overlay);
}

/* Sizes */
.base-loading--sm .base-loading__spinner,
.base-loading--sm .base-loading__pulse {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.base-loading--sm .base-loading__dot {
  width: 6px;
  height: 6px;
}

.base-loading--md .base-loading__spinner,
.base-loading--md .base-loading__pulse {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

.base-loading--md .base-loading__dot {
  width: 8px;
  height: 8px;
}

.base-loading--lg .base-loading__spinner,
.base-loading--lg .base-loading__pulse {
  width: 48px;
  height: 48px;
  border-width: 4px;
}

.base-loading--lg .base-loading__dot {
  width: 10px;
  height: 10px;
}

.base-loading--xl .base-loading__spinner,
.base-loading--xl .base-loading__pulse {
  width: 64px;
  height: 64px;
  border-width: 5px;
}

.base-loading--xl .base-loading__dot {
  width: 12px;
  height: 12px;
}

/* Spinner Variant */
.base-loading__spinner {
  border-radius: var(--radius-full);
  border-style: solid;
  border-color: transparent;
  animation: spin 1s linear infinite;
}

.base-loading--primary .base-loading__spinner {
  border-top-color: var(--color-primary-600);
  border-right-color: var(--color-primary-600);
}

.base-loading--secondary .base-loading__spinner {
  border-top-color: var(--color-gray-600);
  border-right-color: var(--color-gray-600);
}

.base-loading--white .base-loading__spinner {
  border-top-color: #ffffff;
  border-right-color: #ffffff;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dots Variant */
.base-loading__dots {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.base-loading__dot {
  border-radius: var(--radius-full);
  animation: pulse 1.4s ease-in-out infinite;
}

.base-loading--primary .base-loading__dot {
  background-color: var(--color-primary-600);
}

.base-loading--secondary .base-loading__dot {
  background-color: var(--color-gray-600);
}

.base-loading--white .base-loading__dot {
  background-color: #ffffff;
}

.base-loading__dot:nth-child(1) {
  animation-delay: 0s;
}

.base-loading__dot:nth-child(2) {
  animation-delay: 0.2s;
}

.base-loading__dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* Pulse Variant */
.base-loading__pulse {
  border-radius: var(--radius-full);
  animation: pulse-ring 1.5s ease-out infinite;
}

.base-loading--primary .base-loading__pulse {
  background-color: var(--color-primary-600);
}

.base-loading--secondary .base-loading__pulse {
  background-color: var(--color-gray-600);
}

.base-loading--white .base-loading__pulse {
  background-color: #ffffff;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* Text */
.base-loading__text {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  text-align: center;
}

.base-loading--primary .base-loading__text {
  color: var(--text-primary);
}

.base-loading--secondary .base-loading__text {
  color: var(--text-secondary);
}

.base-loading--white .base-loading__text {
  color: #ffffff;
}

.base-loading--fullscreen .base-loading__text {
  color: #ffffff;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .base-loading__spinner,
  .base-loading__dot,
  .base-loading__pulse {
    animation-duration: 0.01ms;
  }
}
</style>
