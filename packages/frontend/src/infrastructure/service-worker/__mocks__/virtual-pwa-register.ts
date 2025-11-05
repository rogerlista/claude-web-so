/**
 * Mock for virtual:pwa-register module
 */

import type { RegisterSWOptions } from 'vite-plugin-pwa/types'
import { vi } from 'vitest'

export const registerSW = vi.fn(
  (_options?: RegisterSWOptions): ((reloadPage?: boolean) => Promise<void>) | undefined => {
    return vi.fn().mockResolvedValue(undefined)
  }
)
