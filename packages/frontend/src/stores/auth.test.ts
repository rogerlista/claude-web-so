/**
 * Auth Store Tests
 * TDD Phase: RED - Tests first
 */

import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "./auth";

global.fetch = vi.fn();

describe("Auth Store", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
	});

	describe("Initial State", () => {
		it("should have a current user", () => {
			const store = useAuthStore();
			expect(store.currentUser).toBeDefined();
			expect(store.currentUser.id).toBe("mock-user-1");
		});

		it("should not be validating password initially", () => {
			const store = useAuthStore();
			expect(store.isValidatingPassword).toBe(false);
		});
	});

	describe("validatePassword", () => {
		it("should validate correct password", async () => {
			const store = useAuthStore();

			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ valid: true }),
			});

			const result = await store.validatePassword("correct-password");

			expect(result).toBe(true);
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining("/api/auth/validate-password"),
				expect.objectContaining({
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						userId: "mock-user-1",
						password: "correct-password",
					}),
				}),
			);
		});

		it("should reject incorrect password", async () => {
			const store = useAuthStore();

			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ valid: false }),
			});

			const result = await store.validatePassword("wrong-password");

			expect(result).toBe(false);
		});

		it("should handle network errors", async () => {
			const store = useAuthStore();

			(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
				new Error("Network error"),
			);

			const result = await store.validatePassword("any-password");

			expect(result).toBe(false);
		});

		it("should handle server errors", async () => {
			const store = useAuthStore();

			(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				ok: false,
				status: 500,
			});

			const result = await store.validatePassword("any-password");

			expect(result).toBe(false);
		});

		it("should set isValidatingPassword during validation", async () => {
			const store = useAuthStore();

			(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
				() =>
					new Promise((resolve) => {
						setTimeout(() => {
							resolve({
								ok: true,
								json: async () => ({ valid: true }),
							});
						}, 100);
					}),
			);

			const promise = store.validatePassword("test");
			expect(store.isValidatingPassword).toBe(true);

			await promise;
			expect(store.isValidatingPassword).toBe(false);
		});
	});
});
