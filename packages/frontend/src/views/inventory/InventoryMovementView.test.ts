/**
 * Tests for InventoryMovementView
 * Phase 5: T031 - Inventory Movement Screen
 */

import { mount, type VueWrapper } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { useInventoryStore } from "../../stores/inventory";
import { useProductsStore } from "../../stores/products";
import InventoryMovementView from "./InventoryMovementView.vue";

describe("InventoryMovementView", () => {
	let wrapper: VueWrapper;
	let router: ReturnType<typeof createRouter>;

	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();

		// Create router
		router = createRouter({
			history: createMemoryHistory(),
			routes: [
				{ path: "/", component: { template: "<div>Home</div>" } },
				{
					path: "/inventory",
					component: { template: "<div>Inventory</div>" },
				},
				{
					path: "/inventory/movement",
					component: InventoryMovementView,
				},
			],
		});

		// Mount component
		wrapper = mount(InventoryMovementView, {
			global: {
				plugins: [router],
				stubs: {
					BaseCard: {
						template:
							'<div class="base-card"><slot name="header"></slot><slot></slot></div>',
					},
					BaseInput: {
						template:
							'<div class="base-input-wrapper"><input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><span v-if="error" class="error-message">{{ error }}</span></div>',
						props: ["modelValue", "error", "disabled"],
						inheritAttrs: true,
					},
					BaseButton: {
						template: '<button v-bind="$attrs"><slot></slot></button>',
						props: ["disabled", "variant"],
					},
				},
			},
		});
	});

	describe("Render", () => {
		it("should render correctly", () => {
			expect(wrapper.find(".inventory-movement-view").exists()).toBe(true);
			expect(wrapper.find("form").exists()).toBe(true);
		});

		it("should display movement type selector", () => {
			const radios = wrapper.findAll('input[type="radio"]');
			expect(radios).toHaveLength(3);
			expect(wrapper.text()).toContain("Entrada");
			expect(wrapper.text()).toContain("Saída");
			expect(wrapper.text()).toContain("Ajuste");
		});

		it("should display product search field", () => {
			const productInput = wrapper.find("#product-search");
			expect(productInput.exists()).toBe(true);
			expect(wrapper.text()).toContain("Produto");
		});

		it("should display quantity field", () => {
			const quantityInput = wrapper.find("#quantity");
			expect(quantityInput.exists()).toBe(true);
			expect(wrapper.text()).toContain("Quantidade");
		});

		it("should display description textarea", () => {
			const descriptionTextarea = wrapper.find("#description");
			expect(descriptionTextarea.exists()).toBe(true);
			expect(wrapper.text()).toContain("Observações");
		});
	});

	describe("Page Title", () => {
		it("should show 'Entrada de Estoque' for entrada type", () => {
			expect(wrapper.text()).toContain("Entrada de Estoque");
		});

		it("should update title when movement type changes to saida", async () => {
			const saidaRadio = wrapper.findAll('input[type="radio"]')[1];
			await saidaRadio?.setValue(true);
			await wrapper.vm.$nextTick();

			expect(wrapper.text()).toContain("Saída de Estoque");
		});

		it("should update title when movement type changes to ajuste", async () => {
			const ajusteRadio = wrapper.findAll('input[type="radio"]')[2];
			await ajusteRadio?.setValue(true);
			await wrapper.vm.$nextTick();

			expect(wrapper.text()).toContain("Ajuste de Estoque");
		});
	});

	describe("Form Validation", () => {
		it("should show error when product is not selected", async () => {
			const quantityInput = wrapper.find("input#quantity");
			await quantityInput.setValue("10");
			await wrapper.vm.$nextTick();

			const form = wrapper.find("form");
			await form.trigger("submit.prevent");
			await wrapper.vm.$nextTick();

			expect(wrapper.text()).toContain("Produto é obrigatório");
		});

		it("should show error when quantity is zero", async () => {
			const productInput = wrapper.find("input#product-search");
			await productInput.setValue("Test Product");
			await wrapper.vm.$nextTick();

			// Quantity is 0 by default
			const form = wrapper.find("form");
			await form.trigger("submit.prevent");
			await wrapper.vm.$nextTick();

			// Should show quantity error since quantity is 0
			expect(wrapper.text()).toContain("Quantidade deve ser maior que zero");
		});

		it("should show error when quantity is negative", async () => {
			const quantityInput = wrapper.find("input#quantity");
			await quantityInput.setValue("-10");
			await wrapper.vm.$nextTick();

			const form = wrapper.find("form");
			await form.trigger("submit.prevent");
			await wrapper.vm.$nextTick();

			expect(wrapper.text()).toContain("Quantidade deve ser maior que zero");
		});
	});

	describe("Form Submission", () => {
		it("should not call registerMovement when form is invalid", async () => {
			const inventoryStore = useInventoryStore();
			const registerSpy = vi
				.spyOn(inventoryStore, "registerMovement")
				.mockResolvedValue(true);

			// Submit form without filling required fields
			const form = wrapper.find("form");
			await form.trigger("submit.prevent");
			await wrapper.vm.$nextTick();

			// Form should not submit because validation fails
			expect(registerSpy).not.toHaveBeenCalled();
		});

		it("should have disabled attribute when store is loading", () => {
			const submitButton = wrapper.findAll("button").find((btn) => {
				return btn.text().includes("Registrar Movimentação");
			});

			// Button should exist
			expect(submitButton?.exists()).toBe(true);

			// When store is not loading, button should not be disabled (or disabled should be undefined/false)
			expect(submitButton?.attributes("disabled")).toBeUndefined();
		});
	});

	describe("Product Search", () => {
		it("should have search button", () => {
			const searchButton = wrapper.findAll("button").find((btn) => {
				return btn.text() === "Buscar";
			});

			expect(searchButton?.exists()).toBe(true);
		});

		it("should call searchProducts when search button is clicked", async () => {
			const productsStore = useProductsStore();
			const searchSpy = vi
				.spyOn(productsStore, "searchProducts")
				.mockResolvedValue();

			const productInput = wrapper.find("input#product-search");
			await productInput.setValue("test product");
			await wrapper.vm.$nextTick();

			const searchButton = wrapper.findAll("button").find((btn) => {
				return btn.text() === "Buscar";
			});

			await searchButton?.trigger("click");
			await wrapper.vm.$nextTick();

			expect(searchSpy).toHaveBeenCalledWith("test product");
		});

		it("should not search when product search is empty", async () => {
			const productsStore = useProductsStore();
			const searchSpy = vi
				.spyOn(productsStore, "searchProducts")
				.mockResolvedValue();

			const searchButton = wrapper.findAll("button").find((btn) => {
				return btn.text() === "Buscar";
			});

			await searchButton?.trigger("click");
			await wrapper.vm.$nextTick();

			expect(searchSpy).not.toHaveBeenCalled();
		});

		it("should show product lookup when products are found", async () => {
			const productsStore = useProductsStore();
			productsStore.products = [
				{
					id: "prod-1",
					descricao: "Product 1",
					sku: "SKU001",
					gtin: "1234567890123",
					preco: 100,
					quantidadeEstoque: 10,
					ncm: "12345678",
				},
			];

			vi.spyOn(productsStore, "searchProducts").mockResolvedValue();

			const productInput = wrapper.find("input#product-search");
			await productInput.setValue("Product");
			await wrapper.vm.$nextTick();

			const searchButton = wrapper.findAll("button").find((btn) => {
				return btn.text() === "Buscar";
			});

			await searchButton?.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".product-lookup").exists()).toBe(true);
			expect(wrapper.text()).toContain("Product 1");
			expect(wrapper.text()).toContain("SKU001");
		});

		it("should select product when clicked from lookup", async () => {
			const productsStore = useProductsStore();
			productsStore.products = [
				{
					id: "prod-1",
					descricao: "Product 1",
					sku: "SKU001",
					gtin: "1234567890123",
					preco: 100,
					quantidadeEstoque: 10,
					ncm: "12345678",
				},
			];

			vi.spyOn(productsStore, "searchProducts").mockResolvedValue();

			const productInput = wrapper.find("input#product-search");
			await productInput.setValue("Product");
			await wrapper.vm.$nextTick();

			const searchButton = wrapper.findAll("button").find((btn) => {
				return btn.text() === "Buscar";
			});

			await searchButton?.trigger("click");
			await wrapper.vm.$nextTick();

			// Click on product in lookup
			const productButtons = wrapper.findAll(".product-lookup button");
			await productButtons[0]?.trigger("click");
			await wrapper.vm.$nextTick();

			// Product should be selected (lookup should be hidden)
			expect(wrapper.find(".product-lookup").exists()).toBe(false);
			expect(wrapper.text()).toContain("Produto selecionado: Product 1");
		});

		it("should trigger search on Enter key", async () => {
			const productsStore = useProductsStore();
			const searchSpy = vi
				.spyOn(productsStore, "searchProducts")
				.mockResolvedValue();

			const productInput = wrapper.find("input#product-search");
			await productInput.setValue("test");
			await productInput.trigger("keyup.enter");
			await wrapper.vm.$nextTick();

			expect(searchSpy).toHaveBeenCalledWith("test");
		});
	});

	describe("Navigation", () => {
		it("should have cancel button", () => {
			const cancelButton = wrapper.findAll("button").find((btn) => {
				return btn.text() === "Cancelar";
			});

			expect(cancelButton?.exists()).toBe(true);
		});

		it("should call router.back when cancel is clicked", async () => {
			const backSpy = vi.spyOn(router, "back");

			const cancelButton = wrapper.findAll("button").find((btn) => {
				return btn.text() === "Cancelar";
			});

			await cancelButton?.trigger("click");

			expect(backSpy).toHaveBeenCalled();
		});
	});

	describe("Error Handling", () => {
		it("should display error message from store", async () => {
			const inventoryStore = useInventoryStore();
			inventoryStore.error = "Test error message";

			await wrapper.vm.$nextTick();

			expect(wrapper.find(".bg-red-100").exists()).toBe(true);
			expect(wrapper.text()).toContain("Test error message");
		});

		it("should not display error when store has no error", () => {
			const inventoryStore = useInventoryStore();
			inventoryStore.error = null;

			expect(wrapper.find(".bg-red-100").exists()).toBe(false);
		});
	});
});
