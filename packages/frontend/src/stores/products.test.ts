/**
 * Products Store Tests
 * TDD Phase: RED - Tests written before implementation
 */

import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProductsStore } from "./products";

describe("useProductsStore", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it("should initialize with empty products array", () => {
		const store = useProductsStore();
		expect(store.products).toEqual([]);
	});

	it("should initialize with loading false", () => {
		const store = useProductsStore();
		expect(store.loading).toBe(false);
	});

	it("should initialize with error null", () => {
		const store = useProductsStore();
		expect(store.error).toBe(null);
	});

	it("should fetch products successfully", async () => {
		const store = useProductsStore();

		// Mock fetch
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				data: [
					{
						id: "1",
						sku: "TEST001",
						descricao: "Test Product",
						preco_unitario: 10.0,
						status: "ativo",
					},
				],
			}),
		});

		await store.fetchProducts();

		expect(store.loading).toBe(false);
		expect(store.error).toBe(null);
		expect(store.products).toHaveLength(1);
		expect(store.products[0]?.id).toBe("1");
	});

	it("should set loading true while fetching", async () => {
		const store = useProductsStore();

		global.fetch = vi.fn().mockImplementation(
			() =>
				new Promise((resolve) => {
					setTimeout(
						() =>
							resolve({
								ok: true,
								json: async () => ({ data: [] }),
							}),
						100,
					);
				}),
		);

		const promise = store.fetchProducts();
		expect(store.loading).toBe(true);
		await promise;
	});

	it("should handle fetch error", async () => {
		const store = useProductsStore();

		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
			statusText: "Internal Server Error",
		});

		await store.fetchProducts();

		expect(store.loading).toBe(false);
		expect(store.error).toBe("Erro ao carregar produtos");
		expect(store.products).toEqual([]);
	});

	it("should search products by term", async () => {
		const store = useProductsStore();

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				data: [
					{
						id: "1",
						sku: "TEST001",
						descricao: "Test Product",
						preco_unitario: 10.0,
						status: "ativo",
					},
				],
			}),
		});

		await store.searchProducts("test");

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining("/api/produtos?q=test"),
		);
		expect(store.products).toHaveLength(1);
	});

	it("should create product successfully", async () => {
		const store = useProductsStore();

		const newProduct = {
			sku: "TEST001",
			descricao: "Test Product",
			preco_unitario: 10.0,
			status: "ativo" as const,
		};

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				data: { id: "1", ...newProduct },
			}),
		});

		const result = await store.createProduct(newProduct);

		expect(result).toBeDefined();
		expect(result?.id).toBe("1");
		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining("/api/produtos"),
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify(newProduct),
			}),
		);
	});

	it("should update product successfully", async () => {
		const store = useProductsStore();

		const updatedProduct = {
			id: "1",
			sku: "TEST001",
			descricao: "Updated Product",
			preco_unitario: 15.0,
			status: "ativo" as const,
		};

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				data: updatedProduct,
			}),
		});

		const result = await store.updateProduct("1", updatedProduct);

		expect(result).toBeDefined();
		expect(result?.descricao).toBe("Updated Product");
	});

	it("should delete product successfully", async () => {
		const store = useProductsStore();

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ success: true }),
		});

		const result = await store.deleteProduct("1");

		expect(result).toBe(true);
		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining("/api/produtos/1"),
			expect.objectContaining({
				method: "DELETE",
			}),
		);
	});
});
