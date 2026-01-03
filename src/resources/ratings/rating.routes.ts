import { Router } from 'express';
import RatingController from './rating.controller';
import { authenticateJWT } from '../../common/middleware/auth.middleware';
import { validateBody } from '../../common/middleware/validation.middleware';
import { createRatingSchema } from '../../common/validation/rating.schema';

const router: Router = Router();

/**
 * @swagger
 * /api/ratings/restaurant/{restaurantId}:
 *   get:
 *     summary: Get ratings for a restaurant
 *     description: Retrieve paginated ratings for a specific restaurant
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Ratings retrieved successfully
 */
router.get('/restaurant/:restaurantId', RatingController.getRestaurantRatings);

// Protected routes
router.use(authenticateJWT);

/**
 * @swagger
 * /api/ratings:
 *   post:
 *     summary: Create a rating for a delivered order
 *     description: Authenticated customers can rate delivered orders
 *     tags: [Ratings]
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
 *               - orderId
 *               - rating
 *             properties:
 *               restaurantId:
 *                 type: string
 *                 format: uuid
 *               orderId:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rating created successfully
 *       400:
 *         description: Validation error or business rule violation
 */
router.post('/', validateBody(createRatingSchema), RatingController.createRating);

/**
 * @swagger
 * /api/ratings/me:
 *   get:
 *     summary: Get my ratings
 *     description: Retrieve ratings created by the authenticated user
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Ratings retrieved successfully
 */
router.get('/me', RatingController.getMyRatings);

/**
 * @swagger
 * /api/ratings/{id}:
 *   delete:
 *     summary: Delete a rating
 *     description: Delete a rating created by the authenticated user
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 *       403:
 *         description: Not allowed to delete this rating
 */
router.delete('/:id', RatingController.deleteRating);

export default router;