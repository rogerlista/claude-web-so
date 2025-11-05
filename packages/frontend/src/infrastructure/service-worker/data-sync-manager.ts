/**
 * Data Synchronization Manager
 *
 * Manages bidirectional data synchronization between local and remote databases
 * Handles conflict resolution, automatic retry, and change tracking
 */

import { processSync, queueRequestForSync } from './background-sync'
import { isOnline, onConnectionChange } from './online-status'

export interface SyncOperation {
  id: string
  entity: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  localData: Record<string, unknown>
  remoteData?: Record<string, unknown>
  timestamp: number
  version: number
  status: 'pending' | 'syncing' | 'synced' | 'conflict' | 'error'
  retryCount: number
  lastError?: string
}

export interface SyncConflict {
  operationId: string
  entity: string
  localData: Record<string, unknown>
  remoteData: Record<string, unknown>
  localVersion: number
  remoteVersion: number
  timestamp: number
}

export type ConflictResolutionStrategy =
  | 'last-write-wins'
  | 'server-wins'
  | 'client-wins'
  | 'manual'

export interface SyncConfig {
  conflictStrategy: ConflictResolutionStrategy
  maxRetries: number
  retryDelayMs: number
  batchSize: number
  syncIntervalMs?: number
  onConflict?: (conflict: SyncConflict) => Promise<Record<string, unknown>>
  onSyncComplete?: (operations: SyncOperation[]) => void
  onSyncError?: (error: Error, operation?: SyncOperation) => void
}

const SYNC_OPERATIONS_KEY = 'pos-nfce-sync-operations'
const DEFAULT_CONFIG: SyncConfig = {
  conflictStrategy: 'last-write-wins',
  maxRetries: 5,
  retryDelayMs: 1000,
  batchSize: 50,
}

let syncConfig: SyncConfig = DEFAULT_CONFIG
let syncIntervalId: number | undefined

/**
 * Initializes the data sync manager
 */
export const initDataSync = (config?: Partial<SyncConfig>): void => {
  syncConfig = { ...DEFAULT_CONFIG, ...config }

  // Set up connection change listener
  onConnectionChange((status) => {
    if (status === 'online') {
      console.info('[DataSync] Connection restored, triggering sync')
      syncPendingOperations().catch((error) => {
        console.error('[DataSync] Failed to sync', error)
      })
    }
  })

  // Set up periodic sync if configured
  if (syncConfig.syncIntervalMs && syncConfig.syncIntervalMs > 0) {
    syncIntervalId = window.setInterval(() => {
      if (isOnline()) {
        syncPendingOperations().catch((error) => {
          console.error('[DataSync] Failed to sync', error)
        })
      }
    }, syncConfig.syncIntervalMs) as unknown as number
  }

  console.info('[DataSync] Data sync manager initialized', syncConfig)
}

/**
 * Stops the data sync manager
 */
export const stopDataSync = (): void => {
  if (syncIntervalId !== undefined) {
    clearInterval(syncIntervalId)
    syncIntervalId = undefined
  }
  console.info('[DataSync] Data sync manager stopped')
}

/**
 * Tracks a local change for synchronization
 */
export const trackChange = async (
  entity: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  data: Record<string, unknown>,
  version = 1
): Promise<string> => {
  const syncOp: SyncOperation = {
    id: crypto.randomUUID(),
    entity,
    operation,
    localData: data,
    timestamp: Date.now(),
    version,
    status: 'pending',
    retryCount: 0,
  }

  const operations = await getSyncOperations()
  operations.push(syncOp)
  await saveSyncOperations(operations)

  console.info('[DataSync] Change tracked', {
    id: syncOp.id,
    entity,
    operation,
  })

  // Trigger sync if online
  if (isOnline()) {
    syncPendingOperations().catch((error) => {
      console.error('[DataSync] Failed to sync after tracking change', error)
    })
  }

  return syncOp.id
}

/**
 * Synchronizes all pending operations
 */
