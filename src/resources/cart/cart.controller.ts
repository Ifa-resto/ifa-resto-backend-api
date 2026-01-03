import { Request, Response } from 'express';
import CartService from './cart.service';
import { authenticateJWT } from '../../common/middleware/auth.middleware';

const cartService = new CartService();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart
 *     description: Retrieve the authenticated user's cart items grouped by restaurant
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       restaurant:
 *                         $ref: '#/components/schemas/Restaurant'
 *                       items:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/CartItem'
 *       401:
 *         description: Unauthorized
 */
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const cart = await cartService.getCart(userId);
    res.json({
      success: true,
      data: cart
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching cart'
    });
  }
};

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add item to cart
 *     description: Add a menu item to the authenticated user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menuItemId
 *               - quantity
 *             properties:
 *               menuItemId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CartItem'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Menu item not found
 */
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { menuItemId, quantity, notes } = req.body;
    
    const cartItem = await cartService.addToCart(userId, menuItemId, quantity, notes);
    res.status(201).json({
      success: true,
      data: cartItem
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error adding item to cart'
    });
  }
};

/**
 * @swagger
 * /api/cart/{cartItemId}:
 *   put:
 *     summary: Update cart item
 *     description: Update quantity or notes of a cart item
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CartItem'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 */
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { cartItemId } = req.params;
    const { quantity, notes } = req.body;
    
    const cartItem = await cartService.updateCartItem(userId, cartItemId, quantity, notes);
    res.json({
      success: true,
      data: cartItem
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating cart item'
    });
  }
};

/**
 * @swagger
 * /api/cart/{cartItemId}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Remove a specific item from the authenticated user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart item not found
 */
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { cartItemId } = req.params;
    
    const result = await cartService.removeFromCart(userId, cartItemId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error removing item from cart'
    });
  }
};

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear cart
 *     description: Remove all items from the authenticated user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const result = await cartService.clearCart(userId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error clearing cart'
    });
  }
};

/**
 * @swagger
 * /api/cart/total:
 *   get:
 *     summary: Get cart total
 *     description: Calculate the total amount and item count for the authenticated user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart total calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     subtotal:
 *                       type: number
 *                       format: float
 *                     itemCount:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
export const getCartTotal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const total = await cartService.getCartTotal(userId);
    res.json({
      success: true,
      data: total
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error calculating cart total'
    });
  }
};