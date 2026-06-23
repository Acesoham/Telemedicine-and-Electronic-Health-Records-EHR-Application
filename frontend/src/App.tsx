import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme';
import ProtectedRoute from './components/common/ProtectedRoute';

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const PatientAppointments = lazy(() => import('./pages/patient/PatientAppointments'));
const PatientPrescriptions = lazy(() => import('./pages/patient/PatientPrescriptions'));
const PatientRecords = lazy(() => import('./pages/patient/PatientRecords'));

const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const DoctorAppointments = lazy(() => import('./pages/doctor/DoctorAppointments'));
const DoctorProfile = lazy(() => import('./pages/doctor/DoctorProfile'));
const PrescriptionGenerator = lazy(() => import('./pages/doctor/PrescriptionGenerator'));
const ConsultationRoom = lazy(() => import('./pages/shared/ConsultationRoom'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));

// Stub pages (fully implemented in later phases)
const {
  DoctorPatients,
  DoctorAvailability,
  DoctorConsultations,
  AdminUsers,
  AdminAnalytics,
} = {
  DoctorPatients: lazy(() => import('./pages/StubPages').then(m => ({ default: m.DoctorPatients }))),
  DoctorAvailability: lazy(() => import('./pages/StubPages').then(m => ({ default: m.DoctorAvailability }))),
  DoctorConsultations: lazy(() => import('./pages/StubPages').then(m => ({ default: m.DoctorConsultations }))),
  AdminUsers: lazy(() => import('./pages/StubPages').then(m => ({ default: m.AdminUsers }))),
  AdminAnalytics: lazy(() => import('./pages/StubPages').then(m => ({ default: m.AdminAnalytics }))),
};

const LoadingFallback: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'background.default',
    }}
  >
    <CircularProgress size={48} thickness={4} />
  </Box>
);

// Root redirect based on role
const RootRedirect: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <LoadingFallback />;

  // Unauthenticated visitors see the homepage
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <HomePage />
      </Suspense>
    );
  }

  const routes: Record<string, string> = {
    PATIENT: '/patient/dashboard',
    DOCTOR: '/doctor/dashboard',
    ADMIN: '/admin/dashboard',
  };

  return <Navigate to={routes[user!.role] || '/login'} replace />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Root */}
              <Route path="/" element={<RootRedirect />} />

              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Patient Routes */}
              <Route
                path="/patient/*"
                element={
                  <ProtectedRoute allowedRoles={['PATIENT']}>
                    <Routes>
                      <Route path="dashboard" element={<PatientDashboard />} />
                      <Route path="records" element={<PatientRecords />} />
                      <Route path="appointments" element={<PatientAppointments />} />
                      <Route path="prescriptions" element={<PatientPrescriptions />} />
                      <Route path="consultation/:roomToken" element={<ConsultationRoom />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />

              {/* Doctor Routes */}
              <Route
                path="/doctor/*"
                element={
                  <ProtectedRoute allowedRoles={['DOCTOR']}>
                    <Routes>
                      <Route path="dashboard" element={<DoctorDashboard />} />
                      <Route path="appointments" element={<DoctorAppointments />} />
                      <Route path="profile" element={<DoctorProfile />} />
                      <Route path="patients" element={<DoctorPatients />} />
                      <Route path="availability" element={<DoctorAvailability />} />
                      <Route path="consultations" element={<DoctorConsultations />} />
                      <Route path="consultation/:roomToken" element={<ConsultationRoom />} />
                      <Route path="prescriptions/new" element={<PrescriptionGenerator />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="audit-logs" element={<AdminAuditLogs />} />
                      <Route path="analytics" element={<AdminAnalytics />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
