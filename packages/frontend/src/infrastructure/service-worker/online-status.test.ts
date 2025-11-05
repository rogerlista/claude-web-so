/**
 * Online Status Manager Tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cleanupOnlineStatusMonitoring,
  getOnlineStatus,
  isOffline,
  isOnline,
  onConnectionChange,
  setupOnlineStatusMonitoring,
  verifyConnectivity,
} from './online-status'

describe('Online Status Manager', () => {
  beforeEach(() => {
    // Reset navigator.onLine to online
    vi.stubGlobal('navigator', { onLine: true })
  })

  afterEach(() => {
    cleanupOnlineStatusMonitoring()
    vi.unstubAllGlobals()
  })

  describe('getOnlineStatus', () => {
    it('should return "online" when navigator is online', () => {
      vi.stubGlobal('navigator', { onLine: true })
      setupOnlineStatusMonitoring()

      expect(getOnlineStatus()).toBe('online')
    })

    it('should return "offline" when navigator is offline', () => {
      vi.stubGlobal('navigator', { onLine: false })
      setupOnlineStatusMonitoring()

      expect(getOnlineStatus()).toBe('offline')
    })
  })

  describe('isOnline', () => {
    it('should return true when online', () => {
      vi.stubGlobal('navigator', { onLine: true })
      setupOnlineStatusMonitoring()

      expect(isOnline()).toBe(true)
    })

    it('should return false when offline', () => {
      vi.stubGlobal('navigator', { onLine: false })
      setupOnlineStatusMonitoring()

      expect(isOffline()).toBe(true)
    })
  })

  describe('isOffline', () => {
    it('should return false when online', () => {
      vi.stubGlobal('navigator', { onLine: true })
      setupOnlineStatusMonitoring()

      expect(isOffline()).toBe(false)
    })

    it('should return true when offline', () => {
      vi.stubGlobal('navigator', { onLine: false })
      setupOnlineStatusMonitoring()

      expect(isOffline()).toBe(true)
    })
  })

  describe('onConnectionChange', () => {
    it('should call callback when connection goes online', () => {
      vi.stubGlobal('navigator', { onLine: false })
      setupOnlineStatusMonitoring()

      const callback = vi.fn()
      onConnectionChange(callback)

      // Simulate online event
      window.dispatchEvent(new Event('online'))

      expect(callback).toHaveBeenCalledWith('online')
    })

    it('should call callback when connection goes offline', () => {
      vi.stubGlobal('navigator', { onLine: true })
      setupOnlineStatusMonitoring()

      const callback = vi.fn()
      onConnectionChange(callback)

      // Simulate offline event
      window.dispatchEvent(new Event('offline'))

      expect(callback).toHaveBeenCalledWith('offline')
    })

    it('should return unsubscribe function', () => {
      setupOnlineStatusMonitoring()

      const callback = vi.fn()
      const unsubscribe = onConnectionChange(callback)

      // Unsubscribe
      unsubscribe()

      // Trigger event
      window.dispatchEvent(new Event('online'))

      // Callback should not be called
      expect(callback).not.toHaveBeenCalled()
    })

    it('should handle multiple listeners', () => {
      setupOnlineStatusMonitoring()

      const callback1 = vi.fn()
      const callback2 = vi.fn()

      onConnectionChange(callback1)
      onConnectionChange(callback2)

      window.dispatchEvent(new Event('online'))

      expect(callback1).toHaveBeenCalledWith('online')
      expect(callback2).toHaveBeenCalledWith('online')
    })

    it('should handle errors in listeners gracefully', () => {
      setupOnlineStatusMonitoring()

      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Callback error')
      })
      const successCallback = vi.fn()

      onConnectionChange(errorCallback)
      onConnectionChange(successCallback)

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // empty mock
      })

      window.dispatchEvent(new Event('online'))

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(successCallback).toHaveBeenCalledWith('online')

      consoleErrorSpy.mockRestore()
    })
  })

  describe('setupOnlineStatusMonitoring', () => {
    it('should set initial status to online when navigator is online', () => {
      vi.stubGlobal('navigator', { onLine: true })

      setupOnlineStatusMonitoring()

      expect(getOnlineStatus()).toBe('online')
    })

    it('should set initial status to offline when navigator is offline', () => {
      vi.stubGlobal('navigator', { onLine: false })

      setupOnlineStatusMonitoring()

      expect(getOnlineStatus()).toBe('offline')
    })
  })

  describe('cleanupOnlineStatusMonitoring', () => {
    it('should remove all event listeners', () => {
      setupOnlineStatusMonitoring()

      const callback = vi.fn()
      onConnectionChange(callback)

      cleanupOnlineStatusMonitoring()

      window.dispatchEvent(new Event('online'))

      expect(callback).not.toHaveBeenCalled()
    })

    it('should clear all listeners', () => {
      setupOnlineStatusMonitoring()

      const callback1 = vi.fn()
      const callback2 = vi.fn()

      onConnectionChange(callback1)
      onConnectionChange(callback2)

      cleanupOnlineStatusMonitoring()

      window.dispatchEvent(new Event('offline'))

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).not.toHaveBeenCalled()
    })
  })

  describe('verifyConnectivity', () => {
    it('should return true when fetch succeeds', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true })

      const result = await verifyConnectivity()

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        '/favicon.ico',
        expect.objectContaining({
          method: 'HEAD',
          cache: 'no-cache',
        })
      )
    })

    it('should return false when fetch fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const result = await verifyConnectivity()

      expect(result).toBe(false)
    })

    it('should return false when response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false })

      const result = await verifyConnectivity()

      expect(result).toBe(false)
    })

    it('should use custom URL when provided', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true })

      await verifyConnectivity('/api/health')

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/health',
        expect.objectContaining({
          method: 'HEAD',
        })
      )
    })

    it('should return false when fetch is aborted', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Aborted'))

      const result = await verifyConnectivity()

      expect(result).toBe(false)
    })
  })
})
