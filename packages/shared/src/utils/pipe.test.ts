import { describe, expect, it } from "vitest";
import { pipe } from "./pipe";

describe("pipe", () => {
	it("should return the initial value when no functions are provided", () => {
		const result = pipe(42);
		expect(result).toBe(42);
	});

	it("should apply a single function to the value", () => {
		const result = pipe(10, (x) => (x as number) * 2);
		expect(result).toBe(20);
	});

	it("should apply multiple functions in order (left to right)", () => {
		const result = pipe(
			10,
			(x) => (x as number) * 2, // 20
			(x) => (x as number) + 5, // 25
			(x) => (x as number) / 5, // 5
		);
		expect(result).toBe(5);
	});

	it("should work with different value types", () => {
		const result = pipe(
			"hello",
			(x) => (x as string).toUpperCase(), // HELLO
			(x) => `${x as string} WORLD`, // HELLO WORLD
			(x) => (x as string).length, // 11
		);
		expect(result).toBe(11);
	});

	it("should work with objects", () => {
		const result = pipe(
			{ value: 10 },
			(obj) => ({
				...(obj as { value: number }),
				value: (obj as { value: number }).value * 2,
			}), // { value: 20 }
			(obj) => ({ ...(obj as { value: number }), doubled: true }), // { value: 20, doubled: true }
			(obj) => (obj as { value: number }).value, // 20
		);
		expect(result).toBe(20);
	});

	it("should work with arrays", () => {
		const result = pipe(
			[1, 2, 3],
			(arr) => (arr as number[]).map((x) => x * 2), // [2, 4, 6]
			(arr) => (arr as number[]).filter((x) => x > 2), // [4, 6]
			(arr) => (arr as number[]).reduce((a, b) => a + b, 0), // 10
		);
		expect(result).toBe(10);
	});

	it("should handle null and undefined", () => {
		const result1 = pipe(null, (x) => x);
		expect(result1).toBeNull();

		const result2 = pipe(undefined, (x) => x);
		expect(result2).toBeUndefined();
	});

	it("should work with boolean values", () => {
		const result = pipe(
			true,
			(x) => !(x as boolean), // false
			(x) => !(x as boolean), // true
			(x) => (x ? "yes" : "no"), // 'yes'
		);
		expect(result).toBe("yes");
	});

	it("should preserve type safety through transformations", () => {
		const result = pipe(
			42,
			(x) => `${x as number}`, // "42"
			(x) => Number.parseInt(x as string, 10), // 42
			(x) => (x as number) > 40, // true
		);
		expect(result).toBe(true);
	});

	it("should work with many functions", () => {
		const result = pipe(
			1,
			(x) => (x as number) + 1, // 2
			(x) => (x as number) + 1, // 3
			(x) => (x as number) + 1, // 4
			(x) => (x as number) + 1, // 5
			(x) => (x as number) + 1, // 6
			(x) => (x as number) + 1, // 7
			(x) => (x as number) + 1, // 8
			(x) => (x as number) + 1, // 9
			(x) => (x as number) + 1, // 10
		);
		expect(result).toBe(10);
	});

	it("should work with complex transformations", () => {
		const result = pipe(
			"hello world",
			(x) => (x as string).split(" "), // ['hello', 'world']
			(x) => (x as string[]).map((s) => s.toUpperCase()), // ['HELLO', 'WORLD']
			(x) => (x as string[]).join("-"), // 'HELLO-WORLD'
			(x) => (x as string).length, // 11
		);
		expect(result).toBe(11);
	});
});
