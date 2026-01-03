import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import routes from './common/routes'
import unknownEndpoint from './middlewares/unknownEndpoint'
import { errorHandler } from './common/middleware/errorHandler'
import { specs, swaggerUi } from './common/swagger'

// to use env variables
import './common/env'

const app: Application = express()

// middleware
app.disable('x-powered-by')
app.use(cors())
app.use(helmet())
app.use(compression())
app.use(
  express.urlencoded({
    extended: true,
    limit: process.env.REQUEST_LIMIT || '100kb',
  }),
)
app.use(express.json())

// health check
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    'health-check': 'OK: top level api working',
  })
})

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

app.use('/v1/', routes)

// Handle unknown endpoints
app.use('*', unknownEndpoint)

// Global error handler
app.use(errorHandler)

export default app
