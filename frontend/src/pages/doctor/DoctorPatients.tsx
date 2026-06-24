import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  TextField, InputAdornment, Skeleton, Drawer, Divider, IconButton,
  Alert, CircularProgress, Tab, Tabs, List, ListItem,
  ListItemText, Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PatientsIcon,
  EventAvailable as AvailabilityIcon,
  VideoCall as ConsultationsIcon,
  Description as PrescriptionIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  MedicalInformation as EhrIcon,
  Close as CloseIcon,
  History as HistoryIcon,
  Phone as PhoneIcon,
  AccessTime as TimeIcon,
  Wc as GenderIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import { appointmentsApi, ehrApi } from '../../services/api';
import { Appointment, PatientProfile } from '../../types';

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

// ─── Patient profile derived from appointments ────────────────────────────────
interface PatientSummary {
  id: string;
  profile: PatientProfile;
  totalVisits: number;
  lastVisit: string;
  upcomingVisit?: string;
  statuses: string[];
  appointments: Appointment[];
}

interface PatientRecordData {
  demographics?: Record<string, string | number | boolean>;
  allergies?: string[];
  medicalHistory?: string;
  diagnoses?: { description?: string; code?: string; diagnosedAt?: string }[];
  consultationNotes?: { note?: string; createdAt?: string }[];
}

// ─── EHR Drawer ───────────────────────────────────────────────────────────────
const EhrDrawer: React.FC<{
  open: boolean;
  patientId: string | null;
  patientName: string;
  onClose: () => void;
}> = ({ open, patientId, patientName, onClose }) => {
  const [record, setRecord] = useState<PatientRecordData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !patientId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError('');
    setRecord(null);
    ehrApi.getPatientRecord(patientId)
      .then((res) => setRecord(res.data?.data as PatientRecordData))
      .catch(() => setError('Could not load medical records'))
      .finally(() => setLoading(false));
  }, [open, patientId]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      {...({ PaperProps: { sx: { width: { xs: '100%', sm: 520 }, p: 3 } } } as React.ComponentProps<typeof Drawer>)}
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

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Allergies</Typography>
            {record.allergies && record.allergies.length > 0 ? (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {record.allergies.map((a: string, i: number) => (
                  <Chip key={i} label={a} color="error" variant="outlined" size="small" />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">None reported</Typography>
            )}
          </Box>

          {record.medicalHistory && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Medical History</Typography>
              <Typography variant="body2" color="text.secondary">{record.medicalHistory}</Typography>
            </Box>
          )}

          {record.diagnoses && record.diagnoses.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Diagnoses</Typography>
              <List dense>
                {record.diagnoses.map((diag, i: number) => {
                  return (
                  <ListItem key={i} sx={{ px: 0 }}>
                    <ListItemText
                      primary={diag.description}
                      secondary={`Code: ${diag.code || 'N/A'} — ${diag.diagnosedAt ? new Date(diag.diagnosedAt).toLocaleDateString() : 'N/A'}`}
                    />
                  </ListItem>
                  );
                })}
              </List>
            </Box>
          )}

          {record.consultationNotes && record.consultationNotes.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Consultation Notes</Typography>
              {record.consultationNotes.map((note, i: number) => {
                return (
                <Box key={i} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, mb: 1 }}>
                  <Typography variant="body2">{note.note}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}
                  </Typography>
                </Box>
                );
              })}
            </Box>
          )}
        </Box>
      )}
    </Drawer>
  );
};

