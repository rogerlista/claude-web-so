import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import BaseDialog from "./BaseDialog.vue";

describe("BaseDialog", () => {
	let container: HTMLDivElement;

	beforeEach(() => {
		// Create container for Teleport
		container = document.createElement("div");
		container.id = "app";
		document.body.appendChild(container);
	});

	afterEach(() => {
		// Clean up any teleported content
		const dialogOverlay = document.querySelector(".dialog-overlay");
		if (dialogOverlay) {
			dialogOverlay.remove();
		}
		document.body.removeChild(container);
	});

	describe("Rendering", () => {
		it("should not render when modelValue is false", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: false,
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			expect(document.querySelector(".dialog-overlay")).toBeNull();
		});

		it("should render when modelValue is true", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			expect(document.querySelector(".dialog-overlay")).not.toBeNull();
		});

		it("should render slot content", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
				},
				slots: {
					default: "Dialog Content",
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			expect(document.querySelector(".dialog-body")?.textContent).toContain(
				"Dialog Content",
			);
		});

		it("should render header slot", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
				},
				slots: {
					header: "Dialog Title",
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			expect(document.querySelector(".dialog-header")?.textContent).toContain(
				"Dialog Title",
			);
		});

		it("should render title prop when no header slot", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
					title: "Test Title",
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			expect(document.querySelector(".dialog-header")?.textContent).toContain(
				"Test Title",
			);
		});

		it("should render footer slot", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
				},
				slots: {
					footer: "Dialog Footer",
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			expect(document.querySelector(".dialog-footer")?.textContent).toContain(
				"Dialog Footer",
			);
		});
	});

	describe("Close Button", () => {
		it("should render close button by default", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			expect(document.querySelector(".dialog-close")).not.toBeNull();
		});

		it("should not render close button when closable is false", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
					closable: false,
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			expect(document.querySelector(".dialog-close")).toBeNull();
		});

		it("should emit update:modelValue when close button is clicked", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			const closeButton = document.querySelector(
				".dialog-close",
			) as HTMLElement;
			closeButton?.click();
			await wrapper.vm.$nextTick();
			expect(wrapper.emitted("update:modelValue")).toBeTruthy();
			expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
		});
	});

	describe("Backdrop Dismiss", () => {
		it("should close when backdrop is clicked and backdropDismiss is true", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
					backdropDismiss: true,
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			const overlay = document.querySelector(".dialog-overlay") as HTMLElement;
			overlay?.click();
			await wrapper.vm.$nextTick();
			expect(wrapper.emitted("update:modelValue")).toBeTruthy();
			expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
		});

		it("should not close when backdrop is clicked and backdropDismiss is false", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
					backdropDismiss: false,
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			const overlay = document.querySelector(".dialog-overlay") as HTMLElement;
			overlay?.click();
			await wrapper.vm.$nextTick();
			expect(wrapper.emitted("update:modelValue")).toBeUndefined();
		});

		it("should not close when dialog container is clicked", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
					backdropDismiss: true,
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			const dialogContainer = document.querySelector(
				".dialog-container",
			) as HTMLElement;
			dialogContainer?.click();
			await wrapper.vm.$nextTick();
			expect(wrapper.emitted("update:modelValue")).toBeUndefined();
		});
	});

	describe("Sizes", () => {
		it("should apply medium size by default", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			const dialogContainer = document.querySelector(".dialog-container");
			expect(dialogContainer?.classList.contains("dialog-container--md")).toBe(
				true,
			);
		});

		it("should apply small size", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
					size: "sm",
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			const dialogContainer = document.querySelector(".dialog-container");
			expect(dialogContainer?.classList.contains("dialog-container--sm")).toBe(
				true,
			);
		});

		it("should apply large size", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
					size: "lg",
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			const dialogContainer = document.querySelector(".dialog-container");
			expect(dialogContainer?.classList.contains("dialog-container--lg")).toBe(
				true,
			);
		});

		it("should apply extra large size", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
					size: "xl",
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			const dialogContainer = document.querySelector(".dialog-container");
			expect(dialogContainer?.classList.contains("dialog-container--xl")).toBe(
				true,
			);
		});
	});

	describe("Keyboard Events", () => {
		it("should close when Escape key is pressed", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
				},
				attachTo: container,
			});
			await wrapper.trigger("keydown", { key: "Escape" });
			expect(wrapper.emitted("update:modelValue")).toBeTruthy();
			expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
		});

		it("should not close when Escape key is pressed and closable is false", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
					closable: false,
				},
				attachTo: container,
			});
			await wrapper.trigger("keydown", { key: "Escape" });
			expect(wrapper.emitted("update:modelValue")).toBeUndefined();
		});
	});

	describe("Accessibility", () => {
		it('should have role="dialog"', async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			const dialogContainer = document.querySelector(".dialog-container");
			expect(dialogContainer?.getAttribute("role")).toBe("dialog");
		});

		it('should have aria-modal="true"', async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			const dialogContainer = document.querySelector(".dialog-container");
			expect(dialogContainer?.getAttribute("aria-modal")).toBe("true");
		});

		it("should have aria-labelledby referencing header", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
					title: "Test Title",
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			const dialogContainer = document.querySelector(".dialog-container");
			const ariaLabelledBy = dialogContainer?.getAttribute("aria-labelledby");
			expect(ariaLabelledBy).toBeTruthy();
			expect(document.querySelector(`#${ariaLabelledBy}`)).not.toBeNull();
		});

		it("should have aria-label on close button", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
				},
				attachTo: container,
			});
			await wrapper.vm.$nextTick();
			const closeButton = document.querySelector(".dialog-close");
			expect(closeButton?.getAttribute("aria-label")).toBe("Fechar");
		});
	});

	describe("Body Scroll Lock", () => {
		it("should add overflow-hidden to body when dialog opens", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: false,
				},
				attachTo: container,
			});
			await wrapper.setProps({ modelValue: true });
			expect(document.body.style.overflow).toBe("hidden");
		});

		it("should remove overflow-hidden from body when dialog closes", async () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
				},
				attachTo: container,
			});
			await wrapper.setProps({ modelValue: false });
			expect(document.body.style.overflow).toBe("");
		});

		it("should restore overflow when component is unmounted", () => {
			const wrapper = mount(BaseDialog, {
				props: {
					modelValue: true,
				},
				attachTo: container,
			});
			wrapper.unmount();
			expect(document.body.style.overflow).toBe("");
		});
	});
});
