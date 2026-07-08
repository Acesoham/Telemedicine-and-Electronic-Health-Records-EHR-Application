/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Skeleton, Alert,
  alpha, Divider, Tooltip, IconButton
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People as PatientsIcon, EventAvailable as AvailabilityIcon,
  VideoCall as ConsultationsIcon, Description as PrescriptionIcon, Person as PersonIcon,
  CalendarToday as CalendarIcon, Refresh, BarChart, AttachMoney, MedicalServices, CheckCircle
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import { appointmentsApi } from '../../services/api';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/doctor/dashboard', icon: <DashboardIcon /> },
  { label: 'My Patients', path: '/doctor/patients', icon: <PatientsIcon /> },
  { label: 'Appointments', path: '/doctor/appointments', icon: <CalendarIcon /> },
  { label: 'Availability', path: '/doctor/availability', icon: <AvailabilityIcon /> },
  { label: 'Consultations', path: '/doctor/consultations', icon: <ConsultationsIcon /> },
  { label: 'Prescriptions', path: '/doctor/prescriptions/new', icon: <PrescriptionIcon /> },
  { label: 'Analytics', path: '/doctor/analytics', icon: <BarChart /> },
  { label: 'My Profile', path: '/doctor/profile', icon: <PersonIcon /> },
];

const COLORS = ['#00897B', '#1565C0', '#F57F17', '#7B1FA2', '#E65100'];

// ─── Animated Stat Card ──────────────────────────────────────
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color: string;
  icon: React.ReactNode;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color, icon, loading }) => (
  <Card sx={{
    height: '100%',
    transition: 'all 0.25s ease',
    '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 12px 32px ${alpha(color, 0.2)}` },
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{
          width: 50, height: 50, borderRadius: '14px',
          bgcolor: alpha(color, 0.12),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          '& svg': { color, fontSize: 26 },
        }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700,  textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 800,  color, mt: 0.5, lineHeight: 1.1 }}>
        {loading ? <Skeleton width={60} /> : value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {loading ? <Skeleton width={80} /> : subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

type DoctorAnalyticsData = {
  totalEarnings: number;
  totalUniquePatients: number;
  patientRetentionRate: number;
  frequentDiagnoses: { name: string; count: number }[];
  appointmentTrend: { date: string; count: number }[];
  completedConsultations: number;
};

const DoctorAnalytics: React.FC = () => {
  const [data, setData] = useState<DoctorAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await appointmentsApi.getDoctorAnalytics();
      setData(res.data.data as any);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch doctor analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const trendData = (data?.appointmentTrend ?? []).map(t => ({
    name: new Date(t.date).toLocaleDateString('en-IN', { weekday: 'short' }),
    Appointments: t.count,
  }));

  const pieData = (data?.frequentDiagnoses ?? []).map(d => ({
    name: d.name,
    value: d.count,
  }));

  const kpiCards: StatCardProps[] = [
    { title: 'Total Earnings',        value: `₹${data?.totalEarnings?.toLocaleString() ?? 0}`, color: '#2E7D32', icon: <AttachMoney />, subtitle: 'Mocked (₹100 per completed)' },
    { title: 'Unique Patients',       value: data?.totalUniquePatients ?? 0,                   color: '#1565C0', icon: <PatientsIcon /> },
    { title: 'Patient Retention',     value: `${data?.patientRetentionRate ?? 0}%`,            color: '#7B1FA2', icon: <CheckCircle />, subtitle: 'Patients with >1 appointment' },
    { title: 'Completed Appts',       value: data?.completedConsultations ?? 0,                color: '#E65100', icon: <ConsultationsIcon /> },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Doctor Analytics">
      {/* Hero */}
      <Box sx={{
        mb: 3, p: 3, borderRadius: 3,
        background: 'linear-gradient(135deg, #00695C 0%, #00897B 60%, #1565C0 100%)',
        color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
      }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>My Analytics</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Track your performance, earnings, and patient demographics.
          </Typography>
          {lastUpdated && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5, display: 'block' }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
        <Tooltip title="Refresh data">
          <IconButton onClick={fetchAnalytics} disabled={loading}
            sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
            <Refresh sx={{ animation: loading ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } }} />
          </IconButton>
        </Tooltip>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      {/* KPI Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {kpiCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.title}>
            <StatCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 7-Day Trend */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>7-Day Appointment Trend</Typography>
              </Box>
              {loading ? <Skeleton variant="rectangular" height={300} /> : (
                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00897B" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00897B" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="Appointments" stroke="#00897B" strokeWidth={3} fillOpacity={1} fill="url(#colorAppts)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Diagnoses Donut */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Frequent Diagnoses</Typography>
              {loading ? <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} /> : (
                <Box sx={{ width: '100%', height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {pieData.map((entry, index) => (
                      <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length] }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{entry.name}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default DoctorAnalytics;
