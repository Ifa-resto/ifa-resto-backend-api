import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import logger from '../logger';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      logger.warn('Validation error:', error.errors);
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((err: any) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }
  };
};

// Alternative validation middleware that only validates the body
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      logger.warn('Validation error:', error.errors);
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((err: any) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }
  };
};