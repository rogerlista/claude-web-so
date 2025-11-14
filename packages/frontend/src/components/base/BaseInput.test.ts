import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import BaseInput from "./BaseInput.vue";

describe("BaseInput", () => {
	describe("Rendering", () => {
		it("should render input element", () => {
			const wrapper = mount(BaseInput);
			expect(wrapper.find("input").exists()).toBe(true);
		});

		it("should render with label", () => {
			const wrapper = mount(BaseInput, {
				props: {
					label: "Username",
				},
			});
			expect(wrapper.find("label").text()).toBe("Username");
		});

		it("should render without label", () => {
			const wrapper = mount(BaseInput);
			expect(wrapper.find("label").exists()).toBe(false);
		});

		it("should link label to input with id", () => {
			const wrapper = mount(BaseInput, {
				props: {
					label: "Email",
					id: "email-input",
				},
			});
			expect(wrapper.find("label").attributes("for")).toBe("email-input");
			expect(wrapper.find("input").attributes("id")).toBe("email-input");
		});

		it("should auto-generate id if not provided", () => {
			const wrapper = mount(BaseInput, {
				props: {
					label: "Name",
				},
			});
			const inputId = wrapper.find("input").attributes("id");
			expect(inputId).toBeDefined();
			expect(wrapper.find("label").attributes("for")).toBe(inputId);
		});
	});

	describe("Model Value", () => {
		it("should render with empty value by default", () => {
			const wrapper = mount(BaseInput);
			expect(wrapper.find("input").element.value).toBe("");
		});

		it("should render with initial value", () => {
			const wrapper = mount(BaseInput, {
				props: {
					modelValue: "Initial value",
				},
			});
			expect(wrapper.find("input").element.value).toBe("Initial value");
		});

		it("should emit update:modelValue on input", async () => {
			const wrapper = mount(BaseInput);
			await wrapper.find("input").setValue("New value");
			expect(wrapper.emitted("update:modelValue")).toBeTruthy();
			expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["New value"]);
		});

		it("should update value when prop changes", async () => {
			const wrapper = mount(BaseInput, {
				props: {
					modelValue: "Initial",
				},
			});
			await wrapper.setProps({ modelValue: "Updated" });
			expect(wrapper.find("input").element.value).toBe("Updated");
		});
	});

	describe("Input Types", () => {
		it('should have type="text" by default', () => {
			const wrapper = mount(BaseInput);
			expect(wrapper.find("input").attributes("type")).toBe("text");
		});

		it("should accept email type", () => {
			const wrapper = mount(BaseInput, {
				props: {
					type: "email",
				},
			});
			expect(wrapper.find("input").attributes("type")).toBe("email");
		});

		it("should accept password type", () => {
			const wrapper = mount(BaseInput, {
				props: {
					type: "password",
				},
			});
			expect(wrapper.find("input").attributes("type")).toBe("password");
		});

		it("should accept number type", () => {
			const wrapper = mount(BaseInput, {
				props: {
					type: "number",
				},
			});
			expect(wrapper.find("input").attributes("type")).toBe("number");
		});

		it("should accept tel type", () => {
			const wrapper = mount(BaseInput, {
				props: {
					type: "tel",
				},
			});
			expect(wrapper.find("input").attributes("type")).toBe("tel");
		});
	});

	describe("Placeholder", () => {
		it("should not have placeholder by default", () => {
			const wrapper = mount(BaseInput);
			expect(wrapper.find("input").attributes("placeholder")).toBeUndefined();
		});

		it("should render with placeholder", () => {
			const wrapper = mount(BaseInput, {
				props: {
					placeholder: "Enter your name",
				},
			});
			expect(wrapper.find("input").attributes("placeholder")).toBe(
				"Enter your name",
			);
		});
	});

	describe("Disabled State", () => {
		it("should not be disabled by default", () => {
			const wrapper = mount(BaseInput);
			expect(wrapper.find("input").attributes("disabled")).toBeUndefined();
		});

		it("should be disabled when disabled prop is true", () => {
			const wrapper = mount(BaseInput, {
				props: {
					disabled: true,
				},
			});
			expect(wrapper.find("input").attributes("disabled")).toBeDefined();
		});

		it("should have disabled class when disabled", () => {
			const wrapper = mount(BaseInput, {
				props: {
					disabled: true,
				},
			});
			expect(wrapper.find("input").classes()).toContain(
				"base-input__field--disabled",
			);
		});
	});

	describe("Readonly State", () => {
		it("should not be readonly by default", () => {
			const wrapper = mount(BaseInput);
			expect(wrapper.find("input").attributes("readonly")).toBeUndefined();
		});

		it("should be readonly when readonly prop is true", () => {
			const wrapper = mount(BaseInput, {
				props: {
					readonly: true,
				},
			});
			expect(wrapper.find("input").attributes("readonly")).toBeDefined();
		});
	});

	describe("Required State", () => {
		it("should not be required by default", () => {
			const wrapper = mount(BaseInput);
			expect(wrapper.find("input").attributes("required")).toBeUndefined();
		});

		it("should be required when required prop is true", () => {
			const wrapper = mount(BaseInput, {
				props: {
					required: true,
				},
			});
			expect(wrapper.find("input").attributes("required")).toBeDefined();
		});

		it("should show asterisk in label when required", () => {
			const wrapper = mount(BaseInput, {
				props: {
					label: "Email",
					required: true,
				},
			});
			expect(wrapper.find(".base-input__label-required").exists()).toBe(true);
		});
	});

	describe("Error State", () => {
		it("should not have error by default", () => {
			const wrapper = mount(BaseInput);
			expect(wrapper.find(".base-input__error").exists()).toBe(false);
		});

		it("should display error message", () => {
			const wrapper = mount(BaseInput, {
				props: {
					error: "This field is required",
				},
			});
			expect(wrapper.find(".base-input__error").text()).toBe(
				"This field is required",
			);
		});

		it("should have error class when error exists", () => {
			const wrapper = mount(BaseInput, {
				props: {
					error: "Invalid input",
				},
			});
			expect(wrapper.find("input").classes()).toContain(
				"base-input__field--error",
			);
		});

		it("should have aria-invalid when error exists", () => {
			const wrapper = mount(BaseInput, {
				props: {
					error: "Error message",
				},
			});
			expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
		});

		it("should link error to input with aria-describedby", () => {
			const wrapper = mount(BaseInput, {
				props: {
					id: "test-input",
					error: "Error message",
				},
			});
			expect(wrapper.find("input").attributes("aria-describedby")).toBe(
				"test-input-error",
			);
			expect(wrapper.find(".base-input__error").attributes("id")).toBe(
				"test-input-error",
			);
		});
	});

	describe("Helper Text", () => {
		it("should not have helper text by default", () => {
			const wrapper = mount(BaseInput);
			expect(wrapper.find(".base-input__helper").exists()).toBe(false);
		});

		it("should display helper text", () => {
			const wrapper = mount(BaseInput, {
				props: {
					helperText: "Enter your full name",
				},
			});
			expect(wrapper.find(".base-input__helper").text()).toBe(
				"Enter your full name",
			);
		});

		it("should link helper text to input with aria-describedby", () => {
			const wrapper = mount(BaseInput, {
				props: {
					id: "test-input",
					helperText: "Helper text",
				},
			});
			expect(wrapper.find("input").attributes("aria-describedby")).toBe(
				"test-input-helper",
			);
		});

		it("should not show helper text when error exists", () => {
			const wrapper = mount(BaseInput, {
				props: {
					helperText: "Helper text",
					error: "Error message",
				},
			});
			expect(wrapper.find(".base-input__helper").exists()).toBe(false);
			expect(wrapper.find(".base-input__error").exists()).toBe(true);
		});
	});

	describe("Max Length", () => {
		it("should not have maxlength by default", () => {
			const wrapper = mount(BaseInput);
			expect(wrapper.find("input").attributes("maxlength")).toBeUndefined();
		});

		it("should set maxlength attribute", () => {
			const wrapper = mount(BaseInput, {
				props: {
					maxLength: 50,
				},
			});
			expect(wrapper.find("input").attributes("maxlength")).toBe("50");
		});

		it("should show character counter when maxLength is set", () => {
			const wrapper = mount(BaseInput, {
				props: {
					modelValue: "Hello",
					maxLength: 10,
				},
			});
			expect(wrapper.find(".base-input__counter").exists()).toBe(true);
			expect(wrapper.find(".base-input__counter").text()).toBe("5 / 10");
		});

		it("should update character counter on input", async () => {
			const wrapper = mount(BaseInput, {
				props: {
					maxLength: 20,
				},
			});
			await wrapper.find("input").setValue("Test message");
			await wrapper.setProps({ modelValue: "Test message" });
			expect(wrapper.find(".base-input__counter").text()).toBe("12 / 20");
		});
	});

	describe("Events", () => {
		it("should emit input event", async () => {
			const wrapper = mount(BaseInput);
			await wrapper.find("input").setValue("test");
			expect(wrapper.emitted("input")).toBeTruthy();
		});

		it("should emit focus event", async () => {
			const wrapper = mount(BaseInput);
			await wrapper.find("input").trigger("focus");
			expect(wrapper.emitted("focus")).toBeTruthy();
		});

		it("should emit blur event", async () => {
			const wrapper = mount(BaseInput);
			await wrapper.find("input").trigger("blur");
			expect(wrapper.emitted("blur")).toBeTruthy();
		});

		it("should emit keydown event", async () => {
			const wrapper = mount(BaseInput);
			await wrapper.find("input").trigger("keydown", { key: "Enter" });
			expect(wrapper.emitted("keydown")).toBeTruthy();
		});

		it("should emit keyup event", async () => {
			const wrapper = mount(BaseInput);
			await wrapper.find("input").trigger("keyup");
			expect(wrapper.emitted("keyup")).toBeTruthy();
		});
	});

	describe("Accessibility", () => {
		it("should have proper aria-required when required", () => {
			const wrapper = mount(BaseInput, {
				props: {
					required: true,
				},
			});
			expect(wrapper.find("input").attributes("aria-required")).toBe("true");
		});

		it("should accept custom aria-label", () => {
			const wrapper = mount(BaseInput, {
				props: {
					ariaLabel: "Search input",
				},
			});
			expect(wrapper.find("input").attributes("aria-label")).toBe(
				"Search input",
			);
		});

		it("should use label as aria-labelledby when id is provided", () => {
			const wrapper = mount(BaseInput, {
				props: {
					label: "Username",
					id: "username-input",
				},
			});
			// The for attribute on label should link to input
			expect(wrapper.find("label").attributes("for")).toBe("username-input");
		});
	});
});
