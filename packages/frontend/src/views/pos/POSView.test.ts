/**
 * Tests for POSView
 * Phase 6: T036-T037 - Main POS Screen Component
 */

import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRouter, createMemoryHistory } from "vue-router";
import POSView from "./POSView.vue";
import { useSalesStore } from "../../stores/sales";

describe("POSView", () => {
	let router: ReturnType<typeof createRouter>;

	const createDefaultStubs = () => ({
		POSProductSearch: {
			template: '<div class="pos-product-search">ProductSearch</div>',
		},
		POSItemList: {
			template: '<div class="pos-item-list">ItemList</div>',
			props: ["items", "loading"],
		},
		POSDiscountModal: {
			template: '<div class="pos-discount-modal">DiscountModal</div>',
			props: ["currentDiscount", "maxDiscount"],
		},
		BaseButton: true,
	});

	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
		global.confirm = vi.fn(() => true);

		router = createRouter({
			history: createMemoryHistory(),
			routes: [
				{ path: "/", component: { template: "Home" } },
				{
					path: "/pos/checkout/:id",
					name: "pos-checkout",
					component: { template: "Checkout" },
				},
			],
		});
	});

	describe("Render", () => {
		it("should render correctly", () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			expect(wrapper.find(".pos-view").exists()).toBe(true);
		});

		it("should display header title", () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			expect(wrapper.find(".pos-header h1").text()).toBe("PDV - Ponto de Venda");
		});

		it("should show 'Nenhuma venda iniciada' when no current sale", () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = null;

			wrapper.vm.$nextTick();

			expect(wrapper.find(".no-sale").exists()).toBe(true);
			expect(wrapper.find(".no-sale").text()).toBe("Nenhuma venda iniciada");
		});

		it("should display sale ID when sale exists", async () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = {
				id: "SALE-123",
				items: [],
				grossTotal: 0,
				discount: 0,
				netTotal: 0,
				status: "open",
			} as any;

			await wrapper.vm.$nextTick();

			expect(wrapper.find(".sale-id").exists()).toBe(true);
			expect(wrapper.find(".sale-id").text()).toContain("SALE-123");
		});
	});

	describe("Error Display", () => {
		it("should show error message when salesStore has error", async () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.error = "Test error message";

			await wrapper.vm.$nextTick();

			expect(wrapper.find(".error-message").exists()).toBe(true);
			expect(wrapper.find(".error-message").text()).toBe("Test error message");
		});

		it("should not show error message when no error", () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.error = "";

			wrapper.vm.$nextTick();

			expect(wrapper.find(".error-message").exists()).toBe(false);
		});
	});

	describe("Child Components", () => {
		it("should render POSProductSearch component", () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			expect(wrapper.find(".pos-product-search").exists()).toBe(true);
		});

		it("should render POSItemList component", () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			expect(wrapper.find(".pos-item-list").exists()).toBe(true);
		});

		it("should not show discount modal initially", () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			expect(wrapper.find(".pos-discount-modal").exists()).toBe(false);
		});
	});

	describe("Totals Display", () => {
		it("should display subtotal", async () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = {
				id: "SALE-123",
				items: [],
				grossTotal: 100,
				discount: 0,
				netTotal: 100,
				status: "open",
			} as any;

			await wrapper.vm.$nextTick();

			expect(wrapper.text()).toContain("Subtotal:");
			expect(wrapper.text()).toContain("100,00");
		});

		it("should display discount when present", async () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = {
				id: "SALE-123",
				items: [],
				grossTotal: 100,
				discount: 10,
				netTotal: 90,
				status: "open",
			} as any;

			await wrapper.vm.$nextTick();

			const discountRow = wrapper.find(".total-row.discount");
			expect(discountRow.exists()).toBe(true);
			expect(discountRow.text()).toContain("Desconto:");
			expect(discountRow.text()).toContain("10,00");
		});

		it("should not display discount row when discount is zero", async () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = {
				id: "SALE-123",
				items: [],
				grossTotal: 100,
				discount: 0,
				netTotal: 100,
				status: "open",
			} as any;

			await wrapper.vm.$nextTick();

			expect(wrapper.find(".total-row.discount").exists()).toBe(false);
		});

		it("should display total", async () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = {
				id: "SALE-123",
				items: [],
				grossTotal: 100,
				discount: 10,
				netTotal: 90,
				status: "open",
			} as any;

			await wrapper.vm.$nextTick();

			const totalRow = wrapper.find(".total-row.total");
			expect(totalRow.exists()).toBe(true);
			expect(totalRow.text()).toContain("Total:");
			expect(totalRow.text()).toContain("90,00");
		});

		it("should display items count", async () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			Object.defineProperty(salesStore, "totalItems", {
				get: () => 5,
				configurable: true,
			});

			await wrapper.vm.$nextTick();

			const itemsRow = wrapper.find(".total-row.items-count");
			expect(itemsRow.exists()).toBe(true);
			expect(itemsRow.text()).toContain("Itens:");
			expect(itemsRow.text()).toContain("5");
		});
	});

	describe("Action Buttons - No Sale", () => {
		it("should show Nova Venda button when no current sale", async () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: {
						...createDefaultStubs(),
						...createDefaultStubs(),
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "size", "loading", "disabled"],
						},
					},
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = null;

			await wrapper.vm.$nextTick();

			const buttons = wrapper.findAll(".pos-actions button");
			expect(buttons.length).toBe(1);
			expect(buttons[0]?.text()).toBe("Nova Venda");
		});

		it("should call createSale when Nova Venda clicked", async () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: {
						...createDefaultStubs(),
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "size", "loading", "disabled"],
						},
					},
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = null;
			const createSaleSpy = vi
				.spyOn(salesStore, "createSale")
				.mockResolvedValue();

			await wrapper.vm.$nextTick();

			const novaVendaButton = wrapper
				.findAll(".pos-actions button")
				.find((btn) => btn.text() === "Nova Venda");
			await novaVendaButton?.trigger("click");

			expect(createSaleSpy).toHaveBeenCalled();
		});
	});

	describe("Action Buttons - With Sale", () => {
		it("should show action buttons when sale exists", async () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: {
						...createDefaultStubs(),
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "size", "loading", "disabled"],
						},
					},
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = {
				id: "SALE-123",
				items: [{ productId: "p1", quantity: 1, unitPrice: 10, subtotal: 10 }],
				grossTotal: 10,
				discount: 0,
				netTotal: 10,
				status: "open",
			} as any;
			Object.defineProperty(salesStore, "hasItems", {
				get: () => true,
				configurable: true,
			});

			await wrapper.vm.$nextTick();

			expect(wrapper.text()).toContain("Aplicar Desconto");
			expect(wrapper.text()).toContain("Finalizar Venda (F2)");
			expect(wrapper.text()).toContain("Cancelar Venda");
		});

		it("should disable action buttons when no items", async () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: {
						...createDefaultStubs(),
						BaseButton: {
							template:
								'<button v-bind="$attrs" :disabled="disabled"><slot></slot></button>',
							props: ["variant", "size", "loading", "disabled"],
						},
					},
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = {
				id: "SALE-123",
				items: [],
				grossTotal: 0,
				discount: 0,
				netTotal: 0,
				status: "open",
			} as any;
			Object.defineProperty(salesStore, "hasItems", {
				get: () => false,
				configurable: true,
			});

			await wrapper.vm.$nextTick();

			const discountButton = wrapper
				.findAll(".pos-actions button")
				.find((btn) => btn.text().includes("Aplicar Desconto"));
			const checkoutButton = wrapper
				.findAll(".pos-actions button")
				.find((btn) => btn.text().includes("Finalizar Venda"));

			expect(discountButton?.attributes("disabled")).toBeDefined();
			expect(checkoutButton?.attributes("disabled")).toBeDefined();
		});
	});

	describe("Discount Modal", () => {
		it("should show discount modal when Aplicar Desconto clicked", async () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: {
						...createDefaultStubs(),
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "size", "loading", "disabled"],
						},
					},
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = {
				id: "SALE-123",
				items: [{ productId: "p1", quantity: 1, unitPrice: 10, subtotal: 10 }],
				grossTotal: 10,
				discount: 0,
				netTotal: 10,
				status: "open",
			} as any;
			Object.defineProperty(salesStore, "hasItems", {
				get: () => true,
				configurable: true,
			});

			await wrapper.vm.$nextTick();

			const discountButton = wrapper
				.findAll(".pos-actions button")
				.find((btn) => btn.text().includes("Aplicar Desconto"));
			await discountButton?.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".pos-discount-modal").exists()).toBe(true);
		});
	});

	describe("Cancel Sale", () => {
		it("should show confirmation when Cancelar Venda clicked", async () => {
			const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: {
						...createDefaultStubs(),
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "size", "loading", "disabled"],
						},
					},
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = {
				id: "SALE-123",
				items: [],
				grossTotal: 0,
				discount: 0,
				netTotal: 0,
				status: "open",
			} as any;

			await wrapper.vm.$nextTick();

			const cancelButton = wrapper
				.findAll(".pos-actions button")
				.find((btn) => btn.text().includes("Cancelar Venda"));
			await cancelButton?.trigger("click");

			expect(confirmSpy).toHaveBeenCalledWith(
				"Tem certeza que deseja cancelar esta venda?",
			);
		});

		it("should call clearSale when confirmed", async () => {
			global.confirm = vi.fn(() => true);

			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: {
						...createDefaultStubs(),
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "size", "loading", "disabled"],
						},
					},
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = {
				id: "SALE-123",
				items: [],
				grossTotal: 0,
				discount: 0,
				netTotal: 0,
				status: "open",
			} as any;
			const clearSaleSpy = vi.spyOn(salesStore, "clearSale");

			await wrapper.vm.$nextTick();

			const cancelButton = wrapper
				.findAll(".pos-actions button")
				.find((btn) => btn.text().includes("Cancelar Venda"));
			await cancelButton?.trigger("click");

			expect(clearSaleSpy).toHaveBeenCalled();
		});

		it("should not call clearSale when cancelled", async () => {
			global.confirm = vi.fn(() => false);

			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: {
						...createDefaultStubs(),
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "size", "loading", "disabled"],
						},
					},
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = {
				id: "SALE-123",
				items: [],
				grossTotal: 0,
				discount: 0,
				netTotal: 0,
				status: "open",
			} as any;
			const clearSaleSpy = vi.spyOn(salesStore, "clearSale");

			await wrapper.vm.$nextTick();

			const cancelButton = wrapper
				.findAll(".pos-actions button")
				.find((btn) => btn.text().includes("Cancelar Venda"));
			await cancelButton?.trigger("click");

			expect(clearSaleSpy).not.toHaveBeenCalled();
		});
	});

	describe("Checkout Navigation", () => {
		it("should navigate to checkout when Finalizar Venda clicked", async () => {
			const wrapper = mount(POSView, {
				global: {
					plugins: [router],
					stubs: {
						...createDefaultStubs(),
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "size", "loading", "disabled"],
						},
					},
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = {
				id: "SALE-123",
				items: [{ productId: "p1", quantity: 1, unitPrice: 10, subtotal: 10 }],
				grossTotal: 10,
				discount: 0,
				netTotal: 10,
				status: "open",
			} as any;
			Object.defineProperty(salesStore, "hasItems", {
				get: () => true,
				configurable: true,
			});

			await wrapper.vm.$nextTick();

			const checkoutButton = wrapper
				.findAll(".pos-actions button")
				.find((btn) => btn.text().includes("Finalizar Venda"));
			await checkoutButton?.trigger("click");
			await router.isReady();

			expect(router.currentRoute.value.path).toBe("/pos/checkout/SALE-123");
		});
	});
});
