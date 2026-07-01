// Shared TypeScript types for the MediVault frontend

export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface PatientProfile {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: number;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  phone: string;
  address: string;
  bloodGroup?: string;
  profilePhoto?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface DoctorProfile {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  specialization: string;
  licenseNumber: string;
  phone: string;
  bio: string;
  qualifications: string[];
  yearsOfExperience: number;
  isVerified: boolean;
  isAcceptingAppointments: boolean;
  consultationDurationMinutes: number;
  availabilitySlots: AvailabilitySlot[];
  profilePhoto?: string;
}

export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Appointment {
  _id: string;
  patientId: string | PatientProfile;
  doctorId: string | DoctorProfile;
  scheduledAt: string;
  endsAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  timezone: string;
  roomToken?: string;
  chiefComplaint: string;
  notes?: string;
  createdAt: string;
}

export interface MedicalRecord {
  _id: string;
  patientId: string;
  demographics: string;
  allergies: string;
  medicalHistory: string;
  diagnoses: string;
  consultationNotes: string;
  reports: ReportFile[];
  lastUpdatedBy: string;
  updatedAt: string;
}

export interface ReportFile {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
  description?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  _id: string;
  prescriptionId: string;
  appointmentId: string;
  doctorId: string | DoctorProfile;
  patientId: string | PatientProfile;
  medications: Medication[];
  instructions: string;
  diagnosis: string;
  prescriptionHash: string;
  qrCodeData: string;
  isValid: boolean;
  expiresAt: string;
  createdAt: string;
}

export type RecordingStatus = 'RECORDING' | 'COMPLETED' | 'FAILED';

export interface Recording {
  _id: string;
  appointmentId: string | Appointment;
  doctorId: string | DoctorProfile;
  patientId: string | PatientProfile;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  status: RecordingStatus;
  recordingDataUrl?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  userId?: string;
  userEmail?: string;
  role?: UserRole;
  action: string;
  ipAddress: string;
  resource?: string;
  resourceId?: string;
  success: boolean;
  timestamp: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface DashboardStats {
  totalPatients?: number;
  totalDoctors?: number;
  totalAppointments?: number;
  upcomingAppointments?: number;
  completedConsultations?: number;
}
