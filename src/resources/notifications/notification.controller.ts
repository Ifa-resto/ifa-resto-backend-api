import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import logger from '../../common/logger';
import NotificationService from './notification.service';

// Create an instance of NotificationService
const notificationService = new NotificationService();

export class NotificationController {
  // Get notifications for current user
  static async getUserNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || '';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await notificationService.getUserNotifications(userId, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications'
      });
    }
  }

  // Mark notification as read
  static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';
      const notification = await notificationService.markAsRead(id, userId);
      
      res.json({
        success: true,
        data: notification
      });
    } catch (error: any) {
      if (error.message === 'Notification not found') {
        res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
        return;
      }
      
      logger.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read'
      });
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || '';
      const result = await notificationService.markAllAsRead(userId);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read'
      });
    }
  }

  // Delete notification
  static async deleteNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';
      await notificationService.deleteNotification(id, userId);
      
      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error: any) {
      if (error.message === 'Notification not found') {
        res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
        return;
      }
      
      logger.error('Error deleting notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification'
      });
    }
  }
}