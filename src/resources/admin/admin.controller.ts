import { Request, Response } from 'express';
import adminService from './admin.service';
import { authenticateJWT, authorize } from '../../common/middleware/auth.middleware';

class AdminController {
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
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await adminService.getStatistics();
      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error retrieving statistics',
      });
    }
  }
}

export default new AdminController();