export const syncPendingOperations = async (): Promise<void> => {
  const operations = await getSyncOperations()
  const pendingOps = operations.filter((op) => op.status === 'pending' || op.status === 'error')

  if (pendingOps.length === 0) {
    console.debug('[DataSync] No pending operations to sync')
    return
  }

  console.info(`[DataSync] Syncing ${pendingOps.length} pending operations`)

  const results: SyncOperation[] = []

  // Process in batches
  for (let i = 0; i < pendingOps.length; i += syncConfig.batchSize) {
    const batch = pendingOps.slice(i, i + syncConfig.batchSize)

    for (const op of batch) {
      try {
        op.status = 'syncing'
        await saveSyncOperations(operations)

        const result = await syncOperation(op)
        results.push(result)
      } catch (error) {
        console.error('[DataSync] Error syncing operation', error, op)
        op.status = 'error'
        op.lastError = error instanceof Error ? error.message : 'Unknown error'
        op.retryCount += 1

        if (op.retryCount >= syncConfig.maxRetries) {
          console.error(`[DataSync] Operation ${op.id} failed after ${op.retryCount} retries`, op)
          syncConfig.onSyncError?.(error instanceof Error ? error : new Error('Unknown error'), op)
        }
      }
    }
  }

  await saveSyncOperations(operations)

  // Clean up synced operations
  const remainingOps = operations.filter((op) => op.status !== 'synced')
  await saveSyncOperations(remainingOps)

  if (results.length > 0) {
    syncConfig.onSyncComplete?.(results)
  }

  console.info('[DataSync] Sync complete', {
    synced: results.filter((op) => op.status === 'synced').length,
    conflicts: results.filter((op) => op.status === 'conflict').length,
    errors: results.filter((op) => op.status === 'error').length,
  })
}

/**
 * Synchronizes a single operation
 */
const syncOperation = async (operation: SyncOperation): Promise<SyncOperation> => {
  // Build request for the operation
  const endpoint = buildEndpoint(operation.entity, operation.operation)
  const method = getHttpMethod(operation.operation)

  try {
    // Queue for background sync
    await queueRequestForSync({
      url: endpoint,
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Sync-Version': operation.version.toString(),
        'X-Operation-Id': operation.id,
      },
      body: JSON.stringify(operation.localData),
    })

    // Process sync immediately if online
    if (isOnline()) {
      await processSync()
    }

    // Check if sync was successful by verifying with server
    const verified = await verifySync(operation)

    if (verified.conflict) {
      operation.status = 'conflict'

      // Ensure remote data exists for conflict resolution
      if (!verified.remoteData || verified.remoteVersion === undefined) {
        throw new Error('Invalid conflict state: missing remote data or version')
      }

      operation.remoteData = verified.remoteData

      // Handle conflict based on strategy
      const resolvedData = await resolveConflict({
        operationId: operation.id,
        entity: operation.entity,
        localData: operation.localData,
        remoteData: verified.remoteData,
        localVersion: operation.version,
        remoteVersion: verified.remoteVersion,
        timestamp: Date.now(),
      })

      // Update with resolved data
      operation.localData = resolvedData
      operation.version = (verified.remoteVersion ?? operation.version) + 1

      // Retry with resolved data
      return syncOperation(operation)
    }

    if (verified.success) {
      operation.status = 'synced'
      console.info('[DataSync] Operation synced successfully', operation.id)
    } else {
      throw new Error(verified.error ?? 'Unknown sync error')
    }
  } catch (error) {
    console.error('[DataSync] Failed to sync operation', error, operation)
    throw error
  }

  return operation
}

/**
 * Verifies if a sync operation was successful
 */
