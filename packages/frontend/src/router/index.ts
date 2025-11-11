/**
 * Vue Router Configuration
 * TDD Phase: GREEN - Minimal implementation to pass tests
 */

import type { Router, RouterHistory } from 'vue-router'
import { createRouter as createVueRouter } from 'vue-router'

export const createRouter = (history: RouterHistory): Router => {
  const router = createVueRouter({
    history,
    routes: [
      {
        path: '/',
        name: 'home',
        component: () => import('../views/HomeView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/login',
        name: 'login',
        component: () => import('../views/LoginView.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: '/products',
        name: 'products',
        component: () => import('../views/products/ProductListView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/products/create',
        name: 'product-create',
        component: () => import('../views/products/ProductFormView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/products/:id/edit',
        name: 'product-edit',
        component: () => import('../views/products/ProductFormView.vue'),
        meta: { requiresAuth: true },
        props: true,
      },
    ],
  })

  return router
}
