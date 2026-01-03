import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import logger from '../../common/logger';
import RestaurantService from './restaurant.service';

// Create an instance of RestaurantService
const restaurantService = new RestaurantService();

export class RestaurantController {
  // Create a new restaurant
  static async createRestaurant(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const restaurantData = {
        ...req.body,
        ownerId: req.user?.id
      };

      const restaurant = await restaurantService.createRestaurant(req.body, req.user?.id || '');
      res.status(201).json({
        success: true,
        data: restaurant
      });
    } catch (error: any) {
      logger.error('Error creating restaurant:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create restaurant'
      });
    }
  }

  // Get restaurant by ID
  static async getRestaurantById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const restaurant = await restaurantService.getRestaurantById(id);
      
      if (!restaurant) {
        res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: restaurant
      });
    } catch (error) {
      logger.error('Error fetching restaurant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch restaurant'
      });
    }
  }

  // Get all restaurants
  static async getAllRestaurants(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const cuisine = req.query.cuisine as string;
      const isOpen = req.query.isOpen !== undefined ? req.query.isOpen === 'true' : undefined;
      
      const filters = {
        cuisine: cuisine || undefined,
        isOpen: isOpen
      };

      const result = await restaurantService.getAllRestaurants(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error fetching restaurants:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch restaurants'
      });
    }
  }

  // Update restaurant
  static async updateRestaurant(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const restaurant = await restaurantService.updateRestaurant(id, req.body);
      
      res.json({
        success: true,
        data: restaurant
      });
    } catch (error: any) {
      logger.error('Error updating restaurant:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update restaurant'
      });
    }
  }

  // Delete restaurant
  static async deleteRestaurant(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await restaurantService.deleteRestaurant(id);
      
      res.json({
        success: true,
        message: 'Restaurant deleted successfully'
      });
    } catch (error: any) {
      logger.error('Error deleting restaurant:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete restaurant'
      });
    }
  }

  // Search restaurants
  static async searchRestaurants(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!query) {
        res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
        return;
      }

      const result = await restaurantService.searchRestaurants(query as string, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error searching restaurants:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search restaurants'
      });
    }
  }

  // Get restaurant menu
  static async getRestaurantMenu(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if restaurant exists
      const restaurant = await restaurantService.getRestaurantById(id);
      if (!restaurant) {
        res.status(404).json({
          success: false,
          message: 'Restaurant not found'
        });
        return;
      }
      
      const menu = await restaurantService.getRestaurantMenu(id);
      
      res.json({
        success: true,
        data: menu
      });
    } catch (error) {
      logger.error('Error fetching restaurant menu:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch restaurant menu'
      });
    }
  }

  // Add menu item
  static async addMenuItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { restaurantId, categoryId } = req.params;
      const menuItemData = req.body;
      
      // Verify the restaurant belongs to the owner
      const restaurant = await restaurantService.getRestaurantById(restaurantId);
      if (!restaurant || restaurant.profile?.userId !== req.user?.id) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You do not own this restaurant'
        });
        return;
      }
      
      const menuItem = await restaurantService.addMenuItem(restaurantId, categoryId, menuItemData);
      
      res.status(201).json({
        success: true,
        data: menuItem
      });
    } catch (error: any) {
      logger.error('Error adding menu item:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to add menu item'
      });
    }
  }

  // Update menu item
  static async updateMenuItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { restaurantId, menuItemId } = req.params;
      const menuItemData = req.body;
      
      // Verify the restaurant belongs to the owner
      const restaurant = await restaurantService.getRestaurantById(restaurantId);
      if (!restaurant || restaurant.profile?.userId !== req.user?.id) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You do not own this restaurant'
        });
        return;
      }
      
      const menuItem = await restaurantService.updateMenuItem(restaurantId, menuItemId, menuItemData);
      
      res.json({
        success: true,
        data: menuItem
      });
    } catch (error: any) {
      logger.error('Error updating menu item:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update menu item'
      });
    }
  }

  // Delete menu item
  static async deleteMenuItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { restaurantId, menuItemId } = req.params;
      
      // Verify the restaurant belongs to the owner
      const restaurant = await restaurantService.getRestaurantById(restaurantId);
      if (!restaurant || restaurant.profile?.userId !== req.user?.id) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You do not own this restaurant'
        });
        return;
      }
      
      await restaurantService.deleteMenuItem(restaurantId, menuItemId);
      
      res.json({
        success: true,
        message: 'Menu item deleted successfully'
      });
    } catch (error: any) {
      logger.error('Error deleting menu item:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete menu item'
      });
    }
  }

  // Add category
  static async addCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const categoryData = req.body;
      
      // Verify the restaurant belongs to the owner
      const restaurant = await restaurantService.getRestaurantById(restaurantId);
      if (!restaurant || restaurant.profile?.userId !== req.user?.id) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You do not own this restaurant'
        });
        return;
      }
      
      const category = await restaurantService.addCategory(restaurantId, categoryData);
      
      res.status(201).json({
        success: true,
        data: category
      });
    } catch (error: any) {
      logger.error('Error adding category:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to add category'
      });
    }
  }

  // Update category
  static async updateCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { restaurantId, categoryId } = req.params;
      const restaurant = await restaurantService.getRestaurantById(restaurantId);
      if (!restaurant || restaurant.profile?.userId !== req.user?.id) {
        res.status(403).json({ success: false, message: 'Forbidden: You do not own this restaurant' });
        return;
      }
      const updated = await restaurantService.updateCategory(restaurantId, categoryId, req.body);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      logger.error('Error updating category:', error);
      res.status(400).json({ success: false, message: error.message || 'Failed to update category' });
    }
  }

  // Delete category
  static async deleteCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { restaurantId, categoryId } = req.params;
      const restaurant = await restaurantService.getRestaurantById(restaurantId);
      if (!restaurant || restaurant.profile?.userId !== req.user?.id) {
        res.status(403).json({ success: false, message: 'Forbidden: You do not own this restaurant' });
        return;
      }
      const result = await restaurantService.deleteCategory(restaurantId, categoryId);
      res.json({ success: true, message: result.message });
    } catch (error: any) {
      logger.error('Error deleting category:', error);
      res.status(400).json({ success: false, message: error.message || 'Failed to delete category' });
    }
  }

  // Get schedules (public)
  static async getSchedules(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const restaurant = await restaurantService.getRestaurantById(id);
      if (!restaurant) {
        res.status(404).json({ success: false, message: 'Restaurant not found' });
        return;
      }
      const schedules = await restaurantService.getSchedules(id);
      res.json({ success: true, data: schedules });
    } catch (error: any) {
      logger.error('Error getting schedules:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to get schedules' });
    }
  }

  // Update schedules (owner only)
  static async updateSchedules(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params as { restaurantId: string };
      const restaurant = await restaurantService.getRestaurantById(restaurantId);
      if (!restaurant || restaurant.profile?.userId !== req.user?.id) {
        res.status(403).json({ success: false, message: 'Forbidden: You do not own this restaurant' });
        return;
      }
      const { schedules } = req.body as { schedules: Array<{ dayOfWeek: number; openTime: string; closeTime: string; isOpen?: boolean }> };
      const updated = await restaurantService.updateSchedules(restaurantId, schedules);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      logger.error('Error updating schedules:', error);
      res.status(400).json({ success: false, message: error.message || 'Failed to update schedules' });
    }
  }
}