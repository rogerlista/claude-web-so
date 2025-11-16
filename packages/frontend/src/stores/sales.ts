/**
 * Sales Store (PDV/POS)
 * Phase 6: Sales Management System
 */

import { defineStore } from "pinia";
import { computed, ref } from "vue";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Payment Method types (SEFAZ codes)
export interface PaymentMethod {
	readonly code: string;
	readonly description: string;
}

export interface SalePayment {
	readonly paymentMethod: PaymentMethod;
	readonly amount: number;
}

export interface SaleItem {
	readonly productId: string;
	readonly productName?: string; // For display
	readonly quantity: number;
	readonly unitPrice: number;
	readonly subtotal: number;
}

export interface Sale {
	readonly id: string;
	readonly customerId: string;
	readonly customerCpf?: string;
	readonly customerEmail?: string;
	readonly items: readonly SaleItem[];
	readonly grossTotal: number;
	readonly discount: number;
	readonly addition: number;
	readonly netTotal: number;
	readonly payments: readonly SalePayment[];
	readonly status: "PENDING" | "COMPLETED" | "CANCELLED";
	readonly createdAt: string;
}

export interface CreateSaleInput {
	readonly customerId: string;
	readonly items?: readonly {
		readonly productId: string;
		readonly quantity: number;
		readonly unitPrice: number;
	}[];
}

export interface AddItemInput {
	readonly productId: string;
	readonly quantity: number;
	readonly unitPrice: number;
}

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
	{ code: "01", description: "Dinheiro" },
	{ code: "02", description: "Cheque" },
	{ code: "03", description: "Cartão de Crédito" },
	{ code: "04", description: "Cartão de Débito" },
	{ code: "05", description: "Crédito Loja" },
	{ code: "10", description: "Vale Alimentação" },
	{ code: "11", description: "Vale Refeição" },
	{ code: "12", description: "Vale Presente" },
	{ code: "13", description: "Vale Combustível" },
	{ code: "15", description: "Boleto Bancário" },
	{ code: "16", description: "Depósito Bancário" },
	{ code: "17", description: "PIX" },
	{ code: "18", description: "Transferência Bancária" },
	{ code: "19", description: "Programa de Fidelidade" },
	{ code: "90", description: "Sem Pagamento" },
	{ code: "99", description: "Outros" },
] as const;

