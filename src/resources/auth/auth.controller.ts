import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../../services/auth.service'
import DBService from '../../services/db'
import { AppError } from '../../common/middleware/errorHandler'
import logger from '../../common/logger'

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, role = 'CUSTOMER', firstName, lastName, phone } = req.body

      const user = await AuthService.register({
        email,
        password,
        role,
        firstName,
        lastName,
        phone,
      })

      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        data: {
          user,
        },
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body

      const result = await AuthService.login(email, password)

      res.json({
        success: true,
        message: 'Connexion réussie',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Refresh access token
   */
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        throw new AppError('Token de rafraîchissement requis', 400)
      }

      const payload = AuthService.verifyAccessToken(refreshToken)
      const prisma = DBService.getClient()

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true, isActive: true },
      })

      if (!user || !user.isActive) {
        throw new AppError('Utilisateur non trouvé ou inactif', 401)
      }

      const tokens = AuthService.generateTokenPair(user)

      res.json({
        success: true,
        message: 'Token rafraîchi avec succès',
        data: tokens,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // In a real implementation, you would invalidate the token
      // For now, we'll just return a success message
      res.json({
        success: true,
        message: 'Déconnexion réussie',
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body
      const prisma = DBService.getClient()

      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        // Don't reveal if email exists or not
        return res.json({
          success: true,
          message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
        })
      }

      // In a real implementation, you would:
      // 1. Generate a password reset token
      // 2. Save it to database with expiration
      // 3. Send email with reset link

      logger.info(`Password reset requested for: ${email}`)

      res.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body

      if (!token || !newPassword) {
        throw new AppError('Token et nouveau mot de passe requis', 400)
      }

      // In a real implementation, you would:
      // 1. Verify the reset token
      // 2. Check if it's not expired
      // 3. Update the user's password
      // 4. Invalidate the reset token

      res.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body

      if (!token) {
        throw new AppError('Token de vérification requis', 400)
      }

      // In a real implementation, you would:
      // 1. Verify the email verification token
      // 2. Update user's emailVerified status
      // 3. Invalidate the verification token

      res.json({
        success: true,
        message: 'Email vérifié avec succès',
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id
      const prisma = DBService.getClient()

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
          lastLogin: true,
          profile: true,
        },
      })

      if (!user) {
        throw new AppError('Utilisateur non trouvé', 404)
      }

      res.json({
        success: true,
        data: { user },
      })
    } catch (error) {
      next(error)
    }
  }
}
