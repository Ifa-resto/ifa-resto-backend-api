import { Request, Response, NextFunction } from 'express'
import UserService from './user.service'
import logger from '../../common/logger'
import { registerSchema, updateUserSchema } from '../../common/validation/schemas'
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware'

// Create an instance of UserService
const userService = new UserService()

class UserController {
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = registerSchema.validate(req.body)

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        })
        return
      }

      const userData = value

      const user = await userService.createUser(userData)

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
      })
    } catch (error: any) {
      if (error.message === 'User with this email already exists') {
        res.status(409).json({
          success: false,
          message: error.message,
        })
        return
      }
      
      logger.error('Error in createUser controller:', error)
      next(error)
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        })
        return
      }

      const user = await userService.getUserById(id)

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        })
        return
      }

      res.status(200).json({
        success: true,
        data: user,
      })
    } catch (error) {
      logger.error('Error in getUserById controller:', error)
      next(error)
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const role = req.query.role as string
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined

      if (page < 1 || limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters',
        })
        return
      }

      const filters = {
        role: role || undefined,
        isActive: isActive
      };

      const result = await userService.getAllUsers(page, limit, filters)

      res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      logger.error('Error in getAllUsers controller:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        })
        return
      }

      const { error, value } = updateUserSchema.validate(req.body)

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        })
        return
      }

      const updateData = value

      const updatedUser = await userService.updateUser(id, updateData)

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser,
      })
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json({
          success: false,
          message: error.message,
        })
        return
      }
      
      logger.error('Error in updateUser controller:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        })
        return
      }

      await userService.deleteUser(id)

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      })
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json({
          success: false,
          message: error.message,
        })
        return
      }
      
      logger.error('Error in deleteUser controller:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  async getUserProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Assuming user ID is available from authentication middleware
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        })
        return
      }

      const user = await userService.getUserProfile(userId)

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        })
        return
      }

      res.status(200).json({
        success: true,
        data: user,
      })
    } catch (error) {
      logger.error('Error in getUserProfile controller:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  async updatePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      const { currentPassword, newPassword } = req.body

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        })
        return
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password and new password are required',
        })
        return
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters long',
        })
        return
      }

      const result = await userService.updatePassword(userId, currentPassword, newPassword)

      res.status(200).json({
        success: true,
        message: result.message,
      })
    } catch (error: any) {
      if (error.message === 'Current password is incorrect') {
        res.status(400).json({
          success: false,
          message: error.message,
        })
        return
      }
      
      logger.error('Error in updatePassword controller:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  async addDeliveryAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      const addressData = req.body

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        })
        return
      }

      const address = await userService.addDeliveryAddress(userId, addressData)

      res.status(201).json({
        success: true,
        data: address,
      })
    } catch (error) {
      logger.error('Error in addDeliveryAddress controller:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  async getDeliveryAddresses(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        })
        return
      }

      const addresses = await userService.getDeliveryAddresses(userId)

      res.status(200).json({
        success: true,
        data: addresses,
      })
    } catch (error) {
      logger.error('Error in getDeliveryAddresses controller:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  async updateDeliveryAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      const { addressId } = req.params
      const addressData = req.body

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        })
        return
      }

      const address = await userService.updateDeliveryAddress(userId, addressId, addressData)

      res.status(200).json({
        success: true,
        data: address,
      })
    } catch (error: any) {
      if (error.message === 'Address not found' || error.message === 'Address does not belong to user') {
        res.status(404).json({
          success: false,
          message: error.message,
        })
        return
      }
      
      logger.error('Error in updateDeliveryAddress controller:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  async deleteDeliveryAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      const { addressId } = req.params

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        })
        return
      }

      await userService.deleteDeliveryAddress(userId, addressId)

      res.status(200).json({
        success: true,
        message: 'Address deleted successfully',
      })
    } catch (error: any) {
      if (error.message === 'Address not found' || error.message === 'Address does not belong to user') {
        res.status(404).json({
          success: false,
          message: error.message,
        })
        return
      }
      
      logger.error('Error in deleteDeliveryAddress controller:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }

  async setDefaultAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      const { addressId } = req.params

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        })
        return
      }

      const address = await userService.setDefaultAddress(userId, addressId)

      res.status(200).json({
        success: true,
        data: address,
      })
    } catch (error: any) {
      if (error.message === 'Address not found' || error.message === 'Address does not belong to user') {
        res.status(404).json({
          success: false,
          message: error.message,
        })
        return
      }
      
      logger.error('Error in setDefaultAddress controller:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }
}

export default new UserController()