/**
 * HomeView Tests
 */

import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import HomeView from "./HomeView.vue";

const mockRouter = createRouter({
	history: createMemoryHistory(),
	routes: [
		{
			path: "/",
			name: "home",
			component: HomeView,
		},
		{
			path: "/products",
			name: "products",
			component: { template: "<div>Products</div>" },
		},
		{
			path: "/pos",
			name: "pos",
			component: { template: "<div>POS</div>" },
		},
	],
});

describe("HomeView", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it("should render component", () => {
		const wrapper = mount(HomeView, {
			global: {
				plugins: [mockRouter],
			},
		});

		expect(wrapper.exists()).toBe(true);
	});

	it("should display page title", () => {
		const wrapper = mount(HomeView, {
			global: {
				plugins: [mockRouter],
			},
		});

		expect(wrapper.find("h1").text()).toBe("Dashboard");
	});

	it("should display subtitle", () => {
		const wrapper = mount(HomeView, {
			global: {
				plugins: [mockRouter],
			},
		});

		expect(wrapper.find(".subtitle").text()).toBe("Sistema POS com NFC-e");
	});

	it("should render feature cards", () => {
		const wrapper = mount(HomeView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const cards = wrapper.findAll(".features-grid > *");
		expect(cards.length).toBeGreaterThanOrEqual(4);
	});

	it("should have link to products page", () => {
		const wrapper = mount(HomeView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const link = wrapper.find('a[href="/products"]');
		expect(link.exists()).toBe(true);
		expect(link.text()).toContain("Ver produtos");
	});

	it("should have link to POS page", () => {
		const wrapper = mount(HomeView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const link = wrapper.find('a[href="/pos"]');
		expect(link.exists()).toBe(true);
		expect(link.text()).toContain("Abrir PDV");
	});

	it("should show disabled state for features in development", () => {
		const wrapper = mount(HomeView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const disabledLinks = wrapper.findAll(".card-link.disabled");
		expect(disabledLinks.length).toBeGreaterThanOrEqual(2);
	});

	it("should display feature cards in grid layout", () => {
		const wrapper = mount(HomeView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const grid = wrapper.find(".features-grid");
		expect(grid.exists()).toBe(true);
	});
});
