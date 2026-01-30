import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import logger from '../common/logger'

class DatabaseService {
  private static instance: DatabaseService
  private prisma: PrismaClient
  private pool: Pool
  private isConnected = false

  private constructor() {
    // Prisma 7: Using PostgreSQL adapter with driver
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    const adapter = new PrismaPg(this.pool)
    this.prisma = new PrismaClient({ adapter })
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  public async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.prisma.$connect()
        this.isConnected = true
        logger.info('✅ Database connected successfully')

        // Test connection
        await this.prisma.$queryRaw`SELECT 1`
        logger.info('✅ Database connection test passed')
      } catch (error) {
        logger.error('❌ Database connection failure:', error)
        this.isConnected = false
        throw error
      }
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.prisma.$disconnect()
      await this.pool.end()
      this.isConnected = false
      logger.info('✅ Database disconnected successfully')
    }
  }

  public getClient(): PrismaClient {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.')
    }
    return this.prisma
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      logger.error('Database health check failed:', error)
      return false
    }
  }

  public async executeTransaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(fn)
  }

  public isConnectionActive(): boolean {
    return this.isConnected
  }
}

export default DatabaseService.getInstance()