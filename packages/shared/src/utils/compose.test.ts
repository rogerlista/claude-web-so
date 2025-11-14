import { describe, expect, it } from "vitest";
import { compose } from "./compose";

describe("compose", () => {
	it("should return a function when no functions are provided", () => {
		const fn = compose();
		const result = fn(42);
		expect(result).toBe(42);
	});

	it("should apply a single function to the value", () => {
		const fn = compose((x) => (x as number) * 2);
		const result = fn(10);
		expect(result).toBe(20);
	});

	it("should apply multiple functions in reverse order (right to left)", () => {
		const fn = compose(
			(x) => (x as number) / 5, // Applied last: 25 / 5 = 5
			(x) => (x as number) + 5, // Applied second: 20 + 5 = 25
			(x) => (x as number) * 2, // Applied first: 10 * 2 = 20
		);
		const result = fn(10);
		expect(result).toBe(5);
	});

	it("should work with different value types", () => {
		const fn = compose(
			(x) => (x as string).length, // Applied last
			(x) => `${x as string} WORLD`, // Applied second
			(x) => (x as string).toUpperCase(), // Applied first
		);
		const result = fn("hello");
		expect(result).toBe(11); // "HELLO WORLD".length
	});

	it("should work with objects", () => {
		const fn = compose(
			(obj) => (obj as { value: number }).value, // Applied last: extract value
			(obj) => ({ ...(obj as { value: number }), doubled: true }), // Applied second: add doubled flag
			(obj) => ({
				...(obj as { value: number }),
				value: (obj as { value: number }).value * 2,
			}), // Applied first: double value
		);
		const result = fn({ value: 10 });
		expect(result).toBe(20);
	});

	it("should work with arrays", () => {
		const fn = compose(
			(arr) => (arr as number[]).reduce((a, b) => a + b, 0), // Applied last: sum
			(arr) => (arr as number[]).filter((x) => x > 2), // Applied second: filter
			(arr) => (arr as number[]).map((x) => x * 2), // Applied first: map
		);
		const result = fn([1, 2, 3]);
		expect(result).toBe(10); // [2, 4, 6] -> [4, 6] -> 10
	});

	it("should handle null and undefined", () => {
		const fn1 = compose((x) => x);
		expect(fn1(null)).toBeNull();

		const fn2 = compose((x) => x);
		expect(fn2(undefined)).toBeUndefined();
	});

	it("should work with boolean values", () => {
		const fn = compose(
			(x) => (x ? "yes" : "no"), // Applied last
			(x) => !(x as boolean), // Applied second
			(x) => !(x as boolean), // Applied first
		);
		const result = fn(true);
		expect(result).toBe("yes"); // true -> false -> true -> 'yes'
	});

	it("should preserve type safety through transformations", () => {
		const fn = compose(
			(x) => (x as number) > 40, // Applied last: boolean
			(x) => Number.parseInt(x as string, 10), // Applied second: number
			(x) => `${x as number}`, // Applied first: string
		);
		const result = fn(42);
		expect(result).toBe(true);
	});

	it("should work with many functions", () => {
		const fn = compose(
			(x) => (x as number) + 1, // Applied last
			(x) => (x as number) + 1,
			(x) => (x as number) + 1,
			(x) => (x as number) + 1,
			(x) => (x as number) + 1,
			(x) => (x as number) + 1,
			(x) => (x as number) + 1,
			(x) => (x as number) + 1,
			(x) => (x as number) + 1, // Applied first
		);
		const result = fn(1);
		expect(result).toBe(10);
	});

	it("should work with complex transformations", () => {
		const fn = compose(
			(x) => (x as string).length, // Applied last
			(x) => (x as string[]).join("-"), // Applied third
			(x) => (x as string[]).map((s) => s.toUpperCase()), // Applied second
			(x) => (x as string).split(" "), // Applied first
		);
		const result = fn("hello world");
		expect(result).toBe(11); // 'hello world' -> ['hello', 'world'] -> ['HELLO', 'WORLD'] -> 'HELLO-WORLD' -> 11
	});

	it("should compose in opposite order to pipe", () => {
		const pipeOrder = (value: number) => {
			let result = value;
			result *= 2; // first
			result += 5; // second
			result /= 5; // third
			return result;
		};

		const composeOrder = compose(
			(x) => (x as number) / 5, // Applied third (same as pipe)
			(x) => (x as number) + 5, // Applied second (same as pipe)
			(x) => (x as number) * 2, // Applied first (same as pipe)
		);

		expect(composeOrder(10)).toBe(pipeOrder(10));
	});

	it("should allow currying", () => {
		const add = (a: number) => (b: number) => a + b;
		const multiply = (a: number) => (b: number) => a * b;

		const fn = compose(
			multiply(3), // Applied last: x * 3
			add(5), // Applied first: x + 5
		);

		const result = fn(10);
		expect(result).toBe(45); // (10 + 5) * 3 = 45
	});
});
