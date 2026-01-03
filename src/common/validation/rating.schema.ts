import { z } from 'zod';

export const createRatingSchema = z.object({
  restaurantId: z.string().uuid(),
  orderId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const deleteRatingSchema = z.object({
  id: z.string().uuid(),
});

export type CreateRatingInput = z.infer<typeof createRatingSchema>;
export type DeleteRatingInput = z.infer<typeof deleteRatingSchema>;