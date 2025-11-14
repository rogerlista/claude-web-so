/**
 * Tests for POSCheckoutView
 * Phase 6: T041-T042 - Checkout/Payment View
 */

import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { useSalesStore } from "../../stores/sales";
import POSCheckoutView from "./POSCheckoutView.vue";

describe("POSCheckoutView", () => {
	let router: ReturnType<typeof createRouter>;

	const createDefaultStubs = () => ({
		POSPaymentPanel: {
			template: '<div class="pos-payment-panel">PaymentPanel</div>',
			props: ["payments", "total"],
		},
		BaseButton: true,
	});

	const mockSale = {
		id: "SALE-123",
		items: [
			{
				productId: "p1",
				productName: "Produto 1",
				quantity: 2,
				unitPrice: 10,
				subtotal: 20,
			},
			{
				productId: "p2",
				productName: "Produto 2",
				quantity: 1,
				unitPrice: 30,
				subtotal: 30,
			},
		],
		grossTotal: 50,
		discount: 5,
		netTotal: 45,
		payments: [],
		status: "open" as const,
		customerCpf: undefined,
		customerEmail: undefined,
	};

	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();

		router = createRouter({
			history: createMemoryHistory(),
			routes: [
				{ path: "/", component: { template: "Home" } },
				{ path: "/pos", component: { template: "POS" } },
				{
					path: "/pos/checkout/:id",
					name: "pos-checkout",
					component: POSCheckoutView,
				},
			],
		});

		// Set initial route
		router.push("/pos/checkout/SALE-123");
	});

	describe("Render", () => {
		it("should render correctly", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".pos-checkout-view").exists()).toBe(true);
		});

		it("should display header title", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			expect(wrapper.find(".checkout-header h1").text()).toBe(
				"Finalizar Venda",
			);
		});

		it("should display sale ID", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			expect(wrapper.find(".sale-id").text()).toBe("SALE-123");
		});

		it("should have back button", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const backButton = wrapper.find(".back-button");
			expect(backButton.exists()).toBe(true);
			expect(backButton.text()).toContain("Voltar");
		});
	});

	describe("Loading State", () => {
		it("should show loading state when no sale", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = null;
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".loading-state").exists()).toBe(true);
			expect(wrapper.text()).toContain("Carregando venda...");
		});

		it("should not show content when loading", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = null;
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".checkout-content").exists()).toBe(false);
		});
	});

	describe("Error Display", () => {
		it("should show error message when salesStore has error", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
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
	});

	describe("Sale Summary", () => {
		it("should display items count", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			await wrapper.vm.$nextTick();

			expect(wrapper.text()).toContain("Itens (2)");
		});

		it("should display all items", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			await wrapper.vm.$nextTick();

			const items = wrapper.findAll(".summary-item");
			expect(items).toHaveLength(2);
			expect(wrapper.text()).toContain("Produto 1");
			expect(wrapper.text()).toContain("Produto 2");
		});

		it("should display subtotal", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			await wrapper.vm.$nextTick();

			expect(wrapper.text()).toContain("Subtotal:");
			expect(wrapper.text()).toContain("50,00");
		});

		it("should display discount when present", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			await wrapper.vm.$nextTick();

			const discountLine = wrapper.find(".total-line.discount");
			expect(discountLine.exists()).toBe(true);
			expect(discountLine.text()).toContain("Desconto:");
			expect(discountLine.text()).toContain("5,00");
		});

		it("should not display discount line when zero", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = {
				...mockSale,
				discount: 0,
			} as any;
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".total-line.discount").exists()).toBe(false);
		});

		it("should display total", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			await wrapper.vm.$nextTick();

			const totalLine = wrapper.find(".total-line.total");
			expect(totalLine.exists()).toBe(true);
			expect(totalLine.text()).toContain("Total:");
			expect(totalLine.text()).toContain("45,00");
		});
	});

	describe("Customer Information", () => {
		it("should have CPF input", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			await wrapper.vm.$nextTick();

			const cpfInput = wrapper.find("#cpf");
			expect(cpfInput.exists()).toBe(true);
		});

		it("should have email input", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			await wrapper.vm.$nextTick();

			const emailInput = wrapper.find("#email");
			expect(emailInput.exists()).toBe(true);
		});

		it("should format CPF on input", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			await wrapper.vm.$nextTick();

			const cpfInput = wrapper.find("#cpf");
			await cpfInput.setValue("12345678901");
			await cpfInput.trigger("input");
			await wrapper.vm.$nextTick();

			expect(cpfInput.element.value).toBe("123.456.789-01");
		});

		it("should validate invalid CPF", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			await wrapper.vm.$nextTick();

			const cpfInput = wrapper.find("#cpf");
			await cpfInput.setValue("123");
			await cpfInput.trigger("input");
			await cpfInput.trigger("blur");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".field-error").exists()).toBe(true);
			expect(wrapper.text()).toContain("CPF deve ter 11 dígitos");
		});

		it("should reject CPF with all same digits", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			await wrapper.vm.$nextTick();

			const cpfInput = wrapper.find("#cpf");
			await cpfInput.setValue("11111111111");
			await cpfInput.trigger("input");
			await cpfInput.trigger("blur");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".field-error").exists()).toBe(true);
			expect(wrapper.text()).toContain("CPF inválido");
		});

		it("should validate invalid email", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			await wrapper.vm.$nextTick();

			const emailInput = wrapper.find("#email");
			await emailInput.setValue("invalid-email");
			await emailInput.trigger("blur");
			await wrapper.vm.$nextTick();

			expect(wrapper.findAll(".field-error").length).toBeGreaterThan(0);
			expect(wrapper.text()).toContain("E-mail inválido");
		});

		it("should accept valid email", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			await wrapper.vm.$nextTick();

			const emailInput = wrapper.find("#email");
			await emailInput.setValue("test@example.com");
			await emailInput.trigger("blur");
			await wrapper.vm.$nextTick();

			const errorFields = wrapper.findAll(".field-error");
			const hasEmailError = errorFields.some((field) =>
				field.text().includes("E-mail inválido"),
			);
			expect(hasEmailError).toBe(false);
		});
	});

	describe("Payment Section", () => {
		it("should render POSPaymentPanel component", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".pos-payment-panel").exists()).toBe(true);
		});
	});

	describe("Navigation", () => {
		it("should call router.push when back button clicked", async () => {
			await router.isReady();

			const pushSpy = vi.spyOn(router, "push");

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			await wrapper.vm.$nextTick();

			const backButton = wrapper.find(".back-button");
			await backButton.trigger("click");

			expect(pushSpy).toHaveBeenCalledWith("/pos");
		});
	});

	describe("Success Modal", () => {
		it("should not show success modal initially", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: createDefaultStubs(),
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".success-modal").exists()).toBe(false);
		});

		it("should show success modal after finalize", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: {
						...createDefaultStubs(),
						POSPaymentPanel: {
							template:
								'<div class="pos-payment-panel"><button @click="$emit(\'complete\')">Complete</button></div>',
							props: ["payments", "total"],
						},
					},
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			vi.spyOn(salesStore, "finalizeSale").mockResolvedValue(true);
			await wrapper.vm.$nextTick();

			const completeButton = wrapper.find(".pos-payment-panel button");
			await completeButton.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".success-modal").exists()).toBe(true);
		});

		it("should display sale information in success modal", async () => {
			await router.isReady();

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: {
						...createDefaultStubs(),
						POSPaymentPanel: {
							template:
								'<div class="pos-payment-panel"><button @click="$emit(\'complete\')">Complete</button></div>',
							props: ["payments", "total"],
						},
					},
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			vi.spyOn(salesStore, "finalizeSale").mockResolvedValue(true);
			await wrapper.vm.$nextTick();

			const completeButton = wrapper.find(".pos-payment-panel button");
			await completeButton.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.text()).toContain("Venda Finalizada!");
			expect(wrapper.text()).toContain("SALE-123");
			expect(wrapper.text()).toContain("45,00");
		});

		it("should call window.print when print receipt clicked", async () => {
			await router.isReady();

			global.window.print = vi.fn();
			const printSpy = vi.spyOn(global.window, "print");

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: {
						...createDefaultStubs(),
						POSPaymentPanel: {
							template:
								'<div class="pos-payment-panel"><button @click="$emit(\'complete\')">Complete</button></div>',
							props: ["payments", "total"],
						},
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant"],
						},
					},
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			vi.spyOn(salesStore, "finalizeSale").mockResolvedValue(true);
			await wrapper.vm.$nextTick();

			const completeButton = wrapper.find(".pos-payment-panel button");
			await completeButton.trigger("click");
			await wrapper.vm.$nextTick();

			const printButton = wrapper
				.findAll(".modal-actions button")
				.find((btn) => btn.text().includes("Imprimir"));
			await printButton?.trigger("click");

			expect(printSpy).toHaveBeenCalled();
		});

		it("should call clearSale and navigate when Nova Venda clicked", async () => {
			await router.isReady();

			const pushSpy = vi.spyOn(router, "push");

			const wrapper = mount(POSCheckoutView, {
				global: {
					plugins: [router],
					stubs: {
						...createDefaultStubs(),
						POSPaymentPanel: {
							template:
								'<div class="pos-payment-panel"><button @click="$emit(\'complete\')">Complete</button></div>',
							props: ["payments", "total"],
						},
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant"],
						},
					},
				},
			});

			const salesStore = useSalesStore();
			salesStore.currentSale = mockSale as any;
			vi.spyOn(salesStore, "finalizeSale").mockResolvedValue(true);
			const clearSaleSpy = vi.spyOn(salesStore, "clearSale");
			await wrapper.vm.$nextTick();

			const completeButton = wrapper.find(".pos-payment-panel button");
			await completeButton.trigger("click");
			await wrapper.vm.$nextTick();

			const novaVendaButton = wrapper
				.findAll(".modal-actions button")
				.find((btn) => btn.text().includes("Nova Venda"));
			await novaVendaButton?.trigger("click");

			expect(clearSaleSpy).toHaveBeenCalled();
			expect(pushSpy).toHaveBeenCalledWith("/pos");
		});
	});
});
