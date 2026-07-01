import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip, Avatar,
  Tab, Tabs, Skeleton, alpha, CircularProgress,
  IconButton, TextField, InputAdornment, Divider,
  Dialog, DialogContent, DialogTitle, DialogActions,
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
  Videocam as RecordingsIcon,
  PlayCircleFilled as PlayIcon,
  DeleteOutlined as DeleteIcon,
  HourglassEmpty as DurationIcon,
  Storage as StorageIcon,
  FiberManualRecord as RecIcon,
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import { appointmentsApi, recordingsApi } from '../../services/api';
import { Appointment, Recording, PatientProfile } from '../../types';

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
  onJoin: (token: string, appointmentId: string) => void;
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
                onClick={() => onJoin(appt.roomToken!, appt._id)}
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

// ─── Recording Card ────────────────────────────────────────────────────────────
const RecordingCard: React.FC<{
  rec: Recording;
  onPlay: (rec: Recording) => void;
  onDelete: (id: string) => void;
  deleting: string | null;
  loadingPlay: string | null;
}> = ({ rec, onPlay, onDelete, deleting, loadingPlay }) => {
  const patient = typeof rec.patientId === 'object' ? rec.patientId as PatientProfile : null;
  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Patient';
  const appt = typeof rec.appointmentId === 'object' ? rec.appointmentId as Appointment : null;
  const recordedAt = new Date(rec.startedAt);

  const formatDuration = (secs?: number) => {
    if (!secs) return '—';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card
      sx={{
        mb: 2,
        transition: 'all 0.15s',
        '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.1)', transform: 'translateY(-1px)' },
        border: '1px solid',
        borderColor: rec.status === 'COMPLETED' ? alpha('#7c3aed', 0.25) : 'divider',
        background: rec.status === 'COMPLETED'
          ? 'linear-gradient(135deg, rgba(124,58,237,0.03) 0%, rgba(255,255,255,0) 100%)'
          : undefined,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Icon */}
          <Box
            sx={{
              width: 56, height: 56, borderRadius: 2, flexShrink: 0,
              background: rec.status === 'COMPLETED'
                ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                : 'linear-gradient(135deg, #dc2626, #b91c1c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: rec.status === 'COMPLETED' ? '0 4px 16px rgba(124,58,237,0.3)' : undefined,
            }}
          >
            {rec.status === 'COMPLETED'
              ? <RecordingsIcon sx={{ color: 'white', fontSize: 28 }} />
              : <RecIcon sx={{ color: 'white', fontSize: 28 }} />
            }
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {patientName}
              </Typography>
              <Chip
                label={rec.status}
                size="small"
                sx={{
                  fontWeight: 700, fontSize: '0.65rem',
                  bgcolor: rec.status === 'COMPLETED' ? alpha('#7c3aed', 0.1) : alpha('#dc2626', 0.1),
                  color: rec.status === 'COMPLETED' ? '#7c3aed' : '#dc2626',
                  border: `1px solid ${rec.status === 'COMPLETED' ? alpha('#7c3aed', 0.3) : alpha('#dc2626', 0.3)}`,
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {recordedAt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                {' at '}
                {recordedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>

            {appt?.chiefComplaint && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                📋 {appt.chiefComplaint}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <DurationIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {formatDuration(rec.durationSeconds)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StorageIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {formatSize(rec.fileSize)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            {rec.status === 'COMPLETED' && (
              <Button
                variant="contained"
                size="small"
                startIcon={loadingPlay === rec._id ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <PlayIcon />}
                onClick={() => onPlay(rec)}
                disabled={loadingPlay === rec._id}
                sx={{
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  fontWeight: 700,
                  '&:hover': { background: 'linear-gradient(135deg, #6d28d9, #5b21b6)' },
                  '&:disabled': { background: 'rgba(124,58,237,0.4)', color: 'white' },
                }}
              >
                {loadingPlay === rec._id ? 'Loading…' : 'Play'}
              </Button>
            )}
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(rec._id)}
              disabled={deleting === rec._id}
            >
              {deleting === rec._id ? <CircularProgress size={16} /> : <DeleteIcon />}
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ─── Recordings Tab ────────────────────────────────────────────────────────────

const RecordingsTab: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [playingRec, setPlayingRec] = useState<Recording | null>(null);
  const [loadingPlay, setLoadingPlay] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [playError, setPlayError] = useState('');
  const [muted, setMuted] = useState(true); // start muted for autoplay policy
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const loadRecordings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recordingsApi.getAll();
      setRecordings((res.data?.data as Recording[]) || []);
    } catch {
      setRecordings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRecordings(); }, [loadRecordings]);

  // Cleanup blob URL when dialog closes
  // Cleanup when dialog closes
  const handleClose = useCallback(() => {
    setBlobUrl(null);
    setPlayingRec(null);
    setPlayError('');
    setMuted(true);
  }, []);

  const handlePlay = async (rec: Recording) => {
    setPlayError('');
    setLoadingPlay(rec._id);
    setPlayingRec(rec);
    setBlobUrl(null);
    try {
      const res = await recordingsApi.stream(rec._id);
      const videoBlob: Blob = res.data;
      if (!videoBlob || videoBlob.size === 0) throw new Error('Received empty video data.');
      const url = URL.createObjectURL(videoBlob);
      setBlobUrl(url);
    } catch (err) {
      console.error('Failed to load recording:', err);
      setPlayError(err instanceof Error ? err.message : 'Failed to load recording.');
    } finally {
      setLoadingPlay(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await recordingsApi.delete(id);
      setRecordings(prev => prev.filter(r => r._id !== id));
    } catch { /* silent */ }
    finally { setDeleting(null); }
  };

  if (loading) {
    return (
      <Box>
        {[...Array(3)].map((_, i) => (
          <Card key={i} sx={{ mb: 2, p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Skeleton variant="rectangular" width={56} height={56} sx={{ borderRadius: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="35%" height={24} />
                <Skeleton width="55%" height={18} sx={{ mt: 0.5 }} />
                <Skeleton width="45%" height={16} sx={{ mt: 0.5 }} />
              </Box>
              <Skeleton width={80} height={36} />
            </Box>
          </Card>
        ))}
      </Box>
    );
  }

  if (recordings.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <RecordingsIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          No Recordings Yet
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 380, mx: 'auto' }}>
          When you record a video consultation, it will appear here. Start a video call and press the Record button.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Consultation Recordings
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {recordings.filter(r => r.status === 'COMPLETED').length} completed · {recordings.length} total
          </Typography>
        </Box>
        <IconButton onClick={loadRecordings} size="small">
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>

      {recordings.map((rec) => (
        <RecordingCard
          key={rec._id}
          rec={rec}
          onPlay={handlePlay}
          onDelete={handleDelete}
          deleting={deleting}
          loadingPlay={loadingPlay}
        />
      ))}

      {/* Playback Dialog */}
      <Dialog
        open={Boolean(playingRec)}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { bgcolor: '#0f172a', borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <RecordingsIcon sx={{ color: '#7c3aed' }} />
          Playback Recording
        </DialogTitle>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <DialogContent sx={{ p: 2 }}>
          {playError ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 2 }}>
              <Typography color="error" sx={{ textAlign: 'center' }}>{playError}</Typography>
              <Button variant="outlined" color="error" onClick={handleClose}>Close</Button>
            </Box>
          ) : blobUrl ? (
            <Box sx={{ position: 'relative' }}>
              <video
                key={blobUrl}
                ref={videoRef}
                src={blobUrl}
                crossOrigin="anonymous"
                controls
                muted={muted}
                playsInline
                preload="auto"
                onLoadedMetadata={() => {
                  // Auto-play as soon as metadata is ready
                  videoRef.current?.play().catch(() => {
                    // If muted autoplay fails somehow, show controls
                    console.warn('Autoplay prevented');
                  });
                }}
                onError={(e) => {
                  const err = (e.currentTarget as HTMLVideoElement).error;
                  setPlayError(`Video error: ${err?.message ?? 'unsupported format or corrupted file'}`);
                }}
                style={{ width: '100%', borderRadius: 8, maxHeight: '65vh', display: 'block', background: '#000' }}
              />
              {/* Unmute button — shown when muted */}
              {muted && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => { setMuted(false); videoRef.current?.play(); }}
                  sx={{
                    position: 'absolute', bottom: 44, right: 8,
                    bgcolor: 'rgba(0,0,0,0.7)', fontSize: '0.7rem',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' },
                  }}
                >
                  🔇 Click to unmute
                </Button>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 2 }}>
              <CircularProgress sx={{ color: '#7c3aed' }} />
              <Typography color="rgba(255,255,255,0.5)" variant="caption">Loading recording…</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Close
          </Button>
          {blobUrl && playingRec && (
            <Button
              variant="contained"
              href={blobUrl}
              download={`recording-${playingRec._id}.${playingRec.mimeType?.includes('mp4') ? 'mp4' : 'webm'}`}
              sx={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', fontWeight: 700 }}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const DoctorConsultations: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');

  // Support navigating back from ConsultationRoom with a specific tab open
  useEffect(() => {
    const state = location.state as { openTab?: number } | null;
    if (state?.openTab !== undefined) {
      setTab(state.openTab);
      // Clear state so refreshing doesn't keep it
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

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

  useEffect(() => { load(); }, [load]);

  const now = new Date();

  const isLive = (appt: Appointment) => {
    if (appt.status !== 'CONFIRMED' || !appt.roomToken) return false;
    const start = new Date(appt.scheduledAt);
    const end = new Date(appt.endsAt);
    return now >= start && now <= end;
  };

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
    {
      label: 'Recordings',
      filter: () => false, // handled by separate component
      icon: <RecordingsIcon />,
    },
  ];

  const filtered = useMemo(() => {
    if (tab === 4) return []; // Recordings tab has its own data source
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
        if (tab === 2) return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleJoin = (token: string, appointmentId: string) => {
    navigate(`/doctor/consultation/${token}`, { state: { appointmentId } });
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

      {/* Search — hide on Recordings tab */}
      {tab !== 4 && (
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
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {TABS.map((t, i) => {
            const isRecordingsTab = i === 4;
            const count = isRecordingsTab ? 0 : appointments.filter(t.filter).length;
            return (
              <Tab
                key={i}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isRecordingsTab && (
                      <RecordingsIcon sx={{ fontSize: 16, color: i === tab ? '#7c3aed' : 'text.secondary' }} />
                    )}
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
                sx={isRecordingsTab ? {
                  '&.Mui-selected': { color: '#7c3aed' },
                } : {}}
              />
            );
          })}
        </Tabs>
      </Box>

      {/* Content */}
      {tab === 4 ? (
        // ── Recordings Tab ──────────────────────────────────────────────────
        <RecordingsTab />
      ) : loading ? (
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
            onJoin={handleJoin}
            onWriteRx={handleWriteRx}
            actionLoading={actionLoading}
          />
        ))
      )}
    </DashboardLayout>
  );
};

export default DoctorConsultations;
