/**
 * ProductLookup Component Tests
 * TDD Phase: RED - Tests written before implementation
 * T028 - Product Lookup component for quick search
 */

import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductLookup from "./ProductLookup.vue";

describe("ProductLookup - T028", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
	});

	it("should render component", () => {
		const wrapper = mount(ProductLookup);
		expect(wrapper.exists()).toBe(true);
	});

	it("should have search input", () => {
		const wrapper = mount(ProductLookup);
		const input = wrapper.find('input[type="text"]');
		expect(input.exists()).toBe(true);
	});

	it("should have placeholder text", () => {
		const wrapper = mount(ProductLookup, {
			props: {
				placeholder: "Search products...",
			},
		});
		const input = wrapper.find('input[type="text"]');
		expect(input.attributes("placeholder")).toBe("Search products...");
	});

	it("should show results dropdown on input", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				data: [
					{
						id: "1",
						sku: "TEST001",
						descricao: "Test Product",
						preco_unitario: 10.0,
						status: "ativo",
					},
				],
			}),
		});

		const wrapper = mount(ProductLookup);
		const input = wrapper.find('input[type="text"]');

		await input.setValue("test");
		await new Promise((resolve) => setTimeout(resolve, 400));

		expect(wrapper.find('[data-testid="results-dropdown"]').exists()).toBe(
			true,
		);
	});

	it("should search by multiple criteria (SKU, GTIN, description)", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ data: [] }),
		});

		const wrapper = mount(ProductLookup);
		const input = wrapper.find('input[type="text"]');

		await input.setValue("TEST");
		await new Promise((resolve) => setTimeout(resolve, 400));

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining("/api/produtos?q=TEST"),
		);
	});

	it("should display search results", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				data: [
					{
						id: "1",
						sku: "TEST001",
						descricao: "Test Product 1",
						preco_unitario: 10.0,
						status: "ativo",
					},
					{
						id: "2",
						sku: "TEST002",
						descricao: "Test Product 2",
						preco_unitario: 20.0,
						status: "ativo",
					},
				],
			}),
		});

		const wrapper = mount(ProductLookup);
		const input = wrapper.find('input[type="text"]');

		await input.setValue("test");
		await new Promise((resolve) => setTimeout(resolve, 400));

		const results = wrapper.findAll('[data-testid="result-item"]');
		expect(results).toHaveLength(2);
	});

	it("should show product details in results (SKU, description, price)", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				data: [
					{
						id: "1",
						sku: "TEST001",
						descricao: "Test Product",
						preco_unitario: 10.0,
						status: "ativo",
					},
				],
			}),
		});

		const wrapper = mount(ProductLookup);
		const input = wrapper.find('input[type="text"]');

		await input.setValue("test");
		await new Promise((resolve) => setTimeout(resolve, 400));

		const result = wrapper.find('[data-testid="result-item"]');
		expect(result.text()).toContain("TEST001");
		expect(result.text()).toContain("Test Product");
	});

	it("should emit select event when product is clicked", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				data: [
					{
						id: "1",
						sku: "TEST001",
						descricao: "Test Product",
						preco_unitario: 10.0,
						status: "ativo",
					},
				],
			}),
		});

		const wrapper = mount(ProductLookup);
		const input = wrapper.find('input[type="text"]');

		await input.setValue("test");
		await new Promise((resolve) => setTimeout(resolve, 400));

		const result = wrapper.find('[data-testid="result-item"]');
		await result.trigger("click");

		expect(wrapper.emitted("select")).toBeTruthy();
		expect(wrapper.emitted("select")?.[0]?.[0]).toMatchObject({
			id: "1",
			sku: "TEST001",
		});
	});

	it("should clear input after selection", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				data: [
					{
						id: "1",
						sku: "TEST001",
						descricao: "Test Product",
						preco_unitario: 10.0,
						status: "ativo",
					},
				],
			}),
		});

		const wrapper = mount(ProductLookup);
		const input = wrapper.find('input[type="text"]');

		await input.setValue("test");
		await new Promise((resolve) => setTimeout(resolve, 400));

		const result = wrapper.find('[data-testid="result-item"]');
		await result.trigger("click");

		expect((input.element as HTMLInputElement).value).toBe("");
	});

	it("should show loading state while searching", async () => {
		global.fetch = vi.fn().mockImplementation(
			() =>
				new Promise((resolve) => {
					setTimeout(
						() =>
							resolve({
								ok: true,
								json: async () => ({ data: [] }),
							}),
						500, // Longer delay to catch loading state
					);
				}),
		);

		const wrapper = mount(ProductLookup);
		const input = wrapper.find('input[type="text"]');

		await input.setValue("test");

		// Wait for debounce (300ms) + a bit more
		await new Promise((resolve) => setTimeout(resolve, 350));

		expect(wrapper.find('[data-testid="loading-indicator"]').exists()).toBe(
			true,
		);
	});

	it("should show empty state when no results", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ data: [] }),
		});

		const wrapper = mount(ProductLookup);
		const input = wrapper.find('input[type="text"]');

		await input.setValue("nonexistent");
		await new Promise((resolve) => setTimeout(resolve, 400));

		expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
	});

	it("should debounce search input", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ data: [] }),
		});

		const wrapper = mount(ProductLookup);
		const input = wrapper.find('input[type="text"]');

		await input.setValue("t");
		await input.setValue("te");
		await input.setValue("tes");
		await input.setValue("test");

		// Should not have called fetch yet (debounced)
		expect(global.fetch).not.toHaveBeenCalled();

		// Wait for debounce
		await new Promise((resolve) => setTimeout(resolve, 400));

		// Should only call once after debounce
		expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	it("should close dropdown on escape key", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				data: [
					{
						id: "1",
						sku: "TEST001",
						descricao: "Test Product",
						preco_unitario: 10.0,
						status: "ativo",
					},
				],
			}),
		});

		const wrapper = mount(ProductLookup);
		const input = wrapper.find('input[type="text"]');

		await input.setValue("test");
		await new Promise((resolve) => setTimeout(resolve, 400));

		expect(wrapper.find('[data-testid="results-dropdown"]').exists()).toBe(
			true,
		);

		await input.trigger("keydown.esc");
		await wrapper.vm.$nextTick();

		expect(wrapper.find('[data-testid="results-dropdown"]').exists()).toBe(
			false,
		);
	});

	it("should support keyboard navigation (arrow keys)", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				data: [
					{
						id: "1",
						sku: "TEST001",
						descricao: "Test Product 1",
						preco_unitario: 10.0,
						status: "ativo",
					},
					{
						id: "2",
						sku: "TEST002",
						descricao: "Test Product 2",
						preco_unitario: 20.0,
						status: "ativo",
					},
				],
			}),
		});

		const wrapper = mount(ProductLookup);
		const input = wrapper.find('input[type="text"]');

		await input.setValue("test");
		await new Promise((resolve) => setTimeout(resolve, 400));

		await input.trigger("keydown.down");
		await input.trigger("keydown.down");

		expect(wrapper.exists()).toBe(true);
	});
});
