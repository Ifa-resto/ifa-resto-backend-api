import { Response } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
export declare class PaymentController {
    static processPayment(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getPaymentById(req: AuthenticatedRequest, res: Response): Promise<void>;
    static refundPayment(req: AuthenticatedRequest, res: Response): Promise<void>;
}
