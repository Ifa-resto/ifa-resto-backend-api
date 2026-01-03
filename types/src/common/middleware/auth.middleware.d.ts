import { Request, Response, NextFunction } from 'express';
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
export declare const authenticateJWT: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
