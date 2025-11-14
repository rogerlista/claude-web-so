<template>
	<Transition name="toast">
		<div
			v-if="visible"
			:class="['toast', `toast--${variant}`]"
			role="alert"
		>
			<span class="toast__icon">{{ icon }}</span>
			<p class="toast__message">{{ message }}</p>
			<button
				v-if="dismissible"
				type="button"
				class="toast__close"
				aria-label="Fechar notificação"
				@click="close"
			>
				✕
			</button>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

interface Props {
	message: string;
	variant?: "success" | "error" | "warning" | "info";
	duration?: number;
	dismissible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	variant: "info",
	duration: 3000,
	dismissible: true,
});

const emit = defineEmits<{
	close: [];
}>();

const visible = ref(true);

const _icon = computed(() => {
	switch (props.variant) {
		case "success":
			return "✓";
		case "error":
			return "✕";
		case "warning":
			return "⚠";
		case "info":
			return "ℹ";
		default:
			return "ℹ";
	}
});

const close = (): void => {
	visible.value = false;
	emit("close");
};

onMounted(() => {
	if (props.duration > 0) {
		setTimeout(close, props.duration);
	}
});
</script>

<style scoped>
.toast {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	min-width: 300px;
	max-width: 500px;
	padding: 1rem;
	border-radius: 0.5rem;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	font-size: 0.875rem;
	background-color: white;
	border-left: 4px solid currentColor;
}

.toast--success {
	color: #10b981;
	background-color: #f0fdf4;
}

.toast--error {
	color: #ef4444;
	background-color: #fef2f2;
}

.toast--warning {
	color: #f59e0b;
	background-color: #fffbeb;
}

.toast--info {
	color: #3b82f6;
	background-color: #eff6ff;
}

.toast__icon {
	font-size: 1.25rem;
	flex-shrink: 0;
}

.toast__message {
	flex: 1;
	margin: 0;
	color: #1f2937;
}

.toast__close {
	flex-shrink: 0;
	background: none;
	border: none;
	font-size: 1.25rem;
	cursor: pointer;
	color: #6b7280;
	padding: 0.25rem;
	line-height: 1;
	transition: color 0.2s;
}

.toast__close:hover {
	color: #1f2937;
}

/* Transition animations */
.toast-enter-active,
.toast-leave-active {
	transition: all 0.3s ease;
}

.toast-enter-from {
	opacity: 0;
	transform: translateY(-1rem);
}

.toast-leave-to {
	opacity: 0;
	transform: translateX(1rem);
}
</style>
