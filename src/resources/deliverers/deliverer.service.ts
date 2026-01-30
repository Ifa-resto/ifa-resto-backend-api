import { PrismaClient } from '@prisma/client';
import DBService from '../../services/db';
import logger from '../../common/logger';
import NotificationService from '../notifications/notification.service';

const notificationService = new NotificationService();

export default class DelivererService {
  private get prisma(): PrismaClient {
    return DBService.getClient();
  }

  async getAvailableDeliverers() {
    try {
      const deliverers = await this.prisma.deliveryPerson.findMany({
        where: { isAvailable: true },
        include: {
          profile: true,
        },
        orderBy: {
          rating: 'desc',
        },
      });
      return deliverers;
    } catch (error) {
      logger.error('Error fetching available deliverers:', error);
      throw error;
    }
  }

  async getDelivererById(id: string) {
    try {
      const deliverer = await this.prisma.deliveryPerson.findUnique({
        where: { id },
        include: {
          profile: true,
          orders: true,
        },
      });
      return deliverer;
    } catch (error) {
      logger.error('Error fetching deliverer by id:', error);
      throw error;
    }
  }

  async getDelivererByUserId(userId: string) {
    try {
      const deliverer = await this.prisma.deliveryPerson.findFirst({
        where: {
          profile: {
            userId,
          },
        },
        include: {
          profile: true,
        },
      });
      return deliverer;
    } catch (error) {
      logger.error('Error fetching deliverer by userId:', error);
      throw error;
    }
  }

  async updateDelivererLocationByUser(userId: string, location: { latitude: number; longitude: number }) {
    try {
      const deliverer = await this.getDelivererByUserId(userId);
      if (!deliverer) {
        throw new Error('Delivery person not found for user');
      }
      const updated = await this.prisma.deliveryPerson.update({
        where: { id: deliverer.id },
        data: { currentLat: location.latitude, currentLng: location.longitude },
        include: { profile: true },
      });
      return updated;
    } catch (error) {
      logger.error('Error updating deliverer location:', error);
      throw error;
    }
  }

  async updateDelivererAvailabilityByUser(userId: string, isAvailable: boolean) {
    try {
      const deliverer = await this.getDelivererByUserId(userId);
      if (!deliverer) {
        throw new Error('Delivery person not found for user');
      }
      const updated = await this.prisma.deliveryPerson.update({
        where: { id: deliverer.id },
        data: { isAvailable },
        include: { profile: true },
      });
      return updated;
    } catch (error) {
      logger.error('Error updating deliverer availability:', error);
      throw error;
    }
  }

  async uploadDocuments(userId: string, documents: string[]) {
    try {
      const deliverer = await this.getDelivererByUserId(userId);
      if (!deliverer) {
        throw new Error('Delivery person not found for user');
      }
      const updated = await this.prisma.deliveryPerson.update({
        where: { id: deliverer.id },
        data: {
          documents,
          verificationStatus: 'REVIEWING'
        },
        include: { profile: true },
      });

      await notificationService.createNotification(
        userId,
        'Documents reçus',
        'Vos documents ont été bien reçus et sont en cours d\'examen. Nous vous informerons une fois la vérification terminée.',
        'SYSTEM'
      );

      return updated;
    } catch (error) {
      logger.error('Error uploading documents:', error);
      throw error;
    }
  }

  async updateVerificationStatus(delivererId: string, status: 'PENDING' | 'REVIEWING' | 'VERIFIED' | 'REJECTED') {
    try {
      const updated = await this.prisma.deliveryPerson.update({
        where: { id: delivererId },
        data: { verificationStatus: status },
        include: { profile: true },
      });

      const userId = updated.profile.userId;
      let title = '';
      let message = '';

      if (status === 'VERIFIED') {
        title = 'Compte Vérifié !';
        message = 'Félicitations ! Votre compte a été vérifié. Vous pouvez maintenant commencer à livrer.';
      } else if (status === 'REJECTED') {
        title = 'Documents Rejetés';
        message = 'Malheureusement, vos documents n\'ont pas pu être vérifiés. Veuillez les soumettre à nouveau en veillant à ce qu\'ils soient lisibles.';
      }

      if (title) {
        await notificationService.createNotification(userId, title, message, 'SYSTEM');
      }

      return updated;
    } catch (error) {
      logger.error('Error updating verification status:', error);
      throw error;
    }
  }
}