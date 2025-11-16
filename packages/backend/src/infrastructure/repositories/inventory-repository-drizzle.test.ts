import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { beforeEach, describe, expect, it } from "vitest";
import { createInventoryId } from "../../domain/inventory/inventory-id";
import { createInventoryMovement } from "../../domain/inventory/inventory-movement";
import { createQuantity } from "../../domain/inventory/quantity";
import { createProductId } from "../../domain/product/product-id";
import { createInventoryRepositoryDrizzle } from "./inventory-repository-drizzle";

/**
 * TDD - Tests for InventoryRepositoryDrizzle
 */

describe("InventoryRepositoryDrizzle", () => {
	let sqlite: Database.Database;
	let db: ReturnType<typeof drizzle>;
	let repository: ReturnType<typeof createInventoryRepositoryDrizzle>;

	beforeEach(() => {
		// Create in-memory SQLite database
		sqlite = new Database(":memory:");
		sqlite.pragma("foreign_keys = ON");

		// Initialize Drizzle
		db = drizzle(sqlite);

		// Create tables
		sqlite.exec(`
      CREATE TABLE products (
        id TEXT PRIMARY KEY NOT NULL,
        description TEXT NOT NULL,
        price_in_cents INTEGER NOT NULL,
        unidade_medida TEXT DEFAULT 'UN',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

		sqlite.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        login TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);

		sqlite.exec(`
      CREATE TABLE inventory (
        id TEXT PRIMARY KEY NOT NULL,
        product_id TEXT NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        movement_type TEXT NOT NULL,
        user_id TEXT REFERENCES users(id),
        adjustment_reason TEXT,
        description TEXT,
        movement_date INTEGER NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);

		// Create repository
		repository = createInventoryRepositoryDrizzle(db);

		// Insert test product
		sqlite.exec(`
      INSERT INTO products (id, description, price_in_cents, unidade_medida, created_at, updated_at)
      VALUES ('prod-001', 'Test Product', 1000, 'UN', ${Date.now()}, ${Date.now()})
    `);
	});

	describe("saveMovement", () => {
		it("should save entrada movement successfully", async () => {
			const idResult = createInventoryId("inv-001");
			const productIdResult = createProductId("prod-001");
			const quantityResult = createQuantity(10.5);

			if (!idResult.ok || !productIdResult.ok || !quantityResult.ok) {
				throw new Error("Invalid test data");
			}

			const movementResult = createInventoryMovement({
				id: idResult.value,
				productId: productIdResult.value,
				quantity: quantityResult.value,
				type: "entrada",
				date: new Date("2024-01-01"),
			});

			if (!movementResult.ok) {
				throw new Error("Invalid movement");
			}

			const result = await repository.saveMovement(movementResult.value);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.id).toBe(idResult.value);
				expect(result.value.productId).toBe(productIdResult.value);
				expect(result.value.type).toBe("entrada");
			}
		});

		it("should save movement with description", async () => {
			const idResult = createInventoryId("inv-002");
			const productIdResult = createProductId("prod-001");
			const quantityResult = createQuantity(5);

			if (!idResult.ok || !productIdResult.ok || !quantityResult.ok) {
				throw new Error("Invalid test data");
			}

			const movementResult = createInventoryMovement({
				id: idResult.value,
				productId: productIdResult.value,
				quantity: quantityResult.value,
				type: "ajuste",
				date: new Date("2024-01-02"),
				description: "Inventory adjustment",
			});

			if (!movementResult.ok) {
				throw new Error("Invalid movement");
			}

			const result = await repository.saveMovement(movementResult.value);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.description).toBe("Inventory adjustment");
			}
		});

		it("should reject duplicate id", async () => {
			const idResult = createInventoryId("inv-003");
			const productIdResult = createProductId("prod-001");
			const quantityResult = createQuantity(10);

			if (!idResult.ok || !productIdResult.ok || !quantityResult.ok) {
				throw new Error("Invalid test data");
			}

			const movementResult = createInventoryMovement({
				id: idResult.value,
				productId: productIdResult.value,
				quantity: quantityResult.value,
				type: "entrada",
				date: new Date("2024-01-01"),
			});

			if (!movementResult.ok) {
				throw new Error("Invalid movement");
			}

			// Save first time
			await repository.saveMovement(movementResult.value);

			// Try to save again with same id
			const result = await repository.saveMovement(movementResult.value);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("DUPLICATE");
			}
		});

		it("should handle foreign key error for non-existent product", async () => {
			const idResult = createInventoryId("inv-004");
			const productIdResult = createProductId("non-existent");
			const quantityResult = createQuantity(10);

			if (!idResult.ok || !productIdResult.ok || !quantityResult.ok) {
				throw new Error("Invalid test data");
			}

			const movementResult = createInventoryMovement({
				id: idResult.value,
				productId: productIdResult.value,
				quantity: quantityResult.value,
				type: "entrada",
				date: new Date("2024-01-01"),
			});

			if (!movementResult.ok) {
				throw new Error("Invalid movement");
			}

			const result = await repository.saveMovement(movementResult.value);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("UNKNOWN");
			}
		});
	});

	describe("getStock", () => {
		it("should calculate stock from multiple movements", async () => {
			const productIdResult = createProductId("prod-001");
			if (!productIdResult.ok) {
				throw new Error("Invalid product id");
			}

			// Create movements: +10, +5, -3 = 12
			const movements = [
				{ id: "inv-010", quantity: 10, type: "entrada" as const },
				{ id: "inv-011", quantity: 5, type: "entrada" as const },
				{ id: "inv-012", quantity: 3, type: "saida" as const },
			];

			for (const mov of movements) {
				const idResult = createInventoryId(mov.id);
				const qtyResult = createQuantity(mov.quantity);

				if (!idResult.ok || !qtyResult.ok) {
					throw new Error("Invalid movement data");
				}

				const movementResult = createInventoryMovement({
					id: idResult.value,
					productId: productIdResult.value,
					quantity: qtyResult.value,
					type: mov.type,
					date: new Date(),
				});

				if (!movementResult.ok) {
					throw new Error("Invalid movement");
				}

				await repository.saveMovement(movementResult.value);
			}

			const result = await repository.getStock(productIdResult.value);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.currentQuantity).toBe(12);
				expect(result.value.productId).toBe(productIdResult.value);
				expect(result.value.lastMovementDate).toBeDefined();
			}
		});

		it("should return NOT_FOUND for product with no movements", async () => {
			const productIdResult = createProductId("prod-001");
			if (!productIdResult.ok) {
				throw new Error("Invalid product id");
			}

			const result = await repository.getStock(productIdResult.value);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("NOT_FOUND");
			}
		});

		it("should handle ajuste movements correctly", async () => {
			const productIdResult = createProductId("prod-001");
			if (!productIdResult.ok) {
				throw new Error("Invalid product id");
			}

			// Create movements: +10, ajuste to 15 = 15
			const movements = [
				{ id: "inv-020", quantity: 10, type: "entrada" as const },
				{ id: "inv-021", quantity: 15, type: "ajuste" as const },
			];

			for (const mov of movements) {
				const idResult = createInventoryId(mov.id);
				const qtyResult = createQuantity(mov.quantity);

				if (!idResult.ok || !qtyResult.ok) {
					throw new Error("Invalid movement data");
				}

				const movementResult = createInventoryMovement({
					id: idResult.value,
					productId: productIdResult.value,
					quantity: qtyResult.value,
					type: mov.type,
					date: new Date(),
				});

				if (!movementResult.ok) {
					throw new Error("Invalid movement");
				}

				await repository.saveMovement(movementResult.value);
			}

			const result = await repository.getStock(productIdResult.value);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.currentQuantity).toBe(15);
			}
		});
	});

	describe("listMovements", () => {
		it("should list all movements for a product", async () => {
			const productIdResult = createProductId("prod-001");
			if (!productIdResult.ok) {
				throw new Error("Invalid product id");
			}

			// Create 3 movements
			const movements = [
				{ id: "inv-030", quantity: 10, type: "entrada" as const },
				{ id: "inv-031", quantity: 5, type: "entrada" as const },
				{ id: "inv-032", quantity: 3, type: "saida" as const },
			];

			for (const mov of movements) {
				const idResult = createInventoryId(mov.id);
				const qtyResult = createQuantity(mov.quantity);

				if (!idResult.ok || !qtyResult.ok) {
					throw new Error("Invalid movement data");
				}

				const movementResult = createInventoryMovement({
					id: idResult.value,
					productId: productIdResult.value,
					quantity: qtyResult.value,
					type: mov.type,
					date: new Date(),
				});

				if (!movementResult.ok) {
					throw new Error("Invalid movement");
				}

				await repository.saveMovement(movementResult.value);
			}

			const result = await repository.listMovements(productIdResult.value);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.length).toBe(3);
			}
		});

		it("should return empty array for product with no movements", async () => {
			const productIdResult = createProductId("prod-001");
			if (!productIdResult.ok) {
				throw new Error("Invalid product id");
			}

			const result = await repository.listMovements(productIdResult.value);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.length).toBe(0);
			}
		});
	});

	describe("findById", () => {
		it("should find movement by id", async () => {
			const idResult = createInventoryId("inv-040");
			const productIdResult = createProductId("prod-001");
			const quantityResult = createQuantity(10);

			if (!idResult.ok || !productIdResult.ok || !quantityResult.ok) {
				throw new Error("Invalid test data");
			}

			const movementResult = createInventoryMovement({
				id: idResult.value,
				productId: productIdResult.value,
				quantity: quantityResult.value,
				type: "entrada",
				date: new Date("2024-01-01"),
				description: "Test movement",
			});

			if (!movementResult.ok) {
				throw new Error("Invalid movement");
			}

			await repository.saveMovement(movementResult.value);

			const result = await repository.findById(idResult.value);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value.id).toBe(idResult.value);
				expect(result.value.description).toBe("Test movement");
			}
		});

		it("should return NOT_FOUND for non-existent id", async () => {
			const idResult = createInventoryId("non-existent");
			if (!idResult.ok) {
				throw new Error("Invalid id");
			}

			const result = await repository.findById(idResult.value);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.type).toBe("NOT_FOUND");
			}
		});
	});
});
