/**
 * Data Synchronization Manager Tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as backgroundSync from './background-sync'
import * as dataSyncManager from './data-sync-manager'
import * as onlineStatus from './online-status'

describe('Data Sync Manager', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(true)
    vi.spyOn(onlineStatus, 'onConnectionChange').mockReturnValue(() => {
      // empty unsubscribe
    })
  })

  afterEach(() => {
    localStorage.clear()
    dataSyncManager.stopDataSync()
  })

  describe('initDataSync', () => {
    it('should initialize with default config', () => {
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {
        // empty mock
      })

      dataSyncManager.initDataSync()

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[DataSync] Data sync manager initialized',
        expect.objectContaining({
          conflictStrategy: 'last-write-wins',
          maxRetries: 5,
        })
      )

      consoleInfoSpy.mockRestore()
    })

    it('should initialize with custom config', () => {
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {
        // empty mock
      })

      dataSyncManager.initDataSync({
        conflictStrategy: 'server-wins',
        maxRetries: 3,
        batchSize: 10,
      })

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[DataSync] Data sync manager initialized',
        expect.objectContaining({
          conflictStrategy: 'server-wins',
          maxRetries: 3,
          batchSize: 10,
        })
      )

      consoleInfoSpy.mockRestore()
    })

    it('should set up connection change listener', () => {
      const onConnectionChangeSpy = vi.spyOn(onlineStatus, 'onConnectionChange')

      dataSyncManager.initDataSync()

      expect(onConnectionChangeSpy).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should set up periodic sync when configured', () => {
      vi.useFakeTimers()

      dataSyncManager.initDataSync({ syncIntervalMs: 5000 })

      expect(vi.getTimerCount()).toBeGreaterThan(0)

      vi.useRealTimers()
    })

    it('should not set up periodic sync when interval is 0', () => {
      vi.useFakeTimers()

      dataSyncManager.initDataSync({ syncIntervalMs: 0 })

      expect(vi.getTimerCount()).toBe(0)

      vi.useRealTimers()
    })
  })

  describe('stopDataSync', () => {
    it('should clear sync interval', () => {
      vi.useFakeTimers()

      dataSyncManager.initDataSync({ syncIntervalMs: 5000 })

      const timerCount = vi.getTimerCount()
      expect(timerCount).toBeGreaterThan(0)

      dataSyncManager.stopDataSync()

      expect(vi.getTimerCount()).toBeLessThan(timerCount)

      vi.useRealTimers()
    })

    it('should log when stopped', () => {
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {
        // empty mock
      })

      dataSyncManager.stopDataSync()

      expect(consoleInfoSpy).toHaveBeenCalledWith('[DataSync] Data sync manager stopped')

      consoleInfoSpy.mockRestore()
    })
  })

  describe('trackChange', () => {
    it('should track INSERT operation', async () => {
      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(false)
      vi.spyOn(backgroundSync, 'queueRequestForSync').mockResolvedValue()
      vi.spyOn(backgroundSync, 'processSync').mockResolvedValue()

      dataSyncManager.initDataSync()

      const id = await dataSyncManager.trackChange('products', 'INSERT', {
        id: 1,
        name: 'Product 1',
      })

      expect(id).toBeTruthy()

      const operations = await dataSyncManager.getAllSyncOperations()
      expect(operations).toHaveLength(1)
      expect(operations[0]).toMatchObject({
        entity: 'products',
        operation: 'INSERT',
        localData: { id: 1, name: 'Product 1' },
        status: 'pending',
      })
    })

    it('should track UPDATE operation', async () => {
      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(false)

      dataSyncManager.initDataSync()

      await dataSyncManager.trackChange('products', 'UPDATE', { id: 1, name: 'Updated Product' }, 2)

      const operations = await dataSyncManager.getAllSyncOperations()
      expect(operations).toHaveLength(1)
      expect(operations[0]).toMatchObject({
        entity: 'products',
        operation: 'UPDATE',
        version: 2,
      })
    })

    it('should track DELETE operation', async () => {
      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(false)

      dataSyncManager.initDataSync()

      await dataSyncManager.trackChange('products', 'DELETE', { id: 1 })

      const operations = await dataSyncManager.getAllSyncOperations()
      expect(operations).toHaveLength(1)
      expect(operations[0]).toMatchObject({
        entity: 'products',
        operation: 'DELETE',
      })
    })

    it('should trigger sync when online', async () => {
      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(true)
      vi.spyOn(backgroundSync, 'queueRequestForSync').mockResolvedValue()
      vi.spyOn(backgroundSync, 'processSync').mockResolvedValue()

      dataSyncManager.initDataSync()

      await dataSyncManager.trackChange('products', 'INSERT', { id: 1 })

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(backgroundSync.queueRequestForSync).toHaveBeenCalled()
    })

    it('should not trigger sync when offline', async () => {
      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(false)
      vi.spyOn(backgroundSync, 'queueRequestForSync').mockResolvedValue()
      vi.spyOn(backgroundSync, 'processSync').mockResolvedValue()

      dataSyncManager.initDataSync()

      await dataSyncManager.trackChange('products', 'INSERT', { id: 1 })

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(backgroundSync.processSync).not.toHaveBeenCalled()
    })
  })

  describe('syncPendingOperations', () => {
    it('should do nothing when no pending operations', async () => {
      dataSyncManager.initDataSync()

      const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {
        // empty mock
      })

      await dataSyncManager.syncPendingOperations()

      expect(consoleDebugSpy).toHaveBeenCalledWith('[DataSync] No pending operations to sync')

      consoleDebugSpy.mockRestore()
    })

    it('should sync pending operations when online', async () => {
      vi.spyOn(backgroundSync, 'queueRequestForSync').mockResolvedValue()
      vi.spyOn(backgroundSync, 'processSync').mockResolvedValue()
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 404,
        json: async () => ({}),
      })

      dataSyncManager.initDataSync()

      await dataSyncManager.trackChange('products', 'INSERT', { id: 1 })

      // Clear previous calls
      vi.clearAllMocks()

      await dataSyncManager.syncPendingOperations()

      expect(backgroundSync.queueRequestForSync).toHaveBeenCalled()
    })

    it('should handle sync errors and retry', async () => {
      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(false)
      vi.spyOn(backgroundSync, 'queueRequestForSync').mockRejectedValue(new Error('Network error'))

      dataSyncManager.initDataSync({ maxRetries: 2 })

      await dataSyncManager.trackChange('products', 'INSERT', { id: 1 })

      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(true)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // empty mock
      })

      await dataSyncManager.syncPendingOperations()

      const operations = await dataSyncManager.getAllSyncOperations()
      expect(operations[0]?.status).toBe('error')
      expect(operations[0]?.retryCount).toBe(1)
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should call onSyncError when max retries exceeded', async () => {
      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(false)
      vi.spyOn(backgroundSync, 'queueRequestForSync').mockRejectedValue(new Error('Network error'))

      const onSyncError = vi.fn()

      dataSyncManager.initDataSync({ maxRetries: 1, onSyncError })

      await dataSyncManager.trackChange('products', 'INSERT', { id: 1 })

      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(true)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // empty mock
      })

      await dataSyncManager.syncPendingOperations()

      expect(onSyncError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object))

      consoleErrorSpy.mockRestore()
    })

    it('should call onSyncComplete when operations synced successfully', async () => {
      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(false)
      vi.spyOn(backgroundSync, 'queueRequestForSync').mockResolvedValue()
      vi.spyOn(backgroundSync, 'processSync').mockResolvedValue()
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 404,
        json: async () => ({}),
      })

      const onSyncComplete = vi.fn()

      dataSyncManager.initDataSync({ onSyncComplete })

      await dataSyncManager.trackChange('products', 'INSERT', { id: 1 })

      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(true)

      await dataSyncManager.syncPendingOperations()

      expect(onSyncComplete).toHaveBeenCalledWith(expect.any(Array))
    })

    it('should process operations in batches', async () => {
      vi.spyOn(backgroundSync, 'queueRequestForSync').mockResolvedValue()
      vi.spyOn(backgroundSync, 'processSync').mockResolvedValue()
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 404,
        json: async () => ({}),
      })

      dataSyncManager.initDataSync({ batchSize: 2 })

      // Track 3 operations
      await dataSyncManager.trackChange('products', 'INSERT', { id: 1 })
      await dataSyncManager.trackChange('products', 'INSERT', { id: 2 })
      await dataSyncManager.trackChange('products', 'INSERT', { id: 3 })

      await dataSyncManager.syncPendingOperations()

      // Should be called 3 times (one for each operation)
      expect(backgroundSync.queueRequestForSync).toHaveBeenCalledTimes(3)
    })
  })

  describe('conflict resolution', () => {
    it('should resolve conflict using server-wins strategy', async () => {
      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(false)
      vi.spyOn(backgroundSync, 'queueRequestForSync').mockResolvedValue()
      vi.spyOn(backgroundSync, 'processSync').mockResolvedValue()
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 1,
          name: 'Server Product',
          version: 2,
        }),
      })

      dataSyncManager.initDataSync({ conflictStrategy: 'server-wins' })

      await dataSyncManager.trackChange('products', 'UPDATE', {
        id: 1,
        name: 'Local Product',
      })

      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(true)

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        // empty mock
      })

      await dataSyncManager.syncPendingOperations()

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[DataSync] Conflict detected',
        expect.any(Object)
      )

      consoleWarnSpy.mockRestore()
    })

    it('should resolve conflict using client-wins strategy', async () => {
      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(false)
      vi.spyOn(backgroundSync, 'queueRequestForSync').mockResolvedValue()
      vi.spyOn(backgroundSync, 'processSync').mockResolvedValue()
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 1,
          name: 'Server Product',
          version: 2,
        }),
      })

      dataSyncManager.initDataSync({ conflictStrategy: 'client-wins' })

      await dataSyncManager.trackChange('products', 'UPDATE', {
        id: 1,
        name: 'Local Product',
      })

      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(true)

      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {
        // empty mock
      })

      await dataSyncManager.syncPendingOperations()

      expect(consoleInfoSpy).toHaveBeenCalledWith('[DataSync] Resolving conflict: client-wins')

      consoleInfoSpy.mockRestore()
    })

    it('should resolve conflict using last-write-wins strategy', async () => {
      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(false)
      vi.spyOn(backgroundSync, 'queueRequestForSync').mockResolvedValue()
      vi.spyOn(backgroundSync, 'processSync').mockResolvedValue()

      const now = Date.now()
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 1,
          name: 'Server Product',
          version: 2,
          updated_at: now - 1000,
        }),
      })

      dataSyncManager.initDataSync({ conflictStrategy: 'last-write-wins' })

      await dataSyncManager.trackChange('products', 'UPDATE', {
        id: 1,
        name: 'Local Product',
        updated_at: now,
      })

      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(true)

      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {
        // empty mock
      })

      await dataSyncManager.syncPendingOperations()

      expect(consoleInfoSpy).toHaveBeenCalledWith('[DataSync] Resolving conflict: last-write-wins')

      consoleInfoSpy.mockRestore()
    })

    it('should resolve conflict using manual strategy with callback', async () => {
      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(false)
      vi.spyOn(backgroundSync, 'queueRequestForSync').mockResolvedValue()
      vi.spyOn(backgroundSync, 'processSync').mockResolvedValue()
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 1,
          name: 'Server Product',
          version: 2,
        }),
      })

      const onConflict = vi.fn().mockResolvedValue({
        id: 1,
        name: 'Merged Product',
      })

      dataSyncManager.initDataSync({ conflictStrategy: 'manual', onConflict })

      await dataSyncManager.trackChange('products', 'UPDATE', {
        id: 1,
        name: 'Local Product',
      })

      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(true)

      await dataSyncManager.syncPendingOperations()

      expect(onConflict).toHaveBeenCalledWith(
        expect.objectContaining({
          entity: 'products',
          localData: expect.objectContaining({ name: 'Local Product' }),
          remoteData: expect.objectContaining({ name: 'Server Product' }),
        })
      )
    })

    it('should fallback to server-wins when manual strategy has no callback', async () => {
      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(false)
      vi.spyOn(backgroundSync, 'queueRequestForSync').mockResolvedValue()
      vi.spyOn(backgroundSync, 'processSync').mockResolvedValue()
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 1,
          name: 'Server Product',
          version: 2,
        }),
      })

      dataSyncManager.initDataSync({ conflictStrategy: 'manual' })

      await dataSyncManager.trackChange('products', 'UPDATE', {
        id: 1,
        name: 'Local Product',
      })

      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(true)

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        // empty mock
      })

      await dataSyncManager.syncPendingOperations()

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[DataSync] No manual conflict resolver provided, falling back to server-wins'
      )

      consoleWarnSpy.mockRestore()
    })
  })

  describe('clearSyncOperations', () => {
    it('should clear all sync operations', async () => {
      dataSyncManager.initDataSync()

      await dataSyncManager.trackChange('products', 'INSERT', { id: 1 })
      await dataSyncManager.trackChange('products', 'INSERT', { id: 2 })

      let operations = await dataSyncManager.getAllSyncOperations()
      expect(operations).toHaveLength(2)

      await dataSyncManager.clearSyncOperations()

      operations = await dataSyncManager.getAllSyncOperations()
      expect(operations).toHaveLength(0)
    })

    it('should handle clearing when no operations exist', async () => {
      await dataSyncManager.clearSyncOperations()

      const operations = await dataSyncManager.getAllSyncOperations()
      expect(operations).toHaveLength(0)
    })

    it('should throw when localStorage.removeItem fails', async () => {
      const original = localStorage.removeItem
      Object.defineProperty(localStorage, 'removeItem', {
        value: () => {
          throw new Error('StorageError')
        },
        writable: true,
        configurable: true,
      })

      await expect(dataSyncManager.clearSyncOperations()).rejects.toThrow('StorageError')

      Object.defineProperty(localStorage, 'removeItem', {
        value: original,
        writable: true,
        configurable: true,
      })
    })
  })

  describe('getPendingOperationsCount', () => {
    it('should return 0 when no pending operations', async () => {
      const count = await dataSyncManager.getPendingOperationsCount()

      expect(count).toBe(0)
    })

    it('should return count of pending operations', async () => {
      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(false)

      dataSyncManager.initDataSync()

      await dataSyncManager.trackChange('products', 'INSERT', { id: 1 })
      await dataSyncManager.trackChange('products', 'INSERT', { id: 2 })

      const count = await dataSyncManager.getPendingOperationsCount()

      expect(count).toBe(2)
    })

    it('should include error operations in count', async () => {
      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(false)
      vi.spyOn(backgroundSync, 'queueRequestForSync').mockRejectedValue(new Error('Network error'))

      dataSyncManager.initDataSync()

      await dataSyncManager.trackChange('products', 'INSERT', { id: 1 })

      vi.spyOn(onlineStatus, 'isOnline').mockReturnValue(true)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // empty mock
      })

      await dataSyncManager.syncPendingOperations()

      const count = await dataSyncManager.getPendingOperationsCount()

      expect(count).toBe(1)

      consoleErrorSpy.mockRestore()
    })

    it('should not include synced operations in count', async () => {
      vi.spyOn(backgroundSync, 'queueRequestForSync').mockResolvedValue()
      vi.spyOn(backgroundSync, 'processSync').mockResolvedValue()
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 404,
        json: async () => ({}),
      })

      dataSyncManager.initDataSync()

      await dataSyncManager.trackChange('products', 'INSERT', { id: 1 })

      await dataSyncManager.syncPendingOperations()

      const count = await dataSyncManager.getPendingOperationsCount()

      expect(count).toBe(0)
    })
  })

  describe('getAllSyncOperations', () => {
    it('should return empty array when no operations', async () => {
      const operations = await dataSyncManager.getAllSyncOperations()

      expect(operations).toEqual([])
    })

    it('should return all tracked operations', async () => {
      dataSyncManager.initDataSync()

      await dataSyncManager.trackChange('products', 'INSERT', { id: 1 })
      await dataSyncManager.trackChange('products', 'UPDATE', { id: 2 })

      const operations = await dataSyncManager.getAllSyncOperations()

      expect(operations).toHaveLength(2)
      expect(operations[0]?.operation).toBe('INSERT')
      expect(operations[1]?.operation).toBe('UPDATE')
    })
  })
})
