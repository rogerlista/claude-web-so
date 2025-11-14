<script setup lang="ts">
/**
 * BaseAlert Component
 *
 * A notification/alert component for displaying important messages.
 * Supports different variants (success, warning, error, info) and dismissible state.
 *
 * @example
 * ```vue
 * <BaseAlert
 *   variant="success"
 *   title="Success!"
 *   message="Your changes have been saved."
 *   dismissible
 *   v-model="showAlert"
 * />
 * ```
 */

import { computed, ref, watch } from "vue";

export interface BaseAlertProps {
	/** Alert variant/type */
	variant?: "info" | "success" | "warning" | "error";
	/** Alert title */
	title?: string;
	/** Alert message */
	message?: string;
	/** Show close button */
	dismissible?: boolean;
	/** Control visibility with v-model */
	modelValue?: boolean;
	/** Show icon */
	showIcon?: boolean;
	/** Add border instead of background */
	bordered?: boolean;
	/** ARIA role */
	role?: "alert" | "status";
	/** Close button aria-label */
	closeLabel?: string;
}

const props = withDefaults(defineProps<BaseAlertProps>(), {
	variant: "info",
	dismissible: false,
	modelValue: true,
	showIcon: false,
	bordered: false,
	role: "alert",
	closeLabel: "Fechar alerta",
});

const emit = defineEmits<{
	"update:modelValue": [value: boolean];
	close: [];
}>();

// Internal visibility state
const isVisible = ref(props.modelValue);

// Watch for external modelValue changes
watch(
	() => props.modelValue,
	(newValue) => {
		isVisible.value = newValue;
	},
);

// Compute aria-live based on variant
const ariaLive = computed(() => {
	return props.variant === "error" ? "assertive" : "polite";
});

// Handle close
const handleClose = () => {
	isVisible.value = false;
	emit("update:modelValue", false);
	emit("close");
};
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isVisible"
      :class="[
        'base-alert',
        `base-alert--${variant}`,
        {
          'base-alert--bordered': bordered,
          'base-alert--with-icon': showIcon,
        },
      ]"
      :role="role"
      :aria-live="ariaLive"
    >
      <!-- Icon -->
      <div v-if="showIcon" class="base-alert__icon">
        <slot name="icon">
          <!-- Default icons based on variant -->
          <svg
            v-if="variant === 'success'"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            width="20"
            height="20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else-if="variant === 'error'"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            width="20"
            height="20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else-if="variant === 'warning'"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            width="20"
            height="20"
          >
            <path
              fill-rule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            width="20"
            height="20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
              clip-rule="evenodd"
            />
          </svg>
        </slot>
      </div>

      <!-- Content -->
      <div class="base-alert__content">
        <h4 v-if="title" class="base-alert__title">{{ title }}</h4>
        <div class="base-alert__message">
          <slot>{{ message }}</slot>
        </div>
      </div>

      <!-- Close Button -->
      <button
        v-if="dismissible"
        type="button"
        class="base-alert__close"
        :aria-label="closeLabel"
        @click="handleClose"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          width="20"
          height="20"
        >
          <path
            d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
          />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
/**
 * BaseAlert Styles
 * Using design system tokens for consistency
 */

.base-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  position: relative;
}

/* Variants - Info */
.base-alert--info {
  background-color: var(--color-primary-50);
  color: var(--color-primary-900);
}

.base-alert--info.base-alert--bordered {
  background-color: transparent;
  border: var(--border-width-2) solid var(--color-primary-200);
}

/* Variants - Success */
.base-alert--success {
  background-color: var(--color-success-50);
  color: var(--color-success-900);
}

.base-alert--success.base-alert--bordered {
  background-color: transparent;
  border: var(--border-width-2) solid var(--color-success-200);
}

/* Variants - Warning */
.base-alert--warning {
  background-color: var(--color-warning-50);
  color: var(--color-warning-900);
}

.base-alert--warning.base-alert--bordered {
  background-color: transparent;
  border: var(--border-width-2) solid var(--color-warning-200);
}

/* Variants - Error */
.base-alert--error {
  background-color: var(--color-error-50);
  color: var(--color-error-900);
}

.base-alert--error.base-alert--bordered {
  background-color: transparent;
  border: var(--border-width-2) solid var(--color-error-200);
}

/* Icon */
.base-alert__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.base-alert--info .base-alert__icon {
  color: var(--color-primary-600);
}

.base-alert--success .base-alert__icon {
  color: var(--color-success-600);
}

.base-alert--warning .base-alert__icon {
  color: var(--color-warning-600);
}

.base-alert--error .base-alert__icon {
  color: var(--color-error-600);
}

/* Content */
.base-alert__content {
  flex: 1;
  min-width: 0;
}

.base-alert__title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-1);
}

.base-alert__message {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

/* Close Button */
.base-alert__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1);
  margin: calc(-1 * var(--space-1)) calc(-1 * var(--space-1)) 0 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-base);
  cursor: pointer;
  opacity: 0.6;
  transition: opacity var(--transition-fast);
}

.base-alert__close:hover {
  opacity: 1;
}

.base-alert__close:focus-visible {
  outline: var(--focus-ring-width) solid currentColor;
  outline-offset: 2px;
  opacity: 1;
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }

  .base-alert__close {
    transition: none;
  }
}
</style>
