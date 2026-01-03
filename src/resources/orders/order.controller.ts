import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import logger from '../../common/logger';
import OrderService from './order.service';
import DBService from '../../services/db';

// Create an instance of OrderService
const orderService = new OrderService();

export class OrderController {
  // Create a new order
  static async createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const orderData = {
        ...req.body,
        profileId: req.user?.profileId
      };

      const order = await orderService.createOrder(req.body, req.user?.id || '');
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error: any) {
      logger.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create order'
      });
    }
  }

  // Get order by ID
  static async getOrderById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      const order = await orderService.getOrderById(id, userId, userRole);
      
      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: order
      });
    } catch (error: any) {
      logger.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch order'
      });
    }
  }

  // Get orders based on user role
  static async getUserOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || '';
      const userRole = req.user?.role;
      let orders: any[] = [];
      
      if (userRole === 'CUSTOMER') {
        orders = await orderService.getOrdersByUser(userId);
      } else if (userRole === 'RESTAURANT_OWNER') {
        // Get restaurant ID for this owner
        const prisma = DBService.getClient();
        const restaurant = await prisma.restaurant.findFirst({
          where: {
            profile: {
              userId: userId
            }
          }
        });
        
        if (restaurant) {
          orders = await orderService.getOrdersForRestaurant(restaurant.id);
        }
      } else if (userRole === 'DELIVERY_PERSON') {
        // Get delivery person ID
        const prisma = DBService.getClient();
        const deliveryPerson = await prisma.deliveryPerson.findFirst({
          where: {
            profile: {
              userId: userId
            }
          }
        });
        
        if (deliveryPerson) {
          orders = await orderService.getOrdersForDeliveryPerson(deliveryPerson.id);
        }
      } else if (userRole === 'ADMIN') {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as string;
        const restaurantId = req.query.restaurantId as string;
        
        const result = await orderService.getOrdersForAdmin(page, limit, { status, restaurantId });
        res.json({
          success: true,
          data: result
        });
        return;
      }
      
      res.json({
        success: true,
        data: orders
      });
    } catch (error: any) {
      logger.error('Error fetching user orders:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch orders'
      });
    }
  }

  // Update order status
  static async updateOrderStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      const order = await orderService.updateOrderStatus(id, status, userId, userRole);
      
      res.json({
        success: true,
        data: order
      });
    } catch (error: any) {
      logger.error('Error updating order status:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update order status'
      });
    }
  }

  // Assign delivery person to order
  static async assignDeliveryPerson(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { deliveryPersonId } = req.body;
      const userId = req.user?.id;
      
      // Verify admin access
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Forbidden: Admin access required'
        });
        return;
      }
      
      const order = await orderService.assignDeliveryPerson(id, deliveryPersonId);
      
      res.json({
        success: true,
        data: order
      });
    } catch (error: any) {
      logger.error('Error assigning delivery person:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to assign delivery person'
      });
    }
  }

  // Get order by order number
  static async getOrderByNumber(req: Request, res: Response): Promise<void> {
    try {
      const { orderNumber } = req.params;
      
      const order = await orderService.getOrderByOrderNumber(orderNumber);
      
      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: order
      });
    } catch (error: any) {
      logger.error('Error fetching order by number:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch order'
      });
    }
  }

  // Cancel order
  static async cancelOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      const order = await orderService.cancelOrder(id, userId, userRole);
      
      res.json({
        success: true,
        data: order
      });
    } catch (error: any) {
      logger.error('Error cancelling order:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to cancel order'
      });
    }
  }

  // Get order tracking
  static async getOrderTracking(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const tracking = await orderService.getOrderTracking(id, userId, userRole);

      res.json({
        success: true,
        data: tracking
      });
    } catch (error: any) {
      logger.error('Error fetching order tracking:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch order tracking'
      });
    }
  }
}