import { Router } from 'express';
import { DelivererController } from './deliverer.controller';
import { authenticateJWT, authorize } from '../../common/middleware/auth.middleware';
import { validateBody } from '../../common/middleware/validation.middleware';
import { updateLocationSchema, updateAvailabilitySchema } from '../../common/validation/deliverer.schema';

const router: Router = Router();

/**
 * @swagger
 * /api/deliverers:
 *   get:
 *     summary: Get available delivery persons
 *     description: Retrieve available delivery persons (public endpoint)
 *     tags: [Deliverers]
 *     responses:
 *       200:
 *         description: Available deliverers retrieved successfully
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
 *                     $ref: '#/components/schemas/DeliveryPerson'
 */
router.get('/', DelivererController.getAvailableDeliverers);

/**
 * @swagger
 * /api/deliverers/{id}:
 *   get:
 *     summary: Get delivery person by ID
 *     description: Retrieve a delivery person details by ID (public endpoint)
 *     tags: [Deliverers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Delivery person ID
 *     responses:
 *       200:
 *         description: Delivery person retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DeliveryPerson'
 *       404:
 *         description: Delivery person not found
 */
router.get('/:id', DelivererController.getDelivererById);

// Protected routes
router.use(authenticateJWT);

// Delivery person routes
/**
 * @swagger
 * /api/deliverers/location:
 *   put:
 *     summary: Update current location
 *     description: Update the authenticated delivery person's current location
 *     tags: [Deliverers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Location updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DeliveryPerson'
 *       401:
 *         description: Unauthorized
 */
router.put('/location', authorize(['DELIVERY_PERSON']), validateBody(updateLocationSchema), DelivererController.updateLocation);

/**
 * @swagger
 * /api/deliverers/availability:
 *   put:
 *     summary: Update availability status
 *     description: Update the authenticated delivery person's availability status
 *     tags: [Deliverers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isAvailable
 *             properties:
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DeliveryPerson'
 *       401:
 *         description: Unauthorized
 */
router.put('/availability', authorize(['DELIVERY_PERSON']), validateBody(updateAvailabilitySchema), DelivererController.updateAvailability);

/**
 * @swagger
 * /api/deliverers/documents:
 *   put:
 *     summary: Upload verification documents
 *     description: Upload document URLs for deliverer verification
 *     tags: [Deliverers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documents
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Documents uploaded successfully
 */
router.put('/documents', authorize(['DELIVERY_PERSON']), DelivererController.uploadDocuments);

export default router;