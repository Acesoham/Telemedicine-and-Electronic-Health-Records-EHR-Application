import { z } from 'zod';

export const updateRecordSchema = z.object({
  demographics: z.record(z.string(), z.any()).optional(),
  allergies: z.array(z.string()).optional(),
  medicalHistory: z.string().optional(),
});

export const addDiagnosisSchema = z.object({
  code: z.string().optional(),
  description: z.string().min(2, 'Description must be at least 2 characters'),
  diagnosedAt: z.string().datetime().optional(),
});

export const addConsultationNoteSchema = z.object({
  note: z.string().min(2, 'Note cannot be empty'),
});
