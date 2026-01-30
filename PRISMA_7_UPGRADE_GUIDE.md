# Prisma 7 Upgrade Guide

## Problem
Prisma 7 has breaking changes that require updating your database configuration.

## What Changed
1. ✅ **DONE**: Removed `url` from `schema.prisma` datasource block
2. ✅ **DONE**: Created `prisma.config.ts` for CLI/migration configuration
3. ❌ **BLOCKED**: Need to install driver adapter packages (disk space issue)

## Required Steps

### Step 1: Free Up Disk Space on C: Drive
Your C: drive is full (0 GB free). You need to:
- Clear temporary files
- Remove unused applications
- Move files to G: drive
- Empty recycle bin
- Clear npm cache: `npm cache clean --force` (after freeing space)

### Step 2: Install Required Packages
Once you have disk space, run:
```bash
npm install @prisma/adapter-pg pg
npm install -D @types/pg
```

### Step 3: Update Database Service
Replace `src/services/database.service.ts` with:

```typescript
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
    // Create PostgreSQL connection pool
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    // Create Prisma adapter
    const adapter = new PrismaPg(this.pool)

    // Initialize Prisma Client with adapter
    this.prisma = new PrismaClient({ 
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    })
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
```

### Step 4: Update config/database.ts (if needed)
Replace `src/config/database.ts` with the same pattern as above.

### Step 5: Regenerate Prisma Client
```bash
npx prisma generate
```

### Step 6: Test the Application
```bash
npm run dev
```

## Alternative: Downgrade to Prisma 6
If you cannot free up disk space, you can temporarily downgrade:
```bash
npm install @prisma/client@6.2.1 prisma@6.2.1
npx prisma generate
```

Then restore the `url` line in `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Files Modified
- ✅ `prisma/schema.prisma` - Removed `url` property
- ✅ `prisma.config.ts` - Created for CLI configuration
- ⏳ `src/services/database.service.ts` - Needs adapter implementation
- ⏳ `src/config/database.ts` - Needs adapter implementation

## References
- [Prisma 7 Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Driver Adapters](https://www.prisma.io/docs/orm/overview/databases/database-drivers)
