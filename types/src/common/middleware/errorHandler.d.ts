import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    code?: number;
    constructor(message: string, statusCode: number, isOperational?: boolean);
}
export declare const errorHandler: (err: AppError, req: Request, res: Response, next: NextFunction) => void;
