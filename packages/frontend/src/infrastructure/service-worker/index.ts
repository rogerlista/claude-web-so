/**
 * Service Worker Infrastructure
 *
 * Exports all service worker related functionality
 */

export {
	clearSyncQueue,
	getSyncQueue,
	getSyncQueueSize,
	isBackgroundSyncSupported,
	processSync,
	queueRequestForSync,
	registerBackgroundSync,
	type SyncRequest,
	saveSyncQueue,
	setupSyncListeners,
} from "./background-sync";
export {
	type ConflictResolutionStrategy,
	clearSyncOperations,
	getAllSyncOperations,
	getPendingOperationsCount,
	initDataSync,
	type SyncConfig,
	type SyncConflict,
	type SyncOperation,
	stopDataSync,
	syncPendingOperations,
	trackChange,
} from "./data-sync-manager";

export {
	type ConnectionChangeCallback,
	type ConnectionStatus,
	cleanupOnlineStatusMonitoring,
	getOnlineStatus,
	isOffline,
	isOnline,
	onConnectionChange,
	setupOnlineStatusMonitoring,
	verifyConnectivity,
} from "./online-status";
export {
	getServiceWorkerRegistration,
	isServiceWorkerSupported,
	registerServiceWorker,
	type ServiceWorkerState,
	type ServiceWorkerStatus,
	unregisterServiceWorker,
	updateServiceWorker,
} from "./sw-manager";
