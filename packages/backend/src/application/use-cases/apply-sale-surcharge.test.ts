import { beforeEach, describe, expect, it } from "vitest";
import type { Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import { createCustomerId } from "../../domain/customer/customer-id";
import { createSale } from "../../domain/sale/sale";
import { createSaleId } from "../../domain/sale/sale-id";
import type { Sale } from "../../domain/sale/sale";
import type { RepositoryError, SaleRepository } from "../ports/sale-repository";
import {
	createApplySaleSurchargeUseCase,
	type ApplySaleSurchargeInput,
	type ApplySaleSurchargeUseCaseError,
} from "./apply-sale-surcharge";

describe("ApplySaleSurchargeUseCase", () => {
	let repository: SaleRepository;
	let applySaleSurcharge: ReturnType<typeof createApplySaleSurchargeUseCase>;

	beforeEach(() => {
		// Create mock repository
		repository = {
			findById: async () =>
				ResultUtils.ok({
					id: createSaleId("sale-1").value,
					customerId: createCustomerId("customer-1").value,
					items: [],
					grossTotal: 100,
					discount: 0,
					addition: 0,
					netTotal: 100,
					payments: [],
					status: "PENDING",
					createdAt: new Date(),
				} as Sale),
			save: async (sale: Sale) => ResultUtils.ok(sale),
		} as SaleRepository;

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
		repository.findById = async () =>
			ResultUtils.err({
				type: "NOT_FOUND",
				message: "Sale not found",
			} as RepositoryError);

		const input: ApplySaleSurchargeInput = {
			saleId: "sale-999",
			surcharge: 10,
		};

		const result = await applySaleSurcharge(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("SALE_NOT_FOUND");
		}
	});

	it("should return repository error when save fails", async () => {
		repository.save = async () =>
			ResultUtils.err({
				type: "INTERNAL_ERROR",
				message: "Database error",
			} as RepositoryError);

		const input: ApplySaleSurchargeInput = {
			saleId: "sale-1",
			surcharge: 10,
		};

		const result = await applySaleSurcharge(input);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.type).toBe("REPOSITORY_ERROR");
		}
	});

	it("should preserve existing discount when applying surcharge", async () => {
		const saleWithDiscount = createSale({
			id: createSaleId("sale-1").value,
			customerId: createCustomerId("customer-1").value,
			items: [],
			discount: 5,
		});

		repository.findById = async () => saleWithDiscount;

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
		const saleWithAddition = createSale({
			id: createSaleId("sale-1").value,
			customerId: createCustomerId("customer-1").value,
			items: [],
			addition: 5,
		});

		repository.findById = async () => saleWithAddition;

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
