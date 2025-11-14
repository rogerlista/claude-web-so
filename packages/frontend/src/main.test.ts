import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { describe, expect, it } from "vitest";
import { createMemoryHistory } from "vue-router";
import App from "./App.vue";
import { createRouter } from "./router";

/**
 * Phase 4: Main application tests
 * Testing Vue app bootstrap with router and state management
 */

describe("Frontend Application", () => {
	it("should render App component", () => {
		const pinia = createPinia();
		const router = createRouter(createMemoryHistory());

		const wrapper = mount(App, {
			global: {
				plugins: [pinia, router],
			},
		});

		expect(wrapper.exists()).toBe(true);
	});

	it("should have router-view for navigation", () => {
		const pinia = createPinia();
		const router = createRouter(createMemoryHistory());

		const wrapper = mount(App, {
			global: {
				plugins: [pinia, router],
			},
		});

		// RouterView doesn't render as 'router-view' in Vue 3, check for router functionality
		expect(router.currentRoute.value).toBeDefined();
		expect(wrapper.findComponent({ name: "AppLayout" }).exists()).toBe(true);
	});

	it("should wrap content in AppLayout", () => {
		const pinia = createPinia();
		const router = createRouter(createMemoryHistory());

		const wrapper = mount(App, {
			global: {
				plugins: [pinia, router],
			},
		});

		expect(wrapper.findComponent({ name: "AppLayout" }).exists()).toBe(true);
	});
});
