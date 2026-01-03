import { PrismaClient } from '@prisma/client'
import logger from '../common/logger'

export class DatabaseService {
  private static instance: PrismaClient

  static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new PrismaClient()
    }

    return DatabaseService.instance
  }

  static async disconnect() {
    if (DatabaseService.instance) {
      await DatabaseService.instance.$disconnect()
    }
  }
}

export const prisma = DatabaseService.getInstance()
