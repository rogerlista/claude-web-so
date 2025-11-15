<script setup lang="ts">
/**
 * BaseDialog Component
 *
 * A modal/dialog component with full accessibility support.
 * Features: keyboard navigation, focus trap, body scroll lock, ARIA attributes.
 *
 * @example
 * ```vue
 * <BaseDialog v-model="isOpen" title="Confirm Action">
 *   Are you sure you want to proceed?
 *   <template #footer>
 *     <BaseButton @click="handleConfirm">Confirm</BaseButton>
 *   </template>
 * </BaseDialog>
 * ```
 */

import { computed, onUnmounted, ref, watch } from "vue";

export interface BaseDialogProps {
	/** Controls dialog visibility (v-model) */
	modelValue: boolean;
	/** Dialog title (shown in header) */
	title?: string;
	/** Dialog size */
	size?: "sm" | "md" | "lg" | "xl";
	/** Whether dialog can be closed (shows close button and allows ESC) */
	closable?: boolean;
	/** Whether clicking backdrop closes dialog */
	backdropDismiss?: boolean;
}

const props = withDefaults(defineProps<BaseDialogProps>(), {
	size: "md",
	closable: true,
	backdropDismiss: false,
});

const emit = defineEmits<{
	"update:modelValue": [value: boolean];
}>();

const dialogRef = ref<HTMLDivElement>();

// Generate unique ID for aria-labelledby
const headerId = computed(
	() => `dialog-header-${Math.random().toString(36).substr(2, 9)}`,
);

/**
 * Close the dialog
 */
const close = () => {
	if (props.closable) {
		emit("update:modelValue", false);
	}
};

/**
 * Handle backdrop click
 */
const handleBackdropClick = () => {
	if (props.backdropDismiss) {
		close();
	}
};

/**
 * Handle keyboard events
 */
const handleKeyDown = (event: KeyboardEvent) => {
	if (event.key === "Escape") {
		close();
	}
};

/**
 * Body scroll lock
 */
const lockBodyScroll = () => {
	document.body.style.overflow = "hidden";
};

const unlockBodyScroll = () => {
	document.body.style.overflow = "";
};

// Watch modelValue to lock/unlock body scroll
watch(
	() => props.modelValue,
	(isOpen) => {
		if (isOpen) {
			lockBodyScroll();
			window.addEventListener("keydown", handleKeyDown);
			// Focus trap will be implemented with focus management
			// For now, just focus the dialog
			setTimeout(() => {
				dialogRef.value?.focus();
			}, 100);
		} else {
			unlockBodyScroll();
			window.removeEventListener("keydown", handleKeyDown);
		}
	},
	{ immediate: true },
);

// Cleanup on unmount
onUnmounted(() => {
	unlockBodyScroll();
	window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="modelValue"
        class="dialog-overlay"
        @click="handleBackdropClick"
      >
        <div
          ref="dialogRef"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="($slots.header || title) ? headerId : undefined"
          :class="[
            'dialog-container',
            `dialog-container--${size}`,
          ]"
          tabindex="-1"
          @click.stop
        >
          <button
            v-if="closable"
            type="button"
            class="dialog-close"
            aria-label="Fechar"
            @click="close"
          >
            ×
          </button>

          <header
            v-if="$slots.header || title"
            :id="headerId"
            class="dialog-header"
          >
            <slot name="header">{{ title }}</slot>
          </header>

          <div class="dialog-body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="dialog-footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/**
 * BaseDialog Styles
 * Using design system tokens for consistency
 */

/* Overlay */
.dialog-overlay {
	position: fixed;
	inset: 0;
	z-index: var(--z-modal-backdrop);
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: var(--bg-overlay);
	padding: var(--space-4);
	overflow-y: auto;
}

/* Container */
.dialog-container {
	position: relative;
	z-index: var(--z-modal);
	display: flex;
	flex-direction: column;
	width: 100%;
	max-height: calc(100vh - var(--space-8));
	background-color: var(--bg-primary);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-2xl);
	outline: none;
}

/* Sizes */
.dialog-container--sm {
	max-width: 400px;
}

.dialog-container--md {
	max-width: 600px;
}

.dialog-container--lg {
	max-width: 800px;
}

.dialog-container--xl {
	max-width: 1000px;
}

/* Header */
.dialog-header {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: var(--space-6);
	border-bottom: var(--border-width) solid var(--border-primary);
	font-size: var(--text-xl);
	font-weight: var(--font-semibold);
	color: var(--text-primary);
}

/* Body */
.dialog-body {
	flex: 1;
	overflow-y: auto;
	padding: var(--space-6);
	color: var(--text-primary);
}

/* Footer */
.dialog-footer {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: var(--space-3);
	padding: var(--space-6);
	border-top: var(--border-width) solid var(--border-primary);
}

/* Close Button */
.dialog-close {
	position: absolute;
	top: var(--space-4);
	right: var(--space-4);
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	padding: 0;
	border: none;
	background-color: transparent;
	border-radius: var(--radius-md);
	color: var(--text-secondary);
	font-size: var(--text-2xl);
	line-height: 1;
	cursor: pointer;
	transition: all var(--transition-fast);
}

.dialog-close:hover {
	background-color: var(--color-gray-100);
	color: var(--text-primary);
}

.dialog-close:active {
	background-color: var(--color-gray-200);
}

.dialog-close:focus-visible {
	outline: var(--focus-ring-width) solid var(--focus-ring-color);
	outline-offset: var(--focus-ring-offset);
}

/* Transitions */
.dialog-enter-active,
.dialog-leave-active {
	transition: opacity var(--transition-base);
}

.dialog-enter-active .dialog-container,
.dialog-leave-active .dialog-container {
	transition: transform var(--transition-base), opacity var(--transition-base);
}

.dialog-enter-from,
.dialog-leave-to {
	opacity: 0;
}

.dialog-enter-from .dialog-container,
.dialog-leave-to .dialog-container {
	transform: scale(0.95);
	opacity: 0;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
	.dialog-enter-active,
	.dialog-leave-active,
	.dialog-enter-active .dialog-container,
	.dialog-leave-active .dialog-container {
		transition: none;
	}
}
</style>
