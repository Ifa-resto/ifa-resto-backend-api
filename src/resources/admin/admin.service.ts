import { PrismaClient } from '@prisma/client';
import DBService from '../../services/db';
import logger from '../../common/logger';

export class AdminService {
  private get prisma(): PrismaClient {
    return DBService.getClient();
  }

  async getStatistics() {
    try {
      // Get counts for different entities
      const [totalUsers, totalRestaurants, totalOrders] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.restaurant.count(),
        this.prisma.order.count(),
      ]);

      // Calculate total revenue from completed orders
      const completedOrders = await this.prisma.order.findMany({
        where: {
          paymentStatus: 'COMPLETED',
        },
        select: {
          totalAmount: true,
        },
      });

      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

      return {
        totalUsers,
        totalRestaurants,
        totalOrders,
        totalRevenue,
      };
    } catch (error) {
      logger.error('Error fetching statistics:', error);
      throw error;
    }
  }
}

export default new AdminService();