import { z } from 'zod';
export declare const processPaymentSchema: z.ZodObject<{
    orderId: z.ZodString;
    amount: z.ZodNumber;
    method: z.ZodEnum<{
        CASH: "CASH";
        CARD: "CARD";
        PAYPAL: "PAYPAL";
        STRIPE: "STRIPE";
        MOBILE_PAYMENT: "MOBILE_PAYMENT";
    }>;
    cardToken: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const refundPaymentSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
