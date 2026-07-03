/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, Avatar, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Alert, Skeleton, alpha, Button, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People, Security, BarChart, VideoCall,
  PlayArrow, Close, Refresh, Search, GraphicEq,
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

type Recording = {
  _id: string;
  appointmentId: string;
  status: 'RECORDING' | 'COMPLETED' | 'FAILED';
  durationSeconds?: number;
  fileSize?: number;
  mimeType?: string;
  startedAt: string;
  endedAt?: string;
  doctorId?: { firstName?: string; lastName?: string };
  patientId?: { firstName?: string; lastName?: string };
};

const formatDuration = (secs?: number) => {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
};

const formatSize = (bytes?: number) => {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  COMPLETED: 'success',
  RECORDING: 'warning',
  FAILED:    'error',
};

// Video preview dialog
const VideoDialog: React.FC<{ id: string | null; onClose: () => void }> = ({ id, onClose }) => {
  const token = localStorage.getItem('medivault_access_token');
  if (!id) return null;
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const streamUrl = `${API}/recordings/${id}/stream?token=${token}`;
  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontWeight: 700 }}>Consultation Recording</Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, bgcolor: '#000', display: 'flex', justifyContent: 'center' }}>
        <video
          src={streamUrl}
          controls
          autoPlay
          style={{ width: '100%', maxHeight: '70vh', outline: 'none' }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminRecordings: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [playId, setPlayId]         = useState<string | null>(null);

  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getRecordings();
      const resData = res.data.data as any;
      setRecordings(resData?.recordings ?? resData ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch recordings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecordings(); }, [fetchRecordings]);

  const filtered = recordings.filter(r => {
    if (!search) return true;
    const doctorName = r.doctorId ? `${r.doctorId.firstName ?? ''} ${r.doctorId.lastName ?? ''}`.toLowerCase() : '';
    const patientName = r.patientId ? `${r.patientId.firstName ?? ''} ${r.patientId.lastName ?? ''}`.toLowerCase() : '';
    return doctorName.includes(search.toLowerCase()) || patientName.includes(search.toLowerCase());
  });

  const totalCompleted = recordings.filter(r => r.status === 'COMPLETED').length;
  const totalDuration  = recordings.reduce((acc, r) => acc + (r.durationSeconds ?? 0), 0);
  const totalSize      = recordings.reduce((acc, r) => acc + (r.fileSize ?? 0), 0);

  return (
    <DashboardLayout navItems={navItems} title="Consultation Recordings">

      {/* Hero */}
      <Box sx={{
        mb: 3, p: 3, borderRadius: 3,
        background: 'linear-gradient(135deg, #1B0045 0%, #4A148C 60%, #7B1FA2 100%)',
        color: 'white',
      }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>Consultation Recordings</Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.75)' }}>
          All video consultations recorded across the platform — compliance archive.
        </Typography>
      </Box>

      {/* Summary stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Recordings', value: recordings.length, color: '#7B1FA2' },
          { label: 'Completed',        value: totalCompleted,    color: '#2E7D32' },
          { label: 'Total Duration',   value: formatDuration(totalDuration), color: '#1565C0' },
          { label: 'Total Storage',    value: formatSize(totalSize),         color: '#E65100' },
        ].map(s => (
          <Box key={s.label} sx={{ flex: '1 1 160px' }}>
            <Card sx={{ transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha(s.color, 0.18)}` } }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{s.label.toUpperCase()}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800,  color: s.color, mt: 0.5 }}>
                  {loading ? <Skeleton width={50} /> : s.value}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Filter bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small" placeholder="Search by patient, doctor, or ID…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
              sx={{ flex: 1, minWidth: 260 }}
            />
            <Tooltip title="Refresh">
              <IconButton onClick={fetchRecordings} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Doctor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>File Size</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Started At</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Play</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(7)].map((__, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                    </TableRow>
                  ))
                : filtered.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                        <GraphicEq sx={{ fontSize: 56, color: 'text.disabled', display: 'block', mx: 'auto', mb: 1 }} />
                        <Typography color="text.secondary">No recordings found</Typography>
                      </TableCell>
                    </TableRow>
                  )
                  : filtered.map((r) => (
                    <TableRow key={r._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 30, height: 30, bgcolor: '#7B1FA2', fontSize: '0.75rem', fontWeight: 700 }}>
                            {r.doctorId?.firstName?.charAt(0) ?? 'D'}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {r.doctorId ? `Dr. ${r.doctorId.firstName} ${r.doctorId.lastName}` : '—'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 30, height: 30, bgcolor: '#1565C0', fontSize: '0.75rem', fontWeight: 700 }}>
                            {r.patientId?.firstName?.charAt(0) ?? 'P'}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {r.patientId ? `${r.patientId.firstName} ${r.patientId.lastName}` : '—'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={r.status} size="small" color={statusColor[r.status]} sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell><Typography variant="body2">{formatDuration(r.durationSeconds)}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{formatSize(r.fileSize)}</Typography></TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(r.startedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {r.status === 'COMPLETED' ? (
                          <Tooltip title="Play Recording">
                            <IconButton size="small" color="primary" onClick={() => setPlayId(r._id)}
                              sx={{ bgcolor: alpha('#1565C0', 0.1), '&:hover': { bgcolor: alpha('#1565C0', 0.2) } }}>
                              <PlayArrow fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.disabled">N/A</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <VideoDialog id={playId} onClose={() => setPlayId(null)} />
    </DashboardLayout>
  );
};

export default AdminRecordings;
