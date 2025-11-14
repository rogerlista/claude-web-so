<script setup lang="ts">
/**
 * BaseSelect Component
 *
 * A custom select/dropdown component with full keyboard navigation and accessibility.
 * Features: search/filter, keyboard navigation, loading state, clear button, ARIA support.
 *
 * @example
 * ```vue
 * <BaseSelect
 *   v-model="selectedValue"
 *   :options="options"
 *   placeholder="Select an option"
 *   searchable
 * />
 * ```
 */

import { computed, onMounted, onUnmounted, ref, watch } from "vue";

export interface SelectOption {
	label: string;
	value: string | number;
	disabled?: boolean;
}

export interface BaseSelectProps {
	/** Current selected value (v-model) */
	modelValue?: string | number | null;
	/** Array of options */
	options: SelectOption[];
	/** Placeholder text */
	placeholder?: string;
	/** Enable search/filter functionality */
	searchable?: boolean;
	/** Allow clearing selection */
	allowClear?: boolean;
	/** Disabled state */
	disabled?: boolean;
	/** Error state */
	error?: boolean;
	/** Loading state */
	loading?: boolean;
	/** Empty state message */
	emptyMessage?: string;
}

const props = withDefaults(defineProps<BaseSelectProps>(), {
	modelValue: null,
	placeholder: "Select...",
	searchable: false,
	allowClear: false,
	disabled: false,
	error: false,
	loading: false,
	emptyMessage: "No options found",
});

const emit = defineEmits<{
	"update:modelValue": [value: string | number | null];
	change: [value: string | number | null];
}>();

const isOpen = ref(false);
const searchQuery = ref("");
const highlightedIndex = ref(-1);
const triggerRef = ref<HTMLDivElement>();
const dropdownRef = ref<HTMLDivElement>();

/**
 * Filtered options based on search query
 */
const filteredOptions = computed(() => {
	if (!searchQuery.value) return props.options;

	const query = searchQuery.value.toLowerCase();
	return props.options.filter((option) =>
		option.label.toLowerCase().includes(query),
	);
});

/**
 * Selected option object
 */
const selectedOption = computed(() => {
	return props.options.find((option) => option.value === props.modelValue);
});

/**
 * Display text (selected label or placeholder)
 */
const _displayText = computed(() => {
	return selectedOption.value?.label || props.placeholder;
});

/**
 * Can the select be interacted with?
 */
const canInteract = computed(() => !props.disabled && !props.loading);

/**
 * Generate unique ID for ARIA
 */
const _selectId = computed(
	() => `select-${Math.random().toString(36).substr(2, 9)}`,
);

/**
 * Toggle dropdown open/close
 */
const _toggle = () => {
	if (!canInteract.value) return;
	isOpen.value = !isOpen.value;
};

/**
 * Open dropdown
 */
const open = () => {
	if (!canInteract.value) return;
	isOpen.value = true;
	highlightedIndex.value = props.modelValue
		? filteredOptions.value.findIndex((opt) => opt.value === props.modelValue)
		: 0;
};

/**
 * Close dropdown
 */
const close = () => {
	isOpen.value = false;
	searchQuery.value = "";
	highlightedIndex.value = -1;
};

/**
 * Select an option
 */
const selectOption = (option: SelectOption) => {
	if (option.disabled) return;
	emit("update:modelValue", option.value);
	emit("change", option.value);
	close();
};

/**
 * Clear selection
 */
const _clear = (event: Event) => {
	event.stopPropagation();
	emit("update:modelValue", null);
	emit("change", null);
};

/**
 * Handle keyboard navigation
 */
const _handleKeyDown = (event: KeyboardEvent) => {
	if (!canInteract.value) return;

	switch (event.key) {
		case "Enter":
			if (isOpen.value) {
				event.preventDefault();
				if (
					highlightedIndex.value >= 0 &&
					highlightedIndex.value < filteredOptions.value.length
				) {
					const option = filteredOptions.value[highlightedIndex.value];
					selectOption(option);
				}
			} else {
				open();
			}
			break;

		case "Escape":
			if (isOpen.value) {
				event.preventDefault();
				close();
			}
			break;

		case "ArrowDown":
			event.preventDefault();
			if (!isOpen.value) {
				open();
			} else {
				highlightedIndex.value = Math.min(
					highlightedIndex.value + 1,
					filteredOptions.value.length - 1,
				);
			}
			break;

		case "ArrowUp":
			event.preventDefault();
			if (isOpen.value) {
				highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
			}
			break;

		case "Home":
			if (isOpen.value) {
				event.preventDefault();
				highlightedIndex.value = 0;
			}
			break;

		case "End":
			if (isOpen.value) {
				event.preventDefault();
				highlightedIndex.value = filteredOptions.value.length - 1;
			}
			break;
	}
};

/**
 * Handle click outside
 */
const handleClickOutside = (event: MouseEvent) => {
	const target = event.target as Node;
	if (
		triggerRef.value &&
		!triggerRef.value.contains(target) &&
		dropdownRef.value &&
		!dropdownRef.value.contains(target)
	) {
		close();
	}
};

// Setup click outside listener
onMounted(() => {
	document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
	document.removeEventListener("click", handleClickOutside);
});

// Watch for open state to reset search
watch(isOpen, (newValue) => {
	if (!newValue) {
		searchQuery.value = "";
	}
});
</script>

