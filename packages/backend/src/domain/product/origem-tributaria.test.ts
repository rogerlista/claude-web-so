import { describe, expect, it } from "vitest";
import { createOrigemTributaria } from "./origem-tributaria";

/**
 * Tests for Origem Tributária Value Object
 *
 * Origem Tributária represents the tax origin code for products in Brazil.
 * Valid values: 0 to 8
 *
 * Meanings:
 * 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
 * 1 - Estrangeira - Importação direta, exceto a indicada no código 6
 * 2 - Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7
 * 3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40%
 * 4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos
 * 5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%
 * 6 - Estrangeira - Importação direta, sem similar nacional, constante em lista da CAMEX
 * 7 - Estrangeira - Adquirida no mercado interno, sem similar nacional, constante em lista da CAMEX
 * 8 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%
 */
describe("Origem Tributária Value Object", () => {
	describe("Valid Origem Tributária", () => {
		it("should accept valid code 0", () => {
			const result = createOrigemTributaria(0);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(0);
			}
		});

		it("should accept valid code 1", () => {
			const result = createOrigemTributaria(1);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(1);
			}
		});

		it("should accept valid code 5", () => {
			const result = createOrigemTributaria(5);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(5);
			}
		});

		it("should accept valid code 8 (maximum)", () => {
			const result = createOrigemTributaria(8);

			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(8);
			}
		});
	});

	describe("Invalid Origem Tributária - Out of Range", () => {
		it("should reject negative number", () => {
			const result = createOrigemTributaria(-1);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("0 e 8");
			}
		});

		it("should reject code 9", () => {
			const result = createOrigemTributaria(9);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("0 e 8");
			}
		});

		it("should reject code greater than 8", () => {
			const result = createOrigemTributaria(10);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("0 e 8");
			}
		});
	});

	describe("Invalid Origem Tributária - Type Validation", () => {
		it("should reject decimal number", () => {
			const result = createOrigemTributaria(1.5);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("inteiro");
			}
		});

		it("should reject null", () => {
			const result = createOrigemTributaria(null as unknown as number);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("null");
			}
		});

		it("should reject undefined", () => {
			const result = createOrigemTributaria(undefined as unknown as number);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("undefined");
			}
		});

		it("should reject string", () => {
			const result = createOrigemTributaria("5" as unknown as number);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("number");
			}
		});

		it("should reject NaN", () => {
			const result = createOrigemTributaria(Number.NaN);

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toContain("NaN");
			}
		});
	});
});
