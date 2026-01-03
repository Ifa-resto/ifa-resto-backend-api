import { Router } from 'express';
import { OrderController } from './order.controller';
import { authenticateJWT, authorize } from '../../common/middleware/auth.middleware';
import { validateBody } from '../../common/middleware/validation.middleware';
import { createOrderSchema, updateOrderStatusSchema } from '../../common/validation/order.schema';

const router: Router = Router();

// All order routes require authentication
router.use(authenticateJWT);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new order for authenticated user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - items
 *               - deliveryAddressId
 *             properties:
 *               restaurantId:
 *                 type: string
 *                 format: uuid
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menuItemId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                     notes:
 *                       type: string
 *               deliveryAddressId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Restaurant or menu items not found
 */
router.post('/', validateBody(createOrderSchema), OrderController.createOrder);

/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Get user's orders
 *     description: Retrieve all orders for the authenticated user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (for admin users)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of orders per page (for admin users)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (for admin users)
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by restaurant (for admin users)
 *     responses:
 *       200:
 *         description: User orders retrieved successfully
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
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */
router.get('/my-orders', OrderController.getUserOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Retrieve order details by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get('/:id', OrderController.getOrderById);

/**
 * @swagger
 * /api/orders/number/{orderNumber}:
 *   get:
 *     summary: Get order by order number
 *     description: Retrieve order details by order number (public endpoint)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Order number
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.get('/number/:orderNumber', OrderController.getOrderByNumber);

/**
 * @swagger
 * /api/orders/{id}/tracking:
 *   get:
 *     summary: Get order tracking history
 *     description: Retrieve chronological tracking events for an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Tracking history retrieved successfully
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
 *                       id:
 *                         type: string
 *                       status:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       location:
 *                         type: string
 *                       notes:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access denied
 *       404:
 *         description: Order not found
 */
router.get('/:id/tracking', OrderController.getOrderTracking);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     description: Update order status (Restaurant owner only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, PREPARING, READY_FOR_PICKUP, PICKED_UP, ON_THE_WAY, DELIVERED, CANCELLED, REFUNDED]
 *     responses:
 *       200:
 *         description: Order status updated successfully
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
 *       403:
 *         description: Forbidden - Restaurant owner access required
 *       404:
 *         description: Order not found
 */
router.put('/:id/status', authorize(['RESTAURANT_OWNER']), validateBody(updateOrderStatusSchema), OrderController.updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}/delivery:
 *   put:
 *     summary: Update delivery status
 *     description: Update order delivery status (Delivery person only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PICKED_UP, ON_THE_WAY, DELIVERED]
 *     responses:
 *       200:
 *         description: Delivery status updated successfully
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
 *       403:
 *         description: Forbidden - Delivery person access required
 *       404:
 *         description: Order not found
 */
router.put('/:id/delivery', authorize(['DELIVERY_PERSON']), validateBody(updateOrderStatusSchema), OrderController.updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}/assign-delivery:
 *   put:
 *     summary: Assign delivery person
 *     description: Assign a delivery person to an order (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliveryPersonId
 *             properties:
 *               deliveryPersonId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Delivery person assigned successfully
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Order or delivery person not found
 */
router.put('/:id/assign-delivery', authorize(['ADMIN']), OrderController.assignDeliveryPerson);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   put:
 *     summary: Cancel order
 *     description: Cancel an order (Customer only, before confirmed)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer access required or order cannot be cancelled
 *       404:
 *         description: Order not found
 */
router.put('/:id/cancel', authorize(['CUSTOMER']), OrderController.cancelOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     description: Retrieve all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of orders per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by restaurant
 *     responses:
 *       200:
 *         description: All orders retrieved successfully
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
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/', authorize(['ADMIN']), OrderController.getUserOrders);

export default router;