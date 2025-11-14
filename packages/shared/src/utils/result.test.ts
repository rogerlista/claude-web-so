import { describe, expect, it } from "vitest";
import type { Result } from "../types/result";
import { ResultUtils } from "./result";

describe("ResultUtils", () => {
	describe("ok", () => {
		it("should create a successful Result with value", () => {
			const result = ResultUtils.ok(42);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(42);
			}
		});

		it("should create a successful Result with string value", () => {
			const result = ResultUtils.ok("hello");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe("hello");
			}
		});

		it("should create a successful Result with object value", () => {
			const obj = { name: "John", age: 30 };
			const result = ResultUtils.ok(obj);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toEqual(obj);
			}
		});
	});

	describe("err", () => {
		it("should create an error Result with error message", () => {
			const result = ResultUtils.err("error message");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBe("error message");
			}
		});

		it("should create an error Result with Error object", () => {
			const error = new Error("Something went wrong");
			const result = ResultUtils.err(error);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBe(error);
			}
		});

		it("should create an error Result with custom error type", () => {
			const customError = { code: 404, message: "Not found" };
			const result = ResultUtils.err(customError);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toEqual(customError);
			}
		});
	});

	describe("map", () => {
		it("should transform the value of a successful Result", () => {
			const result: Result<number, string> = ResultUtils.ok(10);
			const mapped = ResultUtils.map(result, (x) => x * 2);
			expect(mapped.ok).toBe(true);
			if (mapped.ok) {
				expect(mapped.value).toBe(20);
			}
		});

		it("should not transform the value of an error Result", () => {
			const result: Result<number, string> = ResultUtils.err("error");
			const mapped = ResultUtils.map(result, (x) => x * 2);
			expect(mapped.ok).toBe(false);
			if (!mapped.ok) {
				expect(mapped.error).toBe("error");
			}
		});

		it("should change the value type through mapping", () => {
			const result: Result<number, string> = ResultUtils.ok(42);
			const mapped = ResultUtils.map(result, (x) => `Value: ${x}`);
			expect(mapped.ok).toBe(true);
			if (mapped.ok) {
				expect(mapped.value).toBe("Value: 42");
			}
		});
	});

	describe("flatMap", () => {
		it("should chain Results when both are successful", () => {
			const result: Result<number, string> = ResultUtils.ok(10);
			const chained = ResultUtils.flatMap(result, (x) => ResultUtils.ok(x * 2));
			expect(chained.ok).toBe(true);
			if (chained.ok) {
				expect(chained.value).toBe(20);
			}
		});

		it("should propagate error from first Result", () => {
			const result: Result<number, string> = ResultUtils.err("first error");
			const chained = ResultUtils.flatMap(result, (x) => ResultUtils.ok(x * 2));
			expect(chained.ok).toBe(false);
			if (!chained.ok) {
				expect(chained.error).toBe("first error");
			}
		});

		it("should propagate error from second Result", () => {
			const result: Result<number, string> = ResultUtils.ok(10);
			const chained = ResultUtils.flatMap(result, (_x) =>
				ResultUtils.err("second error"),
			);
			expect(chained.ok).toBe(false);
			if (!chained.ok) {
				expect(chained.error).toBe("second error");
			}
		});

		it("should allow changing value type through flatMap", () => {
			const result: Result<number, string> = ResultUtils.ok(42);
			const chained = ResultUtils.flatMap(result, (x) =>
				ResultUtils.ok(`Value: ${x}`),
			);
			expect(chained.ok).toBe(true);
			if (chained.ok) {
				expect(chained.value).toBe("Value: 42");
			}
		});
	});

	describe("isOk", () => {
		it("should return true for successful Result", () => {
			const result = ResultUtils.ok(42);
			expect(ResultUtils.isOk(result)).toBe(true);
		});

		it("should return false for error Result", () => {
			const result = ResultUtils.err("error");
			expect(ResultUtils.isOk(result)).toBe(false);
		});
	});

	describe("isErr", () => {
		it("should return false for successful Result", () => {
			const result = ResultUtils.ok(42);
			expect(ResultUtils.isErr(result)).toBe(false);
		});

		it("should return true for error Result", () => {
			const result = ResultUtils.err("error");
			expect(ResultUtils.isErr(result)).toBe(true);
		});
	});

	describe("unwrap", () => {
		it("should return the value from successful Result", () => {
			const result = ResultUtils.ok(42);
			expect(ResultUtils.unwrap(result)).toBe(42);
		});

		it("should throw error for error Result", () => {
			const result = ResultUtils.err("error message");
			expect(() => ResultUtils.unwrap(result)).toThrow("error message");
		});

		it("should throw Error object for error Result with Error", () => {
			const error = new Error("Something went wrong");
			const result = ResultUtils.err(error);
			expect(() => ResultUtils.unwrap(result)).toThrow(error);
		});
	});

	describe("unwrapOr", () => {
		it("should return the value from successful Result", () => {
			const result = ResultUtils.ok(42);
			expect(ResultUtils.unwrapOr(result, 0)).toBe(42);
		});

		it("should return default value for error Result", () => {
			const result: Result<number, string> = ResultUtils.err("error");
			expect(ResultUtils.unwrapOr(result, 0)).toBe(0);
		});

		it("should work with different value types", () => {
			const result: Result<string, string> = ResultUtils.err("error");
			expect(ResultUtils.unwrapOr(result, "default")).toBe("default");
		});
	});

	describe("match", () => {
		it("should call ok handler for successful Result", () => {
			const result = ResultUtils.ok(42);
			const matched = ResultUtils.match(result, {
				ok: (value) => `Success: ${value}`,
				err: (error) => `Error: ${error}`,
			});
			expect(matched).toBe("Success: 42");
		});

		it("should call err handler for error Result", () => {
			const result: Result<number, string> = ResultUtils.err("not found");
			const matched = ResultUtils.match(result, {
				ok: (value) => `Success: ${value}`,
				err: (error) => `Error: ${error}`,
			});
			expect(matched).toBe("Error: not found");
		});

		it("should allow different return types in handlers", () => {
			const result = ResultUtils.ok(42);
			const matched = ResultUtils.match(result, {
				ok: (value) => value * 2,
				err: (_error) => 0,
			});
			expect(matched).toBe(84);
		});
	});

	describe("mapErr", () => {
		it("should not transform error of successful Result", () => {
			const result: Result<number, string> = ResultUtils.ok(42);
			const mapped = ResultUtils.mapErr(result, (err) => `Mapped: ${err}`);
			expect(mapped.ok).toBe(true);
			if (mapped.ok) {
				expect(mapped.value).toBe(42);
			}
		});

		it("should transform error of error Result", () => {
			const result: Result<number, string> = ResultUtils.err("original error");
			const mapped = ResultUtils.mapErr(result, (err) => `Mapped: ${err}`);
			expect(mapped.ok).toBe(false);
			if (!mapped.ok) {
				expect(mapped.error).toBe("Mapped: original error");
			}
		});

		it("should change error type through mapping", () => {
			const result: Result<number, string> = ResultUtils.err("404");
			const mapped = ResultUtils.mapErr(result, (err) =>
				Number.parseInt(err, 10),
			);
			expect(mapped.ok).toBe(false);
			if (!mapped.ok) {
				expect(mapped.error).toBe(404);
			}
		});
	});

	describe("tryCatch", () => {
		it("should return ok Result for successful function", () => {
			const result = ResultUtils.tryCatch(() => 42);
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(42);
			}
		});

		it("should return err Result for throwing function", () => {
			const result = ResultUtils.tryCatch(() => {
				throw new Error("Something went wrong");
			});
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(Error);
				expect((result.error as Error).message).toBe("Something went wrong");
			}
		});

		it("should handle async functions", async () => {
			const result = await ResultUtils.tryCatch(async () => {
				await Promise.resolve();
				return 42;
			});
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(42);
			}
		});

		it("should handle async throwing functions", async () => {
			const result = await ResultUtils.tryCatch(async () => {
				await Promise.resolve();
				throw new Error("Async error");
			});
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBeInstanceOf(Error);
				expect((result.error as Error).message).toBe("Async error");
			}
		});
	});

	describe("all", () => {
		it("should return ok with all values when all Results are ok", () => {
			const results = [ResultUtils.ok(1), ResultUtils.ok(2), ResultUtils.ok(3)];
			const combined = ResultUtils.all(results);
			expect(combined.ok).toBe(true);
			if (combined.ok) {
				expect(combined.value).toEqual([1, 2, 3]);
			}
		});

		it("should return err with first error when any Result is err", () => {
			const results = [
				ResultUtils.ok(1),
				ResultUtils.err("error 2"),
				ResultUtils.ok(3),
			];
			const combined = ResultUtils.all(results);
			expect(combined.ok).toBe(false);
			if (!combined.ok) {
				expect(combined.error).toBe("error 2");
			}
		});

		it("should return ok with empty array for empty input", () => {
			const results: Result<number, string>[] = [];
			const combined = ResultUtils.all(results);
			expect(combined.ok).toBe(true);
			if (combined.ok) {
				expect(combined.value).toEqual([]);
			}
		});

		it("should return first error when multiple Results are err", () => {
			const results = [
				ResultUtils.err("error 1"),
				ResultUtils.err("error 2"),
				ResultUtils.err("error 3"),
			];
			const combined = ResultUtils.all(results);
			expect(combined.ok).toBe(false);
			if (!combined.ok) {
				expect(combined.error).toBe("error 1");
			}
		});
	});

	describe("toOption", () => {
		it("should convert ok Result to some Option", () => {
			const result = ResultUtils.ok(42);
			const option = ResultUtils.toOption(result);
			expect(option.some).toBe(true);
			if (option.some) {
				expect(option.value).toBe(42);
			}
		});

		it("should convert err Result to none Option", () => {
			const result: Result<number, string> = ResultUtils.err("error");
			const option = ResultUtils.toOption(result);
			expect(option.some).toBe(false);
		});

		it("should discard error information when converting to Option", () => {
			const result: Result<number, string> = ResultUtils.err("important error");
			const option = ResultUtils.toOption(result);
			expect(option.some).toBe(false);
			// Error is discarded - Option has no error information
		});

		it("should work with different value types", () => {
			const result = ResultUtils.ok("hello");
			const option = ResultUtils.toOption(result);
			expect(option.some).toBe(true);
			if (option.some) {
				expect(option.value).toBe("hello");
			}
		});
	});
});
