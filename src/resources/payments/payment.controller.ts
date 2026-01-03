import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import logger from '../../common/logger';
import { processPaymentSchema, refundPaymentSchema } from '../../common/validation/payment.schema';
import PaymentService from './payment.service';

// Create an instance of PaymentService
const paymentService = new PaymentService();

export class PaymentController {
  // Process a payment
  static async processPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const paymentData = {
        ...req.body
      };

      const payment = await paymentService.processPayment(paymentData, req.user?.id || '');
      res.status(201).json({
        success: true,
        data: payment
      });
    } catch (error: any) {
      logger.error('Error processing payment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process payment'
      });
    }
  }

  // Get payment by ID
  static async getPaymentById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const payment = await paymentService.getPaymentById(id, req.user?.id);
      
      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: payment
      });
    } catch (error: any) {
      logger.error('Error fetching payment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch payment'
      });
    }
  }

  // Refund a payment (admin only)
  static async refundPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const payment = await paymentService.refundPayment(id, reason);
      
      res.json({
        success: true,
        data: payment
      });
    } catch (error: any) {
      logger.error('Error refunding payment:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to refund payment'
      });
    }
  }

  // Get user's payments
  static async getUserPayments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || '';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await paymentService.getPaymentsByUser(userId, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Error fetching user payments:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch payments'
      });
    }
  }

  // Get all payments (admin only)
  static async getAllPayments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Verify admin access
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Forbidden: Admin access required'
        });
        return;
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const method = req.query.method as string;
      
      const filters = {
        status: status || undefined,
        method: method || undefined
      };
      
      const result = await paymentService.getPaymentsForAdmin(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Error fetching admin payments:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch payments'
      });
    }
  }
}