// ─── Patient History Drawer ───────────────────────────────────────────────────
const PatientHistoryDrawer: React.FC<{
  open: boolean;
  patient: PatientSummary | null;
  onClose: () => void;
  onViewEhr: (id: string, name: string) => void;
}> = ({ open, patient, onClose, onViewEhr }) => {
  if (!patient) return null;
  const name = `${patient.profile.firstName} ${patient.profile.lastName}`;
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      {...({ PaperProps: { sx: { width: { xs: '100%', sm: 520 }, p: 3 } } } as React.ComponentProps<typeof Drawer>)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48, fontWeight: 700, fontSize: '1.3rem' }}>
            {name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {patient.totalVisits} visit{patient.totalVisits !== 1 ? 's' : ''} total
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {/* Patient info */}
      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {patient.profile.gender && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <GenderIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">{patient.profile.gender}</Typography>
            </Box>
          )}
          {patient.profile.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">{patient.profile.phone}</Typography>
            </Box>
          )}
          {patient.profile.dateOfBirth && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                DOB: {new Date(patient.profile.dateOfBirth).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Button
        variant="outlined"
        startIcon={<EhrIcon />}
        fullWidth
        sx={{ mb: 3 }}
        onClick={() => onViewEhr(patient.id, name)}
      >
        View Full Medical Records
      </Button>

      {/* Visit history */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        Visit History ({patient.totalVisits})
      </Typography>
      {patient.appointments
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
        .map((appt) => {
          const dt = new Date(appt.scheduledAt);
          return (
            <Box
              key={appt._id}
              sx={{
                p: 2, mb: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                '&:hover': { bgcolor: 'background.default' }, transition: 'all 0.15s',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </Typography>
                <Chip label={appt.status} color={STATUS_COLORS[appt.status]} size="small" sx={{ fontWeight: 700 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · {appt.durationMinutes} min session
              </Typography>
              {appt.chiefComplaint && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Reason: {appt.chiefComplaint}
                </Typography>
              )}
            </Box>
          );
        })}
    </Drawer>
  );
};

// ─── Patient Card ─────────────────────────────────────────────────────────────
const PatientCard: React.FC<{
  patient: PatientSummary;
  onClick: () => void;
}> = ({ patient, onClick }) => {
  const name = `${patient.profile.firstName} ${patient.profile.lastName}`;
  const lastDt = new Date(patient.lastVisit);
  const hasUpcoming = !!patient.upcomingVisit;

  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 28px rgba(0,0,0,0.1)' },
        border: hasUpcoming ? '1px solid' : 'none',
        borderColor: hasUpcoming ? 'success.main' : 'transparent',
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Badge
            color="success"
            variant="dot"
            invisible={!hasUpcoming}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Avatar
              sx={{
                bgcolor: 'secondary.main', width: 52, height: 52,
                fontWeight: 700, fontSize: '1.3rem', flexShrink: 0,
              }}
            >
              {name.charAt(0)}
            </Avatar>
          </Badge>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>{name}</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.25 }}>
              {patient.profile.gender && (
                <Typography variant="caption" color="text.secondary">
                  {patient.profile.gender}
                </Typography>
              )}
              {patient.profile.phone && (
                <Typography variant="caption" color="text.secondary">· {patient.profile.phone}</Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Last visit</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {lastDt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Total visits</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{patient.totalVisits}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            {hasUpcoming ? (
              <Chip label="Upcoming" color="success" size="small" sx={{ fontWeight: 700 }} />
            ) : (
              <Typography variant="caption" color="text.disabled">No upcoming</Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const DoctorPatients: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [ehrOpen, setEhrOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null);
  const [ehrPatientId, setEhrPatientId] = useState<string | null>(null);
  const [ehrPatientName, setEhrPatientName] = useState('');

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

  // Derive unique patients from appointments
  const patients = useMemo<PatientSummary[]>(() => {
    const map = new Map<string, PatientSummary>();
    const now = new Date();

    appointments.forEach((appt) => {
      const pObj = typeof appt.patientId === 'object' ? appt.patientId as PatientProfile : null;
      if (!pObj) return;
      const id = (pObj as { _id?: string })._id || appt.patientId as string;

      if (!map.has(id)) {
        map.set(id, {
          id,
          profile: pObj,
          totalVisits: 0,
          lastVisit: appt.scheduledAt,
          statuses: [],
          appointments: [],
        });
      }
      const entry = map.get(id)!;
      entry.totalVisits += 1;
      entry.statuses.push(appt.status);
      entry.appointments.push(appt);

      // Track last visit (most recent past)
      if (new Date(appt.scheduledAt) > new Date(entry.lastVisit)) {
        entry.lastVisit = appt.scheduledAt;
      }
      // Track upcoming (future confirmed/pending)
      if (new Date(appt.scheduledAt) > now && ['CONFIRMED', 'PENDING'].includes(appt.status)) {
        if (!entry.upcomingVisit || new Date(appt.scheduledAt) < new Date(entry.upcomingVisit)) {
          entry.upcomingVisit = appt.scheduledAt;
        }
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
    );
  }, [appointments]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return patients.filter((p) => {
      const name = `${p.profile.firstName} ${p.profile.lastName}`.toLowerCase();
      const matchesSearch = !q || name.includes(q) || p.profile.phone?.includes(q);
      if (tab === 0) return matchesSearch;
      if (tab === 1) return matchesSearch && !!p.upcomingVisit; // upcoming
      return matchesSearch; // all
    });
  }, [patients, search, tab]);

  const handlePatientClick = (p: PatientSummary) => {
    setSelectedPatient(p);
    setHistoryOpen(true);
  };

  const handleViewEhr = (id: string, name: string) => {
    setEhrPatientId(id);
    setEhrPatientName(name);
    setHistoryOpen(false);
    setEhrOpen(true);
  };

  return (
    <DashboardLayout navItems={navItems} title="My Patients">
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
            My Patients
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {loading ? 'Loading…' : `${patients.length} unique patient${patients.length !== 1 ? 's' : ''} from your appointment history`}
          </Typography>
        </Box>
        <IconButton
          onClick={load}
          sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Search + tabs */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search by name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          variant="outlined"
          sx={{ flex: 1, minWidth: 220 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
              ),
            }
          }}
        />
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { minHeight: 36, py: 0.5 } }}>
          <Tab label={`All (${patients.length})`} />
          <Tab label={`Upcoming (${patients.filter(p => !!p.upcomingVisit).length})`} />
        </Tabs>
      </Box>

      {/* Grid */}
      {loading ? (
        <Grid container spacing={2.5}>
          {[...Array(6)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
              <Card sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Skeleton variant="circular" width={52} height={52} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="60%" height={22} />
                    <Skeleton width="40%" height={16} />
                  </Box>
                </Box>
                <Skeleton width="100%" height={1} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                  <Skeleton width="30%" height={36} />
                  <Skeleton width="25%" height={36} />
                  <Skeleton width="25%" height={24} />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <PatientsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {patients.length === 0 ? 'No patients yet' : 'No patients match your search'}
          </Typography>
          <Typography color="text.secondary">
            {patients.length === 0
              ? 'Patients will appear here once they book appointments with you.'
              : 'Try a different search term.'}
          </Typography>
          {patients.length > 0 && (
            <Button sx={{ mt: 2 }} onClick={() => setSearch('')}>Clear search</Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map((p) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={p.id}>
              <PatientCard patient={p} onClick={() => handlePatientClick(p)} />
            </Grid>
          ))}
        </Grid>
      )}

      <PatientHistoryDrawer
        open={historyOpen}
        patient={selectedPatient}
        onClose={() => setHistoryOpen(false)}
        onViewEhr={handleViewEhr}
      />
      <EhrDrawer
        open={ehrOpen}
        patientId={ehrPatientId}
        patientName={ehrPatientName}
        onClose={() => setEhrOpen(false)}
      />
    </DashboardLayout>
  );
};

export default DoctorPatients;
