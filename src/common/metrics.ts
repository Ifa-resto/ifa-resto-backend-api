import promClient from 'prom-client'

// Métriques personnalisées
export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
})

export const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
})

export const orderMetrics = new promClient.Counter({
  name: 'orders_total',
  help: 'Total number of orders',
  labelNames: ['status', 'restaurant_id'],
})

// Collecteur par défaut
promClient.collectDefaultMetrics()
