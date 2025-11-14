import type { Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import type { CPF } from "../customer/cpf";
import type { CustomerId } from "../customer/customer-id";
import type { Email } from "../customer/email";
import type { SaleId } from "./sale-id";
import type { SaleItem } from "./sale-item";
import type { SalePayment } from "./sale-payment";
import type { SaleStatus } from "./sale-status";

/**
 * Sale Entity
 *
 * Domain invariants:
 * - Must have id and customerId
 * - Can have zero or more items (allows creating empty sale and adding items later)
 * - Gross total is calculated from items
 * - Discount and addition default to 0
 * - Net total = gross total - discount + addition
 * - Status defaults to PENDING
 * - CreatedAt is set automatically if not provided
 * - Payments are optional (empty array by default)
 * - Customer CPF and Email are optional
 * - All fields are immutable
 */
export type Sale = {
	readonly id: SaleId;
	readonly customerId: CustomerId;
	readonly customerCpf?: CPF;
	readonly customerEmail?: Email;
	readonly items: readonly SaleItem[];
	readonly grossTotal: number;
	readonly discount: number;
	readonly addition: number;
	readonly netTotal: number;
	readonly payments: readonly SalePayment[];
	readonly status: SaleStatus;
	readonly createdAt: Date;
};

/**
 * Input for creating a Sale
 */
export type CreateSaleInput = {
	readonly id: SaleId;
	readonly customerId: CustomerId;
	readonly customerCpf?: CPF;
	readonly customerEmail?: Email;
	readonly items?: readonly SaleItem[];
	readonly discount?: number;
	readonly addition?: number;
	readonly payments?: readonly SalePayment[];
	readonly status?: SaleStatus;
	readonly createdAt?: Date;
};

/**
 * Calculate gross total from items
 *
 * @param items - Sale items
 * @returns Gross total rounded to 2 decimal places
 */
const calculateGrossTotal = (items: readonly SaleItem[]): number => {
	return items.reduce((sum, item) => {
		return Math.round((sum + item.total) * 100) / 100;
	}, 0);
};

/**
 * Calculate net total from gross total, discount, and addition
 *
 * @param grossTotal - Gross total
 * @param discount - Discount amount
 * @param addition - Addition amount
 * @returns Net total rounded to 2 decimal places
 */
const calculateNetTotal = (
	grossTotal: number,
	discount: number,
	addition: number,
): number => {
	return Math.round((grossTotal - discount + addition) * 100) / 100;
};

/**
 * Create a Sale entity
 *
 * @param input - Sale data
 * @returns Result with Sale or error message
 */
export const createSale = (input: CreateSaleInput): Result<Sale, string> => {
	const items = input.items ?? [];
	const discount = input.discount ?? 0;
	const addition = input.addition ?? 0;
	const payments = input.payments ?? [];

	// Validate discount is not negative
	if (discount < 0) {
		return ResultUtils.err("Discount cannot be negative");
	}

	// Validate addition is not negative
	if (addition < 0) {
		return ResultUtils.err("Addition cannot be negative");
	}

	// Calculate totals
	const grossTotal = calculateGrossTotal(items);
	const netTotal = calculateNetTotal(grossTotal, discount, addition);

	// Validate net total is not negative
	if (netTotal < 0) {
		return ResultUtils.err(
			"Net total cannot be negative (discount exceeds gross total)",
		);
	}

	// Create immutable sale
	const sale: Sale = {
		id: input.id,
		customerId: input.customerId,
		...(input.customerCpf !== undefined && { customerCpf: input.customerCpf }),
		...(input.customerEmail !== undefined && {
			customerEmail: input.customerEmail,
		}),
		items,
		grossTotal,
		discount,
		addition,
		netTotal,
		payments,
		status: input.status ?? "PENDING",
		createdAt: input.createdAt ?? new Date(),
	};

	return ResultUtils.ok(sale);
};

/**
 * Add item to sale
 *
 * @param sale - Current sale
 * @param item - Item to add
 * @returns Result with updated sale or error message
 */
export const addItemToSale = (
	sale: Sale,
	item: SaleItem,
): Result<Sale, string> => {
	return createSale({
		id: sale.id,
		customerId: sale.customerId,
		items: [...sale.items, item],
		discount: sale.discount,
		addition: sale.addition,
		payments: sale.payments,
		status: sale.status,
		createdAt: sale.createdAt,
	});
};

/**
 * Remove item from sale by product ID
 *
 * @param sale - Current sale
 * @param productId - Product ID to remove
 * @returns Result with updated sale or error message
 */
export const removeItemFromSale = (
	sale: Sale,
	productId: string,
): Result<Sale, string> => {
	const updatedItems = sale.items.filter(
		(item) => item.productId !== productId,
	);

	return createSale({
		id: sale.id,
		customerId: sale.customerId,
		items: updatedItems,
		discount: sale.discount,
		addition: sale.addition,
		payments: sale.payments,
		status: sale.status,
		createdAt: sale.createdAt,
	});
};

/**
 * Update item quantity in sale
 *
 * @param sale - Current sale
 * @param productId - Product ID to update
 * @param newQuantity - New quantity
 * @returns Result with updated sale or error message
 */
export const updateItemQuantity = (
	sale: Sale,
	productId: string,
	newQuantity: number,
): Result<Sale, string> => {
	const itemIndex = sale.items.findIndex(
		(item) => item.productId === productId,
	);

	if (itemIndex === -1) {
		return ResultUtils.err(
			`Item with product ID ${productId} not found in sale`,
		);
	}

	const item = sale.items[itemIndex];
	if (!item) {
		return ResultUtils.err(
			`Item with product ID ${productId} not found in sale`,
		);
	}

	// Validate quantity
	if (newQuantity <= 0) {
		return ResultUtils.err("Quantity must be positive");
	}

	if (!Number.isInteger(newQuantity)) {
		return ResultUtils.err("Quantity must be an integer");
	}

	// Create new item with updated quantity
	const newTotal = Math.round(newQuantity * item.unitPrice * 100) / 100;
	const updatedItem: SaleItem = {
		...item,
		quantity: newQuantity,
		total: newTotal,
	};

	// Create updated items array
	const updatedItems = [...sale.items];
	updatedItems[itemIndex] = updatedItem;

	return createSale({
		id: sale.id,
		customerId: sale.customerId,
		items: updatedItems,
		discount: sale.discount,
		addition: sale.addition,
		payments: sale.payments,
		status: sale.status,
		createdAt: sale.createdAt,
	});
};

/**
 * Apply discount to sale
 *
 * @param sale - Current sale
 * @param discount - Discount amount
 * @returns Result with updated sale or error message
 */
export const applyDiscount = (
	sale: Sale,
	discount: number,
): Result<Sale, string> => {
	return createSale({
		id: sale.id,
		customerId: sale.customerId,
		items: sale.items,
		discount,
		addition: sale.addition,
		payments: sale.payments,
		status: sale.status,
		createdAt: sale.createdAt,
	});
};

/**
 * Apply addition to sale
 *
 * @param sale - Current sale
 * @param addition - Addition amount
 * @returns Result with updated sale or error message
 */
export const applyAddition = (
	sale: Sale,
	addition: number,
): Result<Sale, string> => {
	return createSale({
		id: sale.id,
		customerId: sale.customerId,
		items: sale.items,
		discount: sale.discount,
		addition,
		payments: sale.payments,
		status: sale.status,
		createdAt: sale.createdAt,
	});
};

/**
 * Add payment to sale
 *
 * @param sale - Current sale
 * @param payment - Payment to add
 * @returns Result with updated sale or error message
 */
export const addPaymentToSale = (
	sale: Sale,
	payment: SalePayment,
): Result<Sale, string> => {
	return createSale({
		id: sale.id,
		customerId: sale.customerId,
		items: sale.items,
		discount: sale.discount,
		addition: sale.addition,
		payments: [...sale.payments, payment],
		status: sale.status,
		createdAt: sale.createdAt,
	});
};

/**
 * Check if sale is fully paid
 *
 * @param sale - Sale to check
 * @returns true if total payments >= net total
 */
export const isSaleFullyPaid = (sale: Sale): boolean => {
	const totalPaid = sale.payments.reduce((sum, payment) => {
		return Math.round((sum + payment.amount) * 100) / 100;
	}, 0);
	return totalPaid >= sale.netTotal;
};

/**
 * Get remaining amount to be paid
 *
 * @param sale - Sale to check
 * @returns Remaining amount (0 if fully paid)
 */
export const getRemainingAmount = (sale: Sale): number => {
	const totalPaid = sale.payments.reduce((sum, payment) => {
		return Math.round((sum + payment.amount) * 100) / 100;
	}, 0);
	const remaining = Math.round((sale.netTotal - totalPaid) * 100) / 100;
	return remaining > 0 ? remaining : 0;
};

/**
 * Finalize sale (change status to COMPLETED)
 *
 * @param sale - Current sale
 * @returns Result with finalized sale or error message
 */
export const finalizeSale = (sale: Sale): Result<Sale, string> => {
	// Validate sale has at least one item
	if (sale.items.length === 0) {
		return ResultUtils.err("Cannot finalize sale with no items");
	}

	// Validate sale is fully paid
	if (!isSaleFullyPaid(sale)) {
		return ResultUtils.err(
			`Cannot finalize sale: remaining amount is ${getRemainingAmount(sale).toFixed(2)}`,
		);
	}

	return createSale({
		id: sale.id,
		customerId: sale.customerId,
		items: sale.items,
		discount: sale.discount,
		addition: sale.addition,
		payments: sale.payments,
		status: "COMPLETED",
		createdAt: sale.createdAt,
	});
};
