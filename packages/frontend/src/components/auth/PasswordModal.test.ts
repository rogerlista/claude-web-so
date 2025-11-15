import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import PasswordModal from "./PasswordModal.vue";

describe("PasswordModal", () => {
	let wrapper: ReturnType<typeof mount> | null = null;

	afterEach(() => {
		if (wrapper) {
			wrapper.unmount();
			wrapper = null;
		}
	});

	describe("Rendering", () => {
		it("should not render when modelValue is false", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: false,
					title: "Test",
				},
				attachTo: document.body,
			});

			expect(document.querySelector(".modal-overlay")).toBeFalsy();
		});

		it("should render when modelValue is true", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			expect(document.querySelector(".modal-overlay")).toBeTruthy();
		});

		it("should display custom title", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Cancelar Item",
				},
				attachTo: document.body,
			});

			expect(document.body.textContent).toContain("Cancelar Item");
		});

		it("should display custom message", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
					message: "Digite sua senha para continuar",
				},
				attachTo: document.body,
			});

			expect(document.body.textContent).toContain(
				"Digite sua senha para continuar",
			);
		});
	});

	describe("Password Input", () => {
		it("should have password input", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const input = document.querySelector('input[type="password"]');
			expect(input).toBeTruthy();
		});

		it("should update password on input", async () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const input = document.querySelector(
				'input[type="password"]',
			) as HTMLInputElement;
			input.value = "test123";
			input.dispatchEvent(new Event("input"));
			await wrapper.vm.$nextTick();

			expect(input.value).toBe("test123");
		});

		it("should have autofocus on password input", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const input = document.querySelector('input[type="password"]');
			expect(input?.hasAttribute("autofocus")).toBe(true);
		});
	});

	describe("Actions", () => {
		it("should have cancel button", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const buttons = Array.from(document.querySelectorAll("button"));
			const cancelBtn = buttons.find((btn) =>
				btn.textContent?.includes("Cancelar"),
			);
			expect(cancelBtn).toBeTruthy();
		});

		it("should have confirm button", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const buttons = Array.from(document.querySelectorAll("button"));
			const confirmBtn = buttons.find((btn) =>
				btn.textContent?.includes("Confirmar"),
			);
			expect(confirmBtn).toBeTruthy();
		});

		it("should disable confirm button when password is empty", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const buttons = Array.from(document.querySelectorAll("button"));
			const confirmBtn = buttons.find((btn) =>
				btn.textContent?.includes("Confirmar"),
			);
			expect(confirmBtn?.hasAttribute("disabled")).toBe(true);
		});

		it("should enable confirm button when password is not empty", async () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const input = document.querySelector(
				'input[type="password"]',
			) as HTMLInputElement;
			input.value = "test123";
			input.dispatchEvent(new Event("input"));
			await wrapper.vm.$nextTick();

			const buttons = Array.from(document.querySelectorAll("button"));
			const confirmBtn = buttons.find((btn) =>
				btn.textContent?.includes("Confirmar"),
			);
			expect(confirmBtn?.hasAttribute("disabled")).toBe(false);
		});
	});

	describe("Events", () => {
		it("should emit update:modelValue with false on cancel", async () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const buttons = Array.from(document.querySelectorAll("button"));
			const cancelBtn = buttons.find((btn) =>
				btn.textContent?.includes("Cancelar"),
			);
			cancelBtn?.click();
			await wrapper.vm.$nextTick();

			expect(wrapper.emitted("update:modelValue")).toBeTruthy();
			expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
		});

		it("should emit cancel event on cancel button", async () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const buttons = Array.from(document.querySelectorAll("button"));
			const cancelBtn = buttons.find((btn) =>
				btn.textContent?.includes("Cancelar"),
			);
			cancelBtn?.click();
			await wrapper.vm.$nextTick();

			expect(wrapper.emitted("cancel")).toBeTruthy();
		});

		it("should emit confirm event with password on confirm", async () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const input = document.querySelector(
				'input[type="password"]',
			) as HTMLInputElement;
			input.value = "test123";
			input.dispatchEvent(new Event("input"));
			await wrapper.vm.$nextTick();

			const buttons = Array.from(document.querySelectorAll("button"));
			const confirmBtn = buttons.find((btn) =>
				btn.textContent?.includes("Confirmar"),
			);
			confirmBtn?.click();
			await wrapper.vm.$nextTick();

			expect(wrapper.emitted("confirm")).toBeTruthy();
			expect(wrapper.emitted("confirm")?.[0]).toEqual(["test123"]);
		});

		it("should clear password and close modal after confirm", async () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const input = document.querySelector(
				'input[type="password"]',
			) as HTMLInputElement;
			input.value = "test123";
			input.dispatchEvent(new Event("input"));
			await wrapper.vm.$nextTick();

			const buttons = Array.from(document.querySelectorAll("button"));
			const confirmBtn = buttons.find((btn) =>
				btn.textContent?.includes("Confirmar"),
			);
			confirmBtn?.click();
			await wrapper.vm.$nextTick();

			expect(wrapper.emitted("update:modelValue")).toBeTruthy();
			expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
		});
	});

	describe("Keyboard Events", () => {
		it("should close modal on Escape key", async () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const overlay = document.querySelector(".modal-overlay");
			overlay?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
			await wrapper.vm.$nextTick();

			expect(wrapper.emitted("update:modelValue")).toBeTruthy();
			expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
		});

		it("should confirm on Enter key when password is not empty", async () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const input = document.querySelector(
				'input[type="password"]',
			) as HTMLInputElement;
			input.value = "test123";
			input.dispatchEvent(new Event("input"));
			await wrapper.vm.$nextTick();

			input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
			await wrapper.vm.$nextTick();

			expect(wrapper.emitted("confirm")).toBeTruthy();
			expect(wrapper.emitted("confirm")?.[0]).toEqual(["test123"]);
		});

		it("should not confirm on Enter key when password is empty", async () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const input = document.querySelector(
				'input[type="password"]',
			) as HTMLInputElement;
			input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
			await wrapper.vm.$nextTick();

			expect(wrapper.emitted("confirm")).toBeFalsy();
		});
	});

	describe("Loading State", () => {
		it("should show loading state when loading prop is true", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
					loading: true,
				},
				attachTo: document.body,
			});

			expect(document.querySelector(".loading")).toBeTruthy();
		});

		it("should disable confirm button when loading", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
					loading: true,
				},
				attachTo: document.body,
			});

			const modal = document.querySelector(".modal-dialog");
			const buttons = Array.from(modal?.querySelectorAll("button") || []);
			const confirmBtn = buttons.find(
				(btn) =>
					btn.textContent?.includes("Validando") ||
					btn.textContent?.includes("Confirmar"),
			);
			expect(confirmBtn).toBeTruthy();
			expect(
				confirmBtn?.hasAttribute("disabled") ||
					(confirmBtn as HTMLButtonElement)?.disabled,
			).toBe(true);
		});

		it("should disable cancel button when loading", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
					loading: true,
				},
				attachTo: document.body,
			});

			const buttons = Array.from(document.querySelectorAll("button"));
			const cancelBtn = buttons.find((btn) =>
				btn.textContent?.includes("Cancelar"),
			);
			expect(cancelBtn?.hasAttribute("disabled")).toBe(true);
		});
	});

	describe("Error State", () => {
		it("should display error message when error prop is set", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
					error: "Senha incorreta",
				},
				attachTo: document.body,
			});

			expect(document.body.textContent).toContain("Senha incorreta");
		});

		it("should have error styling on input when error is present", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
					error: "Senha incorreta",
				},
				attachTo: document.body,
			});

			const input = document.querySelector('input[type="password"]');
			expect(input?.classList.contains("input-error")).toBe(true);
		});
	});

	describe("Accessibility", () => {
		it("should have role dialog", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const dialog = document.querySelector('[role="dialog"]');
			expect(dialog).toBeTruthy();
		});

		it("should have aria-modal true", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const dialog = document.querySelector('[role="dialog"]');
			expect(dialog?.getAttribute("aria-modal")).toBe("true");
		});

		it("should have aria-labelledby referencing title", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const dialog = document.querySelector('[role="dialog"]');
			const labelId = dialog?.getAttribute("aria-labelledby");
			expect(labelId).toBeTruthy();

			const title = document.querySelector(`#${labelId}`);
			expect(title).toBeTruthy();
		});

		it("should have label for password input", () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			const input = document.querySelector('input[type="password"]');
			const inputId = input?.getAttribute("id");
			expect(inputId).toBeTruthy();

			const label = document.querySelector(`label[for="${inputId}"]`);
			expect(label).toBeTruthy();
		});
	});

	describe("Body Scroll Lock", () => {
		it("should lock body scroll when modal is open", async () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			await wrapper.vm.$nextTick();
			expect(document.body.style.overflow).toBe("hidden");
		});

		it("should restore body scroll when modal is closed", async () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			await wrapper.setProps({ modelValue: false });
			await wrapper.vm.$nextTick();

			expect(document.body.style.overflow).toBe("");
		});

		it("should restore body scroll on unmount", async () => {
			wrapper = mount(PasswordModal, {
				props: {
					modelValue: true,
					title: "Test",
				},
				attachTo: document.body,
			});

			wrapper.unmount();
			wrapper = null;
			expect(document.body.style.overflow).toBe("");
		});
	});
});
