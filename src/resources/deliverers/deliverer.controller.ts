import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import logger from '../../common/logger';
import { updateLocationSchema, updateAvailabilitySchema } from '../../common/validation/deliverer.schema';
import DelivererService from './deliverer.service';

const delivererService = new DelivererService();

export class DelivererController {
  // Get available deliverers
  static async getAvailableDeliverers(req: Request, res: Response): Promise<void> {
    try {
      const deliverers = await delivererService.getAvailableDeliverers();
      const data = deliverers.map((d: any) => ({
        id: d.id,
        firstName: d.profile?.firstName,
        lastName: d.profile?.lastName,
        phone: d.profile?.phone,
        vehicleType: d.vehicleType,
        licenseNumber: d.licenseNumber,
        isAvailable: d.isAvailable,
        currentLat: d.currentLat,
        currentLng: d.currentLng,
        rating: d.rating,
      }));

      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error('Error fetching deliverers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch deliverers'
      });
    }
  }

  // Get deliverer by ID
  static async getDelivererById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deliverer = await delivererService.getDelivererById(id);

      if (!deliverer) {
        res.status(404).json({
          success: false,
          message: 'Deliverer not found'
        });
        return;
      }

      const data = {
        id: deliverer.id,
        firstName: (deliverer as any).profile?.firstName,
        lastName: (deliverer as any).profile?.lastName,
        phone: (deliverer as any).profile?.phone,
        vehicleType: deliverer.vehicleType,
        licenseNumber: deliverer.licenseNumber,
        isAvailable: deliverer.isAvailable,
        currentLat: deliverer.currentLat,
        currentLng: deliverer.currentLng,
        rating: deliverer.rating,
      };

      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error('Error fetching deliverer:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch deliverer'
      });
    }
  }

  // Profil et activité du jour du livreur connecté
  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await delivererService.getMyDashboard(req.user?.id || '');
      res.json({ success: true, data });
    } catch (error: any) {
      logger.error('Error fetching deliverer dashboard:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch deliverer' });
    }
  }

  // Course en cours (null si aucune)
  static async getCurrentCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await delivererService.getCurrentCourse(req.user?.id || '');
      res.json({ success: true, data });
    } catch (error: any) {
      logger.error('Error fetching current course:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch current course' });
    }
  }

  // Courses disponibles pour le livreur connecté
  static async getOffers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await delivererService.getOffers(req.user?.id || '');
      res.json({ success: true, data });
    } catch (error: any) {
      logger.error('Error fetching offers:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch offers' });
    }
  }

  static async acceptCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = await delivererService.acceptCourse(req.user?.id || '', req.params.orderId);
      res.json({ success: true, data });
    } catch (error: any) {
      logger.error('Error accepting course:', error);
      res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to accept course' });
    }
  }

  // Update deliverer location (for delivery person)
  static async updateLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || '';
      const location = req.body;
      const updated = await delivererService.updateDelivererLocationByUser(userId, location);
      const data = {
        id: updated.id,
        firstName: (updated as any).profile?.firstName,
        lastName: (updated as any).profile?.lastName,
        phone: (updated as any).profile?.phone,
        vehicleType: updated.vehicleType,
        licenseNumber: updated.licenseNumber,
        isAvailable: updated.isAvailable,
        currentLat: updated.currentLat,
        currentLng: updated.currentLng,
        rating: updated.rating,
      };

      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error('Error updating deliverer location:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update location'
      });
    }
  }

  // Update deliverer availability status (for delivery person)
  static async updateAvailability(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || '';
      const { isAvailable } = req.body;
      const updated = await delivererService.updateDelivererAvailabilityByUser(userId, isAvailable);
      const data = {
        id: updated.id,
        firstName: (updated as any).profile?.firstName,
        lastName: (updated as any).profile?.lastName,
        phone: (updated as any).profile?.phone,
        vehicleType: updated.vehicleType,
        licenseNumber: updated.licenseNumber,
        isAvailable: updated.isAvailable,
        currentLat: updated.currentLat,
        currentLng: updated.currentLng,
        rating: updated.rating,
      };

      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error('Error updating deliverer availability:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update availability'
      });
    }
  }

  // Upload documents (for onboarding/verification)
  static async uploadDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || '';
      const { documents } = req.body;

      if (!documents || !Array.isArray(documents)) {
        res.status(400).json({
          success: false,
          message: 'Documents are required and must be an array'
        });
        return;
      }

      await delivererService.uploadDocuments(userId, documents);

      res.json({
        success: true,
        message: 'Documents uploaded successfully and sent for review'
      });
    } catch (error) {
      logger.error('Error uploading deliverer documents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload documents'
      });
    }
  }
}