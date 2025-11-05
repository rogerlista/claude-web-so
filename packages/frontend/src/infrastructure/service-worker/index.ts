/**
 * Service Worker Infrastructure
 *
 * Exports all service worker related functionality
 */

export {
  registerServiceWorker,
  updateServiceWorker,
  unregisterServiceWorker,
  isServiceWorkerSupported,
  getServiceWorkerRegistration,
  type ServiceWorkerStatus,
  type ServiceWorkerState,
} from './sw-manager'

export {
  queueRequestForSync,
  registerBackgroundSync,
  processSync,
  getSyncQueue,
  saveSyncQueue,
  clearSyncQueue,
  getSyncQueueSize,
  isBackgroundSyncSupported,
  setupSyncListeners,
  type SyncRequest,
} from './background-sync'

export {
  getOnlineStatus,
  isOnline,
  isOffline,
  onConnectionChange,
  setupOnlineStatusMonitoring,
  cleanupOnlineStatusMonitoring,
  verifyConnectivity,
  type ConnectionStatus,
  type ConnectionChangeCallback,
} from './online-status'

export {
  initDataSync,
  stopDataSync,
  trackChange,
  syncPendingOperations,
  clearSyncOperations,
  getPendingOperationsCount,
  getAllSyncOperations,
  type SyncOperation,
  type SyncConflict,
  type ConflictResolutionStrategy,
  type SyncConfig,
} from './data-sync-manager'
