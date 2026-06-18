import React from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PatientsIcon,
  EventAvailable as AvailabilityIcon,
  VideoCall as ConsultationsIcon,
  Description as PrescriptionIcon,
  TodayOutlined,
  VideoCallOutlined,
  PeopleOutlined,
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/doctor/dashboard', icon: <DashboardIcon /> },
  { label: 'My Patients', path: '/doctor/patients', icon: <PatientsIcon /> },
  { label: 'Availability', path: '/doctor/availability', icon: <AvailabilityIcon /> },
  { label: 'Consultations', path: '/doctor/consultations', icon: <ConsultationsIcon /> },
  { label: 'Prescriptions', path: '/doctor/prescriptions/new', icon: <PrescriptionIcon /> },
];

const DoctorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const doctorProfile = profile as { firstName?: string; specialization?: string } | null;

  const stats = [
    { title: "Today's Appointments", value: 0, icon: <TodayOutlined />, color: '#1565C0' },
    { title: 'Upcoming Consultations', value: 0, icon: <VideoCallOutlined />, color: '#00897B' },
    { title: 'Total Patients', value: 0, icon: <PeopleOutlined />, color: '#7B1FA2' },
    { title: 'Prescriptions Today', value: 0, icon: <PrescriptionIcon />, color: '#E65100' },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Doctor Dashboard">
      {/* Welcome */}
      <Box
        sx={{
          mb: 4, p: 3, borderRadius: 3,
          background: 'linear-gradient(135deg, #00695C 0%, #00897B 60%, #1565C0 100%)',
          color: 'white', position: 'relative', overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" sx={{ color: 'white', mb: 0.5, fontWeight: 700 }}>
            Good morning, Dr. {doctorProfile?.firstName || 'Doctor'} 👨‍⚕️
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {doctorProfile?.specialization || 'General Practitioner'} — Here's your schedule overview
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((s) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={s.title}>
            <Card sx={{ '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 30px ${alpha(s.color, 0.15)}` }, transition: 'all 0.2s' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }} gutterBottom>{s.title}</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>{s.value}</Typography>
                  </Box>
                  <Box sx={{ width: 52, height: 52, borderRadius: '14px', backgroundColor: alpha(s.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', '& svg': { color: s.color, fontSize: 26 } }}>
                    {s.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3 }}>Today's Schedule</Typography>
              <Box sx={{ textAlign: 'center', py: 6, backgroundColor: 'background.default', borderRadius: 2 }}>
                <TodayOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No appointments scheduled for today</Typography>
                <Button variant="outlined" sx={{ mt: 2 }} href="/doctor/availability">
                  Manage Availability
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>Quick Actions</Typography>
              {[
                { label: 'View Patients', path: '/doctor/patients', color: '#1565C0' },
                { label: 'Set Availability', path: '/doctor/availability', color: '#00897B' },
                { label: 'Write Prescription', path: '/doctor/prescriptions/new', color: '#7B1FA2' },
              ].map((a) => (
                <Button key={a.label} fullWidth variant="outlined" href={a.path}
                  sx={{ mb: 1.5, justifyContent: 'flex-start', borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: a.color, color: a.color } }}>
                  {a.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};
export default DoctorDashboard;
