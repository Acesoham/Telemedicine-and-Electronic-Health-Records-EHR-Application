import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, alpha } from '@mui/material';
import {
  Dashboard as DashboardIcon, People, AdminPanelSettings,
  BarChart, Security, EventNote, HealthAndSafety,
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { label: 'User Management', path: '/admin/users', icon: <People /> },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: <Security /> },
  { label: 'Analytics', path: '/admin/analytics', icon: <BarChart /> },
];

const stats = [
  { title: 'Total Patients', value: '—', icon: <People />, color: '#1565C0' },
  { title: 'Total Doctors', value: '—', icon: <AdminPanelSettings />, color: '#00897B' },
  { title: 'Appointments Today', value: '—', icon: <EventNote />, color: '#7B1FA2' },
  { title: 'System Health', value: '✓ Online', icon: <HealthAndSafety />, color: '#2E7D32' },
];

const AdminDashboard: React.FC = () => (
  <DashboardLayout navItems={navItems} title="Admin Dashboard">
    <Box sx={{ mb: 4, p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #1A2332 0%, #2D3748 100%)', color: 'white' }}>
      <Typography variant="h2" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>Admin Control Center</Typography>
      <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>MediVault Platform Management & Monitoring</Typography>
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
            <Typography variant="h5" sx={{ mb: 3 }}>Recent Audit Activity</Typography>
            <Box sx={{ textAlign: 'center', py: 5, backgroundColor: 'background.default', borderRadius: 2 }}>
              <Security sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">Connect to database to view audit logs</Typography>
              <Button variant="outlined" size="small" sx={{ mt: 2 }} href="/admin/audit-logs">View Audit Logs</Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2 }}>Admin Actions</Typography>
            {[
              { label: 'Manage Users', path: '/admin/users' },
              { label: 'View Audit Logs', path: '/admin/audit-logs' },
              { label: 'Analytics Report', path: '/admin/analytics' },
            ].map((a) => (
              <Button key={a.label} fullWidth variant="outlined" href={a.path}
                sx={{ mb: 1.5, justifyContent: 'flex-start', borderColor: 'divider', color: 'text.primary' }}>
                {a.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </DashboardLayout>
);

export default AdminDashboard;
