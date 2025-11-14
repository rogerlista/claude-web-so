/**
 * Tests for POSPaymentPanel
 * Phase 6: T043 - Payment Methods Selection and Management
 */

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import POSPaymentPanel from "./POSPaymentPanel.vue";

describe("POSPaymentPanel", () => {
	const defaultProps = {
		payments: [],
		total: 100,
	};

	describe("Render", () => {
		it("should render correctly", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			expect(wrapper.find(".pos-payment-panel").exists()).toBe(true);
		});

		it("should display header title", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			expect(wrapper.find("h2").text()).toBe("Pagamento");
		});
	});

	describe("Payment Summary", () => {
		it("should display total amount", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			expect(wrapper.text()).toContain("Total da Venda:");
			expect(wrapper.text()).toContain("R$");
			expect(wrapper.text()).toContain("100,00");
		});

		it("should display paid amount as zero when no payments", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const paidRow = wrapper.find(".summary-row.paid");
			expect(paidRow.text()).toContain("Valor Pago:");
			expect(paidRow.text()).toContain("0,00");
		});

		it("should display remaining amount", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const remainingRow = wrapper.find(".summary-row.remaining");
			expect(remainingRow.text()).toContain("Restante:");
			expect(remainingRow.text()).toContain("100,00");
		});

		it("should calculate paid amount from payments", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: {
					payments: [
						{
							paymentMethod: { code: "01", description: "Dinheiro" },
							amount: 30,
						},
						{
							paymentMethod: {
								code: "03",
								description: "Cartão de Crédito",
							},
							amount: 20,
						},
					],
					total: 100,
				},
				global: {
					stubs: { BaseButton: true },
				},
			});

			const paidRow = wrapper.find(".summary-row.paid");
			expect(paidRow.text()).toContain("50,00");
		});

		it("should calculate remaining amount correctly", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: {
					payments: [
						{
							paymentMethod: { code: "01", description: "Dinheiro" },
							amount: 60,
						},
					],
					total: 100,
				},
				global: {
					stubs: { BaseButton: true },
				},
			});

			const remainingRow = wrapper.find(".summary-row.remaining");
			expect(remainingRow.text()).toContain("40,00");
		});

		it("should show 'Troco:' label when overpaid", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: {
					payments: [
						{
							paymentMethod: { code: "01", description: "Dinheiro" },
							amount: 120,
						},
					],
					total: 100,
				},
				global: {
					stubs: { BaseButton: true },
				},
			});

			const remainingRow = wrapper.find(".summary-row.remaining");
			expect(remainingRow.text()).toContain("Troco:");
			expect(remainingRow.text()).toContain("20,00");
		});

		it("should add complete class when fully paid", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: {
					payments: [
						{
							paymentMethod: { code: "01", description: "Dinheiro" },
							amount: 100,
						},
					],
					total: 100,
				},
				global: {
					stubs: { BaseButton: true },
				},
			});

			const remainingRow = wrapper.find(".summary-row.remaining");
			expect(remainingRow.classes()).toContain("complete");
		});
	});

	describe("Payments List", () => {
		it("should not show payments list when no payments", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			expect(wrapper.find(".payments-list").exists()).toBe(false);
		});

		it("should show payments list when payments exist", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: {
					payments: [
						{
							paymentMethod: { code: "01", description: "Dinheiro" },
							amount: 50,
						},
					],
					total: 100,
				},
				global: {
					stubs: { BaseButton: true },
				},
			});

			expect(wrapper.find(".payments-list").exists()).toBe(true);
			expect(wrapper.find(".payments-list h3").text()).toBe(
				"Pagamentos Registrados",
			);
		});

		it("should display payment items correctly", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: {
					payments: [
						{
							paymentMethod: { code: "01", description: "Dinheiro" },
							amount: 30,
						},
						{
							paymentMethod: {
								code: "03",
								description: "Cartão de Crédito",
							},
							amount: 40,
						},
					],
					total: 100,
				},
				global: {
					stubs: { BaseButton: true },
				},
			});

			const paymentItems = wrapper.findAll(".payment-item");
			expect(paymentItems).toHaveLength(2);
			expect(paymentItems[0]?.text()).toContain("Dinheiro");
			expect(paymentItems[0]?.text()).toContain("30,00");
			expect(paymentItems[1]?.text()).toContain("Cartão de Crédito");
			expect(paymentItems[1]?.text()).toContain("40,00");
		});
	});

	describe("Add Payment Form", () => {
		it("should have payment method select", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const select = wrapper.find("#payment-method");
			expect(select.exists()).toBe(true);
			expect(wrapper.find("label[for='payment-method']").text()).toBe(
				"Forma de Pagamento",
			);
		});

		it("should have all payment method options", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const options = wrapper.find("#payment-method").findAll("option");
			// 1 default "Selecione..." + 11 payment methods
			expect(options).toHaveLength(12);
			expect(options[0]?.text()).toBe("Selecione...");
			expect(options[1]?.text()).toBe("Dinheiro");
			expect(options[10]?.text()).toBe("PIX");
		});

		it("should have amount input", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const input = wrapper.find("#payment-amount");
			expect(input.exists()).toBe(true);
			expect(wrapper.find("label[for='payment-amount']").text()).toBe("Valor");
		});

		it("should have 'Restante' quick button", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const quickButton = wrapper.find(".quick-amount-btn");
			expect(quickButton.exists()).toBe(true);
			expect(quickButton.text()).toBe("Restante");
		});

		it("should fill remaining amount when quick button clicked", async () => {
			const wrapper = mount(POSPaymentPanel, {
				props: {
					payments: [
						{
							paymentMethod: { code: "01", description: "Dinheiro" },
							amount: 30,
						},
					],
					total: 100,
				},
				global: {
					stubs: { BaseButton: true },
				},
			});

			const quickButton = wrapper.find(".quick-amount-btn");
			await quickButton.trigger("click");
			await wrapper.vm.$nextTick();

			const input = wrapper.find("#payment-amount");
			expect(input.element.value).toBe("70");
		});

		it("should disable form when fully paid", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: {
					payments: [
						{
							paymentMethod: { code: "01", description: "Dinheiro" },
							amount: 100,
						},
					],
					total: 100,
				},
				global: {
					stubs: { BaseButton: true },
				},
			});

			const select = wrapper.find("#payment-method");
			const input = wrapper.find("#payment-amount");
			const quickButton = wrapper.find(".quick-amount-btn");

			expect(select.attributes("disabled")).toBeDefined();
			expect(input.attributes("disabled")).toBeDefined();
			expect(quickButton.attributes("disabled")).toBeDefined();
		});
	});

	describe("Add Payment Action", () => {
		it("should have add payment button", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: {
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "disabled"],
						},
					},
				},
			});

			const addButton = wrapper
				.findAll(".form-actions button")
				.find((btn) => btn.text().includes("Adicionar Pagamento"));
			expect(addButton?.exists()).toBe(true);
		});

		it("should disable add button when no payment method selected", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: {
						BaseButton: {
							template:
								'<button v-bind="$attrs" :disabled="disabled"><slot></slot></button>',
							props: ["variant", "disabled"],
						},
					},
				},
			});

			const input = wrapper.find("#payment-amount");
			input.setValue("50");
			wrapper.vm.$nextTick();

			const addButton = wrapper
				.findAll(".form-actions button")
				.find((btn) => btn.text().includes("Adicionar Pagamento"));
			expect(addButton?.attributes("disabled")).toBeDefined();
		});

		it("should disable add button when amount is zero", async () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: {
						BaseButton: {
							template:
								'<button v-bind="$attrs" :disabled="disabled"><slot></slot></button>',
							props: ["variant", "disabled"],
						},
					},
				},
			});

			const select = wrapper.find("#payment-method");
			await select.setValue("01");
			await wrapper.vm.$nextTick();

			const addButton = wrapper
				.findAll(".form-actions button")
				.find((btn) => btn.text().includes("Adicionar Pagamento"));
			expect(addButton?.attributes("disabled")).toBeDefined();
		});

		it("should emit add-payment when button clicked", async () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: {
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "disabled"],
						},
					},
				},
			});

			const select = wrapper.find("#payment-method");
			await select.setValue("01");
			const input = wrapper.find("#payment-amount");
			await input.setValue("50");
			await wrapper.vm.$nextTick();

			const addButton = wrapper
				.findAll(".form-actions button")
				.find((btn) => btn.text().includes("Adicionar Pagamento"));
			await addButton?.trigger("click");

			expect(wrapper.emitted("add-payment")).toBeTruthy();
			expect(wrapper.emitted("add-payment")?.[0]).toEqual(["01", 50]);
		});

		it("should reset form after adding payment", async () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: {
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "disabled"],
						},
					},
				},
			});

			const select = wrapper.find("#payment-method");
			await select.setValue("01");
			const input = wrapper.find("#payment-amount");
			await input.setValue("50");
			await wrapper.vm.$nextTick();

			const addButton = wrapper
				.findAll(".form-actions button")
				.find((btn) => btn.text().includes("Adicionar Pagamento"));
			await addButton?.trigger("click");
			await wrapper.vm.$nextTick();

			expect(select.element.value).toBe("");
			expect(input.element.value).toBe("0");
		});

		it("should trigger add payment on Enter key", async () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const select = wrapper.find("#payment-method");
			await select.setValue("17");
			const input = wrapper.find("#payment-amount");
			await input.setValue("100");
			await input.trigger("keyup.enter");
			await wrapper.vm.$nextTick();

			expect(wrapper.emitted("add-payment")).toBeTruthy();
			expect(wrapper.emitted("add-payment")?.[0]).toEqual(["17", 100]);
		});
	});

	describe("Complete Sale", () => {
		it("should have complete button", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: {
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "disabled", "size"],
						},
					},
				},
			});

			const completeButton = wrapper
				.findAll(".complete-section button")
				.find((btn) => btn.text().includes("Pagamento Incompleto"));
			expect(completeButton?.exists()).toBe(true);
		});

		it("should disable complete button when not fully paid", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: {
						BaseButton: {
							template:
								'<button v-bind="$attrs" :disabled="disabled"><slot></slot></button>',
							props: ["variant", "disabled", "size"],
						},
					},
				},
			});

			const completeButton = wrapper
				.findAll(".complete-section button")
				.find((btn) => btn.text().includes("Pagamento Incompleto"));
			expect(completeButton?.attributes("disabled")).toBeDefined();
		});

		it("should show 'Pagamento Incompleto' text when not fully paid", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: {
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "disabled", "size"],
						},
					},
				},
			});

			expect(wrapper.text()).toContain("Pagamento Incompleto");
			expect(wrapper.text()).toContain(
				"Complete o pagamento para finalizar a venda",
			);
		});

		it("should change button text when fully paid", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: {
					payments: [
						{
							paymentMethod: { code: "01", description: "Dinheiro" },
							amount: 100,
						},
					],
					total: 100,
				},
				global: {
					stubs: {
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "disabled", "size"],
						},
					},
				},
			});

			expect(wrapper.text()).toContain("Finalizar Venda ✓");
			expect(wrapper.text()).toContain("Pagamento completo! Clique para finalizar");
		});

		it("should enable complete button when fully paid", () => {
			const wrapper = mount(POSPaymentPanel, {
				props: {
					payments: [
						{
							paymentMethod: { code: "01", description: "Dinheiro" },
							amount: 100,
						},
					],
					total: 100,
				},
				global: {
					stubs: {
						BaseButton: {
							template:
								'<button v-bind="$attrs" :disabled="disabled"><slot></slot></button>',
							props: ["variant", "disabled", "size"],
						},
					},
				},
			});

			const completeButton = wrapper
				.findAll(".complete-section button")
				.find((btn) => btn.text().includes("Finalizar Venda"));
			expect(completeButton?.attributes("disabled")).toBeUndefined();
		});

		it("should emit complete when button clicked", async () => {
			const wrapper = mount(POSPaymentPanel, {
				props: {
					payments: [
						{
							paymentMethod: { code: "01", description: "Dinheiro" },
							amount: 100,
						},
					],
					total: 100,
				},
				global: {
					stubs: {
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "disabled", "size"],
						},
					},
				},
			});

			const completeButton = wrapper
				.findAll(".complete-section button")
				.find((btn) => btn.text().includes("Finalizar Venda"));
			await completeButton?.trigger("click");

			expect(wrapper.emitted("complete")).toBeTruthy();
		});

		it("should not emit complete when not fully paid", async () => {
			const wrapper = mount(POSPaymentPanel, {
				props: defaultProps,
				global: {
					stubs: {
						BaseButton: {
							template: '<button v-bind="$attrs"><slot></slot></button>',
							props: ["variant", "disabled", "size"],
						},
					},
				},
			});

			const completeButton = wrapper
				.findAll(".complete-section button")
				.find((btn) => btn.text().includes("Pagamento Incompleto"));
			await completeButton?.trigger("click");

			expect(wrapper.emitted("complete")).toBeFalsy();
		});
	});
});
