import { z } from 'zod';
export declare const createRestaurantSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    cuisine: z.ZodString;
    deliveryTime: z.ZodNumber;
    deliveryFee: z.ZodNumber;
    minimumOrder: z.ZodNumber;
    address: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    schedules: z.ZodOptional<z.ZodArray<z.ZodObject<{
        dayOfWeek: z.ZodNumber;
        openTime: z.ZodString;
        closeTime: z.ZodString;
        isOpen: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updateRestaurantSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    cuisine: z.ZodOptional<z.ZodString>;
    deliveryTime: z.ZodOptional<z.ZodNumber>;
    deliveryFee: z.ZodOptional<z.ZodNumber>;
    minimumOrder: z.ZodOptional<z.ZodNumber>;
    address: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
        latitude: z.ZodOptional<z.ZodNumber>;
        longitude: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    schedules: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        dayOfWeek: z.ZodNumber;
        openTime: z.ZodString;
        closeTime: z.ZodString;
        isOpen: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>>>;
}, z.core.$strip>;
export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
