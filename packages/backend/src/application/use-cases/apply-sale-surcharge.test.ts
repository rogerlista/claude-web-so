import { ResultUtils } from "@pos-nfce/shared";
import { beforeEach, describe, expect, it } from "vitest";
import { createCustomerId } from "../../domain/customer/customer-id";
import { createPrice } from "../../domain/product/price";
import { createProductId } from "../../domain/product/product-id";
import type { Sale } from "../../domain/sale/sale";
import { createSale } from "../../domain/sale/sale";
import { createSaleId } from "../../domain/sale/sale-id";
import { createSaleItem } from "../../domain/sale/sale-item";
import type { RepositoryError, SaleRepository } from "../ports/sale-repository";
import {
	type ApplySaleSurchargeInput,
	createApplySaleSurchargeUseCase,
} from "./apply-sale-surcharge";

describe("ApplySaleSurchargeUseCase", () => {
	let repository: SaleRepository;
	let applySaleSurcharge: ReturnType<typeof createApplySaleSurchargeUseCase>;

	beforeEach(() => {
		const saleIdResult = createSaleId("sale-1");
		const customerIdResult = createCustomerId("customer-1");

		if (!saleIdResult.ok || !customerIdResult.ok) {
			throw new Error("Failed to create test IDs");
		}

		const productIdResult = createProductId("product-1");
		const priceResult = createPrice(10);

		if (!productIdResult.ok || !priceResult.ok) {
			throw new Error("Failed to create test product data");
		}

		const testItem = createSaleItem({
			productId: productIdResult.value,
			quantity: 10,
			unitPrice: priceResult.value,
		});

		if (!testItem.ok) {
			throw new Error("Failed to create test item");
		}

		const testSale = createSale({
			id: saleIdResult.value,
			customerId: customerIdResult.value,
			items: [testItem.value],
		});

		if (!testSale.ok) {
			throw new Error("Failed to create test sale");
		}

		// Create mock repository
		repository = {
			findById: async () => ResultUtils.ok(testSale.value),
			save: async (sale: Sale) => ResultUtils.ok(sale),
		} as unknown as SaleRepository;

		applySaleSurcharge = createApplySaleSurchargeUseCase(repository);
	});

	it("should apply surcharge to sale", async () => {
		const input: ApplySaleSurchargeInput = {
			saleId: "sale-1",
			surcharge: 10,
		};

		const result = await applySaleSurcharge(input);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.addition).toBe(10);
			expect(result.value.netTotal).toBe(110); // 100 + 10
		}
	});

	it("should return error for invalid sale ID", async () => {
		const input: ApplySaleSurchargeInput = {
			saleId: "",
			surcharge: 10,
		};

		const result = await applySaleSurcharge(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("VALIDATION_ERROR");
		}
	});

	it("should return error for negative surcharge", async () => {
		const input: ApplySaleSurchargeInput = {
			saleId: "sale-1",
			surcharge: -10,
		};

		const result = await applySaleSurcharge(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("VALIDATION_ERROR");
		}
	});

	it("should return error when sale not found", async () => {
		// Create new use case instance with mock that returns NOT_FOUND
		const mockRepository = {
			findById: async () =>
				ResultUtils.err({
					type: "NOT_FOUND",
					id: "sale-999",
				} as RepositoryError),
			save: async (sale: Sale) => ResultUtils.ok(sale),
		} as unknown as SaleRepository;

		const testUseCase = createApplySaleSurchargeUseCase(mockRepository);

		const input: ApplySaleSurchargeInput = {
			saleId: "sale-999",
			surcharge: 10,
		};

		const result = await testUseCase(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("SALE_NOT_FOUND");
		}
	});

	it("should return repository error when save fails", async () => {
		// Create new use case instance with mock that returns error on save
		const saleIdResult = createSaleId("sale-1");
		const customerIdResult = createCustomerId("customer-1");

		if (!saleIdResult.ok || !customerIdResult.ok) {
			throw new Error("Failed to create test IDs");
		}

		const productIdResult = createProductId("product-1");
		const priceResult = createPrice(10);

		if (!productIdResult.ok || !priceResult.ok) {
			throw new Error("Failed to create test product data");
		}

		const testItem = createSaleItem({
			productId: productIdResult.value,
			quantity: 10,
			unitPrice: priceResult.value,
		});

		if (!testItem.ok) {
			throw new Error("Failed to create test item");
		}

		const testSale = createSale({
			id: saleIdResult.value,
			customerId: customerIdResult.value,
			items: [testItem.value],
		});

		if (!testSale.ok) {
			throw new Error("Failed to create test sale");
		}

		const mockRepository = {
			findById: async () => ResultUtils.ok(testSale.value),
			save: async () =>
				ResultUtils.err({
					type: "UNKNOWN",
					message: "Database error",
				} as RepositoryError),
		} as unknown as SaleRepository;

		const testUseCase = createApplySaleSurchargeUseCase(mockRepository);

		const input: ApplySaleSurchargeInput = {
			saleId: "sale-1",
			surcharge: 10,
		};

		const result = await testUseCase(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("REPOSITORY_ERROR");
		}
	});

	it("should preserve existing discount when applying surcharge", async () => {
		const saleIdResult = createSaleId("sale-1");
		const customerIdResult = createCustomerId("customer-1");

		if (!saleIdResult.ok || !customerIdResult.ok) {
			throw new Error("Failed to create test IDs");
		}

		const productIdResult = createProductId("product-1");
		const priceResult = createPrice(10);

		if (!productIdResult.ok || !priceResult.ok) {
			throw new Error("Failed to create test product data");
		}

		const testItem = createSaleItem({
			productId: productIdResult.value,
			quantity: 10,
			unitPrice: priceResult.value,
		});

		if (!testItem.ok) {
			throw new Error("Failed to create test item");
		}

		const saleWithDiscount = createSale({
			id: saleIdResult.value,
			customerId: customerIdResult.value,
			items: [testItem.value],
			discount: 5,
		});

		// Create new repository that returns sale with discount
		repository = {
			...repository,
			findById: async () => {
				if (!saleWithDiscount.ok) {
					throw new Error("Failed to create sale for test");
				}
				return ResultUtils.ok(saleWithDiscount.value);
			},
		};
		applySaleSurcharge = createApplySaleSurchargeUseCase(repository);

		const input: ApplySaleSurchargeInput = {
			saleId: "sale-1",
			surcharge: 10,
		};

		const result = await applySaleSurcharge(input);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.discount).toBe(5);
			expect(result.value.addition).toBe(10);
		}
	});

	it("should replace existing addition with new surcharge", async () => {
		const saleIdResult = createSaleId("sale-1");
		const customerIdResult = createCustomerId("customer-1");

		if (!saleIdResult.ok || !customerIdResult.ok) {
			throw new Error("Failed to create test IDs");
		}

		const productIdResult = createProductId("product-1");
		const priceResult = createPrice(10);

		if (!productIdResult.ok || !priceResult.ok) {
			throw new Error("Failed to create test product data");
		}

		const testItem = createSaleItem({
			productId: productIdResult.value,
			quantity: 10,
			unitPrice: priceResult.value,
		});

		if (!testItem.ok) {
			throw new Error("Failed to create test item");
		}

		const saleWithAddition = createSale({
			id: saleIdResult.value,
			customerId: customerIdResult.value,
			items: [testItem.value],
			addition: 5,
		});

		// Create new repository that returns sale with addition
		repository = {
			...repository,
			findById: async () => {
				if (!saleWithAddition.ok) {
					throw new Error("Failed to create sale for test");
				}
				return ResultUtils.ok(saleWithAddition.value);
			},
		};
		applySaleSurcharge = createApplySaleSurchargeUseCase(repository);

		const input: ApplySaleSurchargeInput = {
			saleId: "sale-1",
			surcharge: 10,
		};

		const result = await applySaleSurcharge(input);

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.addition).toBe(10); // Should replace, not add
		}
	});
});
