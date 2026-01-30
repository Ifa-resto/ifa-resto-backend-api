// to use env variables
import './common/env'

import * as os from 'os'
import app from './app'
import logger from './common/logger'
import DBService from './services/db'

const PORT = process.env.PORT || 3000
const HOST = '0.0.0.0'

async function startServer() {
  try {
    // Connect to database unless explicitly skipped (useful for local Swagger verification)
    if (process.env.SKIP_DB !== 'true') {
      await DBService.connect()
    } else {
      logger.warn('SKIP_DB=true detected: starting server without database connection')
    }

    // Start server
    app.listen(Number(PORT), HOST, () => {
      logger.info(`up and running in ${process.env.NODE_ENV || 'development'} @: ${os.hostname()} on port ${PORT}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully')
  await DBService.disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully')
  await DBService.disconnect()
  process.exit(0)
})

startServer()
