import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import logger from '../../common/logger';
import RatingService from './rating.service';

const ratingService = new RatingService();

export class RatingController {
  static async createRating(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const rating = await ratingService.createRating(req.body, req.user?.id || '');
      res.status(201).json({ success: true, data: rating });
    } catch (error: any) {
      logger.error('Error creating rating:', error);
      res.status(400).json({ success: false, message: error.message || 'Failed to create rating' });
    }
  }

  static async getRestaurantRatings(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await ratingService.getRestaurantRatings(restaurantId, page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error fetching restaurant ratings:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch restaurant ratings' });
    }
  }

  static async getMyRatings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await ratingService.getUserRatings(req.user?.id || '', page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error fetching user ratings:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch user ratings' });
    }
  }

  static async deleteRating(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await ratingService.deleteRating(id, req.user?.id || '');
      res.json({ success: true, data: deleted });
    } catch (error: any) {
      logger.error('Error deleting rating:', error);
      res.status(400).json({ success: false, message: error.message || 'Failed to delete rating' });
    }
  }
}

export default RatingController;