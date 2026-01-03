import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        [key: string]: string | undefined;
    };
}
export declare const authorizeRoles: (allowedRoles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireRestaurantOwner: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireDeliveryPerson: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireCustomer: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAnyRole: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
