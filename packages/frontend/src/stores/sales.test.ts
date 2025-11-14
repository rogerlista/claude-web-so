/**
 * Tests for Sales Store
 * Phase 6: Sales Management System
 */

import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSalesStore, type Sale } from "./sales";

describe("Sales Store", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	const mockSale: Sale = {
		id: "SALE-123",
		customerId: "customer-default",
		customerCpf: undefined,
		customerEmail: undefined,
		items: [
			{
				productId: "p1",
				productName: "Product 1",
				quantity: 2,
				unitPrice: 10,
				subtotal: 20,
			},
			{
				productId: "p2",
				productName: "Product 2",
				quantity: 1,
				unitPrice: 30,
				subtotal: 30,
			},
		],
		grossTotal: 50,
		discount: 5,
		addition: 0,
		netTotal: 45,
		payments: [
			{
				paymentMethod: { code: "01", description: "Dinheiro" },
				amount: 45,
			},
		],
		status: "PENDING",
		createdAt: "2024-01-01T00:00:00.000Z",
	};

	describe("Initial State", () => {
		it("should have null currentSale initially", () => {
			const store = useSalesStore();
			expect(store.currentSale).toBeNull();
		});

		it("should have loading as false initially", () => {
			const store = useSalesStore();
			expect(store.loading).toBe(false);
		});

		it("should have no error initially", () => {
			const store = useSalesStore();
			expect(store.error).toBeNull();
		});
	});

	describe("Computed Properties", () => {
		describe("hasItems", () => {
			it("should return false when no current sale", () => {
				const store = useSalesStore();
				expect(store.hasItems).toBe(false);
			});

			it("should return false when sale has no items", () => {
				const store = useSalesStore();
				store.currentSale = { ...mockSale, items: [] };
				expect(store.hasItems).toBe(false);
			});

			it("should return true when sale has items", () => {
				const store = useSalesStore();
				store.currentSale = mockSale;
				expect(store.hasItems).toBe(true);
			});
		});

		describe("totalItems", () => {
			it("should return 0 when no current sale", () => {
				const store = useSalesStore();
				expect(store.totalItems).toBe(0);
			});

			it("should sum all item quantities", () => {
				const store = useSalesStore();
				store.currentSale = mockSale;
				expect(store.totalItems).toBe(3); // 2 + 1
			});
		});

		describe("paidAmount", () => {
			it("should return 0 when no current sale", () => {
				const store = useSalesStore();
				expect(store.paidAmount).toBe(0);
			});

			it("should sum all payment amounts", () => {
				const store = useSalesStore();
				store.currentSale = mockSale;
				expect(store.paidAmount).toBe(45);
			});

			it("should return 0 when no payments", () => {
				const store = useSalesStore();
				store.currentSale = { ...mockSale, payments: [] };
				expect(store.paidAmount).toBe(0);
			});
		});

		describe("remainingAmount", () => {
			it("should return 0 when no current sale", () => {
				const store = useSalesStore();
				expect(store.remainingAmount).toBe(0);
			});

			it("should calculate remaining amount", () => {
				const store = useSalesStore();
				store.currentSale = { ...mockSale, payments: [] };
				expect(store.remainingAmount).toBe(45); // netTotal - paidAmount
			});

			it("should return 0 when fully paid", () => {
				const store = useSalesStore();
				store.currentSale = mockSale;
				expect(store.remainingAmount).toBe(0);
			});
		});

		describe("isFullyPaid", () => {
			it("should return true when remaining is 0", () => {
				const store = useSalesStore();
				store.currentSale = mockSale;
				expect(store.isFullyPaid).toBe(true);
			});

			it("should return false when not fully paid", () => {
				const store = useSalesStore();
				store.currentSale = { ...mockSale, payments: [] };
				expect(store.isFullyPaid).toBe(false);
			});
		});

		describe("canFinalize", () => {
			it("should return false when no items", () => {
				const store = useSalesStore();
				store.currentSale = { ...mockSale, items: [] };
				expect(store.canFinalize).toBe(false);
			});

			it("should return false when not fully paid", () => {
				const store = useSalesStore();
				store.currentSale = { ...mockSale, payments: [] };
				expect(store.canFinalize).toBe(false);
			});

			it("should return true when has items and fully paid", () => {
				const store = useSalesStore();
				store.currentSale = mockSale;
				expect(store.canFinalize).toBe(true);
			});
		});
	});

	describe("createSale", () => {
		it("should create a new sale successfully", async () => {
			const store = useSalesStore();

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ data: mockSale }),
			});

			const result = await store.createSale();

			expect(result).toEqual(mockSale);
			expect(store.currentSale).toEqual(mockSale);
			expect(store.error).toBeNull();
		});

		it("should handle creation failure", async () => {
			const store = useSalesStore();

			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
			});

			const result = await store.createSale();

			expect(result).toBeNull();
			expect(store.error).toBe("Erro ao criar venda");
		});

		it("should use custom customer ID", async () => {
			const store = useSalesStore();

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ data: mockSale }),
			});

			await store.createSale("custom-id");

			expect(global.fetch).toHaveBeenCalled();
			const callArgs = (global.fetch as any).mock.calls[0];
			const body = JSON.parse(callArgs[1].body);
			expect(body.customerId).toBe("custom-id");
		});
	});

	describe("addItem", () => {
		it("should add item to sale successfully", async () => {
			const store = useSalesStore();
			store.currentSale = mockSale;

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ data: mockSale }),
			});

			const result = await store.addItem({
				productId: "p3",
				quantity: 1,
				unitPrice: 20,
			});

			expect(result).toBe(true);
			expect(store.error).toBeNull();
		});

		it("should return false when no current sale", async () => {
			const store = useSalesStore();

			const result = await store.addItem({
				productId: "p1",
				quantity: 1,
				unitPrice: 10,
			});

			expect(result).toBe(false);
			expect(store.error).toBe("Nenhuma venda ativa");
		});

		it("should handle add item failure", async () => {
			const store = useSalesStore();
			store.currentSale = mockSale;

			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
			});

			const result = await store.addItem({
				productId: "p3",
				quantity: 1,
				unitPrice: 20,
			});

			expect(result).toBe(false);
			expect(store.error).toBe("Erro ao adicionar item");
		});
	});

	describe("removeItem", () => {
		it("should remove item successfully", async () => {
			const store = useSalesStore();
			store.currentSale = mockSale;

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ data: { ...mockSale, items: [] } }),
			});

			const result = await store.removeItem("p1");

			expect(result).toBe(true);
			expect(store.error).toBeNull();
		});

		it("should return false when no current sale", async () => {
			const store = useSalesStore();

			const result = await store.removeItem("p1");

			expect(result).toBe(false);
			expect(store.error).toBe("Nenhuma venda ativa");
		});

		it("should handle remove failure", async () => {
			const store = useSalesStore();
			store.currentSale = mockSale;

			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
			});

			const result = await store.removeItem("p1");

			expect(result).toBe(false);
			expect(store.error).toBe("Erro ao remover item");
		});
	});

	describe("updateItemQuantity", () => {
		it("should update quantity successfully", async () => {
			const store = useSalesStore();
			store.currentSale = mockSale;

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ data: mockSale }),
			});

			const result = await store.updateItemQuantity("p1", 5);

			expect(result).toBe(true);
			expect(store.error).toBeNull();
		});

		it("should return false when no current sale", async () => {
			const store = useSalesStore();

			const result = await store.updateItemQuantity("p1", 5);

			expect(result).toBe(false);
			expect(store.error).toBe("Nenhuma venda ativa");
		});

		it("should handle update failure", async () => {
			const store = useSalesStore();
			store.currentSale = mockSale;

			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
			});

			const result = await store.updateItemQuantity("p1", 5);

			expect(result).toBe(false);
			expect(store.error).toBe("Erro ao atualizar quantidade");
		});
	});

	describe("applyDiscount", () => {
		it("should apply discount successfully", async () => {
			const store = useSalesStore();
			store.currentSale = mockSale;

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ data: mockSale }),
			});

			const result = await store.applyDiscount(10);

			expect(result).toBe(true);
			expect(store.error).toBeNull();
		});

		it("should return false when no current sale", async () => {
			const store = useSalesStore();

			const result = await store.applyDiscount(10);

			expect(result).toBe(false);
			expect(store.error).toBe("Nenhuma venda ativa");
		});

		it("should handle discount failure", async () => {
			const store = useSalesStore();
			store.currentSale = mockSale;

			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
			});

			const result = await store.applyDiscount(10);

			expect(result).toBe(false);
			expect(store.error).toBe("Erro ao aplicar desconto");
		});
	});

	describe("addPayment", () => {
		it("should add payment successfully", async () => {
			const store = useSalesStore();
			store.currentSale = mockSale;

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ data: mockSale }),
			});

			const result = await store.addPayment("01", 45);

			expect(result).toBe(true);
			expect(store.error).toBeNull();
		});

		it("should return false when no current sale", async () => {
			const store = useSalesStore();

			const result = await store.addPayment("01", 45);

			expect(result).toBe(false);
			expect(store.error).toBe("Nenhuma venda ativa");
		});

		it("should handle payment failure", async () => {
			const store = useSalesStore();
			store.currentSale = mockSale;

			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
			});

			const result = await store.addPayment("01", 45);

			expect(result).toBe(false);
			expect(store.error).toBe("Erro ao adicionar pagamento");
		});
	});

	describe("updateCustomerInfo", () => {
		it("should update customer info successfully", async () => {
			const store = useSalesStore();
			store.currentSale = mockSale;

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ data: mockSale }),
			});

			const result = await store.updateCustomerInfo("12345678901", "test@example.com");

			expect(result).toBe(true);
			expect(store.error).toBeNull();
		});

		it("should return false when no current sale", async () => {
			const store = useSalesStore();

			const result = await store.updateCustomerInfo("12345678901");

			expect(result).toBe(false);
			expect(store.error).toBe("Nenhuma venda ativa");
		});

		it("should handle update failure", async () => {
			const store = useSalesStore();
			store.currentSale = mockSale;

			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
			});

			const result = await store.updateCustomerInfo("12345678901");

			expect(result).toBe(false);
			expect(store.error).toBe("Erro ao atualizar dados do cliente");
		});
	});

	describe("finalizeSale", () => {
		it("should finalize sale successfully when conditions met", async () => {
			const store = useSalesStore();
			store.currentSale = mockSale;

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ data: { ...mockSale, status: "COMPLETED" } }),
			});

			const result = await store.finalizeSale();

			expect(result).toBe(true);
			expect(store.error).toBeNull();
		});

		it("should return false when no current sale", async () => {
			const store = useSalesStore();

			const result = await store.finalizeSale();

			expect(result).toBe(false);
			expect(store.error).toBe("Nenhuma venda ativa");
		});

		it("should return false when cannot finalize", async () => {
			const store = useSalesStore();
			store.currentSale = { ...mockSale, payments: [] };

			const result = await store.finalizeSale();

			expect(result).toBe(false);
			expect(store.error).toBe(
				"Venda não pode ser finalizada (verifique itens e pagamentos)",
			);
		});

		it("should handle finalize failure", async () => {
			const store = useSalesStore();
			store.currentSale = mockSale;

			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
			});

			const result = await store.finalizeSale();

			expect(result).toBe(false);
			expect(store.error).toBe("Erro ao finalizar venda");
		});
	});

	describe("clearSale", () => {
		it("should clear current sale", () => {
			const store = useSalesStore();
			store.currentSale = mockSale;
			store.error = "some error";

			store.clearSale();

			expect(store.currentSale).toBeNull();
			expect(store.error).toBeNull();
		});
	});

	describe("getSale", () => {
		it("should get sale by ID successfully", async () => {
			const store = useSalesStore();

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ data: mockSale }),
			});

			const result = await store.getSale("SALE-123");

			expect(result).toEqual(mockSale);
			expect(store.error).toBeNull();
		});

		it("should handle get sale failure", async () => {
			const store = useSalesStore();

			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
			});

			const result = await store.getSale("SALE-123");

			expect(result).toBeNull();
			expect(store.error).toBe("Erro ao carregar venda");
		});

		it("should call correct API endpoint", async () => {
			const store = useSalesStore();

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ data: mockSale }),
			});

			await store.getSale("SALE-456");

			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining("/api/vendas/SALE-456"),
			);
		});
	});

	describe("Loading State", () => {
		it("should set loading during createSale", async () => {
			const store = useSalesStore();

			(global.fetch as any).mockImplementationOnce(
				() =>
					new Promise((resolve) => {
						expect(store.loading).toBe(true);
						resolve({
							ok: true,
							json: async () => ({ data: mockSale }),
						});
					}),
			);

			await store.createSale();

			expect(store.loading).toBe(false);
		});

		it("should set loading during addItem", async () => {
			const store = useSalesStore();
			store.currentSale = mockSale;

			(global.fetch as any).mockImplementationOnce(
				() =>
					new Promise((resolve) => {
						expect(store.loading).toBe(true);
						resolve({
							ok: true,
							json: async () => ({ data: mockSale }),
						});
					}),
			);

			await store.addItem({
				productId: "p3",
				quantity: 1,
				unitPrice: 20,
			});

			expect(store.loading).toBe(false);
		});
	});
});
