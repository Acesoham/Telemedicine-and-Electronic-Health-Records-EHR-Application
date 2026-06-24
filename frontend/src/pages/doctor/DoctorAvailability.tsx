import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Switch,
  FormControlLabel, Chip, Avatar, Divider, Alert, CircularProgress,
  Slider, IconButton, Tooltip, alpha, Fade, Stack,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  EventAvailable as AvailabilityIcon,
  VideoCall as VideoIcon,
  Description as PrescriptionIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  CheckCircle as CheckIcon,
  AccessTime as ClockIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import { availabilityApi } from '../../services/api';
import { AvailabilitySlot } from '../../types';

// ─── Nav ─────────────────────────────────────────────────────────────────────
const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/doctor/dashboard', icon: <DashboardIcon /> },
  { label: 'My Patients', path: '/doctor/patients', icon: <PeopleIcon /> },
  { label: 'Availability', path: '/doctor/availability', icon: <AvailabilityIcon /> },
  { label: 'Consultations', path: '/doctor/consultations', icon: <VideoIcon /> },
  { label: 'Prescriptions', path: '/doctor/prescriptions/new', icon: <PrescriptionIcon /> },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DEFAULT_SLOT: AvailabilitySlot = {
  dayOfWeek: 1,
  startTime: '09:00',
  endTime: '17:00',
  isAvailable: true,
};

