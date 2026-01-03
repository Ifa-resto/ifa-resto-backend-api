import { PrismaClient } from '@prisma/client'
import logger from '../common/logger'

class DatabaseService {
  private static instance: DatabaseService
  private prisma: PrismaClient
  private isConnected = false

  private constructor() {
    this.prisma = new PrismaClient()
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  public async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.prisma.$connect()
      this.isConnected = true
      logger.info('✅ Database connected successfully')
      await this.prisma.$queryRaw`SELECT 1`
      logger.info('✅ Database connection test passed')
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.prisma.$disconnect()
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