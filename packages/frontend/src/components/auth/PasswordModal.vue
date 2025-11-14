<template>
	<Teleport to="body">
		<Transition name="modal">
			<div
				v-if="modelValue"
				class="modal-overlay"
				@click="handleBackdropClick"
				@keydown.esc="handleCancel"
			>
				<div
					ref="dialogRef"
					role="dialog"
					aria-modal="true"
					:aria-labelledby="titleId"
					class="modal-dialog"
					@click.stop
				>
					<!-- Header -->
					<div class="modal-header">
						<h2 :id="titleId" class="modal-title">
							{{ title }}
						</h2>
					</div>

					<!-- Body -->
					<div class="modal-body">
						<p v-if="message" class="modal-message">
							{{ message }}
						</p>

						<div class="form-group">
							<label :for="inputId" class="input-label">Senha</label>
							<input
								:id="inputId"
								ref="inputRef"
								v-model="password"
								type="password"
								:class="['password-input', { 'input-error': !!error }]"
								placeholder="Digite sua senha"
								:disabled="loading"
								autofocus
								@keydown.enter="handleConfirm"
							/>
							<p v-if="error" class="error-message">{{ error }}</p>
						</div>
					</div>

					<!-- Footer -->
					<div class="modal-footer">
						<button
							type="button"
							class="btn btn-secondary"
							:disabled="loading"
							@click="handleCancel"
						>
							Cancelar
						</button>
						<button
							type="button"
							class="btn btn-primary"
							:disabled="!password.trim() || loading"
							@click="handleConfirm"
						>
							<span v-if="loading" class="loading">Validando...</span>
							<span v-else>Confirmar</span>
						</button>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from "vue";

export interface PasswordModalProps {
	readonly modelValue: boolean;
	readonly title: string;
	readonly message?: string;
	readonly loading?: boolean;
	readonly error?: string;
}

const props = withDefaults(defineProps<PasswordModalProps>(), {
	message: "",
	loading: false,
	error: "",
});

const emit = defineEmits<{
	"update:modelValue": [value: boolean];
	confirm: [password: string];
	cancel: [];
}>();

// Refs
const password = ref("");
const _dialogRef = ref<HTMLDivElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

// Computed
const _titleId = computed(
	() => `password-modal-title-${Math.random().toString(36).substring(2, 9)}`,
);
const _inputId = computed(
	() => `password-modal-input-${Math.random().toString(36).substring(2, 9)}`,
);

// Methods
const handleCancel = (): void => {
	password.value = "";
	emit("update:modelValue", false);
	emit("cancel");
};

const _handleConfirm = (): void => {
	if (!password.value.trim() || props.loading) {
		return;
	}

	emit("confirm", password.value);
	password.value = "";
	emit("update:modelValue", false);
};

const _handleBackdropClick = (): void => {
	if (!props.loading) {
		handleCancel();
	}
};

// Body scroll lock
watch(
	() => props.modelValue,
	(isOpen) => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
			nextTick(() => {
				inputRef.value?.focus();
			});
		} else {
			document.body.style.overflow = "";
		}
	},
	{ immediate: true },
);

onUnmounted(() => {
	document.body.style.overflow = "";
});
</script>

<style scoped>
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: var(--z-modal, 1000);
	padding: var(--space-4);
}

.modal-dialog {
	background-color: var(--color-background, white);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-xl);
	max-width: 400px;
	width: 100%;
	overflow: hidden;
}

.modal-header {
	padding: var(--space-6);
	border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.modal-title {
	margin: 0;
	font-size: var(--text-xl);
	font-weight: var(--font-semibold);
	color: var(--color-text-primary, #111827);
}

.modal-body {
	padding: var(--space-6);
}

.modal-message {
	margin: 0 0 var(--space-4) 0;
	font-size: var(--text-sm);
	color: var(--color-text-secondary, #6b7280);
}

.form-group {
	display: flex;
	flex-direction: column;
	gap: var(--space-2);
}

.input-label {
	font-size: var(--text-sm);
	font-weight: var(--font-medium);
	color: var(--color-text-primary, #111827);
}

.password-input {
	padding: var(--space-3);
	border: 1px solid var(--border-color, #d1d5db);
	border-radius: var(--radius-md);
	font-size: var(--text-base);
	transition: all var(--transition-fast);
}

.password-input:focus {
	outline: none;
	border-color: var(--color-primary-500);
	box-shadow: 0 0 0 3px var(--color-primary-100);
}

.password-input:disabled {
	background-color: var(--color-gray-50);
	cursor: not-allowed;
}

.password-input.input-error {
	border-color: var(--color-error-500);
}

.password-input.input-error:focus {
	box-shadow: 0 0 0 3px var(--color-error-100);
}

.error-message {
	margin: 0;
	font-size: var(--text-sm);
	color: var(--color-error-600);
}

.modal-footer {
	padding: var(--space-6);
	border-top: 1px solid var(--border-color, #e5e7eb);
	display: flex;
	justify-content: flex-end;
	gap: var(--space-3);
}

.btn {
	padding: var(--space-2) var(--space-4);
	border: none;
	border-radius: var(--radius-md);
	font-size: var(--text-sm);
	font-weight: var(--font-medium);
	cursor: pointer;
	transition: all var(--transition-fast);
}

.btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.btn-secondary {
	background-color: var(--color-gray-100);
	color: var(--color-gray-700);
}

.btn-secondary:hover:not(:disabled) {
	background-color: var(--color-gray-200);
}

.btn-primary {
	background-color: var(--color-primary-600);
	color: white;
}

.btn-primary:hover:not(:disabled) {
	background-color: var(--color-primary-700);
}

.loading {
	display: inline-block;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
	transition: opacity var(--transition-normal);
}

.modal-enter-from,
.modal-leave-to {
	opacity: 0;
}

.modal-enter-active .modal-dialog,
.modal-leave-active .modal-dialog {
	transition: transform var(--transition-normal);
}

.modal-enter-from .modal-dialog,
.modal-leave-to .modal-dialog {
	transform: scale(0.95);
}
</style>
