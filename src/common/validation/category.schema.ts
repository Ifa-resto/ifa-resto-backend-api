import { z } from 'zod';

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;