import { z } from 'zod';

export const processPaymentSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum(['CASH', 'CARD', 'PAYPAL', 'STRIPE', 'MOBILE_PAYMENT']),
  cardToken: z.string().optional(), // For card payments
});

export const refundPaymentSchema = z.object({
  reason: z.string().min(1).optional(),
});

export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;