import { z } from 'zod';

export const scheduleItemSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isOpen: z.boolean().optional(),
});

export const updateSchedulesSchema = z.object({
  schedules: z.array(scheduleItemSchema).min(1),
});

export type ScheduleItemInput = z.infer<typeof scheduleItemSchema>;
export type UpdateSchedulesInput = z.infer<typeof updateSchedulesSchema>;