import DatabaseService from './database.service'
import logger from '../common/logger'
import { PrismaClient } from '@prisma/client'

class DBService {
  private static databaseService = DatabaseService

  public static async connect(): Promise<void> {
    try {
      await this.databaseService.connect()
      logger.info('✅ Database service initialized successfully')
    } catch (error) {
      logger.error('❌ Failed to initialize database service:', error)
      throw error
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      await this.databaseService.disconnect()
      logger.info('✅ Database service disconnected successfully')
    } catch (error) {
      logger.error('❌ Failed to disconnect database service:', error)
      throw error
    }
  }

  public static getClient() {
    return this.databaseService.getClient()
  }

  public static async healthCheck(): Promise<boolean> {
    return await this.databaseService.healthCheck()
  }

  public static async executeTransaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return await this.databaseService.executeTransaction(fn)
  }

  public static isConnectionActive(): boolean {
    return this.databaseService.isConnectionActive()
  }
}

export default DBService
