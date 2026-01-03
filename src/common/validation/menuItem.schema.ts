import { z } from 'zod';

export const updateMenuItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  discountPrice: z.number().min(0).optional(),
  image: z.string().url().optional(),
  isAvailable: z.boolean().optional(),
  ingredients: z.string().optional(),
  allergens: z.string().optional(),
  preparationTime: z.number().int().min(0).optional(),
  categoryId: z.string().uuid().optional(),
});

export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;