<template>
  <div class="base-select">
    <div
      ref="triggerRef"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-controls="selectId"
      :aria-disabled="disabled"
      :class="[
        'select-trigger',
        {
          'select-trigger--disabled': disabled,
          'select-trigger--error': error,
          'select-trigger--open': isOpen,
        },
      ]"
      tabindex="0"
      @click="toggle"
      @keydown="handleKeyDown"
    >
      <span class="select-value">{{ displayText }}</span>

      <div class="select-actions">
        <button
          v-if="allowClear && modelValue && canInteract"
          type="button"
          class="select-clear"
          aria-label="Clear selection"
          @click="clear"
        >
          ×
        </button>

        <span v-if="loading" class="select-loading" aria-label="Loading">
          ⟳
        </span>

        <span v-else class="select-arrow" :class="{ 'select-arrow--open': isOpen }">
          ▼
        </span>
      </div>
    </div>

    <div
      v-if="isOpen"
      ref="dropdownRef"
      :id="selectId"
      role="listbox"
      class="select-dropdown"
    >
      <input
        v-if="searchable"
        v-model="searchQuery"
        type="text"
        class="select-search"
        placeholder="Search..."
        @click.stop
      />

      <div v-if="filteredOptions.length > 0" class="select-options">
        <div
          v-for="(option, index) in filteredOptions"
          :key="option.value"
          role="option"
          :aria-selected="option.value === modelValue"
          :aria-disabled="option.disabled"
          :class="[
            'select-option',
            {
              'select-option--selected': option.value === modelValue,
              'select-option--disabled': option.disabled,
              'select-option--highlighted': index === highlightedIndex,
            },
          ]"
          @click="selectOption(option)"
          @mouseenter="highlightedIndex = index"
        >
          {{ option.label }}
        </div>
      </div>

      <div v-else class="select-empty">
        {{ emptyMessage }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/**
 * BaseSelect Styles
 * Using design system tokens for consistency
 */

.base-select {
	position: relative;
	width: 100%;
}

/* Trigger */
.select-trigger {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	min-height: 40px;
	padding: var(--space-2) var(--space-4);
	background-color: var(--bg-primary);
	border: var(--border-width) solid var(--border-primary);
	border-radius: var(--radius-md);
	font-size: var(--text-base);
	color: var(--text-primary);
	cursor: pointer;
	transition: all var(--transition-fast);
	outline: none;
}

.select-trigger:hover:not(.select-trigger--disabled) {
	border-color: var(--border-secondary);
}

.select-trigger:focus-visible {
	border-color: var(--focus-ring-color);
	box-shadow: 0 0 0 3px var(--color-primary-100);
}

.select-trigger--open {
	border-color: var(--focus-ring-color);
}

.select-trigger--disabled {
	background-color: var(--color-gray-100);
	color: var(--text-disabled);
	cursor: not-allowed;
	opacity: 0.6;
}

.select-trigger--error {
	border-color: var(--border-error);
}

.select-trigger--error:focus-visible {
	box-shadow: 0 0 0 3px var(--color-error-100);
}

/* Value */
.select-value {
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* Actions */
.select-actions {
	display: flex;
	align-items: center;
	gap: var(--space-2);
	margin-left: var(--space-2);
}

/* Clear Button */
.select-clear {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	padding: 0;
	background: transparent;
	border: none;
	border-radius: var(--radius-sm);
	color: var(--text-secondary);
	font-size: var(--text-lg);
	cursor: pointer;
	transition: all var(--transition-fast);
}

.select-clear:hover {
	background-color: var(--color-gray-200);
	color: var(--text-primary);
}

/* Loading */
.select-loading {
	display: inline-block;
	font-size: var(--text-lg);
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

/* Arrow */
.select-arrow {
	display: inline-block;
	font-size: 10px;
	color: var(--text-secondary);
	transition: transform var(--transition-fast);
}

.select-arrow--open {
	transform: rotate(180deg);
}

/* Dropdown */
.select-dropdown {
	position: absolute;
	top: calc(100% + 4px);
	left: 0;
	right: 0;
	z-index: var(--z-dropdown);
	max-height: 300px;
	overflow-y: auto;
	background-color: var(--bg-primary);
	border: var(--border-width) solid var(--border-primary);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-lg);
}

/* Search */
.select-search {
	width: 100%;
	padding: var(--space-2) var(--space-4);
	border: none;
	border-bottom: var(--border-width) solid var(--border-primary);
	font-size: var(--text-base);
	outline: none;
}

.select-search:focus {
	border-bottom-color: var(--focus-ring-color);
}

/* Options */
.select-options {
	padding: var(--space-1) 0;
}

.select-option {
	padding: var(--space-2) var(--space-4);
	font-size: var(--text-base);
	color: var(--text-primary);
	cursor: pointer;
	transition: all var(--transition-fast);
}

.select-option:hover:not(.select-option--disabled) {
	background-color: var(--color-gray-100);
}

.select-option--highlighted:not(.select-option--disabled) {
	background-color: var(--color-gray-100);
}

.select-option--selected {
	background-color: var(--color-primary-50);
	color: var(--color-primary-700);
	font-weight: var(--font-medium);
}

.select-option--disabled {
	color: var(--text-disabled);
	cursor: not-allowed;
	opacity: 0.5;
}

/* Empty State */
.select-empty {
	padding: var(--space-4);
	text-align: center;
	color: var(--text-secondary);
	font-size: var(--text-sm);
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
	.select-trigger,
	.select-arrow,
	.select-option,
	.select-loading {
		transition: none;
		animation: none;
	}
}
</style>
