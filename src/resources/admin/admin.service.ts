import { PrismaClient } from '@prisma/client';
import DBService from '../../services/db';
import logger from '../../common/logger';

export class AdminService {
  private get prisma(): PrismaClient {
    return DBService.getClient();
  }

  async getStatistics() {
    try {
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get counts for different entities
      const [
        totalUsers,
        totalRestaurants,
        totalOrders,
        activeDeliverers,
        ordersToday,
        pendingDisputes,
        cancelledOrdersToday
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.restaurant.count(),
        this.prisma.order.count(),
        this.prisma.deliveryPerson.count({ where: { isAvailable: true, verificationStatus: 'VERIFIED' } }),
        this.prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
        this.prisma.dispute.count({ where: { status: 'OPEN' } }),
        this.prisma.order.count({ where: { status: 'CANCELLED', updatedAt: { gte: todayStart } } })
      ]);

      // Calculate total revenue and monthly revenue
      const completedOrders = await this.prisma.order.findMany({
        where: {
          status: 'DELIVERED',
        },
        include: {
          restaurant: { select: { commissionRate: true } }
        }
      });

      let totalRevenue = 0;
      let totalCommissions = 0;
      let monthlyRevenue = 0;
      let dailyRevenue = 0;
      let totalDeliveryTime = 0;
      let deliveredCount = completedOrders.length;

      completedOrders.forEach(order => {
        totalRevenue += order.totalAmount;
        const commission = (order.totalAmount * (order.restaurant.commissionRate || 15)) / 100;
        totalCommissions += commission;

        if (order.createdAt >= monthStart) monthlyRevenue += order.totalAmount;
        if (order.createdAt >= todayStart) dailyRevenue += order.totalAmount;

        if (order.actualDelivery && order.createdAt) {
          totalDeliveryTime += (order.actualDelivery.getTime() - order.createdAt.getTime());
        }
      });

      const avgDeliveryTime = deliveredCount > 0
        ? Math.round(totalDeliveryTime / deliveredCount / 60000) // in minutes
        : 0;

      // Get Top Restaurants by order count
      const topRestaurants = await this.prisma.restaurant.findMany({
        take: 5,
        include: {
          _count: {
            select: { orders: true }
          }
        },
        orderBy: {
          orders: {
            _count: 'desc'
          }
        }
      });

      // Get recent activity (last 5 orders)
      const recentOrders = await this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { email: true } },
          restaurant: { select: { name: true } }
        }
      });

      return {
        totalUsers,
        totalRestaurants,
        totalOrders,
        totalRevenue,
        totalCommissions,
        monthlyRevenue,
        dailyRevenue,
        activeDeliverers,
        ordersToday,
        pendingDisputes,
        cancelledOrdersToday,
        avgDeliveryTime,
        topRestaurants: topRestaurants.map(r => ({
          id: r.id,
          name: r.name,
          orderCount: r._count.orders
        })),
        recentOrders: recentOrders.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customer: o.customer.email,
          restaurant: o.restaurant.name,
          amount: o.totalAmount,
          status: o.status,
          createdAt: o.createdAt
        }))
      };
    } catch (error) {
      logger.error('Error fetching statistics:', error);
      throw error;
    }
  }

  async verifyRestaurant(restaurantId: string, status: 'VERIFIED' | 'REJECTED') {
    try {
      const restaurant = await this.prisma.restaurant.update({
        where: { id: restaurantId },
        data: { verificationStatus: status },
        include: { profile: true }
      });

      // Notify owner (simplified, assuming NotificationService is available or we do it directly)
      await this.prisma.notification.create({
        data: {
          userId: restaurant.profile.userId,
          title: status === 'VERIFIED' ? 'Restaurant Approuvé' : 'Candidature Rejetée',
          message: status === 'VERIFIED'
            ? `Votre restaurant ${restaurant.name} a été approuvé. Vous pouvez maintenant recevoir des commandes.`
            : `Désolé, votre restaurant ${restaurant.name} n'a pas été approuvé. Veuillez nous contacter pour plus d'informations.`,
          type: 'SYSTEM'
        }
      });

      return restaurant;
    } catch (error) {
      logger.error('Error verifying restaurant:', error);
      throw error;
    }
  }

  async verifyDeliverer(delivererId: string, status: 'VERIFIED' | 'REJECTED') {
    try {
      const deliverer = await this.prisma.deliveryPerson.update({
        where: { id: delivererId },
        data: { verificationStatus: status },
        include: { profile: true }
      });

      await this.prisma.notification.create({
        data: {
          userId: deliverer.profile.userId,
          title: status === 'VERIFIED' ? 'Compte Livreur Activé' : 'Compte Livreur Rejeté',
          message: status === 'VERIFIED'
            ? 'Félicitations ! Votre compte de livreur est maintenant actif.'
            : 'Votre demande de livreur a été rejetée. Veuillez vérifier vos documents.',
          type: 'SYSTEM'
        }
      });

      return deliverer;
    } catch (error) {
      logger.error('Error verifying deliverer:', error);
      throw error;
    }
  }

  async getAllOrders(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.order.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { include: { profile: true } },
        restaurant: true,
        deliveryPerson: { include: { profile: true } }
      }
    });
  }

  // Audit Logs
  async getAuditLogs(limit: number = 50) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } }
    });
  }

  async createAuditLog(userId: string, action: string, resource: string, details?: string, ip?: string) {
    return this.prisma.auditLog.create({
      data: { userId, action, resource, details, ip }
    });
  }

  // Disputes
  async getDisputes(status?: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'REJECTED') {
    return this.prisma.dispute.findMany({
      where: status ? { status } : {},
      include: {
        order: { include: { restaurant: true, customer: { select: { email: true } } } },
        user: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateDisputeStatus(id: string, status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'REJECTED', resolution?: string) {
    return this.prisma.dispute.update({
      where: { id },
      data: { status, resolution }
    });
  }

  // Configuration & Commissions
  async updateRestaurantCommission(restaurantId: string, rate: number) {
    return this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: { commissionRate: rate }
    });
  }

  async getPlatformConfig() {
    return this.prisma.platformConfig.findMany();
  }

  async updatePlatformConfig(settings: Record<string, any>) {
    const updates = Object.entries(settings).map(([key, value]) => {
      return this.prisma.platformConfig.upsert({
        where: { key },
        update: { value: value.toString() },
        create: { key, value: value.toString() }
      });
    });
    return Promise.all(updates);
  }
}

export default new AdminService();