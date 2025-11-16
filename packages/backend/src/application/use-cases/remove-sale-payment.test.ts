/**
 * Tests for RemoveSalePayment Use Case
 * Task 2.2: Tests for remove-sale-payment
 * TDD Phase: RED - Write failing tests first
 */

import type { Result } from "@pos-nfce/shared";
import { beforeEach, describe, expect, it } from "vitest";
import { createCustomerId } from "../../domain/customer/customer-id";
import { createPaymentMethod } from "../../domain/sale/payment-method";
import { createSale } from "../../domain/sale/sale";
import { createSaleId } from "../../domain/sale/sale-id";
import { createSalePayment } from "../../domain/sale/sale-payment";
import type { RepositoryError, SaleRepository } from "../ports/sale-repository";
import {
	createRemoveSalePaymentUseCase,
	type RemoveSalePaymentInput,
	type RemoveSalePaymentUseCaseError,
} from "./remove-sale-payment";

// Mutable mock repository for tests
interface MockSaleRepository {
	findById: SaleRepository["findById"];
	save: SaleRepository["save"];
	findAll: SaleRepository["findAll"];
	delete: SaleRepository["delete"];
	findByCustomerId: SaleRepository["findByCustomerId"];
	findByStatus: SaleRepository["findByStatus"];
}

