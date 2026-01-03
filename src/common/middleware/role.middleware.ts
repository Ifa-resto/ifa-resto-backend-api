import { Request, Response, NextFunction } from 'express'
import logger from '../logger'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    [key: string]: string | undefined
  }
}

export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        })
        return
      }

      const userRole = req.user.role

      if (!allowedRoles.includes(userRole)) {
        logger.warn(
          `Access denied for user ${req.user.email} with role ${userRole}. Required roles: ${allowedRoles.join(', ')}`,
        )
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        })
        return
      }

      next()
    } catch (error) {
      logger.error('Error in role authorization middleware:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }
}

// Middleware spécifiques pour des rôles communs
export const requireAdmin = authorizeRoles(['ADMIN'])
export const requireRestaurantOwner = authorizeRoles(['RESTAURANT_OWNER', 'ADMIN'])
export const requireDeliveryPerson = authorizeRoles(['DELIVERY_PERSON', 'ADMIN'])
export const requireCustomer = authorizeRoles(['CUSTOMER', 'ADMIN'])
export const requireAnyRole = authorizeRoles(['CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_PERSON', 'ADMIN'])
