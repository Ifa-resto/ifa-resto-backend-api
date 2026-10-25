import { PrismaClient, OrderStatus } from '@prisma/client';
import DBService from '../../services/db';
import logger from '../../common/logger';
import { processOrderCompletion } from '../gamification/gamification.service';

// Transitions de statut autorisées par rôle (l'admin peut tout faire)
const STATUS_TRANSITIONS: Record<string, Partial<Record<OrderStatus, OrderStatus[]>>> = {
  RESTAURANT_OWNER: {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY_FOR_PICKUP'],
  },
  DELIVERY_PERSON: {
    READY_FOR_PICKUP: ['PICKED_UP'],
    PICKED_UP: ['ON_THE_WAY', 'DELIVERED'],
    ON_THE_WAY: ['DELIVERED'],
  },
};

const FINAL_STATUSES: OrderStatus[] = ['DELIVERED', 'CANCELLED', 'REFUNDED'];

export class OrderService {
  private get prisma(): PrismaClient {
    return DBService.getClient();
  }

  // Id de la table DeliveryPerson d'un utilisateur (différent de User.id)
  private async getDeliveryPersonId(userId?: string): Promise<string | null> {
    if (!userId) return null;
    const deliveryPerson = await this.prisma.deliveryPerson.findFirst({
      where: { profile: { userId } },
      select: { id: true }
    });
    return deliveryPerson?.id ?? null;
  }

  // Lève une erreur si l'utilisateur n'a pas accès à la commande
  private async assertCanAccessOrder(
    order: { customerId: string; restaurantId: string; deliveryPersonId: string | null },
    userId?: string,
    userRole?: string
  ) {
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') return;

    if (userRole === 'CUSTOMER' && order.customerId === userId) return;

    if (userRole === 'RESTAURANT_OWNER') {
      const restaurant = await this.prisma.restaurant.findFirst({
        where: { id: order.restaurantId, profile: { userId } },
        select: { id: true }
      });
      if (restaurant) return;
    }

    if (userRole === 'DELIVERY_PERSON' && order.deliveryPersonId) {
      if (order.deliveryPersonId === (await this.getDeliveryPersonId(userId))) return;
    }

    throw new Error('You do not have permission to access this order');
  }

