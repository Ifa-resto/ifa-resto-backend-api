import "dotenv/config";
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import logger from '../common/logger'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

export class DatabaseService {
  private static instance: PrismaClient

  static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new PrismaClient({ adapter })
    }

    return DatabaseService.instance
  }

  static async disconnect() {
    if (DatabaseService.instance) {
      await DatabaseService.instance.$disconnect()
      await pool.end()
    }
  }
}

export const prisma = DatabaseService.getInstance()