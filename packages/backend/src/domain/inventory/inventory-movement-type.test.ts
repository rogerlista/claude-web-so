import { describe, expect, it } from "vitest";
import {
	INVENTORY_MOVEMENT_TYPES,
	type InventoryMovementType,
	isValidMovementType,
} from "./inventory-movement-type";

/**
 * TDD - RED Phase
 * Tests for InventoryMovementType
 *
 * Business Rules:
 * - Only 3 types allowed: 'entrada', 'saida', 'ajuste'
 * - Type is readonly and validated
 */

describe("InventoryMovementType", () => {
	describe("INVENTORY_MOVEMENT_TYPES constant", () => {
		it("should contain entrada type", () => {
			expect(INVENTORY_MOVEMENT_TYPES).toContain("entrada");
		});

		it("should contain saida type", () => {
			expect(INVENTORY_MOVEMENT_TYPES).toContain("saida");
		});

		it("should contain ajuste type", () => {
			expect(INVENTORY_MOVEMENT_TYPES).toContain("ajuste");
		});

		it("should have exactly 3 types", () => {
			expect(INVENTORY_MOVEMENT_TYPES).toHaveLength(3);
		});
	});

	describe("isValidMovementType", () => {
		it("should accept entrada as valid", () => {
			expect(isValidMovementType("entrada")).toBe(true);
		});

		it("should accept saida as valid", () => {
			expect(isValidMovementType("saida")).toBe(true);
		});

		it("should accept ajuste as valid", () => {
			expect(isValidMovementType("ajuste")).toBe(true);
		});

		it("should reject invalid type", () => {
			expect(isValidMovementType("invalid")).toBe(false);
		});

		it("should reject empty string", () => {
			expect(isValidMovementType("")).toBe(false);
		});

		it("should reject uppercase entrada", () => {
			expect(isValidMovementType("ENTRADA")).toBe(false);
		});

		it("should be type-safe when used with type assertion", () => {
			const type: InventoryMovementType = "entrada";
			expect(isValidMovementType(type)).toBe(true);
		});
	});
});
