import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar,
  Tabs, Tab, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, Skeleton, alpha,
  InputAdornment, Divider, IconButton, Tooltip,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Assignment as RecordsIcon,
  Description as PrescriptionIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  VideoCall as VideoIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  AccessTime as TimeIcon,
  LocalHospital as HospitalIcon,
  WorkspacePremium as ExpIcon,
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { doctorsApi, appointmentsApi } from '../../services/api';
import { DoctorProfile, Appointment, AvailabilitySlot } from '../../types';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/patient/dashboard', icon: <DashboardIcon /> },
  { label: 'Medical Records', path: '/patient/records', icon: <RecordsIcon /> },
  { label: 'Appointments', path: '/patient/appointments', icon: <CalendarIcon /> },
  { label: 'Prescriptions', path: '/patient/prescriptions', icon: <PrescriptionIcon /> },
];

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  CANCELLED: 'error',
  COMPLETED: 'primary',
  NO_SHOW: 'default',
};

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AvailabilityBadge: React.FC<{ slots: AvailabilitySlot[] }> = ({ slots }) => {
  const activeSlots = slots.filter((s) => s.isAvailable);
  if (activeSlots.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="caption" color="text.disabled">No schedule set</Typography>
      </Box>
    );
  }
  // Group by day
  const byDay: Record<number, AvailabilitySlot[]> = {};
  activeSlots.forEach((s) => {
    if (!byDay[s.dayOfWeek]) byDay[s.dayOfWeek] = [];
    byDay[s.dayOfWeek].push(s);
  });
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
        Available days:
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {[0, 1, 2, 3, 4, 5, 6].map((d) => {
          const has = !!byDay[d];
          return (
            <Chip
              key={d}
              label={DAYS_SHORT[d]}
              size="small"
              variant={has ? 'filled' : 'outlined'}
              sx={{
                fontSize: '0.65rem',
                height: 20,
                fontWeight: has ? 700 : 400,
                bgcolor: has ? alpha('#1565C0', 0.12) : 'transparent',
                color: has ? 'primary.main' : 'text.disabled',
                border: has ? `1px solid ${alpha('#1565C0', 0.3)}` : undefined,
              }}
            />
          );
        })}
      </Box>
      {/* Show first slot time as representative */}
      {activeSlots.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Typically {activeSlots[0].startTime} – {activeSlots[0].endTime}
        </Typography>
      )}
    </Box>
  );
};

