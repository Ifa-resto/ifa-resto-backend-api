import { Response } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
export declare class NotificationController {
    static getUserNotifications(req: AuthenticatedRequest, res: Response): Promise<void>;
    static markAsRead(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteNotification(req: AuthenticatedRequest, res: Response): Promise<void>;
}
