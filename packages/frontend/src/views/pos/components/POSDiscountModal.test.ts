/**
 * Tests for POSDiscountModal
 * Phase 6: T040 - Discount Modal Component
 */

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import POSDiscountModal from "./POSDiscountModal.vue";

describe("POSDiscountModal", () => {
	const defaultProps = {
		currentDiscount: 10,
		maxDiscount: 100,
	};

	describe("Render", () => {
		it("should render correctly", () => {
			const wrapper = mount(POSDiscountModal, {
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

			expect(wrapper.find(".modal-overlay").exists()).toBe(true);
			expect(wrapper.find(".modal").exists()).toBe(true);
		});

		it("should display header title", () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			expect(wrapper.find(".modal-header h3").text()).toBe("Aplicar Desconto");
		});

		it("should have close button", () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const closeButton = wrapper.find(".close-button");
			expect(closeButton.exists()).toBe(true);
			expect(closeButton.text()).toBe("×");
		});

		it("should display current discount", () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			expect(wrapper.text()).toContain("Desconto Atual:");
			expect(wrapper.text()).toContain("R$");
			expect(wrapper.text()).toContain("10,00");
		});

		it("should display max discount", () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			expect(wrapper.text()).toContain("Valor Máximo:");
			expect(wrapper.text()).toContain("100,00");
		});
	});

	describe("Discount Type Selection", () => {
		it("should have value and percentage buttons", () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const typeButtons = wrapper.findAll(".type-button");
			expect(typeButtons).toHaveLength(2);
			expect(typeButtons[0]?.text()).toContain("Valor (R$)");
			expect(typeButtons[1]?.text()).toContain("Percentual (%)");
		});

		it("should default to value type", () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const valueButton = wrapper.findAll(".type-button")[0];
			expect(valueButton?.classes()).toContain("active");
		});

		it("should switch to percentage type when clicked", async () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const percentageButton = wrapper.findAll(".type-button")[1];
			await percentageButton?.trigger("click");
			await wrapper.vm.$nextTick();

			expect(percentageButton?.classes()).toContain("active");
		});

		it("should update input label when switching types", async () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			expect(wrapper.find("label").text()).toContain("Valor do Desconto (R$)");

			const percentageButton = wrapper.findAll(".type-button")[1];
			await percentageButton?.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find("label").text()).toContain(
				"Percentual do Desconto (%)",
			);
		});
	});

	describe("Discount Input", () => {
		it("should have discount input field", () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const input = wrapper.find("#discount-input");
			expect(input.exists()).toBe(true);
		});

		it("should accept numeric values", async () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const input = wrapper.find("#discount-input");
			await input.setValue("20");
			await wrapper.vm.$nextTick();

			expect((input.element as HTMLInputElement).value).toBe("20");
		});
	});

	describe("Discount Calculation - Value Type", () => {
		it("should calculate discount for value type", async () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const input = wrapper.find("#discount-input");
			await input.setValue("25");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".calculated-discount").exists()).toBe(true);
			expect(wrapper.text()).toContain("Desconto calculado:");
			expect(wrapper.text()).toContain("25,00");
		});

		it("should calculate new total for value type", async () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const input = wrapper.find("#discount-input");
			await input.setValue("25");
			await wrapper.vm.$nextTick();

			expect(wrapper.text()).toContain("Novo total:");
			expect(wrapper.text()).toContain("75,00"); // 100 - 25
		});

		it("should not show calculated discount for zero value", async () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const input = wrapper.find("#discount-input");
			await input.setValue("0");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".calculated-discount").exists()).toBe(false);
		});
	});

	describe("Discount Calculation - Percentage Type", () => {
		it("should calculate discount for percentage type", async () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const percentageButton = wrapper.findAll(".type-button")[1];
			await percentageButton?.trigger("click");
			await wrapper.vm.$nextTick();

			const input = wrapper.find("#discount-input");
			await input.setValue("10");
			await wrapper.vm.$nextTick();

			expect(wrapper.text()).toContain("Desconto calculado:");
			expect(wrapper.text()).toContain("10,00"); // 10% of 100
		});

		it("should calculate correct discount for 50%", async () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const percentageButton = wrapper.findAll(".type-button")[1];
			await percentageButton?.trigger("click");
			await wrapper.vm.$nextTick();

			const input = wrapper.find("#discount-input");
			await input.setValue("50");
			await wrapper.vm.$nextTick();

			expect(wrapper.text()).toContain("50,00"); // 50% of 100
			expect(wrapper.text()).toContain("Novo total:");
		});
	});

	describe("Validation", () => {
		it("should disable apply button when discount is zero", async () => {
			const wrapper = mount(POSDiscountModal, {
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

			const input = wrapper.find("#discount-input");
			await input.setValue("0");
			await wrapper.vm.$nextTick();

			const applyButton = wrapper
				.findAll(".modal-actions button")
				.find((btn) => btn.text().includes("Aplicar"));
			expect(applyButton?.attributes("disabled")).toBeDefined();
		});

		it("should show error for percentage > 100", async () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const percentageButton = wrapper.findAll(".type-button")[1];
			await percentageButton?.trigger("click");
			await wrapper.vm.$nextTick();

			const input = wrapper.find("#discount-input");
			await input.setValue("150");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".error-message").exists()).toBe(true);
			expect(wrapper.find(".error-message").text()).toContain(
				"Percentual não pode ser maior que 100%",
			);
		});

		it("should show error when discount exceeds max", async () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const input = wrapper.find("#discount-input");
			await input.setValue("150");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".error-message").exists()).toBe(true);
			expect(wrapper.find(".error-message").text()).toContain(
				"Desconto não pode ser maior que o valor total",
			);
		});

		it("should not show error for valid discount", async () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const input = wrapper.find("#discount-input");
			await input.setValue("50");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".error-message").exists()).toBe(false);
		});
	});

	describe("Events", () => {
		it("should emit close when close button is clicked", async () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const closeButton = wrapper.find(".close-button");
			await closeButton.trigger("click");

			expect(wrapper.emitted("close")).toBeTruthy();
		});

		it("should emit close when cancel button is clicked", async () => {
			const wrapper = mount(POSDiscountModal, {
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

			const cancelButton = wrapper
				.findAll(".modal-actions button")
				.find((btn) => btn.text() === "Cancelar");
			await cancelButton?.trigger("click");

			expect(wrapper.emitted("close")).toBeTruthy();
		});

		it("should emit close when clicking overlay", async () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const overlay = wrapper.find(".modal-overlay");
			await overlay.trigger("click.self");

			expect(wrapper.emitted("close")).toBeTruthy();
		});

		it("should emit apply with calculated discount", async () => {
			const wrapper = mount(POSDiscountModal, {
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

			const input = wrapper.find("#discount-input");
			await input.setValue("30");
			await wrapper.vm.$nextTick();

			const applyButton = wrapper
				.findAll(".modal-actions button")
				.find((btn) => btn.text().includes("Aplicar"));
			await applyButton?.trigger("click");

			expect(wrapper.emitted("apply")).toBeTruthy();
			expect(wrapper.emitted("apply")?.[0]).toEqual([30]);
		});

		it("should emit apply with percentage discount", async () => {
			const wrapper = mount(POSDiscountModal, {
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

			const percentageButton = wrapper.findAll(".type-button")[1];
			await percentageButton?.trigger("click");
			await wrapper.vm.$nextTick();

			const input = wrapper.find("#discount-input");
			await input.setValue("20");
			await wrapper.vm.$nextTick();

			const applyButton = wrapper
				.findAll(".modal-actions button")
				.find((btn) => btn.text().includes("Aplicar"));
			await applyButton?.trigger("click");

			expect(wrapper.emitted("apply")).toBeTruthy();
			expect(wrapper.emitted("apply")?.[0]).toEqual([20]); // 20% of 100
		});

		it("should trigger apply on Enter key", async () => {
			const wrapper = mount(POSDiscountModal, {
				props: defaultProps,
				global: {
					stubs: { BaseButton: true },
				},
			});

			const input = wrapper.find("#discount-input");
			await input.setValue("15");
			await input.trigger("keyup.enter");
			await wrapper.vm.$nextTick();

			expect(wrapper.emitted("apply")).toBeTruthy();
			expect(wrapper.emitted("apply")?.[0]).toEqual([15]);
		});

		it("should not emit apply when invalid", async () => {
			const wrapper = mount(POSDiscountModal, {
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

			const input = wrapper.find("#discount-input");
			await input.setValue("0");
			await wrapper.vm.$nextTick();

			const applyButton = wrapper
				.findAll(".modal-actions button")
				.find((btn) => btn.text().includes("Aplicar"));
			await applyButton?.trigger("click");

			expect(wrapper.emitted("apply")).toBeFalsy();
		});
	});

	describe("Action Buttons", () => {
		it("should have cancel button", () => {
			const wrapper = mount(POSDiscountModal, {
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

			const cancelButton = wrapper
				.findAll(".modal-actions button")
				.find((btn) => btn.text() === "Cancelar");
			expect(cancelButton?.exists()).toBe(true);
		});

		it("should have apply button", () => {
			const wrapper = mount(POSDiscountModal, {
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

			const applyButton = wrapper
				.findAll(".modal-actions button")
				.find((btn) => btn.text().includes("Aplicar"));
			expect(applyButton?.exists()).toBe(true);
		});
	});
});
