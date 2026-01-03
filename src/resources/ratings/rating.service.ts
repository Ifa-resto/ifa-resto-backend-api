import { PrismaClient } from '@prisma/client';
import DBService from '../../services/db';
import logger from '../../common/logger';

export class RatingService {
  private get prisma(): PrismaClient {
    return DBService.getClient();
  }

  async createRating(ratingData: any, userId: string) {
    try {
      const { restaurantId, orderId, rating, comment } = ratingData;
      
      // Verify user has ordered from this restaurant
      const order = await this.prisma.order.findFirst({
        where: {
          id: orderId,
          customerId: userId,
          restaurantId: restaurantId
        }
      });
      
      if (!order) {
        throw new Error('Order not found or does not belong to this restaurant');
      }
      
      // Check if order is delivered
      if (order.status !== 'DELIVERED') {
        throw new Error('Can only rate delivered orders');
      }
      
      // Check if user has already rated this order
      const existingRating = await this.prisma.rating.findFirst({
        where: {
          orderId: orderId
        }
      });
      
      if (existingRating) {
        throw new Error('Order already rated');
      }
      
      // Create rating
      const newRating = await this.prisma.rating.create({
        data: {
          userId,
          restaurantId,
          orderId,
          rating,
          comment
        }
      });
      
      // Update restaurant rating
      await this.updateRestaurantRating(restaurantId);
      
      return newRating;
    } catch (error) {
      logger.error('Error creating rating:', error);
      throw error;
    }
  }

  async getRestaurantRatings(restaurantId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const [ratings, total] = await Promise.all([
        this.prisma.rating.findMany({
          where: { restaurantId },
          skip,
          take: limit,
          include: {
            user: {
              include: {
                profile: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        this.prisma.rating.count({ where: { restaurantId } })
      ]);
      
      return {
        ratings,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching restaurant ratings:', error);
      throw error;
    }
  }

  async getUserRatings(userId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const [ratings, total] = await Promise.all([
        this.prisma.rating.findMany({
          where: { userId },
          skip,
          take: limit,
          include: {
            restaurant: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        this.prisma.rating.count({ where: { userId } })
      ]);
      
      return {
        ratings,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching user ratings:', error);
      throw error;
    }
  }

  async updateRestaurantRating(restaurantId: string) {
    try {
      // Calculate average rating for the restaurant
      const ratings = await this.prisma.rating.aggregate({
        where: { restaurantId },
        _avg: {
          rating: true
        }
      });
      
      const averageRating = ratings._avg.rating || 0;
      
      // Update restaurant rating
      await this.prisma.restaurant.update({
        where: { id: restaurantId },
        data: { rating: averageRating }
      });
    } catch (error) {
      logger.error('Error updating restaurant rating:', error);
      throw error;
    }
  }

  async deleteRating(ratingId: string, userId: string) {
    try {
      // Get rating
      const rating = await this.prisma.rating.findUnique({
        where: { id: ratingId }
      });
      
      if (!rating) {
        throw new Error('Rating not found');
      }
      
      // Check if user owns this rating
      if (rating.userId !== userId) {
        throw new Error('You do not have permission to delete this rating');
      }
      
      // Delete rating
      const deletedRating = await this.prisma.rating.delete({
        where: { id: ratingId }
      });
      
      // Update restaurant rating
      await this.updateRestaurantRating(rating.restaurantId);
      
      return deletedRating;
    } catch (error) {
      logger.error('Error deleting rating:', error);
      throw error;
    }
  }
}

// Export the class itself, not an instance
export default RatingService;