import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, alpha, Skeleton,
  Chip, Avatar, Divider, Alert,
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
  CheckCircle as ConfirmIcon,
  Cancel as DeclineIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { appointmentsApi } from '../../services/api';
import { Appointment } from '../../types';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/doctor/dashboard', icon: <DashboardIcon /> },
  { label: 'My Patients', path: '/doctor/patients', icon: <PatientsIcon /> },
  { label: 'Appointments', path: '/doctor/appointments', icon: <CalendarIcon /> },
  { label: 'Availability', path: '/doctor/availability', icon: <AvailabilityIcon /> },
  { label: 'Consultations', path: '/doctor/consultations', icon: <ConsultationsIcon /> },
  { label: 'Prescriptions', path: '/doctor/prescriptions/new', icon: <PrescriptionIcon /> },
  { label: 'My Profile', path: '/doctor/profile', icon: <PersonIcon /> },
];

const DoctorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const doctorProfile = profile as { firstName?: string; specialization?: string } | null;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    appointmentsApi
      .getAll({ limit: 50 })
      .then((res) => {
        const data = (res.data?.data as any)?.data || [];
        setAppointments(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const todayAppts = appointments.filter((a) => {
    const d = new Date(a.scheduledAt);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  });

  const pending = appointments.filter((a) => a.status === 'PENDING');
  const confirmed = appointments.filter((a) => a.status === 'CONFIRMED');
  const uniquePatients = new Set(
    appointments.map((a) =>
      typeof a.patientId === 'object' ? (a.patientId as any)._id : a.patientId,
    ),
  ).size;

  const stats = [
    { title: "Today's Appointments", value: todayAppts.length, icon: <TodayOutlined />, color: '#1565C0' },
    { title: 'Pending Confirmation', value: pending.length, icon: <VideoCallOutlined />, color: '#E65100' },
    { title: 'Confirmed Upcoming', value: confirmed.length, icon: <VideoCallOutlined />, color: '#00897B' },
    { title: 'Total Patients', value: uniquePatients, icon: <PeopleOutlined />, color: '#7B1FA2' },
  ];

  const handleConfirm = async (id: string) => {
    setActionLoading(`confirm-${id}`);
    try {
      await appointmentsApi.confirm(id);
      const res = await appointmentsApi.getAll({ limit: 50 });
      setAppointments((res.data?.data as any)?.data || []);
    } catch { /* silent */ }
    finally { setActionLoading(null); }
  };

  const handleDecline = async (id: string) => {
    setActionLoading(`decline-${id}`);
    try {
      await appointmentsApi.cancel(id, 'Declined by doctor');
      const res = await appointmentsApi.getAll({ limit: 50 });
      setAppointments((res.data?.data as any)?.data || []);
    } catch { /* silent */ }
    finally { setActionLoading(null); }
  };

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
        <Box sx={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" sx={{ color: 'white', mb: 0.5, fontWeight: 700 }}>
            Good morning, Dr. {doctorProfile?.firstName || 'Doctor'} 👨‍⚕️
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {doctorProfile?.specialization || 'General Practitioner'} —{' '}
            {pending.length > 0
              ? `${pending.length} appointment${pending.length > 1 ? 's' : ''} awaiting your confirmation`
              : "You're all caught up for today"}
          </Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((s) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={s.title}>
            <Card sx={{ '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 30px ${alpha(s.color, 0.15)}` }, transition: 'all 0.2s' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }} gutterBottom>
                      {s.title}
                    </Typography>
                    {loading ? (
                      <Skeleton width={60} height={42} />
                    ) : (
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>{s.value}</Typography>
                    )}
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
        {/* Pending approvals */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Pending Approvals</Typography>
                <Button size="small" variant="outlined" onClick={() => navigate('/doctor/appointments')}>
                  View all
                </Button>
              </Box>

              {loading ? (
                [...Array(2)].map((_, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Skeleton variant="circular" width={44} height={44} />
                    <Box sx={{ flex: 1 }}><Skeleton width="60%" /><Skeleton width="40%" /></Box>
                    <Skeleton width={120} height={36} />
                  </Box>
                ))
              ) : pending.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, backgroundColor: 'background.default', borderRadius: 2 }}>
                  <TodayOutlined sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">No pending appointment requests</Typography>
                </Box>
              ) : (
                pending.slice(0, 5).map((appt) => {
                  const patient = typeof appt.patientId === 'object' ? appt.patientId : null;
                  const dt = new Date(appt.scheduledAt);
                  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Patient';
                  return (
                    <Box
                      key={appt._id}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 2, p: 2, mb: 1.5,
                        borderRadius: 2, border: '1px solid', borderColor: 'divider',
                        flexWrap: 'wrap',
                        '&:hover': { bgcolor: 'background.default' }, transition: 'all 0.15s',
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 44, height: 44, fontWeight: 700, flexShrink: 0 }}>
                        {patientName.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{patientName}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TimeIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at{' '}
                            {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                        {appt.chiefComplaint && (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {appt.chiefComplaint}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<ConfirmIcon />}
                          onClick={() => handleConfirm(appt._id)}
                          disabled={actionLoading !== null}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeclineIcon />}
                          onClick={() => handleDecline(appt._id)}
                          disabled={actionLoading !== null}
                        >
                          Decline
                        </Button>
                      </Box>
                    </Box>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          {todayAppts.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>Today's Schedule</Typography>
                {todayAppts.map((appt) => {
                  const patient = typeof appt.patientId === 'object' ? appt.patientId : null;
                  const dt = new Date(appt.scheduledAt);
                  return (
                    <Box
                      key={appt._id}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 2, p: 2, mb: 1.5,
                        borderRadius: 2, border: '1px solid', borderColor: 'divider', flexWrap: 'wrap',
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontWeight: 700 }}>
                        {(patient?.firstName || 'P').charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {patient?.firstName || ''} {patient?.lastName || ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · {appt.durationMinutes} min
                        </Typography>
                      </Box>
                      <Chip label={appt.status} size="small" color={appt.status === 'CONFIRMED' ? 'success' : 'warning'} sx={{ fontWeight: 700 }} />
                      {appt.status === 'CONFIRMED' && appt.roomToken && (
                        <Button size="small" variant="contained" color="success" startIcon={<VideoCallOutlined />}
                          onClick={() => navigate(`/doctor/consultation/${appt.roomToken}`)}>
                          Join
                        </Button>
                      )}
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>Quick Actions</Typography>
              {[
                { label: 'Manage Appointments', path: '/doctor/appointments', color: '#1565C0' },
                { label: 'View Patients', path: '/doctor/patients', color: '#00897B' },
                { label: 'Set Availability', path: '/doctor/availability', color: '#7B1FA2' },
                { label: 'Write Prescription', path: '/doctor/prescriptions/new', color: '#E65100' },
              ].map((a) => (
                <Button
                  key={a.label}
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(a.path)}
                  sx={{
                    mb: 1.5, justifyContent: 'flex-start', borderColor: 'divider',
                    color: 'text.primary', fontWeight: 600,
                    '&:hover': { borderColor: a.color, color: a.color, bgcolor: alpha(a.color, 0.04) },
                  }}
                >
                  {a.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Confirmed upcoming */}
          {confirmed.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 2 }}>Upcoming Confirmed</Typography>
                {confirmed.slice(0, 4).map((appt) => {
                  const patient = typeof appt.patientId === 'object' ? appt.patientId : null;
                  const dt = new Date(appt.scheduledAt);
                  return (
                    <Box key={appt._id} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center' }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: 'success.light', fontSize: '0.9rem', fontWeight: 700 }}>
                        {(patient?.firstName || 'P').charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {patient?.firstName || ''} {patient?.lastName || ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at{' '}
                          {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                      {appt.roomToken && (
                        <Button size="small" variant="contained" color="success"
                          onClick={() => navigate(`/doctor/consultation/${appt.roomToken}`)}>
                          Join
                        </Button>
                      )}
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
