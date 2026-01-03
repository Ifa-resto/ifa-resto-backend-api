import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import Redis from 'ioredis'

const useRedisStore = process.env.USE_REDIS_RATE_LIMIT === 'true' && Boolean(process.env.REDIS_URL)
const redis = useRedisStore ? new Redis(process.env.REDIS_URL) : null

export const authLimiter = rateLimit({
  ...(useRedisStore
    ? {
        store: new RedisStore({
          // ioredis accepts (command, ...args); avoid incorrect object spread
          sendCommand: (...args: string[]) => (redis as any).call(...args),
          prefix: 'auth:',
        }),
      }
    : {}),
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Trop de tentatives de connexion',
})

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes',
})