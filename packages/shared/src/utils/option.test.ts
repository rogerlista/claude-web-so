import { describe, expect, it } from "vitest";
import { OptionUtils } from "./option";

describe("OptionUtils", () => {
	describe("some", () => {
		it("should create an Option with a value", () => {
			const option = OptionUtils.some(42);
			expect(option.some).toBe(true);
			if (option.some) {
				expect(option.value).toBe(42);
			}
		});

		it("should create an Option with string value", () => {
			const option = OptionUtils.some("hello");
			expect(option.some).toBe(true);
			if (option.some) {
				expect(option.value).toBe("hello");
			}
		});

		it("should create an Option with object value", () => {
			const obj = { name: "John", age: 30 };
			const option = OptionUtils.some(obj);
			expect(option.some).toBe(true);
			if (option.some) {
				expect(option.value).toEqual(obj);
			}
		});
	});

	describe("none", () => {
		it("should create an empty Option", () => {
			const option = OptionUtils.none<number>();
			expect(option.some).toBe(false);
		});

		it("should create an empty Option with different types", () => {
			const stringOption = OptionUtils.none<string>();
			expect(stringOption.some).toBe(false);

			const numberOption = OptionUtils.none<number>();
			expect(numberOption.some).toBe(false);
		});
	});

	describe("fromNullable", () => {
		it("should create some Option from non-null value", () => {
			const option = OptionUtils.fromNullable(42);
			expect(option.some).toBe(true);
			if (option.some) {
				expect(option.value).toBe(42);
			}
		});

		it("should create none Option from null", () => {
			const option = OptionUtils.fromNullable(null);
			expect(option.some).toBe(false);
		});

		it("should create none Option from undefined", () => {
			const option = OptionUtils.fromNullable(undefined);
			expect(option.some).toBe(false);
		});

		it("should handle zero as valid value", () => {
			const option = OptionUtils.fromNullable(0);
			expect(option.some).toBe(true);
			if (option.some) {
				expect(option.value).toBe(0);
			}
		});

		it("should handle empty string as valid value", () => {
			const option = OptionUtils.fromNullable("");
			expect(option.some).toBe(true);
			if (option.some) {
				expect(option.value).toBe("");
			}
		});

		it("should handle false as valid value", () => {
			const option = OptionUtils.fromNullable(false);
			expect(option.some).toBe(true);
			if (option.some) {
				expect(option.value).toBe(false);
			}
		});
	});

	describe("isSome", () => {
		it("should return true for some Option", () => {
			const option = OptionUtils.some(42);
			expect(OptionUtils.isSome(option)).toBe(true);
		});

		it("should return false for none Option", () => {
			const option = OptionUtils.none<number>();
			expect(OptionUtils.isSome(option)).toBe(false);
		});
	});

	describe("isNone", () => {
		it("should return false for some Option", () => {
			const option = OptionUtils.some(42);
			expect(OptionUtils.isNone(option)).toBe(false);
		});

		it("should return true for none Option", () => {
			const option = OptionUtils.none<number>();
			expect(OptionUtils.isNone(option)).toBe(true);
		});
	});

	describe("map", () => {
		it("should transform the value of some Option", () => {
			const option = OptionUtils.some(10);
			const mapped = OptionUtils.map(option, (x) => x * 2);
			expect(mapped.some).toBe(true);
			if (mapped.some) {
				expect(mapped.value).toBe(20);
			}
		});

		it("should not transform none Option", () => {
			const option = OptionUtils.none<number>();
			const mapped = OptionUtils.map(option, (x) => x * 2);
			expect(mapped.some).toBe(false);
		});

		it("should change value type through mapping", () => {
			const option = OptionUtils.some(42);
			const mapped = OptionUtils.map(option, (x) => `Value: ${x}`);
			expect(mapped.some).toBe(true);
			if (mapped.some) {
				expect(mapped.value).toBe("Value: 42");
			}
		});
	});

	describe("flatMap", () => {
		it("should chain Options when both are some", () => {
			const option = OptionUtils.some(10);
			const chained = OptionUtils.flatMap(option, (x) =>
				OptionUtils.some(x * 2),
			);
			expect(chained.some).toBe(true);
			if (chained.some) {
				expect(chained.value).toBe(20);
			}
		});

		it("should propagate none from first Option", () => {
			const option = OptionUtils.none<number>();
			const chained = OptionUtils.flatMap(option, (x) =>
				OptionUtils.some(x * 2),
			);
			expect(chained.some).toBe(false);
		});

		it("should propagate none from second Option", () => {
			const option = OptionUtils.some(10);
			const chained = OptionUtils.flatMap(option, (_x) =>
				OptionUtils.none<number>(),
			);
			expect(chained.some).toBe(false);
		});

		it("should allow changing value type through flatMap", () => {
			const option = OptionUtils.some(42);
			const chained = OptionUtils.flatMap(option, (x) =>
				OptionUtils.some(`Value: ${x}`),
			);
			expect(chained.some).toBe(true);
			if (chained.some) {
				expect(chained.value).toBe("Value: 42");
			}
		});
	});

	describe("unwrap", () => {
		it("should return the value from some Option", () => {
			const option = OptionUtils.some(42);
			expect(OptionUtils.unwrap(option)).toBe(42);
		});

		it("should throw error for none Option", () => {
			const option = OptionUtils.none<number>();
			expect(() => OptionUtils.unwrap(option)).toThrow("Called unwrap on None");
		});
	});

	describe("unwrapOr", () => {
		it("should return the value from some Option", () => {
			const option = OptionUtils.some(42);
			expect(OptionUtils.unwrapOr(option, 0)).toBe(42);
		});

		it("should return default value for none Option", () => {
			const option = OptionUtils.none<number>();
			expect(OptionUtils.unwrapOr(option, 0)).toBe(0);
		});

		it("should work with different value types", () => {
			const option = OptionUtils.none<string>();
			expect(OptionUtils.unwrapOr(option, "default")).toBe("default");
		});
	});

	describe("match", () => {
		it("should call some handler for some Option", () => {
			const option = OptionUtils.some(42);
			const matched = OptionUtils.match(option, {
				some: (value) => `Value: ${value}`,
				none: () => "No value",
			});
			expect(matched).toBe("Value: 42");
		});

		it("should call none handler for none Option", () => {
			const option = OptionUtils.none<number>();
			const matched = OptionUtils.match(option, {
				some: (value) => `Value: ${value}`,
				none: () => "No value",
			});
			expect(matched).toBe("No value");
		});

		it("should allow different return types in handlers", () => {
			const option = OptionUtils.some(42);
			const matched = OptionUtils.match(option, {
				some: (value) => value * 2,
				none: () => 0,
			});
			expect(matched).toBe(84);
		});
	});

	describe("filter", () => {
		it("should keep some Option when predicate is true", () => {
			const option = OptionUtils.some(42);
			const filtered = OptionUtils.filter(option, (x) => x > 10);
			expect(filtered.some).toBe(true);
			if (filtered.some) {
				expect(filtered.value).toBe(42);
			}
		});

		it("should convert to none when predicate is false", () => {
			const option = OptionUtils.some(42);
			const filtered = OptionUtils.filter(option, (x) => x > 100);
			expect(filtered.some).toBe(false);
		});

		it("should keep none Option", () => {
			const option = OptionUtils.none<number>();
			const filtered = OptionUtils.filter(option, (x) => x > 10);
			expect(filtered.some).toBe(false);
		});
	});

	describe("or", () => {
		it("should return first Option when it is some", () => {
			const option1 = OptionUtils.some(42);
			const option2 = OptionUtils.some(100);
			const result = OptionUtils.or(option1, option2);
			expect(result.some).toBe(true);
			if (result.some) {
				expect(result.value).toBe(42);
			}
		});

		it("should return second Option when first is none", () => {
			const option1 = OptionUtils.none<number>();
			const option2 = OptionUtils.some(100);
			const result = OptionUtils.or(option1, option2);
			expect(result.some).toBe(true);
			if (result.some) {
				expect(result.value).toBe(100);
			}
		});

		it("should return none when both Options are none", () => {
			const option1 = OptionUtils.none<number>();
			const option2 = OptionUtils.none<number>();
			const result = OptionUtils.or(option1, option2);
			expect(result.some).toBe(false);
		});
	});

	describe("and", () => {
		it("should return second Option when first is some", () => {
			const option1 = OptionUtils.some(42);
			const option2 = OptionUtils.some(100);
			const result = OptionUtils.and(option1, option2);
			expect(result.some).toBe(true);
			if (result.some) {
				expect(result.value).toBe(100);
			}
		});

		it("should return none when first Option is none", () => {
			const option1 = OptionUtils.none<number>();
			const option2 = OptionUtils.some(100);
			const result = OptionUtils.and(option1, option2);
			expect(result.some).toBe(false);
		});

		it("should return none when second Option is none", () => {
			const option1 = OptionUtils.some(42);
			const option2 = OptionUtils.none<number>();
			const result = OptionUtils.and(option1, option2);
			expect(result.some).toBe(false);
		});

		it("should allow changing type through and", () => {
			const option1 = OptionUtils.some(42);
			const option2 = OptionUtils.some("hello");
			const result = OptionUtils.and(option1, option2);
			expect(result.some).toBe(true);
			if (result.some) {
				expect(result.value).toBe("hello");
			}
		});
	});

	describe("toNullable", () => {
		it("should return value for some Option", () => {
			const option = OptionUtils.some(42);
			expect(OptionUtils.toNullable(option)).toBe(42);
		});

		it("should return null for none Option", () => {
			const option = OptionUtils.none<number>();
			expect(OptionUtils.toNullable(option)).toBeNull();
		});
	});

	describe("toUndefined", () => {
		it("should return value for some Option", () => {
			const option = OptionUtils.some(42);
			expect(OptionUtils.toUndefined(option)).toBe(42);
		});

		it("should return undefined for none Option", () => {
			const option = OptionUtils.none<number>();
			expect(OptionUtils.toUndefined(option)).toBeUndefined();
		});
	});

	describe("unwrapOrElse", () => {
		it("should return value for some Option", () => {
			const option = OptionUtils.some(42);
			expect(OptionUtils.unwrapOrElse(option, () => 0)).toBe(42);
		});

		it("should compute default for none Option", () => {
			const option = OptionUtils.none<number>();
			expect(OptionUtils.unwrapOrElse(option, () => 100)).toBe(100);
		});

		it("should not call function for some Option", () => {
			const option = OptionUtils.some(42);
			let called = false;
			OptionUtils.unwrapOrElse(option, () => {
				called = true;
				return 0;
			});
			expect(called).toBe(false);
		});

		it("should call function for none Option", () => {
			const option = OptionUtils.none<number>();
			let called = false;
			OptionUtils.unwrapOrElse(option, () => {
				called = true;
				return 0;
			});
			expect(called).toBe(true);
		});
	});

	describe("toResult", () => {
		it("should convert some Option to ok Result", () => {
			const option = OptionUtils.some(42);
			const result = OptionUtils.toResult(option, "error");
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toBe(42);
			}
		});

		it("should convert none Option to err Result", () => {
			const option = OptionUtils.none<number>();
			const result = OptionUtils.toResult(option, "not found");
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toBe("not found");
			}
		});

		it("should work with different error types", () => {
			const option = OptionUtils.none<string>();
			const result = OptionUtils.toResult(option, {
				code: 404,
				message: "Not found",
			});
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error).toEqual({ code: 404, message: "Not found" });
			}
		});
	});

	describe("zip", () => {
		it("should combine two some Options into tuple", () => {
			const option1 = OptionUtils.some(42);
			const option2 = OptionUtils.some("hello");
			const zipped = OptionUtils.zip(option1, option2);
			expect(zipped.some).toBe(true);
			if (zipped.some) {
				expect(zipped.value).toEqual([42, "hello"]);
			}
		});

		it("should return none if first Option is none", () => {
			const option1 = OptionUtils.none<number>();
			const option2 = OptionUtils.some("hello");
			const zipped = OptionUtils.zip(option1, option2);
			expect(zipped.some).toBe(false);
		});

		it("should return none if second Option is none", () => {
			const option1 = OptionUtils.some(42);
			const option2 = OptionUtils.none<string>();
			const zipped = OptionUtils.zip(option1, option2);
			expect(zipped.some).toBe(false);
		});

		it("should return none if both Options are none", () => {
			const option1 = OptionUtils.none<number>();
			const option2 = OptionUtils.none<string>();
			const zipped = OptionUtils.zip(option1, option2);
			expect(zipped.some).toBe(false);
		});
	});
});
