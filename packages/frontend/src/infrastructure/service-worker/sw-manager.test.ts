/**
 * Service Worker Manager Tests
 *
 * Note: These tests focus on testable behavior. The registerSW function from
 * virtual:pwa-register is mocked and its internal behavior is tested via E2E tests.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock virtual:pwa-register module
vi.mock('virtual:pwa-register', () => {
  const mockUpdateSW = vi.fn()
  const mockRegisterSW = vi.fn(() => mockUpdateSW)
  return {
    registerSW: mockRegisterSW,
    __mockUpdateSW: mockUpdateSW,
  }
})

import { registerSW } from 'virtual:pwa-register'
import {
  getServiceWorkerRegistration,
  isServiceWorkerSupported,
  registerServiceWorker,
  unregisterServiceWorker,
  updateServiceWorker,
} from './sw-manager'

describe('Service Worker Manager', () => {
  const mockRegisterSW = vi.mocked(registerSW)

  beforeEach(() => {
    vi.clearAllMocks()
    const mockUpdateSW = vi.fn().mockResolvedValue(undefined)
    mockRegisterSW.mockReturnValue(mockUpdateSW)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('isServiceWorkerSupported', () => {
    it('should return true when service worker is supported', () => {
      vi.stubGlobal('navigator', {
        serviceWorker: {},
      })

      expect(isServiceWorkerSupported()).toBe(true)
    })

    it('should return false when service worker is not supported', () => {
      vi.stubGlobal('navigator', {})

      expect(isServiceWorkerSupported()).toBe(false)
    })
  })

  describe('registerServiceWorker', () => {
    it('should call registerSW with correct options structure', () => {
      registerServiceWorker()

      expect(mockRegisterSW).toHaveBeenCalledWith(
        expect.objectContaining({
          immediate: true,
          onNeedRefresh: expect.any(Function),
          onOfflineReady: expect.any(Function),
          onRegistered: expect.any(Function),
          onRegisterError: expect.any(Function),
        })
      )
    })

    it('should call custom onUpdateAvailable callback when onNeedRefresh is triggered', () => {
      const onUpdateAvailable = vi.fn()

      registerServiceWorker({ onUpdateAvailable })

      // Get the options passed to registerSW
      const options = mockRegisterSW.mock.calls[0]?.[0]

      // Trigger onNeedRefresh
      options?.onNeedRefresh?.()

      expect(onUpdateAvailable).toHaveBeenCalled()
    })

    it('should call custom onOfflineReady callback when triggered', () => {
      const onOfflineReady = vi.fn()

      registerServiceWorker({ onOfflineReady })

      const options = mockRegisterSW.mock.calls[0]?.[0]
      options?.onOfflineReady?.()

      expect(onOfflineReady).toHaveBeenCalled()
    })

    it('should call custom onError callback when onRegisterError is triggered', () => {
      const onError = vi.fn()
      const error = new Error('Registration failed')

      registerServiceWorker({ onError })

      const options = mockRegisterSW.mock.calls[0]?.[0]
      options?.onRegisterError?.(error)

      expect(onError).toHaveBeenCalledWith(error)
    })

    it('should log when service worker is registered', () => {
      const mockRegistration = { active: true } as unknown as ServiceWorkerRegistration
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {
        // empty mock
      })

      registerServiceWorker()

      const options = mockRegisterSW.mock.calls[0]?.[0]
      options?.onRegistered?.(mockRegistration)

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[SW] Service Worker registered',
        mockRegistration
      )

      consoleInfoSpy.mockRestore()
    })

    it('should handle registerSW throwing an error', () => {
      const onError = vi.fn()
      const error = new Error('Registration error')

      mockRegisterSW.mockImplementationOnce(() => {
        throw error
      })

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // empty mock
      })

      registerServiceWorker({ onError })

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith(error)

      consoleErrorSpy.mockRestore()
    })
  })

  describe('updateServiceWorker', () => {
    it('should warn when updateSW is not available', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        // empty mock
      })

      // Reset modules to ensure updateSW is undefined
      vi.resetModules()

      // Re-import the module
      const { updateServiceWorker: updateSW } = await import('./sw-manager')

      // Call without registering
      await updateSW()

      expect(consoleWarnSpy).toHaveBeenCalledWith('[SW] No update function available')

      consoleWarnSpy.mockRestore()
    })

    it('should call updateSW with reloadPage=true by default after registration', async () => {
      const mockUpdateSW = vi.fn().mockResolvedValue(undefined)
      mockRegisterSW.mockReturnValue(mockUpdateSW)

      registerServiceWorker()

      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {
        // empty mock
      })

      await updateServiceWorker()

      expect(mockUpdateSW).toHaveBeenCalledWith(true)
      expect(consoleInfoSpy).toHaveBeenCalledWith('[SW] Service Worker updated successfully')

      consoleInfoSpy.mockRestore()
    })

    it('should call updateSW with reloadPage=false when specified', async () => {
      const mockUpdateSW = vi.fn().mockResolvedValue(undefined)
      mockRegisterSW.mockReturnValue(mockUpdateSW)

      registerServiceWorker()

      await updateServiceWorker(false)

      expect(mockUpdateSW).toHaveBeenCalledWith(false)
    })

    it('should throw error when update fails', async () => {
      const error = new Error('Update failed')
      const mockUpdateSW = vi.fn().mockRejectedValue(error)
      mockRegisterSW.mockReturnValue(mockUpdateSW)

      registerServiceWorker()

      await expect(updateServiceWorker()).rejects.toThrow('Update failed')
    })
  })

  describe('unregisterServiceWorker', () => {
    it('should unregister all service workers', async () => {
      const mockUnregister1 = vi.fn().mockResolvedValue(true)
      const mockUnregister2 = vi.fn().mockResolvedValue(true)

      vi.stubGlobal('navigator', {
        serviceWorker: {
          getRegistrations: vi
            .fn()
            .mockResolvedValue([{ unregister: mockUnregister1 }, { unregister: mockUnregister2 }]),
        },
      })

      await unregisterServiceWorker()

      expect(mockUnregister1).toHaveBeenCalled()
      expect(mockUnregister2).toHaveBeenCalled()
    })

    it('should do nothing when service worker is not supported', async () => {
      vi.stubGlobal('navigator', {})

      await unregisterServiceWorker()

      // Should complete without errors
      expect(true).toBe(true)
    })

    it('should throw error when unregistration fails', async () => {
      const error = new Error('Unregister failed')

      vi.stubGlobal('navigator', {
        serviceWorker: {
          getRegistrations: vi.fn().mockRejectedValue(error),
        },
      })

      await expect(unregisterServiceWorker()).rejects.toThrow('Unregister failed')
    })
  })

  describe('getServiceWorkerRegistration', () => {
    it('should return registration when service worker is supported', async () => {
      const mockRegistration = { active: true }

      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.resolve(mockRegistration),
        },
      })

      const registration = await getServiceWorkerRegistration()

      expect(registration).toBe(mockRegistration)
    })

    it('should return null when service worker is not supported', async () => {
      vi.stubGlobal('navigator', {})

      const registration = await getServiceWorkerRegistration()

      expect(registration).toBeNull()
    })

    it('should return null when getting registration fails', async () => {
      vi.stubGlobal('navigator', {
        serviceWorker: {
          ready: Promise.reject(new Error('Failed')),
        },
      })

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // empty mock
      })

      const registration = await getServiceWorkerRegistration()

      expect(registration).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })
})
