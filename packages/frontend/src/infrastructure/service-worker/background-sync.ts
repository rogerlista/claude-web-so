/**
 * Background Sync Manager
 *
 * Handles background synchronization for failed requests
 * Queues requests when offline and syncs when connection is restored
 */

import { getServiceWorkerRegistration } from "./sw-manager";

export interface SyncRequest {
	id: string;
	url: string;
	method: string;
	headers: Record<string, string>;
	body?: string;
	timestamp: number;
}

const SYNC_TAG = "pos-nfce-sync";
const SYNC_QUEUE_KEY = "pos-nfce-sync-queue";

/**
 * Adds a request to the background sync queue
 */
export const queueRequestForSync = async (
	request: Omit<SyncRequest, "id" | "timestamp">,
): Promise<void> => {
	const syncRequest: SyncRequest = {
		...request,
		id: crypto.randomUUID(),
		timestamp: Date.now(),
	};

	// Store in IndexedDB or localStorage
	const queue = await getSyncQueue();
	queue.push(syncRequest);
	await saveSyncQueue(queue);

	console.info("[Sync] Request queued for background sync", syncRequest);

	// Register background sync if supported
	if (isBackgroundSyncSupported()) {
		await registerBackgroundSync();
	} else if (navigator.onLine) {
		// Fallback: try to sync immediately if online
		await processSync();
	}
};

/**
 * Registers a background sync event
 */
export const registerBackgroundSync = async (): Promise<void> => {
	if (!isBackgroundSyncSupported()) {
		console.warn("[Sync] Background sync not supported, will use fallback");
		return;
	}

	try {
		const registration = await getServiceWorkerRegistration();
		if (!registration) {
			console.warn("[Sync] No service worker registration found");
			return;
		}

		// @ts-expect-error - Background sync types not fully supported
		await registration.sync.register(SYNC_TAG);
		console.info("[Sync] Background sync registered");
	} catch (error) {
		console.error("[Sync] Failed to register background sync", error);
		throw error;
	}
};

/**
 * Processes all queued sync requests
 */
export const processSync = async (): Promise<void> => {
	const queue = await getSyncQueue();

	if (queue.length === 0) {
		console.debug("[Sync] No requests in queue");
		return;
	}

	console.info(`[Sync] Processing ${queue.length} queued requests`);

	const failedRequests: SyncRequest[] = [];

	for (const request of queue) {
		try {
			const fetchOptions: RequestInit = {
				method: request.method,
				headers: request.headers,
			};
			if (request.body) {
				fetchOptions.body = request.body;
			}
			const response = await fetch(request.url, fetchOptions);

			if (response.ok) {
				console.info("[Sync] Request synced successfully", request.id);
			} else {
				console.warn(
					"[Sync] Request failed with status",
					response.status,
					request,
				);
				failedRequests.push(request);
			}
		} catch (error) {
			console.error("[Sync] Failed to sync request", error, request);
			failedRequests.push(request);
		}
	}

	// Update queue with only failed requests
	await saveSyncQueue(failedRequests);

	if (failedRequests.length > 0) {
		console.warn(
			`[Sync] ${failedRequests.length} requests failed, will retry later`,
		);
	} else {
		console.info("[Sync] All requests synced successfully");
	}
};

/**
 * Gets the sync queue from storage
 */
export const getSyncQueue = (): Promise<SyncRequest[]> => {
	try {
		const queueJson = localStorage.getItem(SYNC_QUEUE_KEY);
		if (!queueJson) {
			return Promise.resolve([]);
		}
		return Promise.resolve(JSON.parse(queueJson) as SyncRequest[]);
	} catch (error) {
		console.error("[Sync] Failed to get sync queue", error);
		return Promise.resolve([]);
	}
};

/**
 * Saves the sync queue to storage
 */
export const saveSyncQueue = (queue: SyncRequest[]): Promise<void> => {
	try {
		localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
		return Promise.resolve();
	} catch (error) {
		console.error("[Sync] Failed to save sync queue", error);
		return Promise.reject(error);
	}
};

/**
 * Clears the sync queue
 */
export const clearSyncQueue = (): Promise<void> => {
	try {
		localStorage.removeItem(SYNC_QUEUE_KEY);
		console.info("[Sync] Sync queue cleared");
		return Promise.resolve();
	} catch (error) {
		console.error("[Sync] Failed to clear sync queue", error);
		return Promise.reject(error);
	}
};

/**
 * Gets the number of requests in the sync queue
 */
export const getSyncQueueSize = async (): Promise<number> => {
	const queue = await getSyncQueue();
	return queue.length;
};

/**
 * Checks if background sync is supported by the browser
 */
export const isBackgroundSyncSupported = (): boolean => {
	return (
		"serviceWorker" in navigator &&
		"sync" in ServiceWorkerRegistration.prototype
	);
};

/**
 * Sets up online/offline listeners to trigger sync
 */
export const setupSyncListeners = (): void => {
	window.addEventListener("online", async () => {
		console.info("[Sync] Connection restored, processing queued requests");
		await processSync();
	});

	window.addEventListener("offline", () => {
		console.info("[Sync] Connection lost, requests will be queued");
	});
};
