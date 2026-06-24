import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip, Avatar,
  Tab, Tabs, Skeleton, alpha, CircularProgress,
  IconButton, TextField, InputAdornment,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PatientsIcon,
  EventAvailable as AvailabilityIcon,
  VideoCall as VideoIcon,
  Description as PrescriptionIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  CheckCircle as ConfirmIcon,
  Cancel as DeclineIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  PlayArrow as JoinIcon,
  HistoryOutlined as PastIcon,
  EventOutlined as UpcomingIcon,
  RadioButtonChecked as LiveIcon,
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { appointmentsApi } from '../../services/api';
import { Appointment } from '../../types';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/doctor/dashboard', icon: <DashboardIcon /> },
  { label: 'My Patients', path: '/doctor/patients', icon: <PatientsIcon /> },
  { label: 'Appointments', path: '/doctor/appointments', icon: <CalendarIcon /> },
  { label: 'Availability', path: '/doctor/availability', icon: <AvailabilityIcon /> },
  { label: 'Consultations', path: '/doctor/consultations', icon: <VideoIcon /> },
  { label: 'Prescriptions', path: '/doctor/prescriptions/new', icon: <PrescriptionIcon /> },
  { label: 'My Profile', path: '/doctor/profile', icon: <PersonIcon /> },
];

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  CONFIRMED: 'success', PENDING: 'warning', CANCELLED: 'error',
  COMPLETED: 'primary', NO_SHOW: 'default',
};

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmed', PENDING: 'Pending', CANCELLED: 'Cancelled',
  COMPLETED: 'Completed', NO_SHOW: 'No Show',
};

