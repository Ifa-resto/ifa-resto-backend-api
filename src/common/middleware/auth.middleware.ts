import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../services/auth.service';
import DBService from '../../services/db';
import logger from '../logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    emailVerified?: boolean;
    profile?: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      address?: string;
    };
    [key: string]: any;
  };
}

export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = AuthService.verifyAccessToken(token);

      // Verify user still exists and is active
      const prisma = DBService.getClient();
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { profile: true },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      if (!user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Account is deactivated',
        });
        return;
      }

      // Attach user info to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        profile: user.profile || undefined,
      };

      next();
    } catch (jwtError: any) {
      if (jwtError.message === 'Access token expired') {
        res.status(401).json({
          success: false,
          message: 'Token expired',
        });
        return;
      }

      if (jwtError.message === 'Invalid access token') {
        res.status(401).json({
          success: false,
          message: 'Invalid token',
        });
        return;
      }

      throw jwtError;
    }
  } catch (error) {
    logger.error('Error in JWT authentication middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const userRole = req.user.role;

      // SUPER_ADMIN has all ADMIN privileges
      const effectiveRoles = [...roles];
      if (roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
        effectiveRoles.push('SUPER_ADMIN');
      }

      if (!effectiveRoles.includes(userRole)) {
        logger.warn(
          `Access denied for user ${req.user.email} with role ${userRole}. Required roles: ${effectiveRoles.join(', ')}`
        );
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Error in role authorization middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = AuthService.verifyAccessToken(token);
      const prisma = DBService.getClient();
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { profile: true },
      });

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          profile: user.profile || undefined,
        };
      }
    } catch (jwtError) {
      // Ignore JWT errors in optional auth
      logger.debug('Optional auth failed:', (jwtError as Error).message);
    }

    next();
  } catch (error) {
    logger.error('Error in optional authentication middleware:', error);
    next();
  }
};