  async createOrder(orderData: any, customerId: string) {
    try {
      const { restaurantId, items, deliveryAddressId, notes } = orderData;

      // Verify restaurant exists and is open
      const restaurant = await this.prisma.restaurant.findUnique({
        where: { id: restaurantId }
      });

      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      if (!restaurant.isOpen) {
        throw new Error('Restaurant is currently closed');
      }

      if (restaurant.verificationStatus !== 'VERIFIED') {
        throw new Error('Restaurant is not verified yet');
      }

      // Get customer profile ID
      const customerProfile = await this.prisma.profile.findUnique({
        where: { userId: customerId }
      });

      if (!customerProfile) {
        throw new Error('Customer profile not found');
      }

      // Verify delivery address belongs to customer
      const address = await this.prisma.address.findUnique({
        where: { id: deliveryAddressId }
      });

      if (!address || address.profileId !== customerProfile.id) {
        throw new Error('Invalid delivery address');
      }

      // Calculate order totals
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const menuItem = await this.prisma.menuItem.findUnique({
          where: { id: item.menuItemId }
        });

        if (!menuItem || menuItem.restaurantId !== restaurantId) {
          throw new Error(`Menu item ${item.menuItemId} not found or does not belong to this restaurant`);
        }

        if (!menuItem.isAvailable) {
          throw new Error(`Menu item ${menuItem.name} is not available`);
        }

        const price = menuItem.discountPrice !== null && menuItem.discountPrice < menuItem.price
          ? menuItem.discountPrice
          : menuItem.price;

        const totalPrice = price * item.quantity;
        subtotal += totalPrice;

        orderItemsData.push({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: price,
          totalPrice: totalPrice,
          notes: item.notes || null
        });
      }

      // Check minimum order requirement
      if (subtotal < restaurant.minimumOrder) {
        throw new Error(`Minimum order amount is ${restaurant.minimumOrder}`);
      }

      // Calculate delivery fee
      const deliveryFee = restaurant.deliveryFee;
      const taxAmount = (subtotal + deliveryFee) * 0.1; // 10% tax
      const totalAmount = subtotal + deliveryFee + taxAmount;

      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Create the order
      const order = await this.prisma.order.create({
        data: {
          orderNumber,
          customerId,
          restaurantId,
          subtotal,
          deliveryFee,
          taxAmount,
          totalAmount,
          paymentMethod: 'CASH', // Default, can be updated during payment
          paymentStatus: 'PENDING',
          // Copie de l'adresse : Address.orderId est unique, relier l'adresse enregistrée
          // la retirerait de la commande précédente
          deliveryAddress: {
            create: {
              street: address.street,
              city: address.city,
              postalCode: address.postalCode,
              country: address.country,
              latitude: address.latitude,
              longitude: address.longitude
            }
          },
          notes: notes || null,
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          deliveryAddress: true,
          customer: {
            include: {
              profile: true
            }
          },
          restaurant: true
        }
      });

      // Create initial order tracking
      await this.prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: 'PENDING',
          notes: 'Order created'
        }
      });

      return order;
    } catch (error) {
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrderById(orderId: string, userId?: string, userRole?: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          deliveryAddress: true,
          customer: {
            include: {
              profile: true
            }
          },
          restaurant: true,
          // Infos utiles au suivi côté client (pas les documents ni la vérification)
          deliveryPerson: {
            select: {
              id: true,
              vehicleType: true,
              currentLat: true,
              currentLng: true,
              rating: true,
              profile: {
                select: { firstName: true, lastName: true, phoneNumber: true, avatar: true }
              }
            }
          },
          tracking: {
            orderBy: {
              timestamp: 'asc'
            }
          },
          payments: true
        }
      });

      if (!order) {
        return null;
      }

      await this.assertCanAccessOrder(order, userId, userRole);

      return order;
    } catch (error) {
      logger.error('Error fetching order:', error);
      throw error;
    }
  }

  async getOrderTracking(orderId: string, userId?: string, userRole?: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: { customerId: true, restaurantId: true, deliveryPersonId: true }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      await this.assertCanAccessOrder(order, userId, userRole);

      const tracking = await this.prisma.orderTracking.findMany({
        where: { orderId },
        orderBy: { timestamp: 'asc' }
      });

      return tracking;
    } catch (error) {
      logger.error('Error fetching order tracking:', error);
      throw error;
    }
  }

  async getOrdersByUser(userId: string) {
    try {
      const orders = await this.prisma.order.findMany({
        where: { customerId: userId },
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          restaurant: true,
          tracking: {
            orderBy: {
              timestamp: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return orders;
    } catch (error) {
      logger.error('Error fetching user orders:', error);
      throw error;
    }
  }

  async getOrdersForRestaurant(restaurantId: string) {
    try {
      const orders = await this.prisma.order.findMany({
        where: { restaurantId },
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          customer: {
            include: {
              profile: true
            }
          },
          tracking: {
            orderBy: {
              timestamp: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return orders;
    } catch (error) {
      logger.error('Error fetching restaurant orders:', error);
      throw error;
    }
  }

  async getOrdersForDeliveryPerson(deliveryPersonId: string) {
    try {
      const orders = await this.prisma.order.findMany({
        where: { deliveryPersonId },
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          customer: {
            include: {
              profile: true
            }
          },
          restaurant: true,
          deliveryAddress: true,
          tracking: {
            orderBy: {
              timestamp: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return orders;
    } catch (error) {
      logger.error('Error fetching delivery person orders:', error);
      throw error;
    }
  }

  async getOrdersForAdmin(page: number = 1, limit: number = 10, filters?: { status?: string, restaurantId?: string }) {
    try {
      const skip = (page - 1) * limit;

      const where: any = {};
      if (filters?.status) {
        where.status = filters.status as OrderStatus;
      }
      if (filters?.restaurantId) {
        where.restaurantId = filters.restaurantId;
      }

      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          skip,
          take: limit,
          include: {
            items: {
              include: {
                menuItem: true
              }
            },
            customer: {
              include: {
                profile: true
              }
            },
            restaurant: true,
            tracking: {
              orderBy: {
                timestamp: 'desc'
              },
              take: 1
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        this.prisma.order.count({ where })
      ]);

      return {
        orders,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching admin orders:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: string, userId?: string, userRole?: string) {
    try {
      // Get current order
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          restaurant: {
            include: {
              profile: true
            }
          }
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

      if (userRole === 'RESTAURANT_OWNER' && order.restaurant.profile.userId !== userId) {
        throw new Error('You do not have permission to update this order');
      }

      if (userRole === 'DELIVERY_PERSON') {
        const deliveryPersonId = await this.getDeliveryPersonId(userId);
        if (!deliveryPersonId || order.deliveryPersonId !== deliveryPersonId) {
          throw new Error('You do not have permission to update this order');
        }
      }

      if (!isAdmin) {
        const allowed = STATUS_TRANSITIONS[userRole || '']?.[order.status] || [];
        if (!allowed.includes(status as OrderStatus)) {
          throw new Error(`Transition ${order.status} -> ${status} not allowed`);
        }
      } else if (FINAL_STATUSES.includes(order.status) && order.status === status) {
        throw new Error(`Order is already ${status}`);
      }

      // Update order status
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: status as OrderStatus,
          ...(status === 'DELIVERED' && { actualDelivery: new Date() })
        },
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          customer: {
            include: {
              profile: true
            }
          },
          restaurant: true
        }
      });

      // Create order tracking entry
      await this.prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: status as OrderStatus,
          notes: `Status updated to ${status}`
        }
      });

      // Paiement à la livraison : encaissé quand la commande est livrée
      if (status === 'DELIVERED' && order.paymentMethod === 'CASH' && order.paymentStatus !== 'COMPLETED') {
        const { count } = await this.prisma.payment.updateMany({
          where: { orderId: order.id, method: 'CASH', status: 'PENDING' },
          data: { status: 'COMPLETED', processedAt: new Date() }
        });
        if (count === 0) {
          await this.prisma.payment.create({
            data: { orderId: order.id, amount: order.totalAmount, method: 'CASH', status: 'COMPLETED', processedAt: new Date() }
          });
        }
        await this.prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'COMPLETED' }
        });
      }

      // Livraison terminée ou annulée : le livreur redevient disponible
      if (order.deliveryPersonId && FINAL_STATUSES.includes(status as OrderStatus)) {
        await this.prisma.deliveryPerson.update({
          where: { id: order.deliveryPersonId },
          data: { isAvailable: true }
        });
      }

      // Process gamification if delivered (la transition garantit un seul passage)
      if (status === 'DELIVERED' && order.status !== 'DELIVERED') {
        try {
          await processOrderCompletion(order.customerId, order.id);
        } catch (gamiError) {
          logger.error('Error processing gamification for order:', gamiError);
        }
      }

      return updatedOrder;
    } catch (error) {
      logger.error('Error updating order status:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string, userId: string, userRole: string) {
    try {
      // Get the order with related data
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: true,
          restaurant: true
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Check permissions
      if (userRole === 'CUSTOMER' && order.customerId !== userId) {
        throw new Error('You do not have permission to cancel this order');
      }

      if (userRole === 'RESTAURANT_OWNER') {
        const restaurant = await this.prisma.restaurant.findFirst({
          where: {
            id: order.restaurantId,
            profile: {
              userId: userId
            }
          }
        });

        if (!restaurant) {
          throw new Error('You do not have permission to cancel this order');
        }
      }

      // Check if order can be cancelled (only pending orders)
      if (order.status !== 'PENDING') {
        throw new Error('Only pending orders can be cancelled');
      }

      // Update order status
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED'
        },
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          deliveryAddress: true,
          customer: {
            include: {
              profile: true
            }
          },
          restaurant: true,
          tracking: {
            orderBy: {
              timestamp: 'asc'
            }
          }
        }
      });

      // Create order tracking entry
      await this.prisma.orderTracking.create({
        data: {
          orderId: orderId,
          status: 'CANCELLED',
          notes: 'Order cancelled by user'
        }
      });

      if (order.deliveryPersonId) {
        await this.prisma.deliveryPerson.update({
          where: { id: order.deliveryPersonId },
          data: { isAvailable: true }
        });
      }

      return updatedOrder;
    } catch (error) {
      logger.error('Error cancelling order:', error);
      throw error;
    }
  }

  async assignDeliveryPerson(orderId: string, deliveryPersonId: string) {
    try {
      // Verify delivery person exists and is available
      const deliveryPerson = await this.prisma.deliveryPerson.findUnique({
        where: { id: deliveryPersonId },
        include: {
          profile: true
        }
      });

      if (!deliveryPerson) {
        throw new Error('Delivery person not found');
      }

      if (!deliveryPerson.isAvailable) {
        throw new Error('Delivery person is not available');
      }

      if (deliveryPerson.verificationStatus !== 'VERIFIED') {
        throw new Error('Delivery person is not verified');
      }

      const current = await this.prisma.order.findUnique({ where: { id: orderId } });
      if (!current) {
        throw new Error('Order not found');
      }
      if (FINAL_STATUSES.includes(current.status)) {
        throw new Error(`Cannot assign a delivery person to a ${current.status} order`);
      }

      // Libère l'éventuel livreur précédent
      if (current.deliveryPersonId && current.deliveryPersonId !== deliveryPersonId) {
        await this.prisma.deliveryPerson.update({
          where: { id: current.deliveryPersonId },
          data: { isAvailable: true }
        });
      }

      // Update order with delivery person (le statut de préparation ne change pas)
      const order = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          deliveryPersonId
        },
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          customer: {
            include: {
              profile: true
            }
          },
          restaurant: true,
          deliveryPerson: {
            include: {
              profile: true
            }
          }
        }
      });

      // Create order tracking entry
      await this.prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: order.status,
          notes: `Assigned to delivery person ${deliveryPerson.profile?.firstName} ${deliveryPerson.profile?.lastName}`
        }
      });

      // Update delivery person availability
      await this.prisma.deliveryPerson.update({
        where: { id: deliveryPersonId },
        data: { isAvailable: false }
      });

      return order;
    } catch (error) {
      logger.error('Error assigning delivery person:', error);
      throw error;
    }
  }

  async getOrderByOrderNumber(orderNumber: string, userId?: string, userRole?: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { orderNumber },
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          deliveryAddress: true,
          customer: {
            include: {
              profile: true
            }
          },
          restaurant: true,
          tracking: {
            orderBy: {
              timestamp: 'asc'
            }
          }
        }
      });

      if (order) {
        await this.assertCanAccessOrder(order, userId, userRole);
      }

      return order;
    } catch (error) {
      logger.error('Error fetching order by number:', error);
      throw error;
    }
  }
}

// Export the class itself, not an instance
export default OrderService;
