import { Request, Response } from 'express'
import { prisma } from '../config/database'
import { cacheService } from '../services/cache.service'

export const healthCheck = async (req: Request, res: Response) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      database: 'OK',
      cache: 'OK',
    },
  }

  try {
    // Test base de données
    await prisma.$queryRaw`SELECT 1`
  } catch (error) {
    health.services.database = 'ERROR'
    health.status = 'ERROR'
  }

  try {
    // Test cache
    await cacheService.set('health-check', 'ok', 10)
    await cacheService.get('health-check')
  } catch (error) {
    health.services.cache = 'ERROR'
    health.status = 'ERROR'
  }

  const statusCode = health.status === 'OK' ? 200 : 503
  res.status(statusCode).json(health)
}
