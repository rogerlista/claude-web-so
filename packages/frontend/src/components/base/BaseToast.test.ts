import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BaseToast from "./BaseToast.vue";

describe("BaseToast", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	it("should render toast with message", () => {
		const wrapper = mount(BaseToast, {
			props: {
				message: "Test message",
				variant: "info",
			},
		});

		expect(wrapper.text()).toContain("Test message");
	});

	it("should render success variant with correct icon", () => {
		const wrapper = mount(BaseToast, {
			props: {
				message: "Success",
				variant: "success",
			},
		});

		expect(wrapper.find(".toast--success").exists()).toBe(true);
		expect(wrapper.find(".toast__icon").text()).toBe("✓");
	});

	it("should render error variant with correct icon", () => {
		const wrapper = mount(BaseToast, {
			props: {
				message: "Error",
				variant: "error",
			},
		});

		expect(wrapper.find(".toast--error").exists()).toBe(true);
		expect(wrapper.find(".toast__icon").text()).toBe("✕");
	});

	it("should render warning variant with correct icon", () => {
		const wrapper = mount(BaseToast, {
			props: {
				message: "Warning",
				variant: "warning",
			},
		});

		expect(wrapper.find(".toast--warning").exists()).toBe(true);
		expect(wrapper.find(".toast__icon").text()).toBe("⚠");
	});

	it("should render info variant with correct icon", () => {
		const wrapper = mount(BaseToast, {
			props: {
				message: "Info",
				variant: "info",
			},
		});

		expect(wrapper.find(".toast--info").exists()).toBe(true);
		expect(wrapper.find(".toast__icon").text()).toBe("ℹ");
	});

	it("should render close button when dismissible", () => {
		const wrapper = mount(BaseToast, {
			props: {
				message: "Test",
				variant: "info",
				dismissible: true,
			},
		});

		expect(wrapper.find(".toast__close").exists()).toBe(true);
	});

	it("should not render close button when not dismissible", () => {
		const wrapper = mount(BaseToast, {
			props: {
				message: "Test",
				variant: "info",
				dismissible: false,
			},
		});

		expect(wrapper.find(".toast__close").exists()).toBe(false);
	});

	it("should emit close event when close button clicked", async () => {
		const wrapper = mount(BaseToast, {
			props: {
				message: "Test",
				variant: "info",
				dismissible: true,
			},
		});

		await wrapper.find(".toast__close").trigger("click");

		expect(wrapper.emitted("close")).toBeTruthy();
		expect(wrapper.emitted("close")).toHaveLength(1);
	});

	it("should auto-hide after duration", async () => {
		const wrapper = mount(BaseToast, {
			props: {
				message: "Test",
				variant: "info",
				duration: 3000,
			},
		});

		expect(wrapper.find(".toast").exists()).toBe(true);

		await vi.advanceTimersByTimeAsync(3000);

		expect(wrapper.emitted("close")).toBeTruthy();
	});

	it("should not auto-hide when duration is 0", async () => {
		const wrapper = mount(BaseToast, {
			props: {
				message: "Test",
				variant: "info",
				duration: 0,
			},
		});

		await vi.advanceTimersByTimeAsync(10000);

		expect(wrapper.emitted("close")).toBeFalsy();
	});

	it("should have correct role attribute for accessibility", () => {
		const wrapper = mount(BaseToast, {
			props: {
				message: "Test",
				variant: "info",
			},
		});

		expect(wrapper.find('[role="alert"]').exists()).toBe(true);
	});

	it("should apply transition classes", () => {
		const wrapper = mount(BaseToast, {
			props: {
				message: "Test",
				variant: "info",
			},
		});

		expect(wrapper.find(".toast").exists()).toBe(true);
		expect(wrapper.find(".toast").classes()).toContain("toast--info");
	});
});
