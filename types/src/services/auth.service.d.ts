import type { User } from '@prisma/client';
interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export declare class AuthService {
    private static readonly ACCESS_TOKEN_SECRET;
    private static readonly REFRESH_TOKEN_SECRET;
    private static readonly ACCESS_TOKEN_EXPIRES_IN;
    private static readonly REFRESH_TOKEN_EXPIRES_IN;
    /**
     * Register a new user
     */
    static register(userData: {
        email: string;
        password: string;
        role: string;
        firstName: string;
        lastName: string;
        phone?: string;
    }): Promise<{
        profile: {
            id: string;
            userId: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
            avatar: string;
        };
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        email: string;
        emailVerified: boolean;
        isActive: boolean;
        lastLogin: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Login user
     */
    static login(email: string, password: string): Promise<{
        user: {
            profile: {
                id: string;
                userId: string;
                firstName: string;
                lastName: string;
                phoneNumber: string;
                avatar: string;
            };
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            emailVerified: boolean;
            isActive: boolean;
            lastLogin: Date;
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    /**
     * Generate access token
     */
    static generateAccessToken(user: Pick<User, 'id' | 'email' | 'role'>): string;
    /**
     * Generate refresh token
     */
    static generateRefreshToken(user: Pick<User, 'id' | 'email' | 'role'>): string;
    /**
     * Generate both access and refresh tokens
     */
    static generateTokenPair(user: Pick<User, 'id' | 'email' | 'role'>): TokenPair;
    /**
     * Verify access token
     */
    static verifyAccessToken(token: string): TokenPayload;
    /**
     * Hash password
     */
    static hashPassword(password: string): Promise<string>;
    /**
     * Verify password
     */
    static verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
    /**
     * Extract token from Authorization header
     */
    static extractTokenFromHeader(authHeader: string | undefined): string | null;
}
export { TokenPayload, TokenPair };
