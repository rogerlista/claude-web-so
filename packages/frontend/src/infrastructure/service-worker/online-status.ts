/**
 * Online Status Manager
 *
 * Monitors and manages online/offline status of the application
 */

export type ConnectionStatus = 'online' | 'offline'
export type ConnectionChangeCallback = (status: ConnectionStatus) => void

let currentStatus: ConnectionStatus = navigator.onLine ? 'online' : 'offline'
const listeners = new Set<ConnectionChangeCallback>()

/**
 * Gets the current online/offline status
 */
export const getOnlineStatus = (): ConnectionStatus => {
  return currentStatus
}

/**
 * Checks if the application is currently online
 */
export const isOnline = (): boolean => {
  return currentStatus === 'online'
}

/**
 * Checks if the application is currently offline
 */
export const isOffline = (): boolean => {
  return currentStatus === 'offline'
}

/**
 * Subscribes to connection status changes
 * @returns Unsubscribe function
 */
export const onConnectionChange = (callback: ConnectionChangeCallback): (() => void) => {
  listeners.add(callback)

  // Return unsubscribe function
  return () => {
    listeners.delete(callback)
  }
}

/**
 * Notifies all listeners of status change
 */
const notifyListeners = (status: ConnectionStatus): void => {
  for (const listener of listeners) {
    try {
      listener(status)
    } catch (error) {
      console.error('[OnlineStatus] Error in listener', error)
    }
  }
}

/**
 * Handles online event
 */
const handleOnline = (): void => {
  console.info('[OnlineStatus] Connection restored')
  currentStatus = 'online'
  notifyListeners('online')
}

/**
 * Handles offline event
 */
const handleOffline = (): void => {
  console.info('[OnlineStatus] Connection lost')
  currentStatus = 'offline'
  notifyListeners('offline')
}

/**
 * Initializes online/offline status monitoring
 */
export const setupOnlineStatusMonitoring = (): void => {
  // Set initial status
  currentStatus = navigator.onLine ? 'online' : 'offline'

  // Add event listeners
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  console.info('[OnlineStatus] Monitoring initialized, current status:', currentStatus)
}

/**
 * Cleans up event listeners
 */
export const cleanupOnlineStatusMonitoring = (): void => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  listeners.clear()
  console.info('[OnlineStatus] Monitoring cleaned up')
}

/**
 * Pings a URL to verify actual connectivity (useful for detecting captive portals)
 * @param url - URL to ping (defaults to a small image from the same origin)
 * @param timeout - Timeout in milliseconds
 */
export const verifyConnectivity = async (
  url = '/favicon.ico',
  timeout = 5000
): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}
