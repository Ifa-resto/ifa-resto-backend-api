import { Response } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
export declare class OrderController {
    static createOrder(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getOrderById(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getUserOrders(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateOrderStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
}
