import { z } from 'zod';
export declare const createOrderSchema: z.ZodObject<{
    restaurantId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        menuItemId: z.ZodString;
        quantity: z.ZodNumber;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    deliveryAddress: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    notes: z.ZodOptional<z.ZodString>;
    paymentMethod: z.ZodEnum<{
        CASH: "CASH";
        CARD: "CARD";
        PAYPAL: "PAYPAL";
        STRIPE: "STRIPE";
        MOBILE_PAYMENT: "MOBILE_PAYMENT";
    }>;
}, z.core.$strip>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        PENDING: "PENDING";
        CONFIRMED: "CONFIRMED";
        PREPARING: "PREPARING";
        READY_FOR_PICKUP: "READY_FOR_PICKUP";
        PICKED_UP: "PICKED_UP";
        ON_THE_WAY: "ON_THE_WAY";
        DELIVERED: "DELIVERED";
        CANCELLED: "CANCELLED";
        REFUNDED: "REFUNDED";
    }>;
}, z.core.$strip>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
