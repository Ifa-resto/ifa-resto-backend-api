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

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader) {
      const token = authHeader.split(' ')[1]

      try {
        const payload = AuthService.verifyAccessToken(token)
        const prisma = DBService.getClient()

        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, email: true, role: true, emailVerified: true, isActive: true },
        })

        if (!user || !user.isActive) {
          return res.sendStatus(403)
        }

        // Add user to request object
        ;(req as any).user = user
        next()
      } catch (err) {
        return res.sendStatus(403)
      }
    } else {
      res.sendStatus(401)
    }
  } catch (error) {
    logger.error('Auth middleware error', error)
    res.sendStatus(500)
  }
}

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