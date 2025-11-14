/**
 * Service Worker Manager
 *
 * Manages service worker lifecycle, updates, and background sync
 */

import { registerSW } from "virtual:pwa-register";
import type { RegisterSWOptions } from "vite-plugin-pwa/types";

export type ServiceWorkerStatus =
	| "installing"
	| "waiting"
	| "active"
	| "redundant"
	| "error";

export interface ServiceWorkerState {
	status: ServiceWorkerStatus;
	needsRefresh: boolean;
	offlineReady: boolean;
}

type UpdateAvailableCallback = () => void;
type OfflineReadyCallback = () => void;
type ErrorCallback = (error: Error) => void;

let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined;

/**
 * Registers the service worker and sets up lifecycle handlers
 */
export const registerServiceWorker = (options?: {
	onUpdateAvailable?: UpdateAvailableCallback;
	onOfflineReady?: OfflineReadyCallback;
	onError?: ErrorCallback;
}): void => {
	const { onUpdateAvailable, onOfflineReady, onError } = options ?? {};

	const swOptions: RegisterSWOptions = {
		immediate: true,
		onNeedRefresh() {
			console.info("[SW] New version available, prompting user to refresh");
			onUpdateAvailable?.();
		},
		onOfflineReady() {
			console.info("[SW] App ready to work offline");
			onOfflineReady?.();
		},
		onRegistered(registration) {
			console.info("[SW] Service Worker registered", registration);
		},
		onRegisterError(error) {
			console.error("[SW] Service Worker registration failed", error);
			onError?.(error);
		},
	};

	try {
		updateSW = registerSW(swOptions);
	} catch (error) {
		console.error("[SW] Failed to register service worker", error);
		onError?.(error as Error);
	}
};

/**
 * Updates the service worker to the new version
 * @param reloadPage - Whether to reload the page after update (default: true)
 */
export const updateServiceWorker = async (reloadPage = true): Promise<void> => {
	if (!updateSW) {
		console.warn("[SW] No update function available");
		return;
	}

	try {
		await updateSW(reloadPage);
		console.info("[SW] Service Worker updated successfully");
	} catch (error) {
		console.error("[SW] Failed to update service worker", error);
		throw error;
	}
};

/**
 * Unregisters all service workers
 */
export const unregisterServiceWorker = async (): Promise<void> => {
	if (!("serviceWorker" in navigator)) {
		return;
	}

	try {
		const registrations = await navigator.serviceWorker.getRegistrations();
		await Promise.all(
			registrations.map((registration) => registration.unregister()),
		);
		console.info("[SW] All service workers unregistered");
	} catch (error) {
		console.error("[SW] Failed to unregister service workers", error);
		throw error;
	}
};

/**
 * Checks if service worker is supported by the browser
 */
export const isServiceWorkerSupported = (): boolean => {
	return "serviceWorker" in navigator;
};

/**
 * Gets the current service worker registration
 */
export const getServiceWorkerRegistration =
	async (): Promise<ServiceWorkerRegistration | null> => {
		if (!isServiceWorkerSupported()) {
			return null;
		}

		try {
			return await navigator.serviceWorker.ready;
		} catch (error) {
			console.error("[SW] Failed to get service worker registration", error);
			return null;
		}
	};
