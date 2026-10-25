import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../../services/auth.service'
import DBService from '../../services/db'
import { AppError } from '../../common/middleware/errorHandler'
import logger from '../../common/logger'
import { MailService } from '../../services/mail.service'

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, role = 'CUSTOMER', firstName, lastName, phone, vehicleType, documents } = req.body

      const result = await AuthService.register({
        email,
        password,
        role,
        firstName,
        lastName,
        phone,
        vehicleType,
        documents,
      })

      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès',
        data: result,
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

      const payload = AuthService.verifyRefreshToken(refreshToken)
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

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Les JWT sont sans état : le client supprime ses tokens
      res.json({
        success: true,
        message: 'Déconnexion réussie',
      })
    } catch (error) {
      next(error)
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body
      const prisma = DBService.getClient()

      const user = await prisma.user.findUnique({
        where: { email },
        omit: { password: false },
      })

      // Même réponse que l'e-mail existe ou non
      if (user && user.isActive) {
        const token = AuthService.generatePurposeToken(user, 'reset-password')
        try {
          await MailService.sendPasswordResetEmail(user.email, token)
        } catch (mailError) {
          logger.error(`Échec de l'envoi de l'e-mail de réinitialisation à ${email}`, mailError)
        }
        logger.info(`Password reset requested for: ${email}`)
      }

      res.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      })
    } catch (error) {
      next(error)
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body

      if (!token || !newPassword) {
        throw new AppError('Token et nouveau mot de passe requis', 400)
      }

      const user = await AuthService.verifyPurposeToken(token, 'reset-password')

      // Changer le hash invalide le lien, qui ne peut donc servir qu'une fois
      await DBService.getClient().user.update({
        where: { id: user.id },
        data: {
          password: await AuthService.hashPassword(newPassword),
          // Recevoir le lien prouve l'accès à la boîte mail
          emailVerified: true,
        },
      })

      res.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
      })
    } catch (error) {
      next(error)
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body

      if (!token) {
        throw new AppError('Token de vérification requis', 400)
      }

      const user = await AuthService.verifyPurposeToken(token, 'verify-email')

      if (!user.emailVerified) {
        await DBService.getClient().user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        })
      }

      res.json({
        success: true,
        message: 'Email vérifié avec succès',
      })
    } catch (error) {
      next(error)
    }
  }

  static async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body
      const user = await DBService.getClient().user.findUnique({ where: { email }, omit: { password: false } })

      if (user && user.isActive && !user.emailVerified) {
        await MailService.sendVerificationEmail(user.email, AuthService.generatePurposeToken(user, 'verify-email'))
      }

      res.json({
        success: true,
        message: "Si ce compte existe et n'est pas vérifié, un nouvel e-mail a été envoyé",
      })
    } catch (error) {
      next(error)
    }
  }

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
