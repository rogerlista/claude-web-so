import type { Result } from "@pos-nfce/shared";
import { ResultUtils } from "@pos-nfce/shared";
import type { CPF } from "./cpf";
import type { CustomerId } from "./customer-id";
import type { Email } from "./email";
import type { Phone } from "./phone";

/**
 * Customer Entity
 *
 * Domain invariants:
 * - Must have id, name, and cpf (Brazilian tax ID)
 * - Name must be non-empty
 * - Email and phone are optional
 * - All fields are immutable (readonly)
 */
export type Customer = {
	readonly id: CustomerId;
	readonly name: string;
	readonly cpf: CPF;
	readonly email?: Email;
	readonly phone?: Phone;
};

/**
 * Input for creating a Customer
 */
export type CreateCustomerInput = {
	readonly id: CustomerId;
	readonly name: string;
	readonly cpf: CPF;
	readonly email?: Email;
	readonly phone?: Phone;
};

/**
 * Create a Customer entity
 *
 * @param input - Customer data
 * @returns Result with Customer or error message
 */
export const createCustomer = (
	input: CreateCustomerInput,
): Result<Customer, string> => {
	// Validate name
	const trimmedName = input.name.trim();

	if (trimmedName.length === 0) {
		return ResultUtils.err("Name cannot be empty");
	}

	// Create immutable customer
	const customer: Customer = {
		id: input.id,
		name: trimmedName,
		cpf: input.cpf,
		...(input.email !== undefined && { email: input.email }),
		...(input.phone !== undefined && { phone: input.phone }),
	};

	return ResultUtils.ok(customer);
};