const verifySync = async (
  operation: SyncOperation
): Promise<{
  success: boolean
  conflict: boolean
  remoteData?: Record<string, unknown>
  remoteVersion?: number
  error?: string
}> => {
  try {
    // Get the entity ID from local data
    const entityId = operation.localData['id'] as string | number

    if (!entityId) {
      return { success: true, conflict: false }
    }

    // Fetch current state from server
    const endpoint = buildEndpoint(operation.entity, 'GET', entityId)
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      if (response.status === 404) {
        // Entity doesn't exist on server (expected for INSERT)
        return { success: true, conflict: false }
      }
      return {
        success: false,
        conflict: false,
        error: `Server returned ${response.status}`,
      }
    }

    const remoteData = (await response.json()) as Record<string, unknown>
    const remoteVersion = (remoteData['version'] as number) ?? 0

    // Check for version conflict
    if (remoteVersion > operation.version) {
      return {
        success: false,
        conflict: true,
        remoteData,
        remoteVersion,
      }
    }

    return { success: true, conflict: false }
  } catch (error) {
    console.error('[DataSync] Error verifying sync', error)
    return {
      success: false,
      conflict: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Resolves a data conflict using the configured strategy
 */
const resolveConflict = async (conflict: SyncConflict): Promise<Record<string, unknown>> => {
  console.warn('[DataSync] Conflict detected', conflict)

  switch (syncConfig.conflictStrategy) {
    case 'server-wins':
      console.info('[DataSync] Resolving conflict: server-wins')
      return conflict.remoteData

    case 'client-wins':
      console.info('[DataSync] Resolving conflict: client-wins')
      return conflict.localData

    case 'last-write-wins': {
      console.info('[DataSync] Resolving conflict: last-write-wins')
      const localTimestamp = (conflict.localData['updated_at'] as number) ?? conflict.timestamp
      const remoteTimestamp = (conflict.remoteData['updated_at'] as number) ?? 0

      return localTimestamp > remoteTimestamp ? conflict.localData : conflict.remoteData
    }

    case 'manual':
      console.info('[DataSync] Resolving conflict: manual')
      if (syncConfig.onConflict) {
        return await syncConfig.onConflict(conflict)
      }
      // Fallback to server-wins if no manual resolver
      console.warn('[DataSync] No manual conflict resolver provided, falling back to server-wins')
      return conflict.remoteData

    default:
      console.warn('[DataSync] Unknown conflict strategy, falling back to server-wins')
      return conflict.remoteData
  }
}

/**
 * Gets all sync operations from storage
 */
const getSyncOperations = (): Promise<SyncOperation[]> => {
  try {
    const opsJson = localStorage.getItem(SYNC_OPERATIONS_KEY)
    if (!opsJson) {
      return Promise.resolve([])
    }
    return Promise.resolve(JSON.parse(opsJson) as SyncOperation[])
  } catch (error) {
    console.error('[DataSync] Failed to get sync operations', error)
    return Promise.resolve([])
  }
}

/**
 * Saves sync operations to storage
 */
const saveSyncOperations = (operations: SyncOperation[]): Promise<void> => {
  try {
    localStorage.setItem(SYNC_OPERATIONS_KEY, JSON.stringify(operations))
    return Promise.resolve()
  } catch (error) {
    console.error('[DataSync] Failed to save sync operations', error)
    return Promise.reject(error)
  }
}

/**
 * Clears all sync operations
 */
export const clearSyncOperations = (): Promise<void> => {
  try {
    localStorage.removeItem(SYNC_OPERATIONS_KEY)
    console.info('[DataSync] Sync operations cleared')
    return Promise.resolve()
  } catch (error) {
    console.error('[DataSync] Failed to clear sync operations', error)
    return Promise.reject(error)
  }
}

/**
 * Gets the count of pending sync operations
 */
export const getPendingOperationsCount = async (): Promise<number> => {
  const operations = await getSyncOperations()
  return operations.filter((op) => op.status === 'pending' || op.status === 'error').length
}

/**
 * Gets all sync operations (for debugging/monitoring)
 */
export const getAllSyncOperations = (): Promise<SyncOperation[]> => {
  return getSyncOperations()
}

/**
 * Builds API endpoint for entity operation
 */
const buildEndpoint = (entity: string, operation: string, id?: string | number): string => {
  const baseUrl = '/api'
  const entityPath = entity.toLowerCase().replace(/_/g, '-')

  if (operation === 'GET' && id !== undefined) {
    return `${baseUrl}/${entityPath}/${id}`
  }

  if (operation === 'DELETE' && id !== undefined) {
    return `${baseUrl}/${entityPath}/${id}`
  }

  return `${baseUrl}/${entityPath}`
}

/**
 * Gets HTTP method for sync operation
 */
const getHttpMethod = (operation: 'INSERT' | 'UPDATE' | 'DELETE'): string => {
  switch (operation) {
    case 'INSERT':
      return 'POST'
    case 'UPDATE':
      return 'PUT'
    case 'DELETE':
      return 'DELETE'
    default:
      return 'POST'
  }
}
