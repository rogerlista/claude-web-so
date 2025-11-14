/**
 * Background Sync Manager Tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	clearSyncQueue,
	getSyncQueue,
	getSyncQueueSize,
	isBackgroundSyncSupported,
	processSync,
	queueRequestForSync,
	registerBackgroundSync,
	saveSyncQueue,
	setupSyncListeners,
} from "./background-sync";
import * as swManager from "./sw-manager";

describe("Background Sync Manager", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	afterEach(() => {
		localStorage.clear();
	});

	describe("getSyncQueue", () => {
		it("should return empty array when no queue exists", async () => {
			const queue = await getSyncQueue();

			expect(queue).toEqual([]);
		});

		it("should return stored queue", async () => {
			const mockQueue = [
				{
					id: "1",
					url: "/api/test",
					method: "POST",
					headers: {},
					timestamp: Date.now(),
				},
			];

			localStorage.setItem("pos-nfce-sync-queue", JSON.stringify(mockQueue));

			const queue = await getSyncQueue();

			expect(queue).toEqual(mockQueue);
		});

		it("should return empty array when JSON is invalid", async () => {
			localStorage.setItem("pos-nfce-sync-queue", "invalid json");

			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {
					// empty mock
				});

			const queue = await getSyncQueue();

			expect(queue).toEqual([]);
			expect(consoleErrorSpy).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});
	});

	describe("saveSyncQueue", () => {
		it("should save queue to localStorage", async () => {
			const mockQueue = [
				{
					id: "1",
					url: "/api/test",
					method: "POST",
					headers: {},
					timestamp: Date.now(),
				},
			];

			await saveSyncQueue(mockQueue);

			const stored = localStorage.getItem("pos-nfce-sync-queue");
			expect(stored).toBe(JSON.stringify(mockQueue));
		});

		it("should handle empty queue", async () => {
			await saveSyncQueue([]);

			const stored = localStorage.getItem("pos-nfce-sync-queue");
			expect(stored).toBe("[]");
		});

		it("should throw when localStorage.setItem fails", async () => {
			const mockQueue = [
				{
					id: "1",
					url: "/test",
					method: "POST",
					headers: {},
					timestamp: Date.now(),
				},
			];

			// Mock localStorage.setItem to throw
			const original = localStorage.setItem;
			Object.defineProperty(localStorage, "setItem", {
				value: () => {
					throw new Error("QuotaExceededError");
				},
				writable: true,
				configurable: true,
			});

			await expect(saveSyncQueue(mockQueue)).rejects.toThrow(
				"QuotaExceededError",
			);

			// Restore
			Object.defineProperty(localStorage, "setItem", {
				value: original,
				writable: true,
				configurable: true,
			});
		});
	});

	describe("clearSyncQueue", () => {
		it("should remove queue from localStorage", async () => {
			localStorage.setItem("pos-nfce-sync-queue", "[]");

			await clearSyncQueue();

			expect(localStorage.getItem("pos-nfce-sync-queue")).toBeNull();
		});

		it("should handle clearing when queue is already empty", async () => {
			await clearSyncQueue();

			// Should succeed without errors
			expect(localStorage.getItem("pos-nfce-sync-queue")).toBeNull();
		});

		it("should throw when localStorage.removeItem fails", async () => {
			// Mock localStorage.removeItem to throw
			const original = localStorage.removeItem;
			Object.defineProperty(localStorage, "removeItem", {
				value: () => {
					throw new Error("StorageError");
				},
				writable: true,
				configurable: true,
			});

			await expect(clearSyncQueue()).rejects.toThrow("StorageError");

			// Restore
			Object.defineProperty(localStorage, "removeItem", {
				value: original,
				writable: true,
				configurable: true,
			});
		});
	});

	describe("getSyncQueueSize", () => {
		it("should return 0 when queue is empty", async () => {
			const size = await getSyncQueueSize();

			expect(size).toBe(0);
		});

		it("should return correct queue size", async () => {
			const mockQueue = [
				{
					id: "1",
					url: "/api/test1",
					method: "POST",
					headers: {},
					timestamp: Date.now(),
				},
				{
					id: "2",
					url: "/api/test2",
					method: "PUT",
					headers: {},
					timestamp: Date.now(),
				},
			];

			await saveSyncQueue(mockQueue);

			const size = await getSyncQueueSize();

			expect(size).toBe(2);
		});
	});

	describe("queueRequestForSync", () => {
		it("should add request to queue with id and timestamp", async () => {
			const request = {
				url: "/api/test",
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ data: "test" }),
			};

			vi.spyOn(crypto, "randomUUID").mockReturnValue(
				"550e8400-e29b-41d4-a716-446655440000",
			);
			vi.spyOn(Date, "now").mockReturnValue(1234567890);

			await queueRequestForSync(request);

			const queue = await getSyncQueue();

			expect(queue).toHaveLength(1);
			expect(queue[0]).toEqual({
				...request,
				id: "550e8400-e29b-41d4-a716-446655440000",
				timestamp: 1234567890,
			});
		});

		it("should register background sync when supported", async () => {
			const request = {
				url: "/api/test",
				method: "POST",
				headers: {},
			};

			vi.spyOn(swManager, "getServiceWorkerRegistration").mockResolvedValue({
				sync: {
					register: vi.fn(),
				},
			} as unknown as ServiceWorkerRegistration);

			vi.stubGlobal("ServiceWorkerRegistration", {
				prototype: {
					sync: {},
				},
			});

			vi.stubGlobal("navigator", {
				serviceWorker: {},
			});

			await queueRequestForSync(request);

			// Background sync registration is attempted
			const queue = await getSyncQueue();
			expect(queue).toHaveLength(1);
		});

		it("should try to sync immediately when online and background sync not supported", async () => {
			const request = {
				url: "/api/test",
				method: "POST",
				headers: {},
			};

			vi.stubGlobal("navigator", {
				onLine: true,
			});

			global.fetch = vi.fn().mockResolvedValue({ ok: true });

			await queueRequestForSync(request);

			// Queue should be empty after successful sync
			const queue = await getSyncQueue();
			expect(queue).toHaveLength(0);
		});
	});

	describe("registerBackgroundSync", () => {
		it("should warn when background sync is not supported", async () => {
			// Make background sync not supported
			vi.stubGlobal("ServiceWorkerRegistration", {
				prototype: {},
			});

			const consoleWarnSpy = vi
				.spyOn(console, "warn")
				.mockImplementation(() => {
					// empty mock
				});

			await registerBackgroundSync();

			expect(consoleWarnSpy).toHaveBeenCalledWith(
				"[Sync] Background sync not supported, will use fallback",
			);

			consoleWarnSpy.mockRestore();
		});

		it("should register sync tag with service worker", async () => {
			const mockRegister = vi.fn();
			vi.spyOn(swManager, "getServiceWorkerRegistration").mockResolvedValue({
				sync: {
					register: mockRegister,
				},
			} as unknown as ServiceWorkerRegistration);

			vi.stubGlobal("ServiceWorkerRegistration", {
				prototype: {
					sync: {},
				},
			});

			vi.stubGlobal("navigator", {
				serviceWorker: {},
			});

			await registerBackgroundSync();

			expect(mockRegister).toHaveBeenCalledWith("pos-nfce-sync");
		});

		it("should handle missing service worker registration", async () => {
			vi.spyOn(swManager, "getServiceWorkerRegistration").mockResolvedValue(
				null,
			);

			vi.stubGlobal("ServiceWorkerRegistration", {
				prototype: {
					sync: {},
				},
			});

			vi.stubGlobal("navigator", {
				serviceWorker: {},
			});

			const consoleWarnSpy = vi
				.spyOn(console, "warn")
				.mockImplementation(() => {
					// empty mock
				});

			await registerBackgroundSync();

			expect(consoleWarnSpy).toHaveBeenCalled();

			consoleWarnSpy.mockRestore();
		});

		it("should throw error when registration fails", async () => {
			vi.spyOn(swManager, "getServiceWorkerRegistration").mockResolvedValue({
				sync: {
					register: vi.fn().mockRejectedValue(new Error("Registration failed")),
				},
			} as unknown as ServiceWorkerRegistration);

			vi.stubGlobal("ServiceWorkerRegistration", {
				prototype: {
					sync: {},
				},
			});

			vi.stubGlobal("navigator", {
				serviceWorker: {},
			});

			await expect(registerBackgroundSync()).rejects.toThrow(
				"Registration failed",
			);
		});
	});

	describe("processSync", () => {
		it("should process all queued requests successfully", async () => {
			const mockQueue = [
				{
					id: "1",
					url: "/api/test1",
					method: "POST",
					headers: {},
					timestamp: Date.now(),
				},
				{
					id: "2",
					url: "/api/test2",
					method: "PUT",
					headers: {},
					body: "data",
					timestamp: Date.now(),
				},
			];

			await saveSyncQueue(mockQueue);

			global.fetch = vi.fn().mockResolvedValue({ ok: true });

			await processSync();

			expect(global.fetch).toHaveBeenCalledTimes(2);

			const queue = await getSyncQueue();
			expect(queue).toHaveLength(0);
		});

		it("should keep failed requests in queue", async () => {
			const mockQueue = [
				{
					id: "1",
					url: "/api/success",
					method: "POST",
					headers: {},
					timestamp: Date.now(),
				},
				{
					id: "2",
					url: "/api/fail",
					method: "POST",
					headers: {},
					timestamp: Date.now(),
				},
			];

			await saveSyncQueue(mockQueue);

			global.fetch = vi.fn().mockImplementation((url) => {
				if (url === "/api/fail") {
					return Promise.resolve({ ok: false, status: 500 });
				}
				return Promise.resolve({ ok: true });
			});

			await processSync();

			const queue = await getSyncQueue();
			expect(queue).toHaveLength(1);
			expect(queue[0]?.url).toBe("/api/fail");
		});

		it("should handle fetch errors", async () => {
			const mockQueue = [
				{
					id: "1",
					url: "/api/test",
					method: "POST",
					headers: {},
					timestamp: Date.now(),
				},
			];

			await saveSyncQueue(mockQueue);

			global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {
					// empty mock
				});

			await processSync();

			expect(consoleErrorSpy).toHaveBeenCalled();

			const queue = await getSyncQueue();
			expect(queue).toHaveLength(1);

			consoleErrorSpy.mockRestore();
		});

		it("should do nothing when queue is empty", async () => {
			const consoleDebugSpy = vi
				.spyOn(console, "debug")
				.mockImplementation(() => {
					// empty mock
				});

			await processSync();

			expect(consoleDebugSpy).toHaveBeenCalledWith(
				"[Sync] No requests in queue",
			);

			consoleDebugSpy.mockRestore();
		});
	});

	describe("isBackgroundSyncSupported", () => {
		it("should return true when background sync is supported", () => {
			vi.stubGlobal("navigator", {
				serviceWorker: {},
			});

			vi.stubGlobal("ServiceWorkerRegistration", {
				prototype: {
					sync: {},
				},
			});

			expect(isBackgroundSyncSupported()).toBe(true);
		});

		it("should return false when service worker is not supported", () => {
			vi.stubGlobal("navigator", {});

			expect(isBackgroundSyncSupported()).toBe(false);
		});

		it("should return false when sync is not supported", () => {
			vi.stubGlobal("navigator", {
				serviceWorker: {},
			});

			vi.stubGlobal("ServiceWorkerRegistration", {
				prototype: {},
			});

			expect(isBackgroundSyncSupported()).toBe(false);
		});
	});

	describe("setupSyncListeners", () => {
		it("should process sync when connection is restored", async () => {
			const mockQueue = [
				{
					id: "1",
					url: "/api/test",
					method: "POST",
					headers: {},
					timestamp: Date.now(),
				},
			];

			await saveSyncQueue(mockQueue);

			global.fetch = vi.fn().mockResolvedValue({ ok: true });

			setupSyncListeners();

			window.dispatchEvent(new Event("online"));

			// Wait for async processSync to complete
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(global.fetch).toHaveBeenCalled();
		});

		it("should log when connection is lost", () => {
			const consoleInfoSpy = vi
				.spyOn(console, "info")
				.mockImplementation(() => {
					// empty mock
				});

			setupSyncListeners();

			window.dispatchEvent(new Event("offline"));

			expect(consoleInfoSpy).toHaveBeenCalledWith(
				"[Sync] Connection lost, requests will be queued",
			);

			consoleInfoSpy.mockRestore();
		});
	});
});
