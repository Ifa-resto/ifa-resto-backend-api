import { z } from 'zod';

export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const updateAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;