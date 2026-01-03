import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticateJWT, authorize } from '../../common/middleware/auth.middleware';
import { validateBody } from '../../common/middleware/validation.middleware';
import { processPaymentSchema, refundPaymentSchema } from '../../common/validation/payment.schema';

const router: Router = Router();

// All payment routes require authentication
router.use(authenticateJWT);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Process a payment
 *     description: Process payment for an order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - amount
 *               - method
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *               amount:
 *                 type: number
 *                 format: float
 *               method:
 *                 type: string
 *                 enum: [CASH, CARD, PAYPAL, STRIPE, MOBILE_PAYMENT]
 *               cardToken:
 *                 type: string
 *                 description: Token for card payment (required if method is CARD)
 *     responses:
 *       200:
 *         description: Payment processed successfully
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
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/', validateBody(processPaymentSchema), PaymentController.processPayment);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     description: Retrieve payment details by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
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
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.get('/:id', PaymentController.getPaymentById);

/**
 * @swagger
 * /api/payments/{id}/refund:
 *   post:
 *     summary: Refund a payment
 *     description: Process refund for a payment (admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for refund
 *     responses:
 *       200:
 *         description: Payment refunded successfully
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
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Payment not found
 */
router.post('/:id/refund', authorize(['ADMIN']), validateBody(refundPaymentSchema), PaymentController.refundPayment);

/**
 * @swagger
 * /api/payments/my-payments:
 *   get:
 *     summary: Get user's payments
 *     description: Retrieve all payments for the authenticated user
 *     tags: [Payments]
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
 *         description: Number of payments per page
 *     responses:
 *       200:
 *         description: User payments retrieved successfully
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
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/my-payments', PaymentController.getUserPayments);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments
 *     description: Retrieve all payments (Admin only)
 *     tags: [Payments]
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
 *         description: Number of payments per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED]
 *         description: Filter by payment status
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [CASH, CARD, PAYPAL, STRIPE, MOBILE_PAYMENT]
 *         description: Filter by payment method
 *     responses:
 *       200:
 *         description: All payments retrieved successfully
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
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
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
router.get('/', authorize(['ADMIN']), PaymentController.getAllPayments);

export default router;