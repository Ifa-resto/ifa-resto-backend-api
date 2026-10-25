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

  // Profil du livreur connecté + activité du jour (courses livrées, frais de livraison gagnés)
  async getMyDashboard(userId: string) {
    const deliverer = await this.getDelivererByUserId(userId);
    if (!deliverer) {
      throw new Error('Delivery person not found for user');
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const today = await this.prisma.order.aggregate({
      where: { deliveryPersonId: deliverer.id, status: 'DELIVERED', actualDelivery: { gte: startOfDay } },
      _count: { _all: true },
      _sum: { deliveryFee: true },
    });

    return {
      id: deliverer.id,
      firstName: deliverer.profile.firstName,
      lastName: deliverer.profile.lastName,
      phoneNumber: deliverer.profile.phoneNumber,
      vehicleType: deliverer.vehicleType,
      verificationStatus: deliverer.verificationStatus,
      isAvailable: deliverer.isAvailable,
      currentLat: deliverer.currentLat,
      currentLng: deliverer.currentLng,
      rating: deliverer.rating,
      today: {
        deliveries: today._count._all,
        earnings: today._sum.deliveryFee || 0,
      },
    };
  }

  // Champs d'une course utiles au livreur : retrait au restaurant, dépôt chez le client
  private courseInclude = {
    restaurant: {
      select: {
        id: true,
        name: true,
        logo: true,
        // Pas de colonne adresse sur Restaurant : c'est l'adresse du profil du restaurateur
        profile: {
          select: {
            phoneNumber: true,
            address: { take: 1, select: { street: true, city: true, latitude: true, longitude: true } },
          },
        },
      },
    },
    deliveryAddress: true,
    customer: { select: { profile: { select: { firstName: true, lastName: true, phoneNumber: true } } } },
    items: { select: { id: true, quantity: true, menuItem: { select: { name: true } } } },
  } as const;

  private static ACTIVE_STATUSES = ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'ON_THE_WAY'] as const;

  // Course en cours du livreur (une seule à la fois)
  async getCurrentCourse(userId: string) {
    const deliverer = await this.getDelivererByUserId(userId);
    if (!deliverer) {
      throw new Error('Delivery person not found for user');
    }
    return this.prisma.order.findFirst({
      where: { deliveryPersonId: deliverer.id, status: { in: [...DelivererService.ACTIVE_STATUSES] } },
      include: this.courseInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  // Courses sans livreur, acceptées par un restaurant vérifié (les plus anciennes d'abord)
  async getOffers(userId: string) {
    const deliverer = await this.getDelivererByUserId(userId);
    if (!deliverer) {
      throw new Error('Delivery person not found for user');
    }
    if (deliverer.verificationStatus !== 'VERIFIED' || !deliverer.isAvailable) {
      return [];
    }
    return this.prisma.order.findMany({
      where: {
        deliveryPersonId: null,
        status: { in: ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'] },
        restaurant: { verificationStatus: 'VERIFIED' },
      },
      include: this.courseInclude,
      orderBy: { createdAt: 'asc' },
      take: 10,
    });
  }

  // Accepter une course : la mise à jour conditionnelle garantit qu'un seul livreur l'obtient
  async acceptCourse(userId: string, orderId: string) {
    const deliverer = await this.getDelivererByUserId(userId);
    if (!deliverer) {
      throw new Error('Delivery person not found for user');
    }
    if (deliverer.verificationStatus !== 'VERIFIED') {
      throw Object.assign(new Error('Votre compte livreur n\'est pas encore validé'), { status: 403 });
    }
    const current = await this.getCurrentCourse(userId);
    if (current) {
      throw Object.assign(new Error('Terminez votre course en cours avant d\'en accepter une autre'), { status: 409 });
    }

    const { count } = await this.prisma.order.updateMany({
      where: { id: orderId, deliveryPersonId: null, status: { in: ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'] } },
      data: { deliveryPersonId: deliverer.id },
    });
    if (count === 0) {
      throw Object.assign(new Error('Cette course n\'est plus disponible'), { status: 409 });
    }

    const order = await this.prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: this.courseInclude });
    await this.prisma.orderTracking.create({
      data: {
        orderId,
        status: order.status,
        notes: `Course acceptée par ${deliverer.profile.firstName} ${deliverer.profile.lastName}`,
      },
    });
    // Occupé jusqu'à la livraison (l'API le remet disponible au statut DELIVERED)
    await this.prisma.deliveryPerson.update({ where: { id: deliverer.id }, data: { isAvailable: false } });

    return order;
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