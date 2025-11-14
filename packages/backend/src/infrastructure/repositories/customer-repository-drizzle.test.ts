import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { beforeEach, describe, expect, it } from "vitest";
import { createCPF } from "../../domain/customer/cpf";
import type { Customer } from "../../domain/customer/customer";
import { createCustomerId } from "../../domain/customer/customer-id";
import { createEmail } from "../../domain/customer/email";
import { createPhone } from "../../domain/customer/phone";
import { createCustomerRepositoryDrizzle } from "./customer-repository-drizzle";

/**
 * TDD - RED Phase
 * Tests for CustomerRepository Drizzle adapter
 */

describe("CustomerRepository Drizzle Adapter", () => {
	let sqlite: Database.Database;
	let db: ReturnType<typeof drizzle>;
	let repository: ReturnType<typeof createCustomerRepositoryDrizzle>;

	beforeEach(() => {
		sqlite = new Database(":memory:");
		db = drizzle(sqlite);

		// Create customers table
		sqlite.exec(`
      CREATE TABLE customers (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        phone TEXT,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);

		repository = createCustomerRepositoryDrizzle(db);
	});

	describe("save", () => {
		it("should save a new customer", async () => {
			const idResult = createCustomerId("customer-123");
			const cpfResult = createCPF("123.456.789-09");

			if (!idResult.ok || !cpfResult.ok) {
				throw new Error("Setup failed");
			}

			const customer: Customer = {
				id: idResult.value,
				name: "João Silva",
				cpf: cpfResult.value,
			};

			const result = await repository.save(customer);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.id).toBe("customer-123");
				expect(result.value.name).toBe("João Silva");
				expect(result.value.cpf).toBe("12345678909");
			}
		});

		it("should save a customer with email and phone", async () => {
			const idResult = createCustomerId("customer-123");
			const cpfResult = createCPF("123.456.789-09");
			const emailResult = createEmail("joao@example.com");
			const phoneResult = createPhone("11987654321");

			if (!idResult.ok || !cpfResult.ok || !emailResult.ok || !phoneResult.ok) {
				throw new Error("Setup failed");
			}

			const customer: Customer = {
				id: idResult.value,
				name: "João Silva",
				cpf: cpfResult.value,
				email: emailResult.value,
				phone: phoneResult.value,
			};

			const result = await repository.save(customer);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.email).toBe("joao@example.com");
				expect(result.value.phone).toBe("11987654321");
			}
		});

		it("should update existing customer (upsert)", async () => {
			const idResult = createCustomerId("customer-123");
			const cpfResult = createCPF("123.456.789-09");

			if (!idResult.ok || !cpfResult.ok) {
				throw new Error("Setup failed");
			}

			const customer: Customer = {
				id: idResult.value,
				name: "João Silva",
				cpf: cpfResult.value,
			};

			await repository.save(customer);

			const updatedCustomer: Customer = {
				id: idResult.value,
				name: "João Silva Updated",
				cpf: cpfResult.value,
			};

			const result = await repository.save(updatedCustomer);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.name).toBe("João Silva Updated");
			}
		});

		it("should handle database error", async () => {
			const idResult = createCustomerId("customer-123");
			const cpfResult = createCPF("123.456.789-09");

			if (!idResult.ok || !cpfResult.ok) {
				throw new Error("Setup failed");
			}

			const customer: Customer = {
				id: idResult.value,
				name: "João Silva",
				cpf: cpfResult.value,
			};

			// Close database to trigger error
			sqlite.close();

			const result = await repository.save(customer);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("DATABASE_ERROR");
			}
		});
	});

	describe("findById", () => {
		it("should find a customer by ID", async () => {
			const idResult = createCustomerId("customer-123");
			const cpfResult = createCPF("123.456.789-09");

			if (!idResult.ok || !cpfResult.ok) {
				throw new Error("Setup failed");
			}

			await repository.save({
				id: idResult.value,
				name: "João Silva",
				cpf: cpfResult.value,
			});

			const result = await repository.findById(idResult.value);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.name).toBe("João Silva");
			}
		});

		it("should return NOT_FOUND for non-existent customer", async () => {
			const idResult = createCustomerId("non-existent");
			if (!idResult.ok) {
				throw new Error("Setup failed");
			}

			const result = await repository.findById(idResult.value);

			expect(result.ok).toBe(false);
			if (!result.ok && result.error.type === "NOT_FOUND") {
				expect(result.error.type).toBe("NOT_FOUND");
			}
		});

		it("should handle database error during select", async () => {
			const idResult = createCustomerId("customer-123");
			if (!idResult.ok) {
				throw new Error("Setup failed");
			}

			// Close database to trigger error
			sqlite.close();

			const result = await repository.findById(idResult.value);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("DATABASE_ERROR");
			}
		});

		it("should handle invalid customer data in database", async () => {
			// Insert customer with invalid CPF format directly
			sqlite.exec(`
        INSERT INTO customers (id, name, cpf)
        VALUES ('invalid-123', 'Test', 'INVALID_CPF')
      `);

			const idResult = createCustomerId("invalid-123");
			if (!idResult.ok) {
				throw new Error("Setup failed");
			}

			const result = await repository.findById(idResult.value);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("DATABASE_ERROR");
			}
		});
	});

	describe("findByCPF", () => {
		it("should find customer by CPF", async () => {
			const idResult = createCustomerId("customer-123");
			const cpfResult = createCPF("123.456.789-09");

			if (!idResult.ok || !cpfResult.ok) {
				throw new Error("Setup failed");
			}

			await repository.save({
				id: idResult.value,
				name: "João Silva",
				cpf: cpfResult.value,
			});

			const result = await repository.findByCPF("12345678909");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.name).toBe("João Silva");
			}
		});

		it("should return NOT_FOUND when CPF does not exist", async () => {
			const result = await repository.findByCPF("99999999999");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("NOT_FOUND");
			}
		});

		it("should handle database error", async () => {
			// Close database to trigger error
			sqlite.close();

			const result = await repository.findByCPF("12345678909");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("DATABASE_ERROR");
			}
		});

		it("should handle invalid customer data in database", async () => {
			// Insert customer with invalid CPF format directly
			sqlite.exec(`
        INSERT INTO customers (id, name, cpf)
        VALUES ('invalid-456', 'Test', 'INVALID_CPF')
      `);

			const result = await repository.findByCPF("INVALID_CPF");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("DATABASE_ERROR");
			}
		});
	});

	describe("findByEmail", () => {
		it("should find customer by email", async () => {
			const idResult = createCustomerId("customer-123");
			const cpfResult = createCPF("123.456.789-09");
			const emailResult = createEmail("joao@example.com");

			if (!idResult.ok || !cpfResult.ok || !emailResult.ok) {
				throw new Error("Setup failed");
			}

			await repository.save({
				id: idResult.value,
				name: "João Silva",
				cpf: cpfResult.value,
				email: emailResult.value,
			});

			const result = await repository.findByEmail("joao@example.com");

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.email).toBe("joao@example.com");
			}
		});

		it("should return NOT_FOUND when email does not exist", async () => {
			const result = await repository.findByEmail("nonexistent@example.com");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("NOT_FOUND");
			}
		});

		it("should handle database error", async () => {
			// Close database to trigger error
			sqlite.close();

			const result = await repository.findByEmail("test@example.com");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("DATABASE_ERROR");
			}
		});

		it("should handle invalid customer data in database", async () => {
			// Insert customer with invalid email format directly
			sqlite.exec(`
        INSERT INTO customers (id, name, cpf, email)
        VALUES ('invalid-789', 'Test', '11111111111', 'INVALID_EMAIL')
      `);

			const result = await repository.findByEmail("INVALID_EMAIL");

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("DATABASE_ERROR");
			}
		});
	});

	describe("delete", () => {
		it("should delete a customer", async () => {
			const idResult = createCustomerId("customer-123");
			const cpfResult = createCPF("123.456.789-09");

			if (!idResult.ok || !cpfResult.ok) {
				throw new Error("Setup failed");
			}

			await repository.save({
				id: idResult.value,
				name: "João Silva",
				cpf: cpfResult.value,
			});

			const deleteResult = await repository.delete(idResult.value);
			expect(deleteResult.ok).toBe(true);

			const findResult = await repository.findById(idResult.value);
			expect(findResult.ok).toBe(false);
		});

		it("should return NOT_FOUND when customer does not exist", async () => {
			const idResult = createCustomerId("non-existent");
			if (!idResult.ok) {
				throw new Error("Setup failed");
			}

			const result = await repository.delete(idResult.value);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("NOT_FOUND");
			}
		});

		it("should handle database error", async () => {
			const idResult = createCustomerId("customer-123");
			if (!idResult.ok) {
				throw new Error("Setup failed");
			}

			// Close database to trigger error
			sqlite.close();

			const result = await repository.delete(idResult.value);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("DATABASE_ERROR");
			}
		});
	});

	describe("findAll", () => {
		it("should return empty array when no customers exist", async () => {
			const result = await repository.findAll();

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toHaveLength(0);
			}
		});

		it("should return all customers", async () => {
			const id1Result = createCustomerId("customer-1");
			const cpf1Result = createCPF("123.456.789-09");
			const id2Result = createCustomerId("customer-2");
			const cpf2Result = createCPF("987.654.321-00");

			if (!id1Result.ok || !cpf1Result.ok || !id2Result.ok || !cpf2Result.ok) {
				throw new Error("Setup failed");
			}

			await repository.save({
				id: id1Result.value,
				name: "João Silva",
				cpf: cpf1Result.value,
			});

			await repository.save({
				id: id2Result.value,
				name: "Maria Santos",
				cpf: cpf2Result.value,
			});

			const result = await repository.findAll();

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toHaveLength(2);
				expect(result.value[0]?.name).toBe("João Silva");
				expect(result.value[1]?.name).toBe("Maria Santos");
			}
		});

		it("should handle database error during select", async () => {
			// Close database to trigger error
			sqlite.close();

			const result = await repository.findAll();

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("DATABASE_ERROR");
			}
		});

		it("should handle invalid data in database", async () => {
			// Insert customer with invalid CPF format directly
			sqlite.exec(`
        INSERT INTO customers (id, name, cpf)
        VALUES ('invalid-all', 'Test', 'INVALID_CPF')
      `);

			const result = await repository.findAll();

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("DATABASE_ERROR");
			}
		});
	});
});
