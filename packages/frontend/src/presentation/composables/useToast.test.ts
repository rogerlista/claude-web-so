import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useToast } from "./useToast";

describe("useToast", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		// Clear all toasts between tests
		const { toasts } = useToast();
		toasts.value = [];
		vi.useRealTimers();
	});

	it("should initialize with empty toasts array", () => {
		const { toasts } = useToast();
		expect(toasts.value).toEqual([]);
	});

	it("should add a toast with default variant info", () => {
		const { toasts, show } = useToast();

		show("Test message");

		expect(toasts.value).toHaveLength(1);
		expect(toasts.value[0]).toMatchObject({
			message: "Test message",
			variant: "info",
			duration: 3000,
		});
		expect(toasts.value[0]?.id).toBeDefined();
	});

	it("should add a success toast", () => {
		const { toasts, success } = useToast();

		success("Success message");

		expect(toasts.value).toHaveLength(1);
		expect(toasts.value[0]).toMatchObject({
			message: "Success message",
			variant: "success",
		});
	});

	it("should add an error toast", () => {
		const { toasts, error } = useToast();

		error("Error message");

		expect(toasts.value).toHaveLength(1);
		expect(toasts.value[0]).toMatchObject({
			message: "Error message",
			variant: "error",
		});
	});

	it("should add a warning toast", () => {
		const { toasts, warning } = useToast();

		warning("Warning message");

		expect(toasts.value).toHaveLength(1);
		expect(toasts.value[0]).toMatchObject({
			message: "Warning message",
			variant: "warning",
		});
	});

	it("should add an info toast", () => {
		const { toasts, info } = useToast();

		info("Info message");

		expect(toasts.value).toHaveLength(1);
		expect(toasts.value[0]).toMatchObject({
			message: "Info message",
			variant: "info",
		});
	});

	it("should remove toast by id", () => {
		const { toasts, show, remove } = useToast();

		show("Toast 1");
		show("Toast 2");

		const firstToastId = toasts.value[0]?.id;
		if (firstToastId !== undefined) {
			remove(firstToastId);
		}

		expect(toasts.value).toHaveLength(1);
		expect(toasts.value[0]?.message).toBe("Toast 2");
	});

	it("should auto-remove toast after duration", () => {
		const { toasts, show } = useToast();

		show("Auto remove", "info", 3000);

		expect(toasts.value).toHaveLength(1);

		vi.advanceTimersByTime(3000);

		expect(toasts.value).toHaveLength(0);
	});

	it("should not auto-remove toast when duration is 0", () => {
		const { toasts, show } = useToast();

		show("Persistent toast", "info", 0);

		expect(toasts.value).toHaveLength(1);

		vi.advanceTimersByTime(10000);

		expect(toasts.value).toHaveLength(1);
	});

	it("should handle multiple toasts with different durations", () => {
		const { toasts, show } = useToast();

		show("Toast 1", "info", 1000);
		show("Toast 2", "info", 2000);
		show("Toast 3", "info", 3000);

		expect(toasts.value).toHaveLength(3);

		vi.advanceTimersByTime(1000);
		expect(toasts.value).toHaveLength(2);

		vi.advanceTimersByTime(1000);
		expect(toasts.value).toHaveLength(1);

		vi.advanceTimersByTime(1000);
		expect(toasts.value).toHaveLength(0);
	});

	it("should generate unique IDs for each toast", () => {
		const { toasts, show } = useToast();

		show("Toast 1");
		show("Toast 2");
		show("Toast 3");

		const ids = toasts.value.map((t) => t.id);
		const uniqueIds = new Set(ids);

		expect(uniqueIds.size).toBe(3);
	});
});
