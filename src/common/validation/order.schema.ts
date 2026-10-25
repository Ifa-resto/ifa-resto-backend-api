import { z } from 'zod';

export const createOrderSchema = z.object({
  restaurantId: z.string().uuid(),
  items: z.array(
    z.object({
      menuItemId: z.string().uuid(),
      quantity: z.number().min(1),
      notes: z.string().optional(),
    })
  ).min(1),
  deliveryAddressId: z.string().uuid(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'PAYPAL', 'STRIPE', 'MOBILE_PAYMENT']).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'PICKED_UP',
    'ON_THE_WAY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;