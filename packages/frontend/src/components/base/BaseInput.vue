<script setup lang="ts">
/**
 * BaseInput Component
 *
 * A customizable text input component with label, validation, and error handling.
 * Follows design system tokens and accessibility guidelines (WCAG AA).
 *
 * @example
 * ```vue
 * <BaseInput
 *   v-model="username"
 *   label="Username"
 *   placeholder="Enter your username"
 *   required
 * />
 * ```
 */

import { computed } from 'vue'

export interface BaseInputProps {
  /** Input value (v-model) */
  modelValue?: string | number | undefined
  /** Input label text */
  label?: string
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  /** Placeholder text */
  placeholder?: string
  /** Disabled state */
  disabled?: boolean
  /** Readonly state */
  readonly?: boolean
  /** Required field */
  required?: boolean
  /** Error message */
  error?: string | undefined
  /** Helper text (shown below input when no error) */
  helperText?: string
  /** Maximum character length */
  maxLength?: number
  /** Input ID (auto-generated if not provided) */
  id?: string
  /** Input name attribute */
  name?: string
  /** Step value for number inputs */
  step?: string
  /** Minimum value for number inputs */
  min?: string
  /** ARIA label for accessibility */
  ariaLabel?: string
}

const props = withDefaults(defineProps<BaseInputProps>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  input: [event: Event]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  keydown: [event: KeyboardEvent]
  keyup: [event: KeyboardEvent]
}>()

// Generate unique ID if not provided
const inputId = computed(
  () => props.id || `base-input-${Math.random().toString(36).substring(2, 9)}`
)

// Compute helper/error ID for aria-describedby
const describedById = computed(() => {
  if (props.error) {
    return `${inputId.value}-error`
  }
  if (props.helperText) {
    return `${inputId.value}-helper`
  }
  return undefined
})

// Character count for maxLength
const characterCount = computed(() => {
  const value = String(props.modelValue || '')
  return value.length
})

// Event handlers
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
  emit('input', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

const handleKeyup = (event: KeyboardEvent) => {
  emit('keyup', event)
}
</script>

<template>
  <div class="base-input">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__label-required" aria-hidden="true">*</span>
    </label>

    <!-- Input Field -->
    <input
      :id="inputId"
      :name="name"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :maxlength="maxLength"
      :step="step"
      :min="min"
      :aria-label="ariaLabel"
      :aria-required="required"
      :aria-invalid="!!error"
      :aria-describedby="describedById"
      :class="[
        'base-input__field',
        {
          'base-input__field--error': !!error,
          'base-input__field--disabled': disabled,
        },
      ]"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      @keyup="handleKeyup"
    />

    <!-- Error Message -->
    <div v-if="error" :id="`${inputId}-error`" class="base-input__error" role="alert">
      {{ error }}
    </div>

    <!-- Helper Text -->
    <div v-else-if="helperText" :id="`${inputId}-helper`" class="base-input__helper">
      {{ helperText }}
    </div>

    <!-- Character Counter -->
    <div v-if="maxLength && !error" class="base-input__counter" aria-live="polite">
      {{ characterCount }} / {{ maxLength }}
    </div>
  </div>
</template>

<style scoped>
/**
 * BaseInput Styles
 * Using design system tokens for consistency
 */

.base-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}

/* Label */
.base-input__label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.base-input__label-required {
  color: var(--color-error-600);
  margin-left: var(--space-1);
}

/* Input Field */
.base-input__field {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-base);
  font-family: var(--font-sans);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border: var(--border-width) solid var(--border-primary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  outline: none;
}

.base-input__field::placeholder {
  color: var(--text-tertiary);
}

/* Input States */
.base-input__field:hover:not(:disabled):not(:focus) {
  border-color: var(--border-secondary);
}

.base-input__field:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.base-input__field:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* Disabled State */
.base-input__field--disabled {
  background-color: var(--bg-secondary);
  color: var(--text-disabled);
  cursor: not-allowed;
  opacity: 0.6;
}

.base-input__field--disabled::placeholder {
  color: var(--text-disabled);
}

/* Error State */
.base-input__field--error {
  border-color: var(--border-error);
}

.base-input__field--error:focus {
  border-color: var(--border-error);
  box-shadow: 0 0 0 3px var(--color-error-100);
}

/* Error Message */
.base-input__error {
  font-size: var(--text-sm);
  color: var(--color-error-600);
  margin-top: calc(-1 * var(--space-1));
}

/* Helper Text */
.base-input__helper {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: calc(-1 * var(--space-1));
}

/* Character Counter */
.base-input__counter {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-align: right;
  margin-top: calc(-1 * var(--space-1));
}

/* Readonly State */
.base-input__field:read-only {
  background-color: var(--bg-secondary);
  cursor: default;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .base-input__field {
    transition: none;
  }
}
</style>
