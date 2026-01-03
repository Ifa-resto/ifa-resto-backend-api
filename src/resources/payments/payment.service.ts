import { PrismaClient, PaymentMethod } from '@prisma/client';
import DBService from '../../services/db';
import logger from '../../common/logger';

export class PaymentService {
  private get prisma(): PrismaClient {
    return DBService.getClient();
  }

  async processPayment(paymentData: any, userId: string) {
    try {
      const { orderId, amount, method, cardToken } = paymentData;
      
      // Verify order exists and belongs to user
      const order = await this.prisma.order.findUnique({
        where: { id: orderId }
      });
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      if (order.customerId !== userId) {
        throw new Error('You do not have permission to pay for this order');
      }
      
      // Check if order amount matches
      if (Math.abs(order.totalAmount - amount) > 0.01) {
        throw new Error('Payment amount does not match order total');
      }
      
      // Check if order is already paid
      if (order.paymentStatus === 'COMPLETED') {
        throw new Error('Order is already paid');
      }
      
      // Process payment based on method
      let transactionId: string | null = null;
      
      switch (method) {
        case 'CASH':
          // Cash payments don't need transaction ID
          break;
        case 'CARD':
          // In a real implementation, you would process the card payment here
          // For now, we'll generate a mock transaction ID
          transactionId = `card_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
          break;
        case 'PAYPAL':
          // In a real implementation, you would process PayPal payment here
          transactionId = `paypal_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
          break;
        case 'STRIPE':
          // In a real implementation, you would process Stripe payment here
          transactionId = `stripe_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
          break;
        case 'MOBILE_PAYMENT':
          // In a real implementation, you would process mobile payment here
          transactionId = `mobile_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
          break;
        default:
          throw new Error('Invalid payment method');
      }
      
      // Create payment record
      const payment = await this.prisma.payment.create({
        data: {
          orderId,
          amount,
          method: method as PaymentMethod,
          status: 'COMPLETED',
          transactionId,
          processedAt: new Date()
        }
      });
      
      // Update order payment status
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'COMPLETED',
          paymentMethod: method as PaymentMethod
        }
      });
      
      // Create order tracking entry
      await this.prisma.orderTracking.create({
        data: {
          orderId,
          status: 'CONFIRMED',
          notes: `Payment processed via ${method}`
        }
      });
      
      return payment;
    } catch (error) {
      logger.error('Error processing payment:', error);
      throw error;
    }
  }

  async getPaymentById(paymentId: string, userId?: string) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: {
            include: {
              restaurant: true,
              customer: {
                include: {
                  profile: true
                }
              }
            }
          }
        }
      });
      
      if (!payment) {
        return null;
      }
      
      // Check permissions
      if (userId && payment.order.customerId !== userId) {
        throw new Error('You do not have permission to view this payment');
      }
      
      return payment;
    } catch (error) {
      logger.error('Error fetching payment:', error);
      throw error;
    }
  }

  async refundPayment(paymentId: string, reason?: string) {
    try {
      // Get payment with order
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: true
        }
      });
      
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      // Check if payment can be refunded
      if (payment.status !== 'COMPLETED') {
        throw new Error('Payment cannot be refunded');
      }
      
      // Check if payment is already refunded
      if (payment.status === ('REFUNDED' as any)) {
        throw new Error('Payment is already refunded');
      }
      
      // Update payment status
      const updatedPayment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REFUNDED',
          processedAt: new Date()
        }
      });
      
      // Update order payment status
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: 'REFUNDED'
        }
      });
      
      // Create order tracking entry
      await this.prisma.orderTracking.create({
        data: {
          orderId: payment.orderId,
          status: 'REFUNDED',
          notes: `Payment refunded${reason ? `: ${reason}` : ''}`
        }
      });
      
      return updatedPayment;
    } catch (error) {
      logger.error('Error refunding payment:', error);
      throw error;
    }
  }

  async getPaymentsByUser(userId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const [payments, total] = await Promise.all([
        this.prisma.payment.findMany({
          where: {
            order: {
              customerId: userId
            }
          },
          skip,
          take: limit,
          include: {
            order: {
              include: {
                restaurant: true
              }
            }
          },
          orderBy: {
            id: 'desc'
          }
        }),
        this.prisma.payment.count({
          where: {
            order: {
              customerId: userId
            }
          }
        })
      ]);
      
      return {
        payments,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching user payments:', error);
      throw error;
    }
  }

  async getPaymentsForAdmin(page: number = 1, limit: number = 10, filters?: { status?: string, method?: string }) {
    try {
      const skip = (page - 1) * limit;
      
      const where: any = {};
      if (filters?.status) {
        where.status = filters.status;
      }
      if (filters?.method) {
        where.method = filters.method as PaymentMethod;
      }
      
      const [payments, total] = await Promise.all([
        this.prisma.payment.findMany({
          where,
          skip,
          take: limit,
          include: {
            order: {
              include: {
                customer: {
                  include: {
                    profile: true
                  }
                },
                restaurant: true
              }
            }
          },
          orderBy: {
            id: 'desc'
          }
        }),
        this.prisma.payment.count({ where })
      ]);
      
      return {
        payments,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching admin payments:', error);
      throw error;
    }
  }
}

// Export the class itself, not an instance
export default PaymentService;
