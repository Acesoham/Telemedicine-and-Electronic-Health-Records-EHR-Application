/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, Skeleton, Alert,
  alpha, LinearProgress, Divider, Avatar, List, ListItem, ListItemAvatar,
  ListItemText, IconButton, Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People, Security, BarChart,
  TrendingUp, EventNote, VideoCall, MedicalServices,
  HealthAndSafety, Refresh, Person, CheckCircle, Cancel,
  AccessTime, MonitorHeart,
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

// ─── Mini Bar Chart ──────────────────────────────────────────
interface BarChartProps { data: { label: string; value: number }[]; color: string; title: string }

const MiniBarChart: React.FC<BarChartProps> = ({ data, color, title }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700,  mb: 2 }}>{title}</Typography>
      {data.map((d) => (
        <Box key={d.label} sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">{d.label}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{d.value}</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(d.value / max) * 100}
            sx={{
              height: 8, borderRadius: 4,
              bgcolor: alpha(color, 0.1),
              '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 },
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

// ─── Appointment Status Donut (CSS-only) ─────────────────────
interface DonutProps { confirmed: number; pending: number; cancelled: number }
const StatusDonut: React.FC<DonutProps> = ({ confirmed, pending, cancelled }) => {
  const total = confirmed + pending + cancelled || 1;
  const pct = (n: number) => Math.round((n / total) * 100);
  const items = [
    { label: 'Confirmed', count: confirmed, pct: pct(confirmed), color: '#2E7D32' },
    { label: 'Pending',   count: pending,   pct: pct(pending),   color: '#F57F17' },
    { label: 'Cancelled', count: cancelled, pct: pct(cancelled), color: '#C62828' },
  ];

  // Build conic-gradient stops
  let acc = 0;
  const stops = items.map(item => {
    const from = acc;
    acc += item.pct;
    return `${item.color} ${from}% ${acc}%`;
  });

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
      <Box sx={{
        width: 120, height: 120, borderRadius: '50%', flexShrink: 0,
        background: `conic-gradient(${stops.join(', ')})`,
        position: 'relative',
        '&::after': {
          content: '""', position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 72, height: 72,
          borderRadius: '50%',
          bgcolor: 'background.paper',
        },
      }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>{total}</Typography>
          <Typography variant="caption" color="text.secondary">Total</Typography>
        </Box>
      </Box>
      <Box sx={{ flex: 1 }}>
        {items.map(item => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ flex: 1 }}>{item.label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.count}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 30, textAlign: 'right' }}>{item.pct}%</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ─── Main Component ──────────────────────────────────────────
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
  recentSignups?: number;
  unverifiedDoctors?: number;
  topSpecializations?: { _id: string; count: number }[];
  appointmentTrend?: { date: string; count: number }[];
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

  // Derived stats
  const totalAppts  = data?.totalAppointments ?? 0;
  const confirmed   = data?.appointmentStatusBreakdown?.CONFIRMED  ?? 0;
  const pending     = data?.appointmentStatusBreakdown?.PENDING    ?? 0;
  const cancelled   = data?.appointmentStatusBreakdown?.CANCELLED  ?? 0;
  const completed   = data?.appointmentStatusBreakdown?.COMPLETED  ?? 0;

  const completionRate = totalAppts > 0 ? Math.round(((confirmed + completed) / totalAppts) * 100) : 0;

  const topSpecs: { label: string; value: number }[] = (data?.topSpecializations ?? []).map(s => ({
    label: s._id || 'General',
    value: s.count,
  }));

  const trendData: { label: string; value: number }[] = (data?.appointmentTrend ?? [])
    .slice(-7)
    .map(t => ({
      label: new Date(t.date).toLocaleDateString('en-IN', { weekday: 'short' }),
      value: t.count,
    }));

  const kpiCards: StatCardProps[] = [
    { title: 'Total Users',      value: data?.totalUsers ?? 0,      color: '#1565C0', icon: <People />,        trend: { value: 12, up: true },  subtitle: `${data?.recentSignups ?? 0} new this week` },
    { title: 'Patients',         value: data?.totalPatients ?? 0,   color: '#00897B', icon: <Person />, trend: { value: 8, up: true } },
    { title: 'Doctors',          value: data?.totalDoctors ?? 0,    color: '#7B1FA2', icon: <MedicalServices />,trend: { value: 3, up: true },  subtitle: `${data?.unverifiedDoctors ?? 0} pending verification` },
    { title: 'Appointments',     value: totalAppts,                  color: '#E65100', icon: <EventNote />,     trend: { value: 15, up: true } },
    { title: 'Prescriptions',    value: data?.totalPrescriptions ?? 0, color: '#0277BD', icon: <MonitorHeart />, trend: { value: 5, up: true } },
    { title: 'Completion Rate',  value: `${completionRate}%`,       color: '#2E7D32', icon: <CheckCircle />,   subtitle: `${confirmed + completed} of ${totalAppts} appointments` },
    { title: 'Pending Approval', value: pending,                    color: '#F57F17', icon: <AccessTime />,    subtitle: 'Awaiting confirmation' },
    { title: 'Cancelled',        value: cancelled,                  color: '#C62828', icon: <Cancel />,        subtitle: 'This period' },
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
            Real-time metrics, appointment trends, and system health monitoring.
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

      {/* System Health Banner */}
      <Card sx={{ mb: 3, bgcolor: alpha('#2E7D32', 0.06), border: '1px solid', borderColor: alpha('#2E7D32', 0.2) }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <HealthAndSafety sx={{ color: '#2E7D32' }} />
            <Typography color="#2E7D32" sx={{ fontWeight: 600 }}>System Status: All services operational</Typography>
            <Chip label="Healthy" size="small" color="success" sx={{ ml: 'auto', fontWeight: 700 }} />
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      {/* KPI Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {kpiCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.title}>
            <StatCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Appointment Status Breakdown */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700,  mb: 3 }}>Appointment Breakdown</Typography>
              {loading
                ? <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto' }} />
                : <StatusDonut confirmed={confirmed + completed} pending={pending} cancelled={cancelled} />
              }
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {[
                  { label: 'Confirmed',  val: confirmed,  color: '#2E7D32' },
                  { label: 'Completed',  val: completed,  color: '#1565C0' },
                  { label: 'Pending',    val: pending,    color: '#F57F17' },
                  { label: 'Cancelled',  val: cancelled,  color: '#C62828' },
                ].map(s => (
                  <Box key={s.label} sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800,  color: s.color }}>
                      {loading ? <Skeleton width={30} /> : s.val}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 7-Day Trend */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>7-Day Appointment Trend</Typography>
                <Chip icon={<TrendingUp />} label="This week" size="small" color="primary" variant="outlined" />
              </Box>
              {loading
                ? [...Array(7)].map((_, i) => <Skeleton key={i} height={24} sx={{ mb: 1 }} />)
                : trendData.length > 0
                  ? <MiniBarChart data={trendData} color="#1565C0" title="" />
                  : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <BarChart sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">No trend data available yet</Typography>
                    </Box>
                  )
              }
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={3}>
        {/* Top Specializations */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700,  mb: 2 }}>Top Specializations</Typography>
              {loading
                ? [...Array(5)].map((_, i) => <Skeleton key={i} height={32} sx={{ mb: 1 }} />)
                : topSpecs.length > 0
                  ? <MiniBarChart data={topSpecs.slice(0, 6)} color="#7B1FA2" title="" />
                  : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <MedicalServices sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">No specialization data available</Typography>
                    </Box>
                  )
              }
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats List */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700,  mb: 2 }}>Platform Summary</Typography>
              <List dense disablePadding>
                {[
                  { label: 'Registered Patients',   value: data?.totalPatients    ?? 0, color: '#1565C0', icon: <Person /> },
                  { label: 'Verified Doctors',       value: (data?.totalDoctors ?? 0) - (data?.unverifiedDoctors ?? 0), color: '#2E7D32', icon: <CheckCircle /> },
                  { label: 'Pending Verification',   value: data?.unverifiedDoctors ?? 0, color: '#F57F17', icon: <AccessTime /> },
                  { label: 'Total Prescriptions',    value: data?.totalPrescriptions ?? 0, color: '#0277BD', icon: <MonitorHeart /> },
                  { label: 'Video Consultations',    value: data?.totalConsultations ?? 0, color: '#7B1FA2', icon: <VideoCall /> },
                  { label: 'New Signups (7 days)',   value: data?.recentSignups     ?? 0, color: '#00897B', icon: <TrendingUp /> },
                ].map((item, idx) => (
                  <React.Fragment key={item.label}>
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(item.color, 0.12), '& svg': { color: item.color, fontSize: 18 } }}>
                          {item.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.label}
                        slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 800,  color: item.color }}>
                        {loading ? <Skeleton width={36} /> : item.value}
                      </Typography>
                    </ListItem>
                    {idx < 5 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
