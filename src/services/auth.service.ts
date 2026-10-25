import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { User, UserRole } from '@prisma/client'
import DBService from './db'
import { AppError } from '../common/middleware/errorHandler'
import logger from '../common/logger'
import { MailService } from './mail.service'

interface TokenPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

interface TokenPair {
  accessToken: string
  refreshToken: string
}

// Refuse de démarrer sans secret : un secret par défaut permettrait de forger des tokens
function requireSecret(name: string): string {
  const value = process.env[name]
  if (!value || value.length < 16) {
    throw new Error(`${name} doit être défini (au moins 16 caractères)`)
  }
  return value
}

type TokenPurpose = 'verify-email' | 'reset-password'

export class AuthService {
  private static readonly ACCESS_TOKEN_SECRET = requireSecret('JWT_SECRET')
  private static readonly REFRESH_TOKEN_SECRET = requireSecret('JWT_REFRESH_SECRET')
  private static readonly ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
  private static readonly REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

  /**
   * Register a new user
   */
  static async register(userData: {
    email: string
    password: string
    role: string
    firstName: string
    lastName: string
    phone?: string
    vehicleType?: string
    documents?: string[]
  }) {
    const prisma = DBService.getClient()

    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    })

    if (existingUser) {
      throw new AppError('Email déjà utilisé', 409)
    }

    const hashedPassword = await this.hashPassword(userData.password)

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        role: userData.role as UserRole,
        profile: {
          create: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phone,
          },
        },
      },
      include: { profile: true },
    })

    // If it's a delivery person, create the DeliveryPerson record
    if (userData.role === 'DELIVERY_PERSON' && user.profile) {
      await prisma.deliveryPerson.create({
        data: {
          profileId: user.profile.id,
          vehicleType: userData.vehicleType || 'MOTO',
          documents: userData.documents || [],
          verificationStatus: userData.documents && userData.documents.length > 0 ? 'REVIEWING' : 'PENDING'
        }
      })
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    // Generate tokens for automatic login
    const tokens = this.generateTokenPair(user)

    try {
      await MailService.sendVerificationEmail(
        user.email,
        this.generatePurposeToken({ id: user.id, password: hashedPassword }, 'verify-email'),
      )
    } catch (error) {
      logger.error(`Échec de l'envoi de l'e-mail de vérification à ${user.email}`, error)
    }

    logger.info(`New user registered: ${user.email}`)
    return { ...tokens, user: userWithoutPassword }
  }

  /**
   * Token à usage unique (vérification e-mail, reset mot de passe).
   * Le hash du mot de passe entre dans le secret : le token devient invalide dès que le mot de passe change.
   */
  public static generatePurposeToken(user: Pick<User, 'id' | 'password'>, purpose: TokenPurpose): string {
    return jwt.sign({ userId: user.id, purpose }, this.ACCESS_TOKEN_SECRET + user.password, {
      expiresIn: purpose === 'reset-password' ? '1h' : '24h',
      issuer: 'restaurant-api',
    })
  }

  public static async verifyPurposeToken(token: string, purpose: TokenPurpose): Promise<User> {
    const decoded = jwt.decode(token) as { userId?: string; purpose?: string } | null
    if (!decoded?.userId || decoded.purpose !== purpose) {
      throw new AppError('Lien invalide ou expiré', 400)
    }

    const user = await DBService.getClient().user.findUnique({
      where: { id: decoded.userId },
      omit: { password: false },
    })
    if (!user) {
      throw new AppError('Lien invalide ou expiré', 400)
    }

    try {
      jwt.verify(token, this.ACCESS_TOKEN_SECRET + user.password, { issuer: 'restaurant-api' })
    } catch {
      throw new AppError('Lien invalide ou expiré', 400)
    }
    return user
  }

  /**
   * Verify refresh token
   */
  public static verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
        issuer: 'restaurant-api',
        audience: 'restaurant-app',
      }) as TokenPayload
    } catch {
      throw new AppError('Token de rafraîchissement invalide ou expiré', 401)
    }
  }

  /**
   * Login user
   */
  static async login(email: string, password: string) {
    const prisma = DBService.getClient()

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
      omit: { password: false },
    })

    if (!user || !user.isActive) {
      throw new AppError('Identifiants invalides', 401)
    }

    const isPasswordValid = await this.verifyPassword(password, user.password)
    if (!isPasswordValid) {
      throw new AppError('Identifiants invalides', 401)
    }

    if (!user.emailVerified) {
      throw new AppError('Email non vérifié. Veuillez vérifier votre email.', 401)
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }, // Fix: use correct field name 'lastLogin' instead of 'lastLoginAt'
    })

    const tokens = this.generateTokenPair(user)
    const { password: _, ...userWithoutPassword } = user

    logger.info(`User logged in: ${user.email}`)
    return { ...tokens, user: userWithoutPassword }
  }

  /**
   * Generate access token
   */
  public static generateAccessToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN as string, // Fix: ensure proper typing
      issuer: 'restaurant-api',
      audience: 'restaurant-app',
    } as jwt.SignOptions)
  }

  /**
   * Generate refresh token
   */
  public static generateRefreshToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN as string, // Fix: ensure proper typing
      issuer: 'restaurant-api',
      audience: 'restaurant-app',
    } as jwt.SignOptions)
  }

  /**
   * Generate both access and refresh tokens
   */
  public static generateTokenPair(user: Pick<User, 'id' | 'email' | 'role'>): TokenPair {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    }
  }

  /**
   * Verify access token
   */
  public static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
        issuer: 'restaurant-api',
        audience: 'restaurant-app',
      }) as TokenPayload
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token')
      } else {
        throw new Error('Token verification failed')
      }
    }
  }

  /**
   * Hash password
   */
  public static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  /**
   * Verify password
   */
  public static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  /**
   * Extract token from Authorization header
   */
  public static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null
    }

    return parts[1]
  }
}

export { TokenPayload, TokenPair }