/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Skeleton, Alert,
  alpha, Divider, Avatar, List, ListItem, ListItemAvatar,
  ListItemText, IconButton, Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People, Security, BarChart,
  TrendingUp, EventNote, VideoCall, MedicalServices,
  HealthAndSafety, Refresh, Person, CheckCircle, Cancel,
  AccessTime, MonitorHeart, AttachMoney
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import { adminApi } from '../../services/api';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const navItems: NavItem[] = [
  { label: 'Dashboard',       path: '/admin/dashboard',  icon: <DashboardIcon /> },
  { label: 'User Management', path: '/admin/users',       icon: <People /> },
  { label: 'Audit Logs',      path: '/admin/audit-logs', icon: <Security /> },
  { label: 'Analytics',       path: '/admin/analytics',  icon: <BarChart /> },
  { label: 'Recordings',      path: '/admin/recordings', icon: <VideoCall /> },
];

// ─── Animated Stat Card ──────────────────────────────────────
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color: string;
  icon: React.ReactNode;
  loading?: boolean;
  trend?: { value: number; up: boolean };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color, icon, loading, trend }) => (
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
        {trend && !loading && (
          <Chip
            label={`${trend.up ? '↑' : '↓'} ${Math.abs(trend.value)}%`}
            size="small"
            sx={{
              bgcolor: trend.up ? alpha('#2E7D32', 0.1) : alpha('#C62828', 0.1),
              color: trend.up ? '#2E7D32' : '#C62828',
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          />
        )}
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

const COLORS = ['#1565C0', '#2E7D32', '#F57F17', '#C62828', '#7B1FA2', '#00897B'];

type Analytics = {
  totalUsers?: number;
  totalPatients?: number;
  totalDoctors?: number;
  totalAppointments?: number;
  appointmentStatusBreakdown?: {
    CONFIRMED?: number;
    PENDING?: number;
    CANCELLED?: number;
    COMPLETED?: number;
  };
  totalPrescriptions?: number;
  totalConsultations?: number;
  totalRevenue?: number;
  recentSignups?: number;
  unverifiedDoctors?: number;
  topSpecializations?: { _id: string; count: number }[];
  appointmentTrend?: { date: string; count: number }[];
  patientDemographics?: { _id: number | string; count: number }[];
};

const AdminAnalytics: React.FC = () => {
  const [data, setData]       = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getAnalytics();
      setData(res.data.data as any);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const totalAppts  = data?.totalAppointments ?? 0;
  const confirmed   = data?.appointmentStatusBreakdown?.CONFIRMED  ?? 0;
  const pending     = data?.appointmentStatusBreakdown?.PENDING    ?? 0;
  const cancelled   = data?.appointmentStatusBreakdown?.CANCELLED  ?? 0;
  const completed   = data?.appointmentStatusBreakdown?.COMPLETED  ?? 0;
  const completionRate = totalAppts > 0 ? Math.round(((confirmed + completed) / totalAppts) * 100) : 0;

  const trendData = (data?.appointmentTrend ?? []).slice(-7).map(t => ({
    name: new Date(t.date).toLocaleDateString('en-IN', { weekday: 'short' }),
    Appointments: t.count,
  }));

  const pieData = [
    { name: 'Completed', value: completed },
    { name: 'Confirmed', value: confirmed },
    { name: 'Pending', value: pending },
    { name: 'Cancelled', value: cancelled },
  ].filter(d => d.value > 0);

  const ageData = (data?.patientDemographics ?? []).map(d => ({
    name: typeof d._id === 'number' ? `${d._id}-${Number(d._id) + 10} yrs` : String(d._id),
    Patients: d.count,
  }));

  const specializationsData = (data?.topSpecializations ?? []).slice(0, 5).map(s => ({
    name: s._id || 'General',
    Doctors: s.count,
  }));

  const kpiCards: StatCardProps[] = [
    { title: 'Total Users',      value: data?.totalUsers ?? 0,      color: '#1565C0', icon: <People />,        trend: { value: 12, up: true },  subtitle: `${data?.recentSignups ?? 0} new this week` },
    { title: 'Platform Revenue', value: `₹${data?.totalRevenue?.toLocaleString() ?? 0}`, color: '#2E7D32', icon: <AttachMoney />, trend: { value: 8, up: true }, subtitle: 'Mocked (₹100 per completed)' },
    { title: 'Doctors',          value: data?.totalDoctors ?? 0,    color: '#7B1FA2', icon: <MedicalServices />,trend: { value: 3, up: true },  subtitle: `${data?.unverifiedDoctors ?? 0} pending verification` },
    { title: 'Appointments',     value: totalAppts,                  color: '#E65100', icon: <EventNote />,     trend: { value: 15, up: true } },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Platform Analytics">
      {/* Hero */}
      <Box sx={{
        mb: 3, p: 3, borderRadius: 3,
        background: 'linear-gradient(135deg, #0D2137 0%, #1B3A5C 60%, #0277BD 100%)',
        color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
      }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>Platform Analytics</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.75)' }}>
            Real-time metrics, platform growth, and demographic analysis.
          </Typography>
          {lastUpdated && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5, display: 'block' }}>
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

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>7-Day Appointment Trend</Typography>
              {loading ? <Skeleton variant="rectangular" height={300} /> : (
                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1565C0" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#1565C0" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="Appointments" stroke="#1565C0" strokeWidth={3} fillOpacity={1} fill="url(#colorAppts)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Status Breakdown</Typography>
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
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{entry.name} ({entry.value})</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Patient Demographics (Age)</Typography>
              {loading ? <Skeleton variant="rectangular" height={300} /> : (
                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <RechartsBarChart data={ageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={30}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="Patients" fill="#00897B" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Top Specializations</Typography>
              {loading ? <Skeleton variant="rectangular" height={300} /> : (
                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <RechartsBarChart data={specializationsData} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="Doctors" fill="#7B1FA2" radius={[0, 4, 4, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default AdminAnalytics;