export const useSalesStore = defineStore("sales", () => {
	// Current sale being created/edited
	const currentSale = ref<Sale | null>(null);
	const loading = ref(false);
	const error = ref<string | null>(null);

	// Computed values for current sale
	const hasItems = computed(() => {
		return currentSale.value !== null && currentSale.value.items.length > 0;
	});

	const totalItems = computed(() => {
		if (!currentSale.value) {
			return 0;
		}
		return currentSale.value.items.reduce(
			(sum, item) => sum + item.quantity,
			0,
		);
	});

	const paidAmount = computed(() => {
		if (!currentSale.value) {
			return 0;
		}
		return currentSale.value.payments.reduce(
			(sum, payment) => sum + payment.amount,
			0,
		);
	});

	const remainingAmount = computed(() => {
		if (!currentSale.value) {
			return 0;
		}
		return currentSale.value.netTotal - paidAmount.value;
	});

	const isFullyPaid = computed(() => {
		return remainingAmount.value <= 0;
	});

	const canFinalize = computed(() => {
		return hasItems.value && isFullyPaid.value;
	});

	/**
	 * Create a new sale
	 */
	const createSale = async (
		customerId = "customer-default",
	): Promise<Sale | null> => {
		loading.value = true;
		error.value = null;

		try {
			const saleId = `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

			const input: CreateSaleInput = {
				customerId,
				items: [],
			};

			const response = await fetch(`${API_BASE_URL}/api/vendas`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: saleId, ...input }),
			});

			if (!response.ok) {
				throw new Error("Failed to create sale");
			}

			const data = (await response.json()) as { data: Sale };
			currentSale.value = data.data;
			return data.data;
		} catch (_err) {
			error.value = "Erro ao criar venda";
			return null;
		} finally {
			loading.value = false;
		}
	};

	/**
	 * Add item to current sale
	 */
	const addItem = async (input: AddItemInput): Promise<boolean> => {
		if (!currentSale.value) {
			error.value = "Nenhuma venda ativa";
			return false;
		}

		loading.value = true;
		error.value = null;

		try {
			const response = await fetch(
				`${API_BASE_URL}/api/vendas/${currentSale.value.id}/items`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(input),
				},
			);

			if (!response.ok) {
				throw new Error("Failed to add item");
			}

			const data = (await response.json()) as { data: Sale };
			currentSale.value = data.data;
			return true;
		} catch (_err) {
			error.value = "Erro ao adicionar item";
			return false;
		} finally {
			loading.value = false;
		}
	};

	/**
	 * Remove item from current sale
	 */
	const removeItem = async (productId: string): Promise<boolean> => {
		if (!currentSale.value) {
			error.value = "Nenhuma venda ativa";
			return false;
		}

		loading.value = true;
		error.value = null;

		try {
			const response = await fetch(
				`${API_BASE_URL}/api/vendas/${currentSale.value.id}/items/${productId}`,
				{
					method: "DELETE",
				},
			);

			if (!response.ok) {
				throw new Error("Failed to remove item");
			}

			const data = (await response.json()) as { data: Sale };
			currentSale.value = data.data;
			return true;
		} catch (_err) {
			error.value = "Erro ao remover item";
			return false;
		} finally {
			loading.value = false;
		}
	};

	/**
	 * Update item quantity
	 */
	const updateItemQuantity = async (
		productId: string,
		quantity: number,
	): Promise<boolean> => {
		if (!currentSale.value) {
			error.value = "Nenhuma venda ativa";
			return false;
		}

		loading.value = true;
		error.value = null;

		try {
			const response = await fetch(
				`${API_BASE_URL}/api/vendas/${currentSale.value.id}/items/${productId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ quantity }),
				},
			);

			if (!response.ok) {
				throw new Error("Failed to update item quantity");
			}

			const data = (await response.json()) as { data: Sale };
			currentSale.value = data.data;
			return true;
		} catch (_err) {
			error.value = "Erro ao atualizar quantidade";
			return false;
		} finally {
			loading.value = false;
		}
	};

	/**
	 * Apply discount to sale
	 */
	const applyDiscount = async (discount: number): Promise<boolean> => {
		if (!currentSale.value) {
			error.value = "Nenhuma venda ativa";
			return false;
		}

		loading.value = true;
		error.value = null;

		try {
			const response = await fetch(
				`${API_BASE_URL}/api/vendas/${currentSale.value.id}/discount`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ discount }),
				},
			);

			if (!response.ok) {
				throw new Error("Failed to apply discount");
			}

			const data = (await response.json()) as { data: Sale };
			currentSale.value = data.data;
			return true;
		} catch (_err) {
			error.value = "Erro ao aplicar desconto";
			return false;
		} finally {
			loading.value = false;
		}
	};

	/**
	 * Apply surcharge (addition) to sale
	 */
	const applySurcharge = async (surcharge: number): Promise<boolean> => {
		if (!currentSale.value) {
			error.value = "Nenhuma venda ativa";
			return false;
		}

		loading.value = true;
		error.value = null;

		try {
			const response = await fetch(
				`${API_BASE_URL}/api/vendas/${currentSale.value.id}/surcharge`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ amount: surcharge }),
				},
			);

			if (!response.ok) {
				throw new Error("Failed to apply surcharge");
			}

			const data = (await response.json()) as {
				id: string;
				addition: number;
				grossTotal: number;
				netTotal: number;
			};

			// Update current sale with new values
			if (currentSale.value) {
				currentSale.value = {
					...currentSale.value,
					addition: data.addition,
					netTotal: data.netTotal,
				};
			}

			return true;
		} catch (_err) {
			error.value = "Erro ao aplicar acréscimo";
			return false;
		} finally {
			loading.value = false;
		}
	};

	/**
	 * Add payment to sale
	 */
	const addPayment = async (
		paymentMethodCode: string,
		amount: number,
	): Promise<boolean> => {
		if (!currentSale.value) {
			error.value = "Nenhuma venda ativa";
			return false;
		}

		loading.value = true;
		error.value = null;

		try {
			const response = await fetch(
				`${API_BASE_URL}/api/vendas/${currentSale.value.id}/payments`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ paymentMethodCode, amount }),
				},
			);

			if (!response.ok) {
				throw new Error("Failed to add payment");
			}

			const data = (await response.json()) as { data: Sale };
			currentSale.value = data.data;
			return true;
		} catch (_err) {
			error.value = "Erro ao adicionar pagamento";
			return false;
		} finally {
			loading.value = false;
		}
	};

	/**
	 * Remove payment from sale by index
	 */
	const removePayment = async (index: number): Promise<boolean> => {
		if (!currentSale.value) {
			error.value = "Nenhuma venda ativa";
			return false;
		}

		if (index < 0 || index >= currentSale.value.payments.length) {
			error.value = "Pagamento inválido";
			return false;
		}

		loading.value = true;
		error.value = null;

		try {
			const response = await fetch(
				`${API_BASE_URL}/api/vendas/${currentSale.value.id}/payments/${index}`,
				{
					method: "DELETE",
				},
			);

			if (!response.ok) {
				throw new Error("Failed to remove payment");
			}

			const data = (await response.json()) as {
				id: string;
				payments: readonly SalePayment[];
				netTotal: number;
			};

			// Update current sale with updated payments
			if (currentSale.value) {
				currentSale.value = {
					...currentSale.value,
					payments: data.payments,
					netTotal: data.netTotal,
				};
			}

			return true;
		} catch (_err) {
			error.value = "Erro ao remover pagamento";
			return false;
		} finally {
			loading.value = false;
		}
	};

	/**
	 * Update customer information (CPF and Email)
	 */
	const updateCustomerInfo = async (
		cpf?: string,
		email?: string,
	): Promise<boolean> => {
		if (!currentSale.value) {
			error.value = "Nenhuma venda ativa";
			return false;
		}

		loading.value = true;
		error.value = null;

		try {
			const response = await fetch(
				`${API_BASE_URL}/api/vendas/${currentSale.value.id}/customer-info`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ cpf, email }),
				},
			);

			if (!response.ok) {
				throw new Error("Failed to update customer info");
			}

			const data = (await response.json()) as { data: Sale };
			currentSale.value = data.data;
			return true;
		} catch (_err) {
			error.value = "Erro ao atualizar dados do cliente";
			return false;
		} finally {
			loading.value = false;
		}
	};

	/**
	 * Finalize sale
	 */
	const finalizeSale = async (): Promise<boolean> => {
		if (!currentSale.value) {
			error.value = "Nenhuma venda ativa";
			return false;
		}

		if (!canFinalize.value) {
			error.value =
				"Venda não pode ser finalizada (verifique itens e pagamentos)";
			return false;
		}

		loading.value = true;
		error.value = null;

		try {
			const response = await fetch(
				`${API_BASE_URL}/api/vendas/${currentSale.value.id}/finalize`,
				{
					method: "POST",
				},
			);

			if (!response.ok) {
				throw new Error("Failed to finalize sale");
			}

			const data = (await response.json()) as { data: Sale };
			currentSale.value = data.data;
			return true;
		} catch (_err) {
			error.value = "Erro ao finalizar venda";
			return false;
		} finally {
			loading.value = false;
		}
	};

	/**
	 * Clear current sale (start new)
	 */
	const clearSale = (): void => {
		currentSale.value = null;
		error.value = null;
	};

	/**
	 * Get sale by ID
	 */
	const getSale = async (saleId: string): Promise<Sale | null> => {
		loading.value = true;
		error.value = null;

		try {
			const response = await fetch(`${API_BASE_URL}/api/vendas/${saleId}`);

			if (!response.ok) {
				throw new Error("Failed to fetch sale");
			}

			const data = (await response.json()) as { data: Sale };
			return data.data;
		} catch (_err) {
			error.value = "Erro ao carregar venda";
			return null;
		} finally {
			loading.value = false;
		}
	};

	return {
		// State
		currentSale,
		loading,
		error,

		// Computed
		hasItems,
		totalItems,
		paidAmount,
		remainingAmount,
		isFullyPaid,
		canFinalize,

		// Actions
		createSale,
		addItem,
		removeItem,
		updateItemQuantity,
		applyDiscount,
		applySurcharge,
		addPayment,
		removePayment,
		updateCustomerInfo,
		finalizeSale,
		clearSale,
		getSale,
	};
});
