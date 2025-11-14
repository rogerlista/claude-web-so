/**
 * Products Store
 * TDD Phase: GREEN - Implementation to pass tests
 */

import { defineStore } from "pinia";
import { ref } from "vue";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface Product {
	readonly id: string;
	readonly sku: string;
	readonly descricao: string;
	readonly preco_unitario: number;
	readonly status: "ativo" | "inativo";
	readonly gtin?: string;
	readonly codigo?: string;
	readonly unidade_medida?: string;
	readonly preco_promocional?: number;
	readonly ncm?: string;
	readonly cest?: string;
	readonly created_at?: string;
	readonly updated_at?: string;
}

export interface CreateProductInput {
	readonly sku: string;
	readonly descricao: string;
	readonly preco_unitario: number;
	readonly status: "ativo" | "inativo";
	readonly gtin?: string;
	readonly codigo?: string;
	readonly unidade_medida?: string;
	readonly preco_promocional?: number;
	readonly ncm?: string;
	readonly cest?: string;
}

export const useProductsStore = defineStore("products", () => {
	const products = ref<readonly Product[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);

	const fetchProducts = async (): Promise<void> => {
		loading.value = true;
		error.value = null;

		try {
			const response = await fetch(`${API_BASE_URL}/api/produtos`);

			if (!response.ok) {
				throw new Error("Failed to fetch products");
			}

			const data = (await response.json()) as { data: readonly Product[] };
			products.value = data.data;
		} catch (_err) {
			error.value = "Erro ao carregar produtos";
			products.value = [];
		} finally {
			loading.value = false;
		}
	};

	const searchProducts = async (query: string): Promise<void> => {
		loading.value = true;
		error.value = null;

		try {
			const response = await fetch(
				`${API_BASE_URL}/api/produtos?q=${encodeURIComponent(query)}`,
			);

			if (!response.ok) {
				throw new Error("Failed to search products");
			}

			const data = (await response.json()) as { data: readonly Product[] };
			products.value = data.data;
		} catch (_err) {
			error.value = "Erro ao buscar produtos";
			products.value = [];
		} finally {
			loading.value = false;
		}
	};

	const createProduct = async (
		input: CreateProductInput,
	): Promise<Product | null> => {
		loading.value = true;
		error.value = null;

		try {
			const response = await fetch(`${API_BASE_URL}/api/produtos`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(input),
			});

			if (!response.ok) {
				throw new Error("Failed to create product");
			}

			const data = (await response.json()) as { data: Product };
			return data.data;
		} catch (_err) {
			error.value = "Erro ao criar produto";
			return null;
		} finally {
			loading.value = false;
		}
	};

	const updateProduct = async (
		id: string,
		input: Partial<CreateProductInput>,
	): Promise<Product | null> => {
		loading.value = true;
		error.value = null;

		try {
			const response = await fetch(`${API_BASE_URL}/api/produtos/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(input),
			});

			if (!response.ok) {
				throw new Error("Failed to update product");
			}

			const data = (await response.json()) as { data: Product };
			return data.data;
		} catch (_err) {
			error.value = "Erro ao atualizar produto";
			return null;
		} finally {
			loading.value = false;
		}
	};

	const deleteProduct = async (id: string): Promise<boolean> => {
		loading.value = true;
		error.value = null;

		try {
			const response = await fetch(`${API_BASE_URL}/api/produtos/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete product");
			}

			return true;
		} catch (_err) {
			error.value = "Erro ao deletar produto";
			return false;
		} finally {
			loading.value = false;
		}
	};

	return {
		products,
		loading,
		error,
		fetchProducts,
		searchProducts,
		createProduct,
		updateProduct,
		deleteProduct,
	};
});
