/**
 * ProductFormView Tests
 * TDD Phase: RED - Tests written before implementation
 * T027 - Product registration/edit form
 */

import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRouter, createWebHistory } from "vue-router";
import ProductFormView from "./ProductFormView.vue";

const mockRouter = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: "/products/create",
			name: "product-create",
			component: ProductFormView,
		},
		{
			path: "/products/:id/edit",
			name: "product-edit",
			component: ProductFormView,
		},
	],
});

describe("ProductFormView - T027", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
		// Mock fetch globally for all tests
		global.fetch = vi.fn();
	});

	it("should render component", () => {
		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		expect(wrapper.exists()).toBe(true);
	});

	it("should display create title when no id", async () => {
		await mockRouter.push("/products/create");

		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		expect(wrapper.find("h1").text()).toBe("Novo Produto");
	});

	it("should display edit title when id is present", async () => {
		await mockRouter.push("/products/123/edit");

		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
				mocks: {
					$route: {
						params: { id: "123" },
					},
				},
			},
		});

		expect(wrapper.find("h1").text()).toBe("Editar Produto");
	});

	it("should have basic information section", () => {
		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		expect(wrapper.text()).toContain("Informações Básicas");
	});

	it("should have SKU input field", () => {
		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const input = wrapper.find('input[name="sku"]');
		expect(input.exists()).toBe(true);
	});

	it("should have description input field", () => {
		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const input = wrapper.find('input[name="descricao"]');
		expect(input.exists()).toBe(true);
	});

	it("should have unit price input field", () => {
		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const input = wrapper.find('input[name="preco_unitario"]');
		expect(input.exists()).toBe(true);
	});

	it("should have status select field", () => {
		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const select = wrapper.find('select[name="status"]');
		expect(select.exists()).toBe(true);
	});

	it("should have codes section with GTIN field", () => {
		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		expect(wrapper.text()).toContain("Códigos");
		expect(wrapper.find('input[name="gtin"]').exists()).toBe(true);
	});

	it("should have fiscal information section", () => {
		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		expect(wrapper.text()).toContain("Informações Fiscais");
		expect(wrapper.find('input[name="ncm"]').exists()).toBe(true);
		expect(wrapper.find('input[name="cest"]').exists()).toBe(true);
	});

	it("should have save button", () => {
		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const button = wrapper.find('[data-testid="save-button"]');
		expect(button.exists()).toBe(true);
	});

	it("should have cancel button", () => {
		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const button = wrapper.find('[data-testid="cancel-button"]');
		expect(button.exists()).toBe(true);
	});

	it("should validate required fields", async () => {
		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const form = wrapper.find("form");
		await form.trigger("submit");
		await wrapper.vm.$nextTick();

		// Check for validation error messages
		const text = wrapper.text();
		expect(text).toContain("SKU é obrigatório");
	});

	it("should submit form with valid data", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				data: {
					id: "1",
					sku: "TEST001",
					descricao: "Test Product",
					preco_unitario: 10.0,
					status: "ativo",
				},
			}),
		});

		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		await wrapper.find('input[name="sku"]').setValue("TEST001");
		await wrapper.find('input[name="descricao"]').setValue("Test Product");
		await wrapper.find('input[name="preco_unitario"]').setValue("10.00");

		const saveButton = wrapper.find('[data-testid="save-button"]');
		await saveButton.trigger("click");

		// Wait for async operations
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(global.fetch).toHaveBeenCalled();
	});

	it("should navigate back on cancel", async () => {
		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const cancelButton = wrapper.find('[data-testid="cancel-button"]');
		await cancelButton.trigger("click");

		expect(mockRouter.currentRoute.value.path).not.toBe("/products/create");
	});

	it("should load product data when editing", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				data: {
					id: "123",
					sku: "TEST001",
					descricao: "Test Product",
					preco_unitario: 10.0,
					status: "ativo",
				},
			}),
		});

		await mockRouter.push("/products/123/edit");

		mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
			props: {
				id: "123",
			},
		});

		// Wait for async operations
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining("/api/produtos/123"),
		);
	});

	it("should handle load product error", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 404,
		});

		await mockRouter.push("/products/123/edit");

		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
			props: {
				id: "123",
			},
		});

		await new Promise((resolve) => setTimeout(resolve, 100));
		await wrapper.vm.$nextTick();

		expect(global.fetch).toHaveBeenCalled();
	});

	it("should handle submit error", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
		});

		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		// Fill form with valid data
		// biome-ignore lint/suspicious/noExplicitAny: test helper
		(wrapper.vm as any).form = {
			sku: "TEST001",
			descricao: "Test Product",
			preco_unitario: 10.0,
			status: "ativo",
		};

		const submitButton = wrapper.find('[data-testid="submit-button"]');
		if (submitButton.exists()) {
			await submitButton.trigger("click");
			await new Promise((resolve) => setTimeout(resolve, 100));
		}

		expect(global.fetch).toHaveBeenCalled();
	});

	it("should validate price fields", async () => {
		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		// biome-ignore lint/suspicious/noExplicitAny: test helper
		(wrapper.vm as any).form = {
			sku: "TEST001",
			descricao: "Test Product",
			preco_unitario: -10.0, // Invalid negative price
			status: "ativo",
		};

		// biome-ignore lint/suspicious/noExplicitAny: test helper
		const isValid = (wrapper.vm as any).validateForm();
		expect(isValid).toBe(false);
		// biome-ignore lint/suspicious/noExplicitAny: test helper
		expect((wrapper.vm as any).errors.preco_unitario).toBeDefined();
	});

	it("should validate promotional price dates", async () => {
		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		// Type assertion for exposed properties
		// biome-ignore lint/suspicious/noExplicitAny: test helper
		(wrapper.vm as any).form = {
			sku: "TEST001",
			descricao: "Test Product",
			preco_unitario: 10.0,
			status: "ativo",
			preco_promocional: 8.0,
			preco_promocional_inicio: today.toISOString().split("T")[0],
			preco_promocional_fim: yesterday.toISOString().split("T")[0], // End before start
		};

		// biome-ignore lint/suspicious/noExplicitAny: test helper
		const isValid = (wrapper.vm as any).validateForm();
		expect(isValid).toBe(false);
	});

	it("should handle optional fields", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ data: { id: "1" } }),
		});

		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		// biome-ignore lint/suspicious/noExplicitAny: test helper
		(wrapper.vm as any).form = {
			sku: "TEST001",
			descricao: "Test Product",
			preco_unitario: 10.0,
			status: "ativo",
			gtin: "1234567890123",
			ncm: "12345678",
		};

		// biome-ignore lint/suspicious/noExplicitAny: test helper
		const isValid = (wrapper.vm as any).validateForm();
		expect(isValid).toBe(true);
	});

	it("should clear errors on valid input", async () => {
		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		// First set invalid data
		// biome-ignore lint/suspicious/noExplicitAny: test helper
		(wrapper.vm as any).form = {
			sku: "",
			descricao: "",
			preco_unitario: 0,
			status: "ativo",
		};
		// biome-ignore lint/suspicious/noExplicitAny: test helper
		(wrapper.vm as any).validateForm();
		// biome-ignore lint/suspicious/noExplicitAny: test helper
		expect(Object.keys((wrapper.vm as any).errors).length).toBeGreaterThan(0);

		// Then set valid data
		// biome-ignore lint/suspicious/noExplicitAny: test helper
		(wrapper.vm as any).form = {
			sku: "TEST001",
			descricao: "Test Product",
			preco_unitario: 10.0,
			status: "ativo",
		};
		// biome-ignore lint/suspicious/noExplicitAny: test helper
		(wrapper.vm as any).validateForm();
		// Errors should be minimal or none
		// biome-ignore lint/suspicious/noExplicitAny: test helper
		expect((wrapper.vm as any).errors.sku).toBeUndefined();
	});

	it("should show origem tributaria options", () => {
		const wrapper = mount(ProductFormView, {
			global: {
				plugins: [mockRouter],
			},
		});

		// biome-ignore lint/suspicious/noExplicitAny: test helper
		expect((wrapper.vm as any).origemTributariaOptions.length).toBeGreaterThan(
			0,
		);
	});
});
