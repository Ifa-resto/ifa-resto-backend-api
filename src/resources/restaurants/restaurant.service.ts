import { PrismaClient } from '@prisma/client';
import DBService from '../../services/db';
import logger from '../../common/logger';

export class RestaurantService {
  private get prisma(): PrismaClient {
    return DBService.getClient();
  }

  async createRestaurant(restaurantData: any, ownerId: string) {
    try {
      // First, get the profile ID of the owner
      const ownerProfile = await this.prisma.profile.findUnique({
        where: { userId: ownerId }
      });

      if (!ownerProfile) {
        throw new Error('Owner profile not found');
      }

      const restaurant = await this.prisma.restaurant.create({
        data: {
          ...restaurantData,
          profileId: ownerProfile.id,
          rating: 0,
          isOpen: true,
          deliveryTime: restaurantData.deliveryTime || 30,
          deliveryFee: restaurantData.deliveryFee || 0,
          minimumOrder: restaurantData.minimumOrder || 0,
        }
      });

      return restaurant;
    } catch (error) {
      logger.error('Error creating restaurant:', error);
      throw error;
    }
  }

  async getRestaurantById(id: string) {
    try {
      const restaurant = await this.prisma.restaurant.findUnique({
        where: { id },
        include: {
          profile: {
            include: {
              user: true
            }
          },
          categories: true,
          menus: true,
          ratings: true
        }
      });

      return restaurant;
    } catch (error) {
      logger.error('Error fetching restaurant:', error);
      throw error;
    }
  }

