import { z } from 'zod';
export declare const updateLocationSchema: z.ZodObject<{
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
}, z.core.$strip>;
export declare const updateAvailabilitySchema: z.ZodObject<{
    isAvailable: z.ZodBoolean;
}, z.core.$strip>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
