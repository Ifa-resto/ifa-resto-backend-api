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
        ordersToday
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.restaurant.count(),
        this.prisma.order.count(),
        this.prisma.deliveryPerson.count({ where: { isAvailable: true, verificationStatus: 'VERIFIED' } }),
        this.prisma.order.count({ where: { createdAt: { gte: todayStart } } })
      ]);

      // Calculate total revenue and monthly revenue
      const completedOrders = await this.prisma.order.findMany({
        where: {
          status: 'DELIVERED',
        },
        select: {
          totalAmount: true,
          createdAt: true,
        },
      });

      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const monthlyRevenue = completedOrders
        .filter(o => o.createdAt >= monthStart)
        .reduce((sum, order) => sum + order.totalAmount, 0);
      const dailyRevenue = completedOrders
        .filter(o => o.createdAt >= todayStart)
        .reduce((sum, order) => sum + order.totalAmount, 0);

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
        monthlyRevenue,
        dailyRevenue,
        activeDeliverers,
        ordersToday,
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
}

export default new AdminService();