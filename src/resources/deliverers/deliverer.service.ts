import { PrismaClient } from '@prisma/client';
import DBService from '../../services/db';
import logger from '../../common/logger';

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
}