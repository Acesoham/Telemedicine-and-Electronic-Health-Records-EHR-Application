/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, alpha, Skeleton, Alert } from '@mui/material';
import {
  Dashboard as DashboardIcon, People, AdminPanelSettings,
  BarChart, Security, EventNote, HealthAndSafety, VideoCall,
  TrendingUp, Person, MedicalServices,
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import { adminApi } from '../../services/api';

const navItems: NavItem[] = [
  { label: 'Dashboard',       path: '/admin/dashboard',  icon: <DashboardIcon /> },
  { label: 'User Management', path: '/admin/users',       icon: <People /> },
  { label: 'Audit Logs',      path: '/admin/audit-logs', icon: <Security /> },
  { label: 'Analytics',       path: '/admin/analytics',  icon: <BarChart /> },
  { label: 'Recordings',      path: '/admin/recordings', icon: <VideoCall /> },
];

type Analytics = {
  totalUsers?: number;
  totalPatients?: number;
  totalDoctors?: number;
  totalAppointments?: number;
  appointmentStatusBreakdown?: Record<string, number>;
  recentSignups?: number;
  unverifiedDoctors?: number;
};

const AdminDashboard: React.FC = () => {
  const [data, setData]       = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    adminApi.getAnalytics()
      .then(res => setData(res.data.data as any))
      .catch((err: any) => setError(err.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { title: 'Total Patients',      value: data?.totalPatients      ?? 0, icon: <Person />,           color: '#1565C0' },
    { title: 'Total Doctors',       value: data?.totalDoctors       ?? 0, icon: <MedicalServices />,  color: '#00897B' },
    { title: 'Total Appointments',  value: data?.totalAppointments  ?? 0, icon: <EventNote />,         color: '#7B1FA2' },
    { title: 'System Health',       value: '✓ Online',                    icon: <HealthAndSafety />,   color: '#2E7D32', noFetch: true },
  ];

  const recentItems = [
    { label: 'New signups (7 days)',     value: data?.recentSignups     ?? 0, color: '#1565C0', icon: <TrendingUp /> },
    { label: 'Pending doctor verify',    value: data?.unverifiedDoctors ?? 0, color: '#E65100', icon: <AdminPanelSettings /> },
    { label: 'Confirmed appointments',   value: data?.appointmentStatusBreakdown?.CONFIRMED ?? 0, color: '#2E7D32', icon: <EventNote /> },
    { label: 'Cancelled appointments',   value: data?.appointmentStatusBreakdown?.CANCELLED ?? 0, color: '#C62828', icon: <EventNote /> },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Admin Dashboard">
      {/* Hero */}
      <Box sx={{ mb: 4, p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #1A2332 0%, #2D3748 100%)', color: 'white' }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, mb: 0.5 }}>Admin Control Center</Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>MediVault Platform Management &amp; Monitoring</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((s) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={s.title}>
            <Card sx={{ '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 30px ${alpha(s.color, 0.15)}` }, transition: 'all 0.2s' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>{s.title}</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {loading && !s.noFetch ? <Skeleton width={60} /> : s.value}
                    </Typography>
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
        {/* Recent metrics */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700,  mb: 3 }}>Platform Overview</Typography>
              {loading
                ? [...Array(4)].map((_, i) => <Skeleton key={i} height={48} sx={{ mb: 1 }} />)
                : (
                  <Box>
                    {recentItems.map((item) => (
                      <Box key={item.label} sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        p: 2, mb: 1, borderRadius: 2, bgcolor: 'action.hover',
                        '&:hover': { bgcolor: alpha(item.color, 0.06) }, transition: 'all 0.15s',
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(item.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', '& svg': { color: item.color, fontSize: 18 } }}>
                            {item.icon}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.label}</Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800,  color: item.color }}>{item.value}</Typography>
                      </Box>
                    ))}
                  </Box>
                )
              }
            </CardContent>
          </Card>
        </Grid>

        {/* Quick actions */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700,  mb: 2 }}>Quick Actions</Typography>
              {[
                { label: 'Manage Users',     path: '/admin/users',      color: '#1565C0' },
                { label: 'View Audit Logs',  path: '/admin/audit-logs', color: '#7B1FA2' },
                { label: 'Analytics Report', path: '/admin/analytics',  color: '#00897B' },
                { label: 'Recordings',       path: '/admin/recordings', color: '#E65100' },
              ].map((a) => (
                <Button key={a.label} fullWidth variant="outlined" href={a.path}
                  sx={{ mb: 1.5, justifyContent: 'flex-start', borderColor: 'divider', color: a.color, '&:hover': { borderColor: a.color, bgcolor: alpha(a.color, 0.05) } }}>
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

export default AdminDashboard;
