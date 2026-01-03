import { Router } from 'express';
import * as CartController from './cart.controller';
import { authenticateJWT } from '../../common/middleware/auth.middleware';
import { validate } from '../../common/validation/schemas';

const router: Router = Router();

// Routes protégées (authentification requise)
router.use(authenticateJWT);

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
router.get('/', CartController.getCart);

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
router.post('/', CartController.addToCart);

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
router.put('/:cartItemId', CartController.updateCartItem);

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
router.delete('/:cartItemId', CartController.removeFromCart);

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
router.delete('/clear', CartController.clearCart);

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
router.get('/total', CartController.getCartTotal);

export default router;