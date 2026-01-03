import { z } from 'zod';

export const createRestaurantSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  cuisine: z.string().min(1),
  deliveryTime: z.number().min(0),
  deliveryFee: z.number().min(0),
  minimumOrder: z.number().min(0),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  schedules: z.array(
    z.object({
      dayOfWeek: z.number().min(0).max(6),
      openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
      closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
      isOpen: z.boolean().optional(),
    })
  ).optional(),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;