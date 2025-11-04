import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'

const app = new Hono()

// Middlewares
app.use('*', logger())
app.use('*', cors())

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'pos-nfce-backend'
  })
})

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'POS NFC-e API',
    version: '0.0.0',
    docs: '/api/docs'
  })
})

// API Routes
const api = new Hono()

api.get('/ping', (c) => {
  return c.json({ message: 'pong' })
})

app.route('/api', api)

// 404 Handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    path: c.req.path
  }, 404)
})

// Error Handler
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({
    error: 'Internal Server Error',
    message: err.message
  }, 500)
})

const port = Number(process.env['PORT']) || 3000

console.log(`🚀 Server starting on port ${port}`)

export default {
  port,
  fetch: app.fetch
}
