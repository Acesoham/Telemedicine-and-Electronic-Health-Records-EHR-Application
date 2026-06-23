import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach access token
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('medivault_access_token');
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401 and token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {                                                                
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Token expired — attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('medivault_refresh_token');

      if (!refreshToken) {
        processQueue(new Error('No refresh token'), null);
        isRefreshing = false;
        // Redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('medivault_access_token', newAccessToken);
        localStorage.setItem('medivault_refresh_token', newRefreshToken);

        processQueue(null, newAccessToken);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        isRefreshing = false;
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;

// ──────────────────────────────────────────────────────────────
// Auth API
// ──────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse>('/auth/register', data),

  login: (email: string, password: string) =>
    apiClient.post<ApiResponse>('/auth/login', { email, password }),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse>('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post<ApiResponse>('/auth/logout', { refreshToken }),

  getProfile: () => apiClient.get<ApiResponse>('/auth/profile'),
  updateDoctorProfile: (data: Record<string, unknown>) =>
    apiClient.put<ApiResponse>('/auth/profile/doctor', data),
};

// ──────────────────────────────────────────────────────────────
// EHR API
// ──────────────────────────────────────────────────────────────
export const ehrApi = {
  getRecord: (patientId: string) => apiClient.get<ApiResponse>(`/ehr/${patientId}`),
  getMyRecord: () => apiClient.get<ApiResponse>('/ehr/my-record'),
  updateMyRecord: (data: Record<string, unknown>) =>
    apiClient.put<ApiResponse>('/ehr/my-record', data),
  updateRecord: (patientId: string, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse>(`/ehr/${patientId}`, data),
  getPatientRecord: (patientId: string) =>
    apiClient.get<ApiResponse>(`/ehr/patient/${patientId}`),
  uploadReport: (patientId: string, formData: FormData) =>
    apiClient.post<ApiResponse>(`/ehr/${patientId}/reports`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ──────────────────────────────────────────────────────────────
// Appointments API
// ──────────────────────────────────────────────────────────────
export const appointmentsApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get<ApiResponse>('/appointments', { params }),
  getById: (id: string) =>
    apiClient.get<ApiResponse>(`/appointments/${id}`),
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse>('/appointments', data),
  confirm: (id: string) => apiClient.put<ApiResponse>(`/appointments/${id}/confirm`),
  cancel: (id: string, reason?: string) =>
    apiClient.put<ApiResponse>(`/appointments/${id}/cancel`, { reason }),
  getDoctorSlots: (doctorId: string, date: string) =>
    apiClient.get<ApiResponse>(`/doctors/${doctorId}/slots`, { params: { date } }),
  updateDoctorSlots: (doctorId: string, slots: unknown[]) =>
    apiClient.put<ApiResponse>(`/doctors/${doctorId}/slots`, { slots }),
};

// ──────────────────────────────────────────────────────────────
// Doctors API
// ──────────────────────────────────────────────────────────────
export const doctorsApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get<ApiResponse>('/appointments/doctors', { params }),
  getById: (id: string) =>
    apiClient.get<ApiResponse>(`/appointments/doctors/${id}`),
};

// ──────────────────────────────────────────────────────────────
// Prescriptions API
// ──────────────────────────────────────────────────────────────
export const prescriptionsApi = {
  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse>('/prescriptions', data),
  getById: (id: string) => apiClient.get<ApiResponse>(`/prescriptions/${id}`),
  getMyPrescriptions: () =>
    apiClient.get<ApiResponse>('/prescriptions/my'),
  download: (id: string) =>
    apiClient.get(`/prescriptions/${id}/download`, { responseType: 'blob' }),
  getPatientPrescriptions: (patientId: string) =>
    apiClient.get<ApiResponse>(`/prescriptions/patient/${patientId}`),
  verify: (hash: string) => apiClient.get<ApiResponse>(`/prescriptions/verify/${hash}`),
};

// ──────────────────────────────────────────────────────────────
// Admin API
// ──────────────────────────────────────────────────────────────
export const adminApi = {
  getUsers: (params?: Record<string, unknown>) =>
    apiClient.get<ApiResponse>('/admin/users', { params }),
  toggleUserStatus: (id: string) =>
    apiClient.put<ApiResponse>(`/admin/users/${id}/status`),
  getAuditLogs: (params?: Record<string, unknown>) =>
    apiClient.get<ApiResponse>('/admin/audit-logs', { params }),
  getAnalytics: () => apiClient.get<ApiResponse>('/admin/analytics'),
  getDoctors: (params?: Record<string, unknown>) =>
    apiClient.get<ApiResponse>('/admin/doctors', { params }),
  verifyDoctor: (doctorId: string) =>
    apiClient.put<ApiResponse>(`/admin/doctors/${doctorId}/verify`),
};
