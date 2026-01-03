import { PrismaClient, NotificationType } from '@prisma/client';
import DBService from '../../services/db';
import logger from '../../common/logger';

export class NotificationService {
  private get prisma(): PrismaClient {
    return DBService.getClient();
  }

  async createNotification(userId: string, title: string, message: string, type: NotificationType = 'SYSTEM') {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type
        }
      });
      
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const [notifications, total] = await Promise.all([
        this.prisma.notification.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc'
          }
        }),
        this.prisma.notification.count({ where: { userId } })
      ]);
      
      return {
        notifications,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await this.prisma.notification.update({
        where: {
          id: notificationId,
          userId: userId
        },
        data: {
          isRead: true
        }
      });
      
      return notification;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string) {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          userId: userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });
      
      return result;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string, userId: string) {
    try {
      const notification = await this.prisma.notification.delete({
        where: {
          id: notificationId,
          userId: userId
        }
      });
      
      return notification;
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  async createOrderNotification(orderId: string, status: string) {
    try {
      // Get order with customer
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: {
            include: {
              profile: true
            }
          },
          restaurant: true
        }
      });
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      let title = '';
      let message = '';
      let type: NotificationType = 'ORDER_UPDATE';
      
      switch (status) {
        case 'CONFIRMED':
          title = 'Order Confirmed';
          message = `Your order #${order.orderNumber} has been confirmed by ${order.restaurant.name}`;
          break;
        case 'PREPARING':
          title = 'Order Preparing';
          message = `Your order #${order.orderNumber} is being prepared by ${order.restaurant.name}`;
          break;
        case 'READY_FOR_PICKUP':
          title = 'Order Ready';
          message = `Your order #${order.orderNumber} is ready for pickup at ${order.restaurant.name}`;
          break;
        case 'PICKED_UP':
          title = 'Order Picked Up';
          message = `Your order #${order.orderNumber} has been picked up by the delivery person`;
          break;
        case 'ON_THE_WAY':
          title = 'Order on the Way';
          message = `Your order #${order.orderNumber} is on the way to you`;
          break;
        case 'DELIVERED':
          title = 'Order Delivered';
          message = `Your order #${order.orderNumber} has been delivered. Enjoy your meal!`;
          break;
        case 'CANCELLED':
          title = 'Order Cancelled';
          message = `Your order #${order.orderNumber} has been cancelled`;
          type = 'SYSTEM';
          break;
        case 'REFUNDED':
          title = 'Order Refunded';
          message = `Your order #${order.orderNumber} has been refunded`;
          type = 'SYSTEM';
          break;
        default:
          return;
      }
      
      // Create notification for customer
      await this.createNotification(
        order.customerId,
        title,
        message,
        type
      );
    } catch (error) {
      logger.error('Error creating order notification:', error);
      throw error;
    }
  }

  async createPromotionalNotification(userId: string, title: string, message: string) {
    try {
      await this.createNotification(
        userId,
        title,
        message,
        'PROMOTION'
      );
    } catch (error) {
      logger.error('Error creating promotional notification:', error);
      throw error;
    }
  }
}

// Export the class itself, not an instance
export default NotificationService;