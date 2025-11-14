/**
 * Tests for POSProductSearch
 * Phase 6: T039 - Product Search Component
 */

import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProductsStore } from "../../../stores/products";
import POSProductSearch from "./POSProductSearch.vue";

describe("POSProductSearch", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
		// Mock window.alert
		global.alert = vi.fn();
	});

	describe("Render", () => {
		it("should render correctly", () => {
			const wrapper = mount(POSProductSearch, {
				global: {
					stubs: {
						BaseInput: {
							template:
								'<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
							props: ["modelValue", "disabled"],
						},
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "loading", "disabled"],
						},
					},
				},
			});

			expect(wrapper.find(".pos-product-search").exists()).toBe(true);
		});

		it("should display header title", () => {
			const wrapper = mount(POSProductSearch, {
				global: {
					stubs: {
						BaseInput: true,
						BaseButton: true,
					},
				},
			});

			expect(wrapper.find(".search-header h2").text()).toBe(
				"Adicionar Produtos",
			);
		});

		it("should have search input", () => {
			const wrapper = mount(POSProductSearch, {
				global: {
					stubs: {
						BaseInput: {
							template: '<input v-bind="$attrs" />',
							props: ["modelValue", "disabled"],
						},
						BaseButton: true,
					},
				},
			});

			const input = wrapper.find(".search-box input");
			expect(input.exists()).toBe(true);
		});

		it("should have search button", () => {
			const wrapper = mount(POSProductSearch, {
				global: {
					stubs: {
						BaseInput: true,
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "loading"],
						},
					},
				},
			});

			const button = wrapper.find(".search-box button");
			expect(button.exists()).toBe(true);
			expect(button.text()).toBe("Buscar");
		});
	});

	describe("Search Functionality", () => {
		it("should call searchProducts when search button is clicked", async () => {
			const productsStore = useProductsStore();
			const searchSpy = vi
				.spyOn(productsStore, "searchProducts")
				.mockResolvedValue();

			const wrapper = mount(POSProductSearch, {
				global: {
					stubs: {
						BaseInput: {
							template:
								'<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
							props: ["modelValue", "disabled"],
						},
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "loading"],
						},
					},
				},
			});

			const input = wrapper.find(".search-box input");
			await input.setValue("test");
			await wrapper.vm.$nextTick();

			const button = wrapper.find(".search-box button");
			await button.trigger("click");
			await wrapper.vm.$nextTick();

			expect(searchSpy).toHaveBeenCalledWith("test");
		});

		it("should trigger search on Enter key", async () => {
			const productsStore = useProductsStore();
			const searchSpy = vi
				.spyOn(productsStore, "searchProducts")
				.mockResolvedValue();

			const wrapper = mount(POSProductSearch, {
				global: {
					stubs: {
						BaseInput: {
							template:
								'<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup.enter="$emit(\'keyup.enter\')" />',
							props: ["modelValue", "disabled"],
						},
						BaseButton: true,
					},
				},
			});

			const input = wrapper.find(".search-box input");
			await input.setValue("test");
			await input.trigger("keyup.enter");
			await wrapper.vm.$nextTick();

			expect(searchSpy).toHaveBeenCalledWith("test");
		});

		it("should not search with empty query", async () => {
			const productsStore = useProductsStore();
			const searchSpy = vi
				.spyOn(productsStore, "searchProducts")
				.mockResolvedValue();

			const wrapper = mount(POSProductSearch, {
				global: {
					stubs: {
						BaseInput: {
							template:
								'<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
							props: ["modelValue", "disabled"],
						},
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "loading"],
						},
					},
				},
			});

			const button = wrapper.find(".search-box button");
			await button.trigger("click");
			await wrapper.vm.$nextTick();

			expect(searchSpy).not.toHaveBeenCalled();
		});

		it("should display search results", async () => {
			const productsStore = useProductsStore();
			productsStore.products = [
				{
					id: "prod-1",
					descricao: "Product 1",
					sku: "SKU001",
					gtin: "1234567890123",
					preco: 100,
					preco_unitario: 100,
					quantidadeEstoque: 10,
					ncm: "12345678",
					status: "ativo",
				},
				{
					id: "prod-2",
					descricao: "Product 2",
					sku: "SKU002",
					gtin: "1234567890124",
					preco: 200,
					preco_unitario: 200,
					quantidadeEstoque: 5,
					ncm: "12345678",
					status: "ativo",
				},
			];

			vi.spyOn(productsStore, "searchProducts").mockResolvedValue();

			const wrapper = mount(POSProductSearch, {
				global: {
					stubs: {
						BaseInput: {
							template:
								'<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
							props: ["modelValue", "disabled"],
						},
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "loading"],
						},
					},
				},
			});

			const input = wrapper.find(".search-box input");
			await input.setValue("test");

			const button = wrapper.find(".search-box button");
			await button.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".search-results").exists()).toBe(true);
			expect(wrapper.findAll(".product-item")).toHaveLength(2);
		});

		it("should display no results message when empty", async () => {
			const productsStore = useProductsStore();
			productsStore.products = [];
			vi.spyOn(productsStore, "searchProducts").mockResolvedValue();

			const wrapper = mount(POSProductSearch, {
				global: {
					stubs: {
						BaseInput: {
							template:
								'<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
							props: ["modelValue", "disabled"],
						},
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "loading"],
						},
					},
				},
			});

			const input = wrapper.find(".search-box input");
			await input.setValue("nonexistent");

			const button = wrapper.find(".search-box button");
			await button.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".no-results").exists()).toBe(true);
			expect(wrapper.find(".no-results").text()).toBe(
				"Nenhum produto encontrado",
			);
		});
	});

	describe("Product Selection", () => {
		it("should open quantity modal when product is clicked", async () => {
			const productsStore = useProductsStore();
			productsStore.products = [
				{
					id: "prod-1",
					descricao: "Product 1",
					sku: "SKU001",
					gtin: "1234567890123",
					preco: 100,
					preco_unitario: 100,
					quantidadeEstoque: 10,
					ncm: "12345678",
					status: "ativo",
				},
			];

			vi.spyOn(productsStore, "searchProducts").mockResolvedValue();

			const wrapper = mount(POSProductSearch, {
				global: {
					stubs: {
						BaseInput: {
							template:
								'<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
							props: ["modelValue", "disabled"],
						},
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "loading", "disabled"],
						},
					},
				},
			});

			const input = wrapper.find(".search-box input");
			await input.setValue("test");

			const button = wrapper.find(".search-box button");
			await button.trigger("click");
			await wrapper.vm.$nextTick();

			const productItem = wrapper.find(".product-item");
			await productItem.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".modal-overlay").exists()).toBe(true);
			expect(wrapper.find(".modal").exists()).toBe(true);
		});

		it("should show alert for inactive product", async () => {
			const alertSpy = vi.spyOn(window, "alert");
			const productsStore = useProductsStore();
			productsStore.products = [
				{
					id: "prod-1",
					descricao: "Inactive Product",
					sku: "SKU001",
					gtin: "1234567890123",
					preco: 100,
					preco_unitario: 100,
					quantidadeEstoque: 10,
					ncm: "12345678",
					status: "inativo",
				},
			];

			vi.spyOn(productsStore, "searchProducts").mockResolvedValue();

			const wrapper = mount(POSProductSearch, {
				global: {
					stubs: {
						BaseInput: {
							template:
								'<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
							props: ["modelValue", "disabled"],
						},
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "loading", "disabled"],
						},
					},
				},
			});

			const input = wrapper.find(".search-box input");
			await input.setValue("test");

			const button = wrapper.find(".search-box button");
			await button.trigger("click");
			await wrapper.vm.$nextTick();

			const productItem = wrapper.find(".product-item");
			await productItem.trigger("click");
			await wrapper.vm.$nextTick();

			expect(alertSpy).toHaveBeenCalledWith(
				"Este produto está inativo e não pode ser vendido.",
			);
			expect(wrapper.find(".modal-overlay").exists()).toBe(false);
		});
	});

	describe("Quantity Modal", () => {
		it("should display product name in modal header", async () => {
			const productsStore = useProductsStore();
			productsStore.products = [
				{
					id: "prod-1",
					descricao: "Test Product",
					sku: "SKU001",
					gtin: "1234567890123",
					preco: 100,
					preco_unitario: 100,
					quantidadeEstoque: 10,
					ncm: "12345678",
					status: "ativo",
				},
			];

			vi.spyOn(productsStore, "searchProducts").mockResolvedValue();

			const wrapper = mount(POSProductSearch, {
				global: {
					stubs: {
						BaseInput: {
							template:
								'<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
							props: ["modelValue", "disabled"],
						},
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "loading", "disabled"],
						},
					},
				},
			});

			const input = wrapper.find(".search-box input");
			await input.setValue("test");

			const button = wrapper.find(".search-box button");
			await button.trigger("click");
			await wrapper.vm.$nextTick();

			const productItem = wrapper.find(".product-item");
			await productItem.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".modal-header h3").text()).toBe("Test Product");
		});

		it("should have close button in modal", async () => {
			const productsStore = useProductsStore();
			productsStore.products = [
				{
					id: "prod-1",
					descricao: "Product 1",
					sku: "SKU001",
					gtin: "1234567890123",
					preco: 100,
					preco_unitario: 100,
					quantidadeEstoque: 10,
					ncm: "12345678",
					status: "ativo",
				},
			];

			vi.spyOn(productsStore, "searchProducts").mockResolvedValue();

			const wrapper = mount(POSProductSearch, {
				global: {
					stubs: {
						BaseInput: {
							template:
								'<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
							props: ["modelValue", "disabled"],
						},
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "loading", "disabled"],
						},
					},
				},
			});

			const input = wrapper.find(".search-box input");
			await input.setValue("test");

			const button = wrapper.find(".search-box button");
			await button.trigger("click");
			await wrapper.vm.$nextTick();

			const productItem = wrapper.find(".product-item");
			await productItem.trigger("click");
			await wrapper.vm.$nextTick();

			const closeButton = wrapper.find(".close-button");
			expect(closeButton.exists()).toBe(true);
			expect(closeButton.text()).toBe("×");
		});

		it("should close modal when close button is clicked", async () => {
			const productsStore = useProductsStore();
			productsStore.products = [
				{
					id: "prod-1",
					descricao: "Product 1",
					sku: "SKU001",
					gtin: "1234567890123",
					preco: 100,
					preco_unitario: 100,
					quantidadeEstoque: 10,
					ncm: "12345678",
					status: "ativo",
				},
			];

			vi.spyOn(productsStore, "searchProducts").mockResolvedValue();

			const wrapper = mount(POSProductSearch, {
				global: {
					stubs: {
						BaseInput: {
							template:
								'<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
							props: ["modelValue", "disabled"],
						},
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "loading", "disabled"],
						},
					},
				},
			});

			const input = wrapper.find(".search-box input");
			await input.setValue("test");

			const button = wrapper.find(".search-box button");
			await button.trigger("click");
			await wrapper.vm.$nextTick();

			const productItem = wrapper.find(".product-item");
			await productItem.trigger("click");
			await wrapper.vm.$nextTick();

			const closeButton = wrapper.find(".close-button");
			await closeButton.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".modal-overlay").exists()).toBe(false);
		});

		it("should have quantity input in modal", async () => {
			const productsStore = useProductsStore();
			productsStore.products = [
				{
					id: "prod-1",
					descricao: "Product 1",
					sku: "SKU001",
					gtin: "1234567890123",
					preco: 100,
					preco_unitario: 100,
					quantidadeEstoque: 10,
					ncm: "12345678",
					status: "ativo",
				},
			];

			vi.spyOn(productsStore, "searchProducts").mockResolvedValue();

			const wrapper = mount(POSProductSearch, {
				global: {
					stubs: {
						BaseInput: {
							template:
								'<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
							props: ["modelValue", "disabled"],
						},
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "loading", "disabled"],
						},
					},
				},
			});

			const input = wrapper.find(".search-box input");
			await input.setValue("test");

			const button = wrapper.find(".search-box button");
			await button.trigger("click");
			await wrapper.vm.$nextTick();

			const productItem = wrapper.find(".product-item");
			await productItem.trigger("click");
			await wrapper.vm.$nextTick();

			const quantityInput = wrapper.find("#quantity-input");
			expect(quantityInput.exists()).toBe(true);
			expect(quantityInput.element.value).toBe("1");
		});
	});

	describe("Add to Sale", () => {
		it("should emit add-product event when adding to sale", async () => {
			const productsStore = useProductsStore();
			productsStore.products = [
				{
					id: "prod-1",
					descricao: "Product 1",
					sku: "SKU001",
					gtin: "1234567890123",
					preco: 100,
					preco_unitario: 100,
					quantidadeEstoque: 10,
					ncm: "12345678",
					status: "ativo",
				},
			];

			vi.spyOn(productsStore, "searchProducts").mockResolvedValue();

			const wrapper = mount(POSProductSearch, {
				global: {
					stubs: {
						BaseInput: {
							template:
								'<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
							props: ["modelValue", "disabled"],
						},
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "loading", "disabled"],
						},
					},
				},
			});

			const input = wrapper.find(".search-box input");
			await input.setValue("test");

			const searchButton = wrapper.find(".search-box button");
			await searchButton.trigger("click");
			await wrapper.vm.$nextTick();

			const productItem = wrapper.find(".product-item");
			await productItem.trigger("click");
			await wrapper.vm.$nextTick();

			const addButton = wrapper
				.findAll(".modal-actions button")
				.find((btn) => btn.text() === "Adicionar");
			await addButton?.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.emitted("add-product")).toBeTruthy();
			expect(wrapper.emitted("add-product")?.[0]).toEqual([
				{
					id: "prod-1",
					price: 100,
					quantity: 1,
				},
			]);
		});

		it("should close modal and clear search after adding", async () => {
			const productsStore = useProductsStore();
			productsStore.products = [
				{
					id: "prod-1",
					descricao: "Product 1",
					sku: "SKU001",
					gtin: "1234567890123",
					preco: 100,
					preco_unitario: 100,
					quantidadeEstoque: 10,
					ncm: "12345678",
					status: "ativo",
				},
			];

			vi.spyOn(productsStore, "searchProducts").mockResolvedValue();

			const wrapper = mount(POSProductSearch, {
				global: {
					stubs: {
						BaseInput: {
							template:
								'<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
							props: ["modelValue", "disabled"],
						},
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "loading", "disabled"],
						},
					},
				},
			});

			const input = wrapper.find(".search-box input");
			await input.setValue("test");

			const searchButton = wrapper.find(".search-box button");
			await searchButton.trigger("click");
			await wrapper.vm.$nextTick();

			const productItem = wrapper.find(".product-item");
			await productItem.trigger("click");
			await wrapper.vm.$nextTick();

			const addButton = wrapper
				.findAll(".modal-actions button")
				.find((btn) => btn.text() === "Adicionar");
			await addButton?.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".modal-overlay").exists()).toBe(false);
			expect(wrapper.find(".search-results").exists()).toBe(false);
		});
	});
});
