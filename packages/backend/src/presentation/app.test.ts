import { ResultUtils } from '@pos-nfce/shared'
import { describe, expect, it } from 'vitest'
import type { ProductRepository } from '../application/ports/product-repository'
import { createApp } from './app'

describe('App', () => {
  const createMockRepository = (): ProductRepository => ({
    save: async () => ResultUtils.err({ type: 'UNKNOWN', message: 'Not implemented' }),
    findById: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
    findAll: async () => ResultUtils.ok([]),
    delete: async () => ResultUtils.ok(undefined),
    findBySKU: async () => ResultUtils.ok([]),
    findByGTIN: async () => ResultUtils.err({ type: 'NOT_FOUND', id: '' }),
  })

  it('should have health check endpoint', async () => {
    const app = createApp({ productRepository: createMockRepository() })

    const res = await app.request('/health', { method: 'GET' })

    expect(res.status).toBe(200)
    const data = (await res.json()) as { status: string; version: string; timestamp: string }
    expect(data.status).toBe('healthy')
    expect(data.version).toBe('0.0.0')
  })

  it('should return 404 for non-existent routes', async () => {
    const app = createApp({ productRepository: createMockRepository() })

    const res = await app.request('/non-existent', { method: 'GET' })

    expect(res.status).toBe(404)
    const data = (await res.json()) as { error: string }
    expect(data.error).toBe('Not found')
  })

  it('should have product routes mounted', async () => {
    const app = createApp({ productRepository: createMockRepository() })

    const res = await app.request('/api/produtos', { method: 'GET' })

    // Should not return 404 (route exists)
    expect(res.status).not.toBe(404)
  })
})
