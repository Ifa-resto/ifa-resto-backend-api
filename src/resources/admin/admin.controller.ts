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

  async verifyRestaurant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await adminService.verifyRestaurant(id, status);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async verifyDeliverer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await adminService.verifyDeliverer(id, status);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await adminService.getAllOrders(page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Audit Logs
  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await adminService.getAuditLogs(limit);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Disputes
  async getDisputes(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as any;
      const result = await adminService.getDisputes(status);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateDispute(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, resolution } = req.body;
      const result = await adminService.updateDisputeStatus(id, status, resolution);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Config & Commissions
  async updateCommission(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { rate } = req.body;
      const result = await adminService.updateRestaurantCommission(restaurantId, rate);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPlatformConfig(req: Request, res: Response): Promise<void> {
    try {
      const result = await adminService.getPlatformConfig();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updatePlatformConfig(req: Request, res: Response): Promise<void> {
    try {
      const result = await adminService.updatePlatformConfig(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default new AdminController();