// ─── Consultation Card ─────────────────────────────────────────────────────────
const ConsultationCard: React.FC<{
  appt: Appointment;
  isLive: boolean;
  onConfirm: (id: string) => void;
  onDecline: (id: string) => void;
  onJoin: (token: string) => void;
  onWriteRx: (appt: Appointment) => void;
  actionLoading: string | null;
}> = ({ appt, isLive, onConfirm, onDecline, onJoin, onWriteRx, actionLoading }) => {
  const patient = typeof appt.patientId === 'object' ? appt.patientId : null;
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Patient';
  const dt = new Date(appt.scheduledAt);
  const now = new Date();
  const minutesUntil = Math.floor((dt.getTime() - now.getTime()) / 60000);
  const isPast = dt < now;

  return (
    <Card
      sx={{
        mb: 2,
        transition: 'all 0.15s',
        '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.09)' },
        border: isLive ? '2px solid' : '1px solid',
        borderColor: isLive ? 'success.main' : 'divider',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {isLive && (
        <Box
          sx={{
            position: 'absolute', top: -10, left: 20,
            bgcolor: 'success.main', color: 'white',
            px: 1.5, py: 0.25, borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 0.5,
            fontSize: '0.7rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <LiveIcon sx={{ fontSize: 12 }} /> LIVE NOW
        </Box>
      )}
      <CardContent sx={{ pt: isLive ? 3 : 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Patient info */}
          <Avatar
            sx={{
              bgcolor: isLive ? 'success.main' : 'secondary.main',
              width: 56, height: 56, fontWeight: 700, fontSize: '1.3rem', flexShrink: 0,
            }}
          >
            {patientName.charAt(0)}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{patientName}</Typography>
              <Chip
                label={STATUS_LABEL[appt.status]}
                color={STATUS_COLORS[appt.status]}
                size="small"
                sx={{ fontWeight: 700 }}
              />
              {patient?.gender && (
                <Chip label={patient.gender} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                {' at '}
                {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                {' · '}{appt.durationMinutes} min
              </Typography>
            </Box>

            {/* Countdown / past indicator */}
            {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && appt.status !== 'NO_SHOW' && (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: isLive ? 'success.main' : isPast ? 'error.main' : minutesUntil < 30 ? 'warning.main' : 'text.secondary',
                }}
              >
                {isLive
                  ? '🟢 Consultation in progress'
                  : isPast
                  ? '⚠️ Past scheduled time'
                  : minutesUntil < 60
                  ? `⏰ In ${minutesUntil} minutes`
                  : minutesUntil < 1440
                  ? `📅 In ${Math.floor(minutesUntil / 60)}h ${minutesUntil % 60}m`
                  : `📅 In ${Math.floor(minutesUntil / 1440)} days`}
              </Typography>
            )}

            {appt.chiefComplaint && (
              <Box sx={{ p: 1.5, bgcolor: alpha('#1565C0', 0.05), borderRadius: 1.5, mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Chief Complaint:
                </Typography>
                <Typography variant="body2"> {appt.chiefComplaint}</Typography>
              </Box>
            )}
          </Box>

          {/* Actions column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 150 }}>
            {/* Join video — confirmed + has room token */}
            {appt.status === 'CONFIRMED' && appt.roomToken && (
              <Button
                variant="contained"
                size="small"
                fullWidth
                color="success"
                startIcon={<JoinIcon />}
                onClick={() => onJoin(appt.roomToken!)}
                sx={{ fontWeight: 700 }}
              >
                {isLive ? 'Rejoin Video' : 'Join Video'}
              </Button>
            )}

            {/* Pending — confirm or decline */}
            {appt.status === 'PENDING' && (
              <>
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  color="success"
                  startIcon={actionLoading === `confirm-${appt._id}` ? <CircularProgress size={14} /> : <ConfirmIcon />}
                  onClick={() => onConfirm(appt._id)}
                  disabled={actionLoading !== null}
                >
                  Confirm
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  color="error"
                  startIcon={actionLoading === `decline-${appt._id}` ? <CircularProgress size={14} /> : <DeclineIcon />}
                  onClick={() => onDecline(appt._id)}
                  disabled={actionLoading !== null}
                >
                  Decline
                </Button>
              </>
            )}

            {/* Confirmed — write prescription */}
            {(appt.status === 'CONFIRMED' || appt.status === 'COMPLETED') && (
              <Button
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<PrescriptionIcon />}
                onClick={() => onWriteRx(appt)}
              >
                Prescription
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ─── Stats Bar ─────────────────────────────────────────────────────────────────
const StatsBar: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => {
  const now = new Date();
  const confirmed = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const pending = appointments.filter((a) => a.status === 'PENDING').length;
  const completed = appointments.filter((a) => a.status === 'COMPLETED').length;
  const live = appointments.filter((a) => {
    if (a.status !== 'CONFIRMED' || !a.roomToken) return false;
    const start = new Date(a.scheduledAt);
    const end = new Date(a.endsAt);
    return now >= start && now <= end;
  }).length;

  const items = [
    { label: 'Live Now', value: live, color: '#00897B', icon: <LiveIcon /> },
    { label: 'Confirmed', value: confirmed, color: '#1565C0', icon: <VideoIcon /> },
    { label: 'Pending', value: pending, color: '#E65100', icon: <UpcomingIcon /> },
    { label: 'Completed', value: completed, color: '#7B1FA2', icon: <PastIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      {items.map((item) => (
        <Card key={item.label} sx={{ flex: 1, minWidth: 110 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 36, height: 36, borderRadius: '10px',
                  bgcolor: alpha(item.color, 0.12),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  '& svg': { color: item.color, fontSize: 18 },
                }}
              >
                {item.icon}
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>{item.value}</Typography>
                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const DoctorConsultations: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentsApi.getAll({ limit: 200 });
      setAppointments((res.data?.data as { data?: Appointment[] })?.data || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const now = new Date();

  const isLive = (appt: Appointment) => {
    if (appt.status !== 'CONFIRMED' || !appt.roomToken) return false;
    const start = new Date(appt.scheduledAt);
    const end = new Date(appt.endsAt);
    return now >= start && now <= end;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const TABS = [
    {
      label: 'Upcoming',
      filter: (a: Appointment) =>
        ['PENDING', 'CONFIRMED'].includes(a.status) && new Date(a.scheduledAt) > now,
      icon: <UpcomingIcon />,
    },
    {
      label: 'Live',
      filter: (a: Appointment) => isLive(a),
      icon: <LiveIcon />,
    },
    {
      label: 'Past',
      filter: (a: Appointment) =>
        ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(a.status) ||
        (new Date(a.scheduledAt) < now && !isLive(a)),
      icon: <PastIcon />,
    },
    {
      label: 'All',
      filter: () => true,
      icon: <VideoIcon />,
    },
  ];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return appointments
      .filter(TABS[tab].filter)
      .filter((a) => {
        if (!q) return true;
        const patient = typeof a.patientId === 'object' ? a.patientId : null;
        const name = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : '';
        return name.includes(q) || a.chiefComplaint?.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        // upcoming: soonest first; past: most recent first
        if (tab === 2) return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      });
  }, [appointments, tab, search]);

  const handleConfirm = async (id: string) => {
    setActionLoading(`confirm-${id}`);
    try { await appointmentsApi.confirm(id); load(); }
    catch { /* silent */ }
    finally { setActionLoading(null); }
  };

  const handleDecline = async (id: string) => {
    setActionLoading(`decline-${id}`);
    try { await appointmentsApi.cancel(id, 'Declined by doctor'); load(); }
    catch { /* silent */ }
    finally { setActionLoading(null); }
  };

  const handleWriteRx = (appt: Appointment) => {
    const patient = typeof appt.patientId === 'object' ? appt.patientId : null;
    const patientId = patient ? (patient as { _id?: string })._id : appt.patientId;
    navigate('/doctor/prescriptions/new', {
      state: { appointmentId: appt._id, patientId },
    });
  };

  return (
    <DashboardLayout navItems={navItems} title="Consultations">
      {/* Header */}
      <Box
        sx={{
          mb: 4, p: 3, borderRadius: 3,
          background: 'linear-gradient(135deg, #00695C 0%, #00897B 60%, #1565C0 100%)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.25 }}>
            Video Consultations
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {loading
              ? 'Loading…'
              : `${appointments.filter((a) => isLive(a)).length > 0 ? '🟢 Active consultation in progress · ' : ''}${appointments.filter((a) => ['PENDING', 'CONFIRMED'].includes(a.status)).length} upcoming`}
          </Typography>
        </Box>
        <IconButton
          onClick={load}
          sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Stats */}
      {!loading && <StatsBar appointments={appointments} />}

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="Search by patient name or complaint…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          size="small"
          variant="outlined"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
              ),
            }
          }}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {TABS.map((t, i) => {
            const count = appointments.filter(t.filter).length;
            return (
              <Tab
                key={i}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {t.label}
                    {count > 0 && (
                      <Chip
                        label={count}
                        size="small"
                        color={i === 1 ? 'success' : i === 0 ? 'warning' : 'default'}
                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                      />
                    )}
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Box>

      {/* Content */}
      {loading ? (
        [...Array(3)].map((_, i) => (
          <Card key={i} sx={{ mb: 2, p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Skeleton variant="circular" width={56} height={56} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="40%" height={24} />
                <Skeleton width="60%" height={18} />
                <Skeleton width="80%" height={48} sx={{ mt: 1 }} />
              </Box>
              <Box sx={{ width: 150 }}>
                <Skeleton width="100%" height={36} />
                <Skeleton width="100%" height={36} sx={{ mt: 1 }} />
              </Box>
            </Box>
          </Card>
        ))
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <VideoIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No {TABS[tab].label.toLowerCase()} consultations
          </Typography>
          <Typography color="text.secondary">
            {tab === 0
              ? 'No upcoming consultations scheduled.'
              : tab === 1
              ? 'No active consultations right now.'
              : 'Past consultations will appear here.'}
          </Typography>
        </Box>
      ) : (
        filtered.map((appt) => (
          <ConsultationCard
            key={appt._id}
            appt={appt}
            isLive={isLive(appt)}
            onConfirm={handleConfirm}
            onDecline={handleDecline}
            onJoin={(token) => navigate(`/doctor/consultation/${token}`)}
            onWriteRx={handleWriteRx}
            actionLoading={actionLoading}
          />
        ))
      )}
    </DashboardLayout>
  );
};

export default DoctorConsultations;
