import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip, Avatar,
  Tabs, Tab, CircularProgress, Alert, Divider, Skeleton,
  Drawer, IconButton, alpha, Tooltip,
  List, ListItem, ListItemText,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PatientsIcon,
  EventAvailable as AvailabilityIcon,
  VideoCall as ConsultationsIcon,
  Description as PrescriptionIcon,
  CheckCircle as ConfirmIcon,
  Cancel as DeclineIcon,
  VideoCall as VideoIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  MedicalInformation as EhrIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { appointmentsApi, ehrApi } from '../../services/api';
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

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  CONFIRMED: 'success', PENDING: 'warning', CANCELLED: 'error',
  COMPLETED: 'primary', NO_SHOW: 'default',
};

// ─── Patient EHR Drawer ───────────────────────────────────────────────────────
const EhrDrawer: React.FC<{
  open: boolean;
  patientId: string | null;
  patientName: string;
  onClose: () => void;
}> = ({ open, patientId, patientName, onClose }) => {
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !patientId) return;
    setLoading(true);
    setError('');
    setRecord(null);
    ehrApi.getPatientRecord(patientId)
      .then((res) => setRecord(res.data?.data))
      .catch(() => setError('Could not load medical records'))
      .finally(() => setLoading(false));
  }, [open, patientId]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      {...{ PaperProps: { sx: { width: { xs: '100%', sm: 480 }, p: 3 } } } as any}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Medical Records</Typography>
          <Typography variant="body2" color="text.secondary">{patientName}</Typography>
        </Box>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && !record && (
        <Alert severity="info">No medical records found for this patient.</Alert>
      )}
      {record && (
        <Box>
          {/* Demographics */}
          {record.demographics && Object.keys(record.demographics).length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Demographics</Typography>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                {Object.entries(record.demographics).map(([k, v]) => (
                  <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{k}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{String(v)}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Allergies */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Allergies</Typography>
            {record.allergies?.length > 0 ? (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {record.allergies.map((a: string, i: number) => (
                  <Chip key={i} label={a} color="error" variant="outlined" size="small" />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">None reported</Typography>
            )}
          </Box>

          {/* Medical History */}
          {record.medicalHistory && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Medical History</Typography>
              <Typography variant="body2" color="text.secondary">{record.medicalHistory}</Typography>
            </Box>
          )}

          {/* Diagnoses */}
          {record.diagnoses?.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Diagnoses</Typography>
              <List dense>
                {record.diagnoses.map((d: any, i: number) => (
                  <ListItem key={i} sx={{ px: 0 }}>
                    <ListItemText
                      primary={d.description}
                      secondary={`Code: ${d.code || 'N/A'} — ${new Date(d.diagnosedAt).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Consultation Notes */}
          {record.consultationNotes?.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Consultation Notes</Typography>
              {record.consultationNotes.map((n: any, i: number) => (
                <Box key={i} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, mb: 1 }}>
                  <Typography variant="body2">{n.note}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(n.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Drawer>
  );
};

// ─── Appointment Card ─────────────────────────────────────────────────────────
const AppointmentCard: React.FC<{
  appt: Appointment;
  onConfirm: (id: string) => void;
  onDecline: (id: string) => void;
  onViewEhr: (patientId: string, name: string) => void;
  onJoinVideo: (token: string) => void;
  loading: string | null;
}> = ({ appt, onConfirm, onDecline, onViewEhr, onJoinVideo, loading }) => {
  const patient = typeof appt.patientId === 'object' ? appt.patientId : null;
  const dt = new Date(appt.scheduledAt);
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Patient';
  const patientIdStr = typeof appt.patientId === 'string' ? appt.patientId : (appt.patientId as any)?._id || '';

  return (
    <Card sx={{ mb: 2, transition: 'all 0.15s', '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.09)' } }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Patient avatar & info */}
          <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56, fontWeight: 700, fontSize: '1.3rem', flexShrink: 0 }}>
            {patientName.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{patientName}</Typography>
              <Chip
                label={appt.status}
                color={STATUS_COLORS[appt.status]}
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                {' at '}
                {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                {' · '}
                {appt.durationMinutes} min
              </Typography>
            </Box>
            {appt.chiefComplaint && (
              <Box sx={{ p: 1.5, bgcolor: alpha('#1565C0', 0.05), borderRadius: 1.5, mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Chief Complaint:
                </Typography>
                <Typography variant="body2"> {appt.chiefComplaint}</Typography>
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 140 }}>
            <Tooltip title="View patient's medical records">
              <Button
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<EhrIcon />}
                onClick={() => onViewEhr(patientIdStr, patientName)}
              >
                View Records
              </Button>
            </Tooltip>

            {appt.status === 'PENDING' && (
              <>
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  color="success"
                  startIcon={loading === `confirm-${appt._id}` ? <CircularProgress size={14} /> : <ConfirmIcon />}
                  onClick={() => onConfirm(appt._id)}
                  disabled={loading !== null}
                >
                  Confirm
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  color="error"
                  startIcon={loading === `decline-${appt._id}` ? <CircularProgress size={14} /> : <DeclineIcon />}
                  onClick={() => onDecline(appt._id)}
                  disabled={loading !== null}
                >
                  Decline
                </Button>
              </>
            )}

            {appt.status === 'CONFIRMED' && appt.roomToken && (
              <Button
                variant="contained"
                size="small"
                fullWidth
                color="success"
                startIcon={<VideoIcon />}
                onClick={() => onJoinVideo(appt.roomToken!)}
              >
                Join Video
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const DoctorAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [ehrOpen, setEhrOpen] = useState(false);
  const [ehrPatientId, setEhrPatientId] = useState<string | null>(null);
  const [ehrPatientName, setEhrPatientName] = useState('');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await appointmentsApi.getAll({ limit: 100 });
      const data = (res.data?.data as any)?.data || [];
      setAppointments(data);
    } catch {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleConfirm = async (id: string) => {
    setActionLoading(`confirm-${id}`);
    try {
      await appointmentsApi.confirm(id);
      fetchAppointments();
    } catch { /* notify */ }
    finally { setActionLoading(null); }
  };

  const handleDecline = async (id: string) => {
    setActionLoading(`decline-${id}`);
    try {
      await appointmentsApi.cancel(id, 'Declined by doctor');
      fetchAppointments();
    } catch { /* notify */ }
    finally { setActionLoading(null); }
  };

  const handleViewEhr = (patientId: string, name: string) => {
    setEhrPatientId(patientId);
    setEhrPatientName(name);
    setEhrOpen(true);
  };

  const tabs = [
    { label: 'Pending', filter: (a: Appointment) => a.status === 'PENDING' },
    { label: 'Confirmed', filter: (a: Appointment) => a.status === 'CONFIRMED' },
    { label: 'All', filter: () => true },
  ];

  const filtered = appointments.filter(tabs[tab].filter);
  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length;

  return (
    <DashboardLayout navItems={navItems} title="Appointments">
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
            Patient Appointments
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {pendingCount > 0
              ? `${pendingCount} appointment${pendingCount > 1 ? 's' : ''} awaiting your confirmation`
              : 'All appointments up to date'}
          </Typography>
        </Box>
        <IconButton
          onClick={fetchAppointments}
          sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {tabs.map((t, i) => {
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
                        color={i === 0 ? 'warning' : i === 1 ? 'success' : 'default'}
                        sx={{ height: 20, fontSize: '0.7rem' }}
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
              <Box sx={{ width: 140 }}>
                <Skeleton width="100%" height={36} />
                <Skeleton width="100%" height={36} sx={{ mt: 1 }} />
              </Box>
            </Box>
          </Card>
        ))
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" gutterBottom>No {tabs[tab].label.toLowerCase()} appointments</Typography>
          <Typography color="text.secondary">
            {tab === 0
              ? "You're all caught up — no pending requests."
              : 'No appointments in this category yet.'}
          </Typography>
        </Box>
      ) : (
        filtered.map((appt) => (
          <AppointmentCard
            key={appt._id}
            appt={appt}
            onConfirm={handleConfirm}
            onDecline={handleDecline}
            onViewEhr={handleViewEhr}
            onJoinVideo={(token) => navigate(`/doctor/consultation/${token}`)}
            loading={actionLoading}
          />
        ))
      )}

      <EhrDrawer
        open={ehrOpen}
        patientId={ehrPatientId}
        patientName={ehrPatientName}
        onClose={() => setEhrOpen(false)}
      />
    </DashboardLayout>
  );
};

export default DoctorAppointments;
