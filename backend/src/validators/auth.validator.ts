import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  role: z.enum(['PATIENT', 'DOCTOR']),
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  // Patient-specific (required if role = PATIENT)
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  phone: z.string().optional(),
  // Doctor-specific (required if role = DOCTOR)
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