// ─── Slot Row ─────────────────────────────────────────────────────────────────
const SlotRow: React.FC<{
  slot: AvailabilitySlot;
  index: number;
  onChange: (i: number, updated: AvailabilitySlot) => void;
  onRemove: (i: number) => void;
}> = ({ slot, index, onChange, onRemove }) => {
  const dayColor = ['#f44336', '#2196f3', '#4caf50', '#9c27b0', '#ff9800', '#00bcd4', '#ff5722'];

  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          mb: 1.5,
          border: slot.isAvailable ? '1px solid' : '1px dashed',
          borderColor: slot.isAvailable ? 'primary.main' : 'divider',
          bgcolor: slot.isAvailable ? alpha('#1565C0', 0.03) : 'background.paper',
          transition: 'all 0.2s',
        }}
      >
        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {/* Day selector */}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', minWidth: 260 }}>
              {DAYS.map((d, di) => (
                <Chip
                  key={di}
                  label={DAY_SHORT[di]}
                  size="small"
                  onClick={() => onChange(index, { ...slot, dayOfWeek: di })}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 700,
                    bgcolor: slot.dayOfWeek === di ? dayColor[di] : alpha(dayColor[di], 0.12),
                    color: slot.dayOfWeek === di ? '#fff' : dayColor[di],
                    border: `1px solid ${alpha(dayColor[di], 0.3)}`,
                    '&:hover': { bgcolor: alpha(dayColor[di], 0.25) },
                  }}
                />
              ))}
            </Box>

            {/* Time range */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ClockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => onChange(index, { ...slot, startTime: e.target.value })}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 14,
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>to</Typography>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => onChange(index, { ...slot, endTime: e.target.value })}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 14,
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </Box>

            {/* Available toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={slot.isAvailable}
                  onChange={(e) => onChange(index, { ...slot, isAvailable: e.target.checked })}
                  size="small"
                  color="success"
                />
              }
              label={
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {slot.isAvailable ? 'Available' : 'Off'}
                </Typography>
              }
              sx={{ ml: 'auto' }}
            />

            {/* Remove */}
            <Tooltip title="Remove slot">
              <IconButton
                size="small"
                color="error"
                onClick={() => onRemove(index)}
                sx={{ ml: 0.5 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

// ─── Weekly Overview ──────────────────────────────────────────────────────────
const WeeklyOverview: React.FC<{ slots: AvailabilitySlot[] }> = ({ slots }) => {
  const grouped: Record<number, AvailabilitySlot[]> = {};
  slots.forEach((s) => {
    if (!grouped[s.dayOfWeek]) grouped[s.dayOfWeek] = [];
    grouped[s.dayOfWeek].push(s);
  });

  return (
    <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1565C0 0%, #0d47a1 100%)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TodayIcon /> Weekly Schedule Preview
        </Typography>
        <Grid container spacing={1}>
          {DAYS.map((day, di) => {
            const daySlots = grouped[di] || [];
            const activeSlots = daySlots.filter((s) => s.isAvailable);
            const isOff = activeSlots.length === 0;
            return (
              <Grid size={{ xs: 12 / 7 }} key={di}>
                <Box
                  sx={{
                    textAlign: 'center',
                    borderRadius: 2,
                    p: 1,
                    bgcolor: isOff ? alpha('#fff', 0.08) : alpha('#fff', 0.2),
                    border: `1px solid ${isOff ? alpha('#fff', 0.1) : alpha('#fff', 0.35)}`,
                    minHeight: 80,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: isOff ? alpha('#fff', 0.5) : '#fff', fontWeight: 700, display: 'block' }}
                  >
                    {DAY_SHORT[di]}
                  </Typography>
                  {isOff ? (
                    <Typography variant="caption" sx={{ color: alpha('#fff', 0.4), fontSize: '0.6rem' }}>
                      OFF
                    </Typography>
                  ) : (
                    activeSlots.map((s, si) => (
                      <Typography key={si} variant="caption" sx={{ color: '#fff', fontSize: '0.6rem', display: 'block', mt: 0.3 }}>
                        {s.startTime}–{s.endTime}
                      </Typography>
                    ))
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const DoctorAvailabilityPage: React.FC = () => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [duration, setDuration] = useState(30);
  const [accepting, setAccepting] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await availabilityApi.getMyAvailability();
      const data = res.data?.data as {
        availabilitySlots: AvailabilitySlot[];
        consultationDurationMinutes: number;
        isAcceptingAppointments: boolean;
      };
      setSlots(data?.availabilitySlots || []);
      setDuration(data?.consultationDurationMinutes || 30);
      setAccepting(data?.isAcceptingAppointments ?? true);
    } catch {
      setError('Failed to load availability. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const handleSlotChange = (i: number, updated: AvailabilitySlot) => {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? updated : s)));
  };

  const handleRemove = (i: number) => {
    setSlots((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleAdd = () => {
    setSlots((prev) => [...prev, { ...DEFAULT_SLOT }]);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await availabilityApi.updateMyAvailability({
        availabilitySlots: slots,
        consultationDurationMinutes: duration,
        isAcceptingAppointments: accepting,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Availability Management">
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress size={48} />
        </Box>
      ) : (
        <Box>
          {/* Header actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Availability Management</Typography>
              <Typography variant="body2" color="text.secondary">
                Set your weekly schedule and consultation slot duration
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={accepting}
                    onChange={(e) => setAccepting(e.target.checked)}
                    color={accepting ? 'success' : 'default'}
                  />
                }
                label={
                  <Chip
                    size="small"
                    label={accepting ? 'Accepting Appointments' : 'Not Accepting'}
                    color={accepting ? 'success' : 'default'}
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                }
              />
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : saved ? <CheckIcon /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                color={saved ? 'success' : 'primary'}
                sx={{ minWidth: 130 }}
              >
                {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {saved && (
            <Alert severity="success" sx={{ mb: 3 }} icon={<CheckIcon />}>
              Availability saved successfully! Patients will now see your updated schedule.
            </Alert>
          )}

          {/* Weekly overview */}
          <WeeklyOverview slots={slots} />

          <Grid container spacing={3}>
            {/* Left — Slots editor */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Time Slots
                      <Chip
                        label={`${slots.filter((s) => s.isAvailable).length} active`}
                        size="small"
                        color="primary"
                        sx={{ ml: 1.5, fontWeight: 700 }}
                      />
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      size="small"
                      onClick={handleAdd}
                    >
                      Add Slot
                    </Button>
                  </Box>

                  {slots.length === 0 ? (
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 8,
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      <AvailabilityIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No availability slots yet
                      </Typography>
                      <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                        Add your first time slot to start accepting appointments
                      </Typography>
                      <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
                        Add First Slot
                      </Button>
                    </Box>
                  ) : (
                    slots.map((slot, i) => (
                      <SlotRow
                        key={i}
                        slot={slot}
                        index={i}
                        onChange={handleSlotChange}
                        onRemove={handleRemove}
                      />
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Right — Settings */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                      <ClockIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Session Duration
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h2" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
                      {duration}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">minutes per consultation</Typography>
                  </Box>

                  <Slider
                    value={duration}
                    onChange={(_, v) => setDuration(v as number)}
                    min={15}
                    max={120}
                    step={15}
                    marks={[
                      { value: 15, label: '15m' },
                      { value: 30, label: '30m' },
                      { value: 45, label: '45m' },
                      { value: 60, label: '1h' },
                      { value: 90, label: '90m' },
                      { value: 120, label: '2h' },
                    ]}
                    valueLabelDisplay="auto"
                    sx={{ mt: 1 }}
                  />

                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="text.secondary">
                    Each time slot you add will be blocked in this duration. Patients will see session
                    length when browsing your profile.
                  </Typography>
                </CardContent>
              </Card>

              {/* Quick tips */}
              <Card sx={{ bgcolor: alpha('#1565C0', 0.04), border: '1px solid', borderColor: alpha('#1565C0', 0.15) }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'primary.main' }}>
                    💡 Tips
                  </Typography>
                  {[
                    'Add one slot per day for recurring hours',
                    'Toggle a slot "Off" to pause without deleting',
                    'Turn off "Accepting Appointments" to pause all bookings',
                    'Patients can see your schedule when browsing doctors',
                  ].map((tip, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Typography variant="caption" color="primary.main" sx={{ fontWeight: 'bold', flexShrink: 0 }}>
                        {i + 1}.
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{tip}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </DashboardLayout>
  );
};

export default DoctorAvailabilityPage;
