import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import BaseSelect from "./BaseSelect.vue";

interface SelectOption {
	label: string;
	value: string | number;
	disabled?: boolean;
}

describe("BaseSelect", () => {
	const defaultOptions: SelectOption[] = [
		{ label: "Option 1", value: "1" },
		{ label: "Option 2", value: "2" },
		{ label: "Option 3", value: "3" },
		{ label: "Disabled Option", value: "4", disabled: true },
	];

	describe("Rendering", () => {
		it("should render select component", () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
				},
			});
			expect(wrapper.exists()).toBe(true);
		});

		it("should render placeholder", () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
					placeholder: "Select an option",
				},
			});
			expect(wrapper.text()).toContain("Select an option");
		});

		it("should render selected option label", () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
					modelValue: "2",
				},
			});
			expect(wrapper.text()).toContain("Option 2");
		});

		it("should not render dropdown initially", () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
				},
			});
			expect(wrapper.find(".select-dropdown").exists()).toBe(false);
		});
	});

	describe("Dropdown Behavior", () => {
		it("should open dropdown when clicked", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
				},
			});
			await wrapper.find(".select-trigger").trigger("click");
			expect(wrapper.find(".select-dropdown").exists()).toBe(true);
		});

		it("should close dropdown when clicking outside", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
				},
				attachTo: document.body,
			});
			await wrapper.find(".select-trigger").trigger("click");
			expect(wrapper.find(".select-dropdown").exists()).toBe(true);

			// Simulate click outside
			document.body.click();
			await wrapper.vm.$nextTick();
			expect(wrapper.find(".select-dropdown").exists()).toBe(false);
		});

		it("should close dropdown when option is selected", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
				},
			});
			await wrapper.find(".select-trigger").trigger("click");
			await wrapper.findAll(".select-option")[0]?.trigger("click");
			await wrapper.vm.$nextTick();
			expect(wrapper.find(".select-dropdown").exists()).toBe(false);
		});
	});

	describe("Selection", () => {
		it("should emit update:modelValue when option is selected", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
				},
			});
			await wrapper.find(".select-trigger").trigger("click");
			await wrapper.findAll(".select-option")[1]?.trigger("click");
			expect(wrapper.emitted("update:modelValue")).toBeTruthy();
			expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["2"]);
		});

		it("should not select disabled option", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
				},
			});
			await wrapper.find(".select-trigger").trigger("click");
			const disabledOption = wrapper.findAll(".select-option")[3];
			if (disabledOption) {
				await disabledOption.trigger("click");
			}
			expect(wrapper.emitted("update:modelValue")).toBeUndefined();
		});

		it("should mark selected option with aria-selected", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
					modelValue: "2",
				},
			});
			await wrapper.find(".select-trigger").trigger("click");
			const selectedOption = wrapper.findAll(".select-option")[1];
			if (selectedOption) {
				expect(selectedOption.attributes("aria-selected")).toBe("true");
			}
		});
	});

	describe("Search/Filter", () => {
		it("should filter options based on search input", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
					searchable: true,
				},
			});
			await wrapper.find(".select-trigger").trigger("click");
			const searchInput = wrapper.find(".select-search");
			await searchInput.setValue("Option 2");
			const visibleOptions = wrapper.findAll(".select-option");
			expect(visibleOptions).toHaveLength(1);
			expect(visibleOptions[0]?.text()).toContain("Option 2");
		});

		it("should show empty state when no options match search", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
					searchable: true,
				},
			});
			await wrapper.find(".select-trigger").trigger("click");
			const searchInput = wrapper.find(".select-search");
			if (searchInput.exists()) {
				await searchInput.setValue("Nonexistent");
			}
			expect(wrapper.find(".select-empty").exists()).toBe(true);
		});

		it("should not show search input when searchable is false", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
					searchable: false,
				},
			});
			await wrapper.find(".select-trigger").trigger("click");
			expect(wrapper.find(".select-search").exists()).toBe(false);
		});
	});

	describe("Keyboard Navigation", () => {
		it("should open dropdown with Enter key", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
				},
			});
			await wrapper
				.find(".select-trigger")
				.trigger("keydown", { key: "Enter" });
			expect(wrapper.find(".select-dropdown").exists()).toBe(true);
		});

		it("should close dropdown with Escape key", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
				},
			});
			const trigger = wrapper.find(".select-trigger");
			await trigger.trigger("click");
			await trigger.trigger("keydown", { key: "Escape" });
			await wrapper.vm.$nextTick();
			expect(wrapper.find(".select-dropdown").exists()).toBe(false);
		});

		it("should navigate options with ArrowDown", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
				},
			});
			const trigger = wrapper.find(".select-trigger");
			await trigger.trigger("click");
			await trigger.trigger("keydown", { key: "ArrowDown" });
			await trigger.trigger("keydown", { key: "Enter" });
			expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["1"]);
		});

		it("should navigate options with ArrowUp", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
					modelValue: "2",
				},
			});
			const trigger = wrapper.find(".select-trigger");
			await trigger.trigger("click");
			await trigger.trigger("keydown", { key: "ArrowUp" });
			await trigger.trigger("keydown", { key: "Enter" });
			expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["1"]);
		});
	});

	describe("Clear Button", () => {
		it("should show clear button when allowClear is true and has value", () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
					modelValue: "2",
					allowClear: true,
				},
			});
			expect(wrapper.find(".select-clear").exists()).toBe(true);
		});

		it("should not show clear button when no value selected", () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
					allowClear: true,
				},
			});
			expect(wrapper.find(".select-clear").exists()).toBe(false);
		});

		it("should clear value when clear button is clicked", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
					modelValue: "2",
					allowClear: true,
				},
			});
			await wrapper.find(".select-clear").trigger("click");
			expect(wrapper.emitted("update:modelValue")).toBeTruthy();
			expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([null]);
		});
	});

	describe("Disabled State", () => {
		it("should not open dropdown when disabled", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
					disabled: true,
				},
			});
			await wrapper.find(".select-trigger").trigger("click");
			expect(wrapper.find(".select-dropdown").exists()).toBe(false);
		});

		it("should have disabled class when disabled", () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
					disabled: true,
				},
			});
			expect(wrapper.find(".select-trigger").classes()).toContain(
				"select-trigger--disabled",
			);
		});
	});

	describe("Error State", () => {
		it("should have error class when error prop is true", () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
					error: true,
				},
			});
			expect(wrapper.find(".select-trigger").classes()).toContain(
				"select-trigger--error",
			);
		});
	});

	describe("Loading State", () => {
		it("should show loading indicator when loading", () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
					loading: true,
				},
			});
			expect(wrapper.find(".select-loading").exists()).toBe(true);
		});

		it("should not open dropdown when loading", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
					loading: true,
				},
			});
			await wrapper.find(".select-trigger").trigger("click");
			expect(wrapper.find(".select-dropdown").exists()).toBe(false);
		});
	});

	describe("Accessibility", () => {
		it('should have role="combobox"', () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
				},
			});
			expect(wrapper.find(".select-trigger").attributes("role")).toBe(
				"combobox",
			);
		});

		it("should have aria-expanded attribute", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
				},
			});
			expect(wrapper.find(".select-trigger").attributes("aria-expanded")).toBe(
				"false",
			);
			await wrapper.find(".select-trigger").trigger("click");
			expect(wrapper.find(".select-trigger").attributes("aria-expanded")).toBe(
				"true",
			);
		});

		it('should have role="listbox" on dropdown', async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
				},
			});
			await wrapper.find(".select-trigger").trigger("click");
			expect(wrapper.find(".select-dropdown").attributes("role")).toBe(
				"listbox",
			);
		});

		it('should have role="option" on each option', async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
				},
			});
			await wrapper.find(".select-trigger").trigger("click");
			const options = wrapper.findAll(".select-option");
			options.forEach((option) => {
				expect(option.attributes("role")).toBe("option");
			});
		});

		it("should have aria-disabled on disabled options", async () => {
			const wrapper = mount(BaseSelect, {
				props: {
					options: defaultOptions,
				},
			});
			await wrapper.find(".select-trigger").trigger("click");
			const disabledOption = wrapper.findAll(".select-option")[3];
			if (disabledOption) {
				expect(disabledOption.attributes("aria-disabled")).toBe("true");
			}
		});
	});
});
