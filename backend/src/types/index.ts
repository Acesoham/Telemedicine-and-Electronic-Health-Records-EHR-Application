// Shared TypeScript types and interfaces across the MediVault backend

export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export type AuditAction =
  | 'USER_REGISTER'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_UPDATE'
  | 'VIEW_RECORD'
  | 'CREATE_RECORD'
  | 'UPDATE_RECORD'
  | 'DELETE_RECORD'
  | 'BOOK_APPOINTMENT'
  | 'CONFIRM_APPOINTMENT'
  | 'CANCEL_APPOINTMENT'
  | 'JOIN_CONSULTATION'
  | 'LEAVE_CONSULTATION'
  | 'CREATE_PRESCRIPTION'
  | 'VIEW_PRESCRIPTION'
  | 'DOWNLOAD_PRESCRIPTION'
  | 'ADMIN_ACTION'
  | 'FAILED_LOGIN'
  | 'UNAUTHORIZED_ACCESS';

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
}

// Express Request augmentation
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
