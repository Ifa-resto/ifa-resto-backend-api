import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    /**
     * Register a new user
     */
    static register(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Login user
     */
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Refresh access token
     */
    static refresh(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Logout user
     */
    static logout(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Forgot password
     */
    static forgotPassword(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    /**
     * Reset password
     */
    static resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Verify email
     */
    static verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get current user profile
     */
    static getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
}