  async getAllRestaurants(page: number = 1, limit: number = 10, filters?: { cuisine?: string, isOpen?: boolean }) {
    try {
      const skip = (page - 1) * limit;

      const where: any = {};
      if (filters?.cuisine) {
        where.cuisine = {
          contains: filters.cuisine,
          mode: 'insensitive'
        };
      }
      if (filters?.isOpen !== undefined) {
        where.isOpen = filters.isOpen;
      }

      const [restaurants, total] = await Promise.all([
        this.prisma.restaurant.findMany({
          where,
          skip,
          take: limit,
          include: {
            profile: true,
            categories: true
          },
          orderBy: {
            rating: 'desc'
          }
        }),
        this.prisma.restaurant.count({ where })
      ]);

      return {
        restaurants,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching restaurants:', error);
      throw error;
    }
  }

  async updateRestaurant(id: string, data: any) {
    try {
      if (data.isOpen) {
        const current = await this.prisma.restaurant.findUnique({ where: { id } });
        if (current && current.verificationStatus !== 'VERIFIED') {
          throw new Error('Restaurant cannot be opened until it is verified by an admin');
        }
      }

      const restaurant = await this.prisma.restaurant.update({
        where: { id },
        data
      });

      return restaurant;
    } catch (error) {
      logger.error('Error updating restaurant:', error);
      throw error;
    }
  }

  async deleteRestaurant(id: string) {
    try {
      // First, delete related entities
      await this.prisma.category.deleteMany({
        where: { restaurantId: id }
      });

      await this.prisma.menuItem.deleteMany({
        where: { restaurantId: id }
      });

      await this.prisma.restaurantSchedule.deleteMany({
        where: { restaurantId: id }
      });

      // Then delete the restaurant
      const restaurant = await this.prisma.restaurant.delete({
        where: { id }
      });

      return restaurant;
    } catch (error) {
      logger.error('Error deleting restaurant:', error);
      throw error;
    }
  }

  async searchRestaurants(query: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [restaurants, total] = await Promise.all([
        this.prisma.restaurant.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { cuisine: { contains: query, mode: 'insensitive' } }
            ]
          },
          skip,
          take: limit,
          include: {
            profile: true,
            categories: true
          },
          orderBy: {
            rating: 'desc'
          }
        }),
        this.prisma.restaurant.count({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { cuisine: { contains: query, mode: 'insensitive' } }
            ]
          }
        })
      ]);

      return {
        restaurants,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error searching restaurants:', error);
      throw error;
    }
  }

  async getRestaurantMenu(restaurantId: string) {
    try {
      const menu = await this.prisma.category.findMany({
        where: {
          restaurantId,
          isActive: true
        },
        include: {
          menuItems: {
            where: {
              isAvailable: true
            }
          }
        },
        orderBy: {
          sortOrder: 'asc'
        }
      });

      return menu;
    } catch (error) {
      logger.error('Error fetching restaurant menu:', error);
      throw error;
    }
  }

  async getSchedules(restaurantId: string) {
    try {
      const schedules = await this.prisma.restaurantSchedule.findMany({
        where: { restaurantId },
        orderBy: { dayOfWeek: 'asc' }
      });
      return schedules;
    } catch (error) {
      logger.error('Error fetching restaurant schedules:', error);
      throw error;
    }
  }

  async updateSchedules(restaurantId: string, schedules: Array<{ dayOfWeek: number; openTime: string; closeTime: string; isOpen?: boolean }>) {
    try {
      // Replace schedules atomically in a transaction
      await this.prisma.$transaction([
        this.prisma.restaurantSchedule.deleteMany({ where: { restaurantId } }),
        this.prisma.restaurantSchedule.createMany({
          data: schedules.map(s => ({
            restaurantId,
            dayOfWeek: s.dayOfWeek,
            openTime: s.openTime,
            closeTime: s.closeTime,
            isOpen: s.isOpen ?? true,
          }))
        })
      ]);

      // Return the new schedules
      return this.getSchedules(restaurantId);
    } catch (error) {
      logger.error('Error updating restaurant schedules:', error);
      throw error;
    }
  }

  async addMenuItem(restaurantId: string, categoryId: string, menuItemData: any) {
    try {
      // Verify the category belongs to the restaurant
      const category = await this.prisma.category.findFirst({
        where: {
          id: categoryId,
          restaurantId
        }
      });

      if (!category) {
        throw new Error('Category not found or does not belong to this restaurant');
      }

      const menuItem = await this.prisma.menuItem.create({
        data: {
          ...menuItemData,
          restaurantId,
          categoryId
        }
      });

      return menuItem;
    } catch (error) {
      logger.error('Error adding menu item:', error);
      throw error;
    }
  }

  async addCategory(restaurantId: string, categoryData: any) {
    try {
      // Get the maximum sort order and add 1
      const maxSortOrderResult = await this.prisma.category.aggregate({
        _max: {
          sortOrder: true
        },
        where: {
          restaurantId
        }
      });

      const maxSortOrder = maxSortOrderResult._max.sortOrder || 0;

      const category = await this.prisma.category.create({
        data: {
          ...categoryData,
          restaurantId,
          sortOrder: maxSortOrder + 1
        }
      });

      return category;
    } catch (error) {
      logger.error('Error adding category:', error);
      throw error;
    }
  }

  async updateMenuItem(restaurantId: string, menuItemId: string, menuItemData: any) {
    try {
      // Verify the menu item belongs to the restaurant
      const menuItem = await this.prisma.menuItem.findFirst({
        where: {
          id: menuItemId,
          restaurantId
        }
      });

      if (!menuItem) {
        throw new Error('Menu item not found or does not belong to this restaurant');
      }

      if (menuItemData.categoryId) {
        // Ensure new category belongs to the same restaurant
        const category = await this.prisma.category.findFirst({
          where: { id: menuItemData.categoryId, restaurantId }
        });
        if (!category) {
          throw new Error('Target category not found or does not belong to this restaurant');
        }
      }

      const updatedMenuItem = await this.prisma.menuItem.update({
        where: { id: menuItemId },
        data: menuItemData
      });

      return updatedMenuItem;
    } catch (error) {
      logger.error('Error updating menu item:', error);
      throw error;
    }
  }

  async deleteMenuItem(restaurantId: string, menuItemId: string) {
    try {
      // Verify the menu item belongs to the restaurant
      const menuItem = await this.prisma.menuItem.findFirst({
        where: {
          id: menuItemId,
          restaurantId
        }
      });

      if (!menuItem) {
        throw new Error('Menu item not found or does not belong to this restaurant');
      }

      await this.prisma.menuItem.delete({
        where: { id: menuItemId }
      });

      return { success: true, message: 'Menu item deleted successfully' };
    } catch (error) {
      logger.error('Error deleting menu item:', error);
      throw error;
    }
  }

  async updateCategory(restaurantId: string, categoryId: string, categoryData: any) {
    try {
      const category = await this.prisma.category.findFirst({
        where: { id: categoryId, restaurantId }
      });
      if (!category) {
        throw new Error('Category not found or does not belong to this restaurant');
      }
      const updated = await this.prisma.category.update({
        where: { id: categoryId },
        data: categoryData,
      });
      return updated;
    } catch (error) {
      logger.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(restaurantId: string, categoryId: string) {
    try {
      const category = await this.prisma.category.findFirst({
        where: { id: categoryId, restaurantId }
      });
      if (!category) {
        throw new Error('Category not found or does not belong to this restaurant');
      }
      await this.prisma.menuItem.deleteMany({ where: { categoryId } });
      await this.prisma.category.delete({ where: { id: categoryId } });
      return { success: true, message: 'Category deleted successfully' };
    } catch (error) {
      logger.error('Error deleting category:', error);
      throw error;
    }
  }
}

// Export the class itself, not an instance
export default RestaurantService;
