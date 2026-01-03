import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { User, UserRole } from '@prisma/client'
import DBService from './db'
import { AppError } from '../common/middleware/errorHandler'
import logger from '../common/logger'

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

export class AuthService {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'your-secret-key'
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
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
        role: userData.role as UserRole, // Fix: cast to UserRole type
        profile: {
          create: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phone, // Fix: use correct field name
          },
        },
      },
      include: { profile: true },
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    logger.info(`New user registered: ${user.email}`)
    return userWithoutPassword
  }

  /**
   * Login user
   */
  static async login(email: string, password: string) {
    const prisma = DBService.getClient()

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
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