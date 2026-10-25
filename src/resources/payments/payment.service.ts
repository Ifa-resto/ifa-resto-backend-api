import { PrismaClient, PaymentMethod } from '@prisma/client';
import DBService from '../../services/db';
import logger from '../../common/logger';

export class PaymentService {
  private get prisma(): PrismaClient {
    return DBService.getClient();
  }

  async processPayment(paymentData: any, userId: string) {
    try {
      const { orderId, amount, method } = paymentData;
      
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
      
      if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
        throw new Error('Cannot pay for a cancelled order');
      }

      // Aucun prestataire de paiement en ligne n'est branché : on refuse plutôt que de
      // marquer la commande comme payée sans encaissement réel.
      if (method !== 'CASH') {
        throw new Error('Online payment is not available yet, please choose cash on delivery');
      }

      // Paiement à la livraison : en attente jusqu'au statut DELIVERED
      const existing = await this.prisma.payment.findFirst({
        where: { orderId, method: 'CASH', status: 'PENDING' }
      });
      if (existing) {
        return existing;
      }

      const payment = await this.prisma.payment.create({
        data: {
          orderId,
          amount: order.totalAmount,
          method: 'CASH',
          status: 'PENDING'
        }
      });

      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentMethod: 'CASH' }
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
