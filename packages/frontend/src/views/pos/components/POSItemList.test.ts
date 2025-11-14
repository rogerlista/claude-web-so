/**
 * Tests for POSItemList
 * Phase 6: T038 - Sale Items List Component
 */

import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import POSItemList from "./POSItemList.vue";

describe("POSItemList", () => {
	describe("Render - Empty State", () => {
		it("should render empty state when no items", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [],
				},
			});

			expect(wrapper.find(".empty-state").exists()).toBe(true);
			expect(wrapper.text()).toContain("Nenhum item adicionado");
			expect(wrapper.text()).toContain("Use F1 para buscar produtos");
		});

		it("should display empty icon", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [],
				},
			});

			expect(wrapper.find(".empty-icon").exists()).toBe(true);
			expect(wrapper.find(".empty-icon").text()).toBe("🛒");
		});
	});

	describe("Render - Loading State", () => {
		it("should show loading state when loading prop is true", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [],
					loading: true,
				},
			});

			expect(wrapper.find(".loading").exists()).toBe(true);
			expect(wrapper.text()).toContain("Carregando...");
		});

		it("should not show empty state when loading", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [],
					loading: true,
				},
			});

			expect(wrapper.find(".empty-state").exists()).toBe(false);
		});
	});

	describe("Render - With Items", () => {
		const mockItems = [
			{
				productId: "prod-1",
				productName: "Product 1",
				quantity: 2,
				unitPrice: 10.5,
				subtotal: 21,
			},
			{
				productId: "prod-2",
				productName: "Product 2",
				quantity: 1,
				unitPrice: 15.0,
				subtotal: 15,
			},
		];

		it("should display items count in header", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: mockItems,
				},
			});

			expect(wrapper.find(".item-count").exists()).toBe(true);
			expect(wrapper.find(".item-count").text()).toBe("2 itens");
		});

		it("should display singular 'item' for single item", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [mockItems[0]],
				},
			});

			expect(wrapper.find(".item-count").text()).toBe("1 item");
		});

		it("should render all items", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: mockItems,
				},
			});

			const itemRows = wrapper.findAll(".item-row");
			expect(itemRows).toHaveLength(2);
		});

		it("should display item number", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: mockItems,
				},
			});

			const itemNumbers = wrapper.findAll(".item-number");
			expect(itemNumbers[0]?.text()).toBe("1");
			expect(itemNumbers[1]?.text()).toBe("2");
		});

		it("should display item names", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: mockItems,
				},
			});

			expect(wrapper.text()).toContain("Product 1");
			expect(wrapper.text()).toContain("Product 2");
		});

		it("should display formatted prices", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: mockItems,
				},
			});

			expect(wrapper.text()).toContain("R$");
			expect(wrapper.text()).toContain("10,50");
			expect(wrapper.text()).toContain("15,00");
		});

		it("should display subtotals", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: mockItems,
				},
			});

			const subtotals = wrapper.findAll(".item-subtotal");
			expect(subtotals[0]?.text()).toContain("21,00");
			expect(subtotals[1]?.text()).toContain("15,00");
		});

		it("should fallback to productId when productName is missing", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [
						{
							productId: "prod-x",
							productName: "",
							quantity: 1,
							unitPrice: 10,
							subtotal: 10,
						},
					],
				},
			});

			expect(wrapper.text()).toContain("prod-x");
		});
	});

	describe("Quantity Controls", () => {
		const mockItem = {
			productId: "prod-1",
			productName: "Product 1",
			quantity: 2,
			unitPrice: 10,
			subtotal: 20,
		};

		it("should have increase quantity button", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [mockItem],
				},
			});

			const increaseButton = wrapper
				.findAll(".quantity-button")
				.find((btn) => btn.text() === "+");
			expect(increaseButton?.exists()).toBe(true);
		});

		it("should have decrease quantity button", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [mockItem],
				},
			});

			const decreaseButton = wrapper
				.findAll(".quantity-button")
				.find((btn) => btn.text() === "−");
			expect(decreaseButton?.exists()).toBe(true);
		});

		it("should have quantity input", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [mockItem],
				},
			});

			const quantityInput = wrapper.find(".quantity-input");
			expect(quantityInput.exists()).toBe(true);
			expect(quantityInput.element.value).toBe("2");
		});

		it("should emit update-quantity when increase button is clicked", async () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [mockItem],
				},
			});

			const increaseButton = wrapper
				.findAll(".quantity-button")
				.find((btn) => btn.text() === "+");
			await increaseButton?.trigger("click");

			expect(wrapper.emitted("update-quantity")).toBeTruthy();
			expect(wrapper.emitted("update-quantity")?.[0]).toEqual(["prod-1", 3]);
		});

		it("should emit update-quantity when decrease button is clicked", async () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [mockItem],
				},
			});

			const decreaseButton = wrapper
				.findAll(".quantity-button")
				.find((btn) => btn.text() === "−");
			await decreaseButton?.trigger("click");

			expect(wrapper.emitted("update-quantity")).toBeTruthy();
			expect(wrapper.emitted("update-quantity")?.[0]).toEqual(["prod-1", 1]);
		});

		it("should disable decrease button when quantity is 1", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [
						{
							...mockItem,
							quantity: 1,
						},
					],
				},
			});

			const decreaseButton = wrapper
				.findAll(".quantity-button")
				.find((btn) => btn.text() === "−");
			expect(decreaseButton?.attributes("disabled")).toBeDefined();
		});

		it("should not emit update-quantity when decrease is clicked at quantity 1", async () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [
						{
							...mockItem,
							quantity: 1,
						},
					],
				},
			});

			const decreaseButton = wrapper
				.findAll(".quantity-button")
				.find((btn) => btn.text() === "−");
			await decreaseButton?.trigger("click");

			expect(wrapper.emitted("update-quantity")).toBeFalsy();
		});

		it("should emit update-quantity when quantity input changes", async () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [mockItem],
				},
			});

			const quantityInput = wrapper.find(".quantity-input");
			await quantityInput.setValue("5");
			await quantityInput.trigger("change");

			expect(wrapper.emitted("update-quantity")).toBeTruthy();
			expect(wrapper.emitted("update-quantity")?.[0]).toEqual(["prod-1", 5]);
		});

		it("should not emit update-quantity for invalid quantity (zero)", async () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [mockItem],
				},
			});

			const quantityInput = wrapper.find(".quantity-input");
			await quantityInput.setValue("0");
			await quantityInput.trigger("change");

			expect(wrapper.emitted("update-quantity")).toBeFalsy();
		});

		it("should not emit update-quantity for same quantity", async () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [mockItem],
				},
			});

			const quantityInput = wrapper.find(".quantity-input");
			await quantityInput.setValue("2"); // Same as current
			await quantityInput.trigger("change");

			expect(wrapper.emitted("update-quantity")).toBeFalsy();
		});
	});

	describe("Remove Item", () => {
		const mockItem = {
			productId: "prod-1",
			productName: "Product 1",
			quantity: 2,
			unitPrice: 10,
			subtotal: 20,
		};

		beforeEach(() => {
			// Mock window.confirm
			global.confirm = vi.fn(() => true);
		});

		it("should have remove button", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [mockItem],
				},
			});

			const removeButton = wrapper.find(".remove-button");
			expect(removeButton.exists()).toBe(true);
			expect(removeButton.text()).toBe("🗑️");
		});

		it("should show confirmation dialog when remove is clicked", async () => {
			const confirmSpy = vi.spyOn(window, "confirm");

			const wrapper = mount(POSItemList, {
				props: {
					items: [mockItem],
				},
			});

			const removeButton = wrapper.find(".remove-button");
			await removeButton.trigger("click");

			expect(confirmSpy).toHaveBeenCalledWith(
				'Remover "Product 1" da venda?',
			);
		});

		it("should emit remove-item when confirmed", async () => {
			global.confirm = vi.fn(() => true);

			const wrapper = mount(POSItemList, {
				props: {
					items: [mockItem],
				},
			});

			const removeButton = wrapper.find(".remove-button");
			await removeButton.trigger("click");

			expect(wrapper.emitted("remove-item")).toBeTruthy();
			expect(wrapper.emitted("remove-item")?.[0]).toEqual(["prod-1"]);
		});

		it("should not emit remove-item when cancelled", async () => {
			global.confirm = vi.fn(() => false);

			const wrapper = mount(POSItemList, {
				props: {
					items: [mockItem],
				},
			});

			const removeButton = wrapper.find(".remove-button");
			await removeButton.trigger("click");

			expect(wrapper.emitted("remove-item")).toBeFalsy();
		});

		it("should use productId in confirmation when productName is empty", async () => {
			const confirmSpy = vi.spyOn(window, "confirm");

			const wrapper = mount(POSItemList, {
				props: {
					items: [
						{
							...mockItem,
							productName: "",
						},
					],
				},
			});

			const removeButton = wrapper.find(".remove-button");
			await removeButton.trigger("click");

			expect(confirmSpy).toHaveBeenCalledWith('Remover "prod-1" da venda?');
		});
	});

	describe("Header", () => {
		it("should display header title", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [],
				},
			});

			expect(wrapper.find(".list-header h2").text()).toBe("Itens da Venda");
		});

		it("should not show item count when empty", () => {
			const wrapper = mount(POSItemList, {
				props: {
					items: [],
				},
			});

			expect(wrapper.find(".item-count").exists()).toBe(false);
		});
	});
});