// ─── Doctor Card ─────────────────────────────────────────────────────────────
const DoctorCard: React.FC<{ doctor: DoctorProfile; onBook: (d: DoctorProfile) => void }> = ({
  doctor,
  onBook,
}) => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.2s',
      '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(21,101,192,0.12)' },
    }}
  >
    <CardContent sx={{ p: 3, flex: 1 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Avatar
          sx={{
            width: 64, height: 64, bgcolor: 'primary.main',
            fontSize: '1.5rem', fontWeight: 700, flexShrink: 0,
          }}
        >
          {doctor.firstName.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Dr. {doctor.firstName} {doctor.lastName}
          </Typography>
          <Chip
            label={doctor.specialization}
            size="small"
            sx={{ mt: 0.5, bgcolor: alpha('#1565C0', 0.1), color: 'primary.main', fontWeight: 600 }}
          />
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
        {doctor.bio || 'Experienced medical professional dedicated to patient care.'}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ExpIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {doctor.yearsOfExperience} yrs exp
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {doctor.consultationDurationMinutes} min/session
          </Typography>
        </Box>
      </Box>

      {doctor.qualifications?.length > 0 && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
          {doctor.qualifications.slice(0, 3).map((q, i) => (
            <Chip key={i} label={q} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
          ))}
        </Box>
      )}

      {/* Availability schedule */}
      <Box sx={{ mb: 1, p: 1.5, bgcolor: alpha('#1565C0', 0.04), borderRadius: 1.5, border: '1px solid', borderColor: alpha('#1565C0', 0.1) }}>
        <AvailabilityBadge slots={doctor.availabilitySlots || []} />
      </Box>
    </CardContent>

    <Box sx={{ px: 3, pb: 3, pt: 0 }}>
      <Button
        fullWidth
        variant="contained"
        startIcon={<CalendarIcon />}
        onClick={() => onBook(doctor)}
        disabled={!doctor.isAcceptingAppointments}
      >
        {doctor.isAcceptingAppointments ? 'Book Appointment' : 'Not Accepting'}
      </Button>
    </Box>
  </Card>
);

// ─── Book Appointment Modal ───────────────────────────────────────────────────
const BookModal: React.FC<{
  doctor: DoctorProfile | null;
  open: boolean;
  onClose: () => void;
  onBooked: () => void;
}> = ({ doctor, open, onClose, onBooked }) => {
  const [scheduledAt, setScheduledAt] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBook = async () => {
    if (!doctor || !scheduledAt || !chiefComplaint.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await appointmentsApi.create({
        doctorId: doctor._id,
        scheduledAt: new Date(scheduledAt).toISOString(),
        chiefComplaint: chiefComplaint.trim(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setScheduledAt('');
      setChiefComplaint('');
      onBooked();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const minDateTime = new Date();
  minDateTime.setMinutes(minDateTime.getMinutes() + 30);
  const minStr = minDateTime.toISOString().slice(0, 16);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Book Appointment</Typography>
          {doctor && (
            <Typography variant="body2" color="text.secondary">
              Dr. {doctor.firstName} {doctor.lastName} — {doctor.specialization}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label="Appointment Date & Time"
          type="datetime-local"
          fullWidth
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          {...{ inputProps: { min: minStr } } as any}
          sx={{ mb: 3 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Chief Complaint / Reason for Visit"
          multiline
          rows={3}
          fullWidth
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.target.value)}
          placeholder="Describe your symptoms or reason for consultation..."
          {...{ inputProps: { maxLength: 500 } } as any}
          helperText={`${chiefComplaint.length}/500`}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>Cancel</Button>
        <Button
          onClick={handleBook}
          variant="contained"
          disabled={loading || !scheduledAt || !chiefComplaint.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : <CheckIcon />}
        >
          {loading ? 'Booking…' : 'Confirm Booking'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Success Dialog ───────────────────────────────────────────────────────────
const SuccessDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogContent sx={{ textAlign: 'center', py: 5 }}>
      <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Appointment Requested!</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Your appointment is pending doctor confirmation. You'll be able to join the video
        consultation once the doctor confirms.
      </Typography>
      <Button variant="contained" onClick={onClose}>View My Appointments</Button>
    </DialogContent>
  </Dialog>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const PatientAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [apptLoading, setApptLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [bookOpen, setBookOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchDoctors = useCallback(async (q?: string) => {
    setDoctorsLoading(true);
    try {
      const res = await doctorsApi.getAll(q ? { search: q } : {});
      const data = (res.data?.data as any)?.data || [];
      setDoctors(data);
    } catch {
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    setApptLoading(true);
    try {
      const res = await appointmentsApi.getAll({ limit: 50 });
      const data = (res.data?.data as any)?.data || [];
      setAppointments(data);
    } catch {
      setAppointments([]);
    } finally {
      setApptLoading(false);
    }
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);
  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleSearch = () => fetchDoctors(search.trim() || undefined);

  const handleBooked = () => {
    setBookOpen(false);
    setSuccessOpen(true);
    fetchAppointments();
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    setTab(1);
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await appointmentsApi.cancel(id, 'Cancelled by patient');
      fetchAppointments();
    } catch { /* silent */ }
    finally { setCancellingId(null); }
  };

  const filteredDoctors = doctors.filter((d) => {
    const q = search.toLowerCase();
    return (
      !q ||
      d.firstName.toLowerCase().includes(q) ||
      d.lastName.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout navItems={navItems} title="Appointments">
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Find a Doctor" />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                My Appointments
                {appointments.length > 0 && (
                  <Chip label={appointments.length} size="small" color="primary" />
                )}
              </Box>
            }
          />
        </Tabs>
      </Box>

      {/* ── Tab 0: Doctors ── */}
      {tab === 0 && (
        <>
          {/* Search */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              placeholder="Search by name or specialization…"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              {...{
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
                  ),
                }
              } as any}
            />
            <Button variant="contained" onClick={handleSearch} sx={{ px: 3, flexShrink: 0 }}>
              Search
            </Button>
          </Box>

          {doctorsLoading ? (
            <Grid container spacing={3}>
              {[...Array(6)].map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
                  <Card sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Skeleton variant="circular" width={64} height={64} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="70%" height={24} />
                        <Skeleton width="50%" height={20} />
                      </Box>
                    </Box>
                    <Skeleton width="100%" height={60} />
                    <Skeleton width="100%" height={42} sx={{ mt: 2 }} />
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : filteredDoctors.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <HospitalIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" gutterBottom>No doctors found</Typography>
              <Typography color="text.secondary">
                Try a different specialization or clear your search.
              </Typography>
              <Button sx={{ mt: 2 }} onClick={() => { setSearch(''); fetchDoctors(); }}>
                Show all doctors
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredDoctors.map((doc) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={doc._id}>
                  <DoctorCard
                    doctor={doc}
                    onBook={(d) => { setSelectedDoctor(d); setBookOpen(true); }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* ── Tab 1: My Appointments ── */}
      {tab === 1 && (
        <>
          {apptLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} sx={{ mb: 2, p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="40%" height={24} />
                    <Skeleton width="60%" height={18} />
                  </Box>
                  <Skeleton width={80} height={32} />
                </Box>
              </Card>
            ))
          ) : appointments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CalendarIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" gutterBottom>No appointments yet</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Book your first consultation with one of our doctors.
              </Typography>
              <Button variant="contained" onClick={() => setTab(0)}>Find a Doctor</Button>
            </Box>
          ) : (
            appointments.map((appt) => {
              const doctor = typeof appt.doctorId === 'object' ? appt.doctorId : null;
              const dt = new Date(appt.scheduledAt);
              return (
                <Card
                  key={appt._id}
                  sx={{
                    mb: 2,
                    transition: 'all 0.15s',
                    '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52, fontWeight: 700 }}>
                        {(doctor?.firstName || 'D').charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Dr. {doctor?.firstName || ''} {doctor?.lastName || ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {doctor?.specialization || ''}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            {' at '}
                            {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                        {appt.chiefComplaint && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                            Reason: {appt.chiefComplaint}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={appt.status}
                          color={STATUS_COLORS[appt.status] || 'default'}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                        {appt.status === 'CONFIRMED' && appt.roomToken && (
                          <Tooltip title="Join video consultation">
                            <Button
                              variant="contained"
                              size="small"
                              color="success"
                              startIcon={<VideoIcon />}
                              onClick={() => navigate(`/patient/consultation/${appt.roomToken}`)}
                            >
                              Join Video
                            </Button>
                          </Tooltip>
                        )}
                        {['PENDING', 'CONFIRMED'].includes(appt.status) && (
                          <Tooltip title="Cancel appointment">
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              startIcon={cancellingId === appt._id ? <CircularProgress size={14} /> : <CancelIcon />}
                              onClick={() => handleCancel(appt._id)}
                              disabled={cancellingId === appt._id}
                            >
                              Cancel
                            </Button>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })
          )}
        </>
      )}

      <BookModal
        doctor={selectedDoctor}
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        onBooked={handleBooked}
      />
      <SuccessDialog open={successOpen} onClose={handleSuccessClose} />
    </DashboardLayout>
  );
};

export default PatientAppointments;
