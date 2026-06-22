import { z } from 'zod';

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  scheduledAt: z
    .string()
    .min(1, 'Scheduled time is required')
    .refine((v) => !isNaN(Date.parse(v)), { message: 'Invalid date/time format' }),
  chiefComplaint: z
    .string()
    .min(3, 'Chief complaint must be at least 3 characters')
    .max(500, 'Chief complaint too long')
    .trim(),
  timezone: z.string().default('UTC'),
  notes: z.string().max(1000).optional(),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const listAppointmentsQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
