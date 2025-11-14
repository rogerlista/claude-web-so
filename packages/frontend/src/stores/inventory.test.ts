/**
 * Inventory Store Tests
 * TDD Phase: RED - Tests first
 */

import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useInventoryStore } from "./inventory";

describe("Inventory Store", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.restoreAllMocks();
	});

	it("should initialize with empty state", () => {
		const store = useInventoryStore();

		expect(store.movements).toEqual([]);
		expect(store.stock).toBeNull();
		expect(store.loading).toBe(false);
		expect(store.error).toBeNull();
	});

	it("should register stock entrada", async () => {
		const store = useInventoryStore();

		// Mock fetch
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				id: "mov-001",
				productId: "prod-001",
				quantity: 10,
				type: "entrada",
				date: new Date().toISOString(),
			}),
		});

		const result = await store.registerMovement({
			productId: "prod-001",
			quantity: 10,
			type: "entrada",
			description: "Purchase",
		});

		expect(result).not.toBeNull();
		expect(result?.type).toBe("entrada");
		expect(store.loading).toBe(false);
		expect(store.error).toBeNull();
	});

	it("should register stock saida", async () => {
		const store = useInventoryStore();

		// Mock fetch
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				id: "mov-002",
				productId: "prod-001",
				quantity: 5,
				type: "saida",
				date: new Date().toISOString(),
			}),
		});

		const result = await store.registerMovement({
			productId: "prod-001",
			quantity: 5,
			type: "saida",
			description: "Sale",
		});

		expect(result).not.toBeNull();
		expect(result?.type).toBe("saida");
	});

	it("should fetch stock for product", async () => {
		const store = useInventoryStore();

		// Mock fetch
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				productId: "prod-001",
				currentQuantity: 100,
				lastMovementDate: new Date().toISOString(),
			}),
		});

		await store.fetchStock("prod-001");

		expect(store.stock).not.toBeNull();
		expect(store.stock?.currentQuantity).toBe(100);
		expect(store.loading).toBe(false);
		expect(store.error).toBeNull();
	});

	it("should fetch movements for product", async () => {
		const store = useInventoryStore();

		// Mock fetch
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				data: [
					{
						id: "mov-001",
						productId: "prod-001",
						quantity: 10,
						type: "entrada",
						date: new Date().toISOString(),
					},
					{
						id: "mov-002",
						productId: "prod-001",
						quantity: 5,
						type: "saida",
						date: new Date().toISOString(),
					},
				],
				total: 2,
			}),
		});

		await store.fetchMovements("prod-001");

		expect(store.movements).toHaveLength(2);
		expect(store.movements[0]?.type).toBe("entrada");
		expect(store.loading).toBe(false);
		expect(store.error).toBeNull();
	});

	it("should handle error when registering movement", async () => {
		const store = useInventoryStore();

		// Mock fetch to fail
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 400,
		});

		const result = await store.registerMovement({
			productId: "prod-001",
			quantity: 10,
			type: "entrada",
		});

		expect(result).toBeNull();
		expect(store.error).not.toBeNull();
		expect(store.loading).toBe(false);
	});

	it("should handle error when fetching stock", async () => {
		const store = useInventoryStore();

		// Mock fetch to fail
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 404,
		});

		await store.fetchStock("prod-999");

		expect(store.stock).toBeNull();
		expect(store.error).not.toBeNull();
		expect(store.loading).toBe(false);
	});

	it("should handle error when fetching movements", async () => {
		const store = useInventoryStore();

		// Mock fetch to fail
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
		});

		await store.fetchMovements("prod-001");

		expect(store.movements).toEqual([]);
		expect(store.error).not.toBeNull();
		expect(store.loading).toBe(false);
	});
});
