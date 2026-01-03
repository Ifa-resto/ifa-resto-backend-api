import { Router } from 'express';
import AdminController from './admin.controller';
import { authenticateJWT, authorize } from '../../common/middleware/auth.middleware';

const router: Router = Router();

// Super Admin routes
router.use(authenticateJWT, authorize(['SUPER_ADMIN']));

/**
 * @swagger
 * /api/admin/statistics:
 *   get:
 *     summary: Get system statistics
 *     description: Retrieve overall system statistics (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                     totalUsers:
 *                       type: integer
 *                     totalRestaurants:
 *                       type: integer
 *                     totalOrders:
 *                       type: integer
 *                     totalRevenue:
 *                       type: number
 *                       format: float
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Super Admin access required
 */
router.get('/statistics', AdminController.getStatistics);

export default router;