describe("RemoveSalePayment Use Case", () => {
	let mockRepository: MockSaleRepository;

	beforeEach(() => {
		mockRepository = {
			findById: async () => ({
				ok: false,
				error: { type: "NOT_FOUND" as const, id: "unknown" },
			}),
			save: async () => ({
				ok: false,
				error: { type: "UNKNOWN" as const, message: "Not implemented" },
			}),
			findAll: async () => ({
				ok: false,
				error: { type: "UNKNOWN" as const, message: "Not implemented" },
			}),
			delete: async () => ({
				ok: false,
				error: { type: "UNKNOWN" as const, message: "Not implemented" },
			}),
			findByCustomerId: async () => ({
				ok: false,
				error: { type: "UNKNOWN" as const, message: "Not implemented" },
			}),
			findByStatus: async () => ({
				ok: false,
				error: { type: "UNKNOWN" as const, message: "Not implemented" },
			}),
		};
	});

	describe("Success Cases", () => {
		it("should remove payment from sale", async () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const paymentMethodResult = createPaymentMethod("01");

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!paymentMethodResult.ok
			) {
				throw new Error("Test setup failed");
			}

			// Create sale with two payments
			const payment1Result = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 60.0,
			});

			const payment2Result = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 40.0,
			});

			if (!payment1Result.ok || !payment2Result.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				payments: [payment1Result.value, payment2Result.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			const sale = saleResult.value;

			// Mock repository to return the sale
			mockRepository.findById = async () => ({ ok: true, value: sale });
			mockRepository.save = async (updatedSale) => ({
				ok: true,
				value: updatedSale,
			});

			const useCase = createRemoveSalePaymentUseCase(mockRepository);
			const input: RemoveSalePaymentInput = {
				saleId: "sale-123",
				paymentIndex: 0,
			};

			const result = await useCase(input);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.payments).toHaveLength(1);
				expect(result.value.payments[0]?.amount).toBe(40.0);
			}
		});

		it("should remove last payment from sale", async () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const paymentMethodResult = createPaymentMethod("01");

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!paymentMethodResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const payment1Result = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 60.0,
			});

			const payment2Result = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 40.0,
			});

			if (!payment1Result.ok || !payment2Result.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				payments: [payment1Result.value, payment2Result.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			const sale = saleResult.value;

			mockRepository.findById = async () => ({ ok: true, value: sale });
			mockRepository.save = async (updatedSale) => ({
				ok: true,
				value: updatedSale,
			});

			const useCase = createRemoveSalePaymentUseCase(mockRepository);
			const input: RemoveSalePaymentInput = {
				saleId: "sale-123",
				paymentIndex: 1,
			};

			const result = await useCase(input);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.payments).toHaveLength(1);
				expect(result.value.payments[0]?.amount).toBe(60.0);
			}
		});
	});

	describe("Validation Errors", () => {
		it("should return error for invalid sale ID", async () => {
			const useCase = createRemoveSalePaymentUseCase(mockRepository);
			const input: RemoveSalePaymentInput = {
				saleId: "", // Invalid
				paymentIndex: 0,
			};

			const result: Result<unknown, RemoveSalePaymentUseCaseError> =
				await useCase(input);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("VALIDATION_ERROR");
			}
		});

		it("should return error for negative payment index", async () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");

			if (!saleIdResult.ok || !customerIdResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			mockRepository.findById = async () => ({
				ok: true,
				value: saleResult.value,
			});

			const useCase = createRemoveSalePaymentUseCase(mockRepository);
			const input: RemoveSalePaymentInput = {
				saleId: "sale-123",
				paymentIndex: -1,
			};

			const result = await useCase(input);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("VALIDATION_ERROR");
				if (result.error.type === "VALIDATION_ERROR") {
					expect(result.error.message).toContain("Invalid payment index");
				}
			}
		});

		it("should return error for out of bounds payment index", async () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const paymentMethodResult = createPaymentMethod("01");

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!paymentMethodResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const paymentResult = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 50.0,
			});

			if (!paymentResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				payments: [paymentResult.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			mockRepository.findById = async () => ({
				ok: true,
				value: saleResult.value,
			});

			const useCase = createRemoveSalePaymentUseCase(mockRepository);
			const input: RemoveSalePaymentInput = {
				saleId: "sale-123",
				paymentIndex: 5, // Out of bounds
			};

			const result = await useCase(input);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("VALIDATION_ERROR");
				if (result.error.type === "VALIDATION_ERROR") {
					expect(result.error.message).toContain("Invalid payment index");
				}
			}
		});
	});

	describe("Repository Errors", () => {
		it("should return error when sale not found", async () => {
			mockRepository.findById = async () => ({
				ok: false,
				error: { type: "NOT_FOUND" as const, id: "sale-999" },
			});

			const useCase = createRemoveSalePaymentUseCase(mockRepository);
			const input: RemoveSalePaymentInput = {
				saleId: "sale-999",
				paymentIndex: 0,
			};

			const result = await useCase(input);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("SALE_NOT_FOUND");
				if (result.error.type === "SALE_NOT_FOUND") {
					expect(result.error.saleId).toBe("sale-999");
				}
			}
		});

		it("should return error when repository findById fails", async () => {
			mockRepository.findById = async () => ({
				ok: false,
				error: { type: "UNKNOWN" as const, message: "Database error" },
			});

			const useCase = createRemoveSalePaymentUseCase(mockRepository);
			const input: RemoveSalePaymentInput = {
				saleId: "sale-123",
				paymentIndex: 0,
			};

			const result = await useCase(input);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("REPOSITORY_ERROR");
			}
		});

		it("should return error when repository save fails", async () => {
			const saleIdResult = createSaleId("sale-123");
			const customerIdResult = createCustomerId("customer-123");
			const paymentMethodResult = createPaymentMethod("01");

			if (
				!saleIdResult.ok ||
				!customerIdResult.ok ||
				!paymentMethodResult.ok
			) {
				throw new Error("Test setup failed");
			}

			const paymentResult = createSalePayment({
				paymentMethod: paymentMethodResult.value,
				amount: 100.0,
			});

			if (!paymentResult.ok) {
				throw new Error("Test setup failed");
			}

			const saleResult = createSale({
				id: saleIdResult.value,
				customerId: customerIdResult.value,
				payments: [paymentResult.value],
			});

			if (!saleResult.ok) {
				throw new Error("Test setup failed");
			}

			mockRepository.findById = async () => ({
				ok: true,
				value: saleResult.value,
			});
			mockRepository.save = async () => ({
				ok: false,
				error: {
					type: "UNKNOWN" as const,
					message: "Failed to save",
				} as RepositoryError,
			});

			const useCase = createRemoveSalePaymentUseCase(mockRepository);
			const input: RemoveSalePaymentInput = {
				saleId: "sale-123",
				paymentIndex: 0,
			};

			const result = await useCase(input);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("REPOSITORY_ERROR");
			}
		});
	});
});
