import { PrismaClient } from '@prisma/client';
import DBService from '../../services/db';
import logger from '../../common/logger';

// Create a type that extends PrismaClient with the cartItem property
type ExtendedPrismaClient = PrismaClient & {
  cartItem: any;
  menuItem: any;
};

export class CartService {
  private get prisma(): ExtendedPrismaClient {
    return DBService.getClient() as ExtendedPrismaClient;
  }

  async getCart(userId: string) {
    try {
      // Get user's cart items
      const cartItems = await this.prisma.cartItem.findMany({
        where: { userId },
        include: {
          menuItem: {
            include: {
              restaurant: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
      
      // Group items by restaurant
      const cartByRestaurant: any = {};
      
      cartItems.forEach(item => {
        const restaurantId = item.menuItem.restaurantId;
        if (!cartByRestaurant[restaurantId]) {
          cartByRestaurant[restaurantId] = {
            restaurant: item.menuItem.restaurant,
            items: []
          };
        }
        cartByRestaurant[restaurantId].items.push(item);
      });
      
      return Object.values(cartByRestaurant);
    } catch (error) {
      logger.error('Error fetching cart:', error);
      throw error;
    }
  }

  async addToCart(userId: string, menuItemId: string, quantity: number = 1, notes?: string) {
    try {
      // Verify menu item exists and is available
      const menuItem = await this.prisma.menuItem.findUnique({
        where: { id: menuItemId }
      });
      
      if (!menuItem) {
        throw new Error('Menu item not found');
      }
      
      if (!menuItem.isAvailable) {
        throw new Error('Menu item is not available');
      }
      
      // Check if item is already in cart
      const existingCartItem = await this.prisma.cartItem.findFirst({
        where: {
          userId,
          menuItemId
        }
      });
      
      if (existingCartItem) {
        // Update quantity
        const updatedCartItem = await this.prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: {
            quantity: existingCartItem.quantity + quantity,
            notes: notes || existingCartItem.notes
          }
        });
        
        return updatedCartItem;
      } else {
        // Add new item to cart
        const cartItem = await this.prisma.cartItem.create({
          data: {
            userId,
            menuItemId,
            quantity,
            notes
          }
        });
        
        return cartItem;
      }
    } catch (error) {
      logger.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItem(userId: string, cartItemId: string, quantity: number, notes?: string) {
    try {
      // Verify cart item exists and belongs to user
      const cartItem = await this.prisma.cartItem.findFirst({
        where: {
          id: cartItemId,
          userId
        }
      });
      
      if (!cartItem) {
        throw new Error('Cart item not found or does not belong to user');
      }
      
      // Update cart item
      const updatedCartItem = await this.prisma.cartItem.update({
        where: { id: cartItemId },
        data: {
          quantity,
          notes
        }
      });
      
      return updatedCartItem;
    } catch (error) {
      logger.error('Error updating cart item:', error);
      throw error;
    }
  }

  async removeFromCart(userId: string, cartItemId: string) {
    try {
      // Verify cart item exists and belongs to user
      const cartItem = await this.prisma.cartItem.findFirst({
        where: {
          id: cartItemId,
          userId
        }
      });
      
      if (!cartItem) {
        throw new Error('Cart item not found or does not belong to user');
      }
      
      // Delete cart item
      await this.prisma.cartItem.delete({
        where: { id: cartItemId }
      });
      
      return { success: true, message: 'Item removed from cart' };
    } catch (error) {
      logger.error('Error removing from cart:', error);
      throw error;
    }
  }

  async clearCart(userId: string) {
    try {
      // Delete all cart items for user
      await this.prisma.cartItem.deleteMany({
        where: { userId }
      });
      
      return { success: true, message: 'Cart cleared successfully' };
    } catch (error) {
      logger.error('Error clearing cart:', error);
      throw error;
    }
  }

  async getCartTotal(userId: string) {
    try {
      // Get cart items with menu item prices
      const cartItems = await this.prisma.cartItem.findMany({
        where: { userId },
        include: {
          menuItem: true
        }
      });
      
      // Calculate total
      let subtotal = 0;
      
      cartItems.forEach(item => {
        const price = item.menuItem.discountPrice !== null && item.menuItem.discountPrice < item.menuItem.price 
          ? item.menuItem.discountPrice 
          : item.menuItem.price;
          
        subtotal += price * item.quantity;
      });
      
      return {
        subtotal,
        itemCount: cartItems.reduce((total, item) => total + item.quantity, 0)
      };
    } catch (error) {
      logger.error('Error calculating cart total:', error);
      throw error;
    }
  }
}

// Export the class itself, not an instance
export default CartService;