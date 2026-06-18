import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { Assignment, People, Security, BarChart, EventAvailable, VideoCall, Description } from '@mui/icons-material';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const createStubPage = (
  title: string,
  description: string,
  icon: React.ReactNode,
  navItems: { label: string; path: string; icon: React.ReactNode }[]
) => {
  const StubPage: React.FC = () => {
    const navigate = useNavigate();
    return (
      <DashboardLayout navItems={navItems} title={title}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Box sx={{ mb: 3, '& svg': { fontSize: 64, color: 'primary.main', opacity: 0.6 } }}>
              {icon}
            </Box>
            <Typography variant="h3" gutterBottom>{title}</Typography>
            <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
              {description}
            </Typography>
            <Button variant="contained" onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  };
  return StubPage;
};

// Patient nav
const patientNav = [
  { label: 'Dashboard', path: '/patient/dashboard', icon: <Assignment /> },
  { label: 'Medical Records', path: '/patient/records', icon: <Assignment /> },
  { label: 'Appointments', path: '/patient/appointments', icon: <EventAvailable /> },
  { label: 'Prescriptions', path: '/patient/prescriptions', icon: <Description /> },
];

// Doctor nav
const doctorNav = [
  { label: 'Dashboard', path: '/doctor/dashboard', icon: <Assignment /> },
  { label: 'My Patients', path: '/doctor/patients', icon: <People /> },
  { label: 'Availability', path: '/doctor/availability', icon: <EventAvailable /> },
  { label: 'Consultations', path: '/doctor/consultations', icon: <VideoCall /> },
  { label: 'Prescriptions', path: '/doctor/prescriptions/new', icon: <Description /> },
];

// Admin nav
const adminNav = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <Assignment /> },
  { label: 'User Management', path: '/admin/users', icon: <People /> },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: <Security /> },
  { label: 'Analytics', path: '/admin/analytics', icon: <BarChart /> },
];

export const PatientRecords = createStubPage(
  'Medical Records',
  'Your complete encrypted medical history including diagnoses, allergies, and consultation notes will appear here.',
  <Assignment />,
  patientNav
);

export const PatientAppointments = createStubPage(
  'Appointments',
  'Browse available doctors, book consultations, and manage your appointment schedule.',
  <EventAvailable />,
  patientNav
);

export const PatientPrescriptions = createStubPage(
  'Prescriptions',
  'View and download your digital prescriptions with QR code verification.',
  <Description />,
  patientNav
);

export const ConsultationRoom = createStubPage(
  'Consultation Room',
  'Secure peer-to-peer video consultation powered by WebRTC. Camera and microphone controls will be available here.',
  <VideoCall />,
  patientNav
);

export const DoctorPatients = createStubPage(
  'My Patients',
  'View and manage your patient list, access encrypted medical records and consultation history.',
  <People />,
  doctorNav
);

export const DoctorAvailability = createStubPage(
  'Availability Management',
  'Set your weekly availability schedule and consultation slot duration.',
  <EventAvailable />,
  doctorNav
);

export const DoctorConsultations = createStubPage(
  'Consultations',
  'View upcoming and past consultations. Join active video consultation rooms.',
  <VideoCall />,
  doctorNav
);

export const PrescriptionGenerator = createStubPage(
  'Prescription Generator',
  'Create professional digital prescriptions with medication details and dosage instructions. PDF generated automatically.',
  <Description />,
  doctorNav
);

export const AdminUsers = createStubPage(
  'User Management',
  'Manage patients and doctors, verify licenses, and control account access.',
  <People />,
  adminNav
);

export const AdminAuditLogs = createStubPage(
  'Audit Logs',
  'Immutable audit trail of all critical platform operations including logins, record access, and prescriptions.',
  <Security />,
  adminNav
);

export const AdminAnalytics = createStubPage(
  'Analytics',
  'Platform metrics including appointment trends, consultation statistics, and system health monitoring.',
  <BarChart />,
  adminNav
);
