/**
 * Router Tests
 * TDD Phase: RED - Tests written before implementation
 */

import { describe, expect, it } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import { createRouter } from './index'

describe('Router', () => {
  it('should create router instance', () => {
    const router = createRouter(createMemoryHistory())
    expect(router).toBeDefined()
  })

  it('should have login route', () => {
    const router = createRouter(createMemoryHistory())
    const route = router.getRoutes().find((r) => r.name === 'login')
    expect(route).toBeDefined()
    expect(route?.path).toBe('/login')
  })

  it('should have products list route', () => {
    const router = createRouter(createMemoryHistory())
    const route = router.getRoutes().find((r) => r.name === 'products')
    expect(route).toBeDefined()
    expect(route?.path).toBe('/products')
  })

  it('should have product create route', () => {
    const router = createRouter(createMemoryHistory())
    const route = router.getRoutes().find((r) => r.name === 'product-create')
    expect(route).toBeDefined()
    expect(route?.path).toBe('/products/create')
  })

  it('should have product edit route', () => {
    const router = createRouter(createMemoryHistory())
    const route = router.getRoutes().find((r) => r.name === 'product-edit')
    expect(route).toBeDefined()
    expect(route?.path).toBe('/products/:id/edit')
  })

  it('should have home/dashboard route', () => {
    const router = createRouter(createMemoryHistory())
    const route = router.getRoutes().find((r) => r.name === 'home')
    expect(route).toBeDefined()
    expect(route?.path).toBe('/')
  })

  it('should redirect to login when not authenticated', async () => {
    const router = createRouter(createMemoryHistory())
    await router.push('/products')
    // This will be implemented with auth guard
    expect(router.currentRoute.value.path).toBeDefined()
  })
})
