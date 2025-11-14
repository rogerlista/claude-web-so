import { ResultUtils } from "@pos-nfce/shared";
import { describe, expect, it } from "vitest";
import { createPrice } from "../../domain/product/price";
import { createProductId } from "../../domain/product/product-id";
import { createSKU } from "../../domain/product/sku";
import type { ProductRepository } from "../ports/product-repository";
import { createSearchProducts } from "./search-products";

describe("search-products use case", () => {
	it("should search products by description (case-insensitive, partial match)", async () => {
		const product1Id = createProductId("prod-1");
		const product1Price = createPrice(10.5);
		const product2Id = createProductId("prod-2");
		const product2Price = createPrice(20.0);

		if (
			!product1Id.ok ||
			!product1Price.ok ||
			!product2Id.ok ||
			!product2Price.ok
		) {
			throw new Error("Failed to create test data");
		}

		const mockRepository: ProductRepository = {
			save: async () =>
				ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
			findById: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
			findAll: async () => ResultUtils.ok([]),
			delete: async () => ResultUtils.ok(undefined),
			findBySKU: async () => ResultUtils.ok([]),
			findByGTIN: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
			search: (query) => {
				// Simulate searching by description
				if (query.toLowerCase().includes("arroz")) {
					return Promise.resolve(
						ResultUtils.ok([
							{
								id: product1Id.value,
								description: "Arroz Branco 1kg",
								price: product1Price.value,
							},
							{
								id: product2Id.value,
								description: "Arroz Integral 1kg",
								price: product2Price.value,
							},
						]),
					);
				}
				return Promise.resolve(ResultUtils.ok([]));
			},
		};

		const searchProducts = createSearchProducts({ repository: mockRepository });

		const result = await searchProducts({ query: "arroz" });

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toHaveLength(2);
			expect(result.value[0]?.description).toBe("Arroz Branco 1kg");
			expect(result.value[1]?.description).toBe("Arroz Integral 1kg");
		}
	});

	it("should search products by SKU", async () => {
		const productId = createProductId("prod-1");
		const productPrice = createPrice(15.0);
		const productSKU = createSKU("ARR001");

		if (!productId.ok || !productPrice.ok || !productSKU.ok) {
			throw new Error("Failed to create test data");
		}

		const mockRepository: ProductRepository = {
			save: async () =>
				ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
			findById: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
			findAll: async () => ResultUtils.ok([]),
			delete: async () => ResultUtils.ok(undefined),
			findBySKU: async () => ResultUtils.ok([]),
			findByGTIN: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
			search: (query) => {
				if (query.toUpperCase().includes("ARR")) {
					return Promise.resolve(
						ResultUtils.ok([
							{
								id: productId.value,
								description: "Arroz Branco 1kg",
								price: productPrice.value,
								sku: productSKU.value,
							},
						]),
					);
				}
				return Promise.resolve(ResultUtils.ok([]));
			},
		};

		const searchProducts = createSearchProducts({ repository: mockRepository });

		const result = await searchProducts({ query: "arr001" });

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toHaveLength(1);
			expect(result.value[0]?.sku).toBe(productSKU.value);
		}
	});

	it("should return empty array when no products match", async () => {
		const mockRepository: ProductRepository = {
			save: async () =>
				ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
			findById: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
			findAll: async () => ResultUtils.ok([]),
			delete: async () => ResultUtils.ok(undefined),
			findBySKU: async () => ResultUtils.ok([]),
			findByGTIN: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
			search: async () => ResultUtils.ok([]),
		};

		const searchProducts = createSearchProducts({ repository: mockRepository });

		const result = await searchProducts({ query: "nonexistent" });

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toHaveLength(0);
		}
	});

	it("should reject empty query", async () => {
		const mockRepository: ProductRepository = {
			save: async () =>
				ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
			findById: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
			findAll: async () => ResultUtils.ok([]),
			delete: async () => ResultUtils.ok(undefined),
			findBySKU: async () => ResultUtils.ok([]),
			findByGTIN: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
			search: async () => ResultUtils.ok([]),
		};

		const searchProducts = createSearchProducts({ repository: mockRepository });

		const result = await searchProducts({ query: "" });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain("Query cannot be empty");
		}
	});

	it("should reject whitespace-only query", async () => {
		const mockRepository: ProductRepository = {
			save: async () =>
				ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
			findById: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
			findAll: async () => ResultUtils.ok([]),
			delete: async () => ResultUtils.ok(undefined),
			findBySKU: async () => ResultUtils.ok([]),
			findByGTIN: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
			search: async () => ResultUtils.ok([]),
		};

		const searchProducts = createSearchProducts({ repository: mockRepository });

		const result = await searchProducts({ query: "   " });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain("Query cannot be empty");
		}
	});

	it("should handle repository errors gracefully", async () => {
		const mockRepository: ProductRepository = {
			save: async () =>
				ResultUtils.err({ type: "UNKNOWN", message: "Not implemented" }),
			findById: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
			findAll: async () => ResultUtils.ok([]),
			delete: async () => ResultUtils.ok(undefined),
			findBySKU: async () => ResultUtils.ok([]),
			findByGTIN: async () => ResultUtils.err({ type: "NOT_FOUND", id: "" }),
			search: async () =>
				ResultUtils.err({
					type: "DATABASE_ERROR",
					message: "Connection failed",
				}),
		};

		const searchProducts = createSearchProducts({ repository: mockRepository });

		const result = await searchProducts({ query: "test" });

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain("Connection failed");
		}
	});
});
