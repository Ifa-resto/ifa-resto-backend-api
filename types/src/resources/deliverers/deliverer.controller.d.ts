import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
export declare class DelivererController {
    static getAvailableDeliverers(req: Request, res: Response): Promise<void>;
    static getDelivererById(req: Request, res: Response): Promise<void>;
    static updateLocation(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateAvailability(req: AuthenticatedRequest, res: Response): Promise<void>;
}
