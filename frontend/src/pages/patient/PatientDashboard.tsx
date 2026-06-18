import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Button,
  Skeleton,
  alpha,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Assignment as RecordsIcon,
  VideoCall as VideoIcon,
  Description as PrescriptionIcon,
  Dashboard as DashboardIcon,
  MedicalServices,
  HealthAndSafety,
  Schedule,
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { appointmentsApi, prescriptionsApi } from '../../services/api';
import { Appointment, Prescription } from '../../types';
import { useNavigate } from 'react-router-dom';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/patient/dashboard', icon: <DashboardIcon /> },
  { label: 'Medical Records', path: '/patient/records', icon: <RecordsIcon /> },
  { label: 'Appointments', path: '/patient/appointments', icon: <CalendarIcon /> },
  { label: 'Prescriptions', path: '/patient/prescriptions', icon: <PrescriptionIcon /> },
];

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color, loading }) => (
  <Card
    sx={{
      height: '100%',
      position: 'relative',
      overflow: 'visible',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 30px ${alpha(color, 0.15)}`,
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }} gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <Skeleton width={60} height={42} />
          ) : (
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.25 }}>
              {value}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '14px',
            color,
            fontSize: 26,
            backgroundColor: alpha(color, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            '& svg': { fontSize: 26 },
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
  switch (status) {
    case 'CONFIRMED': return 'success';
    case 'PENDING': return 'warning';
    case 'CANCELLED': return 'error';
    case 'COMPLETED': return 'primary';
    default: return 'default';
  }
};

const PatientDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const patientProfile = profile as {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, _rxRes] = await Promise.allSettled([
          appointmentsApi.getAll({ limit: 5, status: 'CONFIRMED,PENDING' }),
          patientProfile?._id
            ? prescriptionsApi.getPatientPrescriptions(patientProfile._id)
            : Promise.resolve(null),
        ]);

        if (apptRes.status === 'fulfilled') {
          setAppointments((apptRes.value?.data?.data as { data: Appointment[] })?.data || []);
        }
      } catch {
        // Silent fail — dashboard gracefully shows empty states
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientProfile?._id]);

  const upcoming = appointments.filter((a) => ['CONFIRMED', 'PENDING'].includes(a.status));

  return (
    <DashboardLayout navItems={navItems} title="Patient Dashboard">
      {/* Welcome */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 60%, #00897B 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            right: -40,
            top: -40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            right: 40,
            bottom: -60,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" sx={{ color: 'white', mb: 0.5, fontWeight: 700 }}>
            Good morning, {patientProfile?.firstName || 'Patient'} 👋
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>
            Here's your health summary for today
          </Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: 'Upcoming Appointments',
            value: loading ? '...' : upcoming.length,
            subtitle: 'Next 30 days',
            icon: <CalendarIcon />,
            color: '#1565C0',
          },
          {
            title: 'Active Prescriptions',
            value: loading ? '...' : prescriptions.filter((p) => p.isValid).length,
            subtitle: 'Currently valid',
            icon: <PrescriptionIcon />,
            color: '#00897B',
          },
          {
            title: 'Consultations',
            value: loading ? '...' : appointments.filter((a) => a.status === 'COMPLETED').length,
            subtitle: 'Total completed',
            icon: <VideoIcon />,
            color: '#7B1FA2',
          },
          {
            title: 'Medical Records',
            value: '1',
            subtitle: 'Up to date',
            icon: <HealthAndSafety />,
            color: '#E65100',
          },
        ].map((stat) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={stat.title}>
            <StatCard {...stat} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Upcoming Appointments */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">Upcoming Appointments</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/patient/appointments')}
                  sx={{ fontWeight: 600 }}
                >
                  View all
                </Button>
              </Box>

              {loading ? (
                [...Array(3)].map((_, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Skeleton variant="circular" width={44} height={44} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width="60%" height={20} />
                      <Skeleton width="40%" height={16} />
                    </Box>
                  </Box>
                ))
              ) : upcoming.length === 0 ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 5,
                    px: 2,
                    backgroundColor: 'background.default',
                    borderRadius: 2,
                  }}
                >
                  <Schedule sx={{ fontSize: 40, color: 'text.disabled', mb: 1.5 }} />
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    No upcoming appointments
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate('/patient/appointments')}
                    sx={{ mt: 1 }}
                  >
                    Book Appointment
                  </Button>
                </Box>
              ) : (
                upcoming.slice(0, 4).map((appt) => {
                  const doctor = typeof appt.doctorId === 'object' ? appt.doctorId : null;
                  const scheduledDate = new Date(appt.scheduledAt);
                  return (
                    <Box
                      key={appt._id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        mb: 1.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': { backgroundColor: 'background.default' },
                        transition: 'all 0.15s',
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontWeight: 700 }}>
                        {(doctor?.firstName || 'D').charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          Dr. {doctor?.firstName || ''} {doctor?.lastName || ''}
                          {!doctor && 'Doctor'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {scheduledDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          at{' '}
                          {scheduledDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                      <Chip
                        label={appt.status}
                        size="small"
                        color={getStatusColor(appt.status)}
                        sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                      />
                      {appt.status === 'CONFIRMED' && appt.roomToken && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<VideoIcon />}
                          onClick={() => navigate(`/patient/consultation/${appt.roomToken}`)}
                          sx={{ ml: 1, whiteSpace: 'nowrap', fontSize: '0.8rem' }}
                        >
                          Join
                        </Button>
                      )}
                    </Box>
                  );
                })
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions + Recent Prescriptions */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2.5 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={1.5}>
                {[
                  { label: 'Book Appointment', icon: <CalendarIcon />, path: '/patient/appointments', color: '#1565C0' },
                  { label: 'Medical Records', icon: <RecordsIcon />, path: '/patient/records', color: '#00897B' },
                  { label: 'My Prescriptions', icon: <PrescriptionIcon />, path: '/patient/prescriptions', color: '#7B1FA2' },
                  { label: 'Find a Doctor', icon: <MedicalServices />, path: '/patient/appointments', color: '#E65100' },
                ].map((action) => (
                  <Grid size={{ xs: 6 }} key={action.label}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate(action.path)}
                      sx={{
                        py: 2,
                        flexDirection: 'column',
                        gap: 0.75,
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                          borderColor: action.color,
                          backgroundColor: alpha(action.color, 0.04),
                          '& .MuiSvgIcon-root': { color: action.color },
                        },
                      }}
                    >
                      <Box sx={{ fontSize: 24, color: 'text.secondary', transition: 'color 0.2s', display: 'flex', alignItems: 'center' }}>
                        {action.icon}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'center' }}>
                        {action.label}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Health Summary */}
          <Card
            sx={{
              background: 'linear-gradient(135deg, #F0F7FF, #EFF8F6)',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Health Summary
              </Typography>
              {[
                { label: 'Blood Group', value: 'Not set' },
                { label: 'Known Allergies', value: 'Not set' },
                { label: 'Last Consultation', value: 'No records' },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.25,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
              <Button
                size="small"
                onClick={() => navigate('/patient/records')}
                sx={{ mt: 1.5, fontWeight: 600 }}
              >
                Update health info →
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default PatientDashboard;
