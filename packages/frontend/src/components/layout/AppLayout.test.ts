import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AppLayout from "./AppLayout.vue";

describe("AppLayout", () => {
	it("should render main layout element", () => {
		const wrapper = mount(AppLayout);
		expect(wrapper.find(".app-layout").exists()).toBe(true);
	});

	it("should render slot content", () => {
		const wrapper = mount(AppLayout, {
			slots: {
				default: '<div class="test-content">Content</div>',
			},
		});
		expect(wrapper.find(".test-content").exists()).toBe(true);
	});

	it("should render AppHeader", () => {
		const wrapper = mount(AppLayout);
		expect(wrapper.findComponent({ name: "AppHeader" }).exists()).toBe(true);
	});

	it("should render AppFooter", () => {
		const wrapper = mount(AppLayout);
		expect(wrapper.findComponent({ name: "AppFooter" }).exists()).toBe(true);
	});
});
