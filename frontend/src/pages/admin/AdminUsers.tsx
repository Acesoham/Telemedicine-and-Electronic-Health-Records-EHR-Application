/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar, IconButton,
  TextField, InputAdornment, MenuItem, Select, FormControl,
  InputLabel, Tooltip, CircularProgress, Alert, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Skeleton, Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People, Security, BarChart,
  Search, FilterList, Block, CheckCircle, Verified,
  Person, MedicalServices, AdminPanelSettings,
  Refresh, Close, Visibility, VideoCall,
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import { adminApi } from '../../services/api';

const navItems: NavItem[] = [
  { label: 'Dashboard',       path: '/admin/dashboard',   icon: <DashboardIcon /> },
  { label: 'User Management', path: '/admin/users',        icon: <People /> },
  { label: 'Audit Logs',      path: '/admin/audit-logs',  icon: <Security /> },
  { label: 'Analytics',       path: '/admin/analytics',   icon: <BarChart /> },
  { label: 'Recordings',      path: '/admin/recordings',  icon: <VideoCall /> },
];

type User = {
  _id: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  patientProfile?: { firstName: string; lastName: string };
  doctorProfile?: {
    firstName: string; lastName: string;
    specialization?: string; isVerified?: boolean;
  };
};

const roleColor: Record<string, 'primary' | 'secondary' | 'error' | 'default'> = {
  PATIENT: 'primary',
  DOCTOR:  'secondary',
  ADMIN:   'error',
};

const getRoleIcon = (role: string): React.ReactElement => {
  if (role === 'DOCTOR')  return <MedicalServices sx={{ fontSize: 14 }} />;
  if (role === 'ADMIN')   return <AdminPanelSettings sx={{ fontSize: 14 }} />;
  return <Person sx={{ fontSize: 14 }} />;
};

const getDisplayName = (u: User) => {
  if (u.doctorProfile) return `Dr. ${u.doctorProfile.firstName} ${u.doctorProfile.lastName}`;
  if (u.patientProfile) return `${u.patientProfile.firstName} ${u.patientProfile.lastName}`;
  return u.email.split('@')[0];
};

const getInitial = (u: User) => getDisplayName(u).charAt(0).toUpperCase();

const avatarBg: Record<string, string> = {
  PATIENT: '#1565C0',
  DOCTOR:  '#7B1FA2',
  ADMIN:   '#C62828',
};

// Skeleton row
const SkeletonRow = () => (
  <TableRow>
    {[60, '25%', '20%', '10%', '10%', '12%', 80].map((w, i) => (
      <TableCell key={i}><Skeleton width={typeof w === 'number' ? w : undefined} sx={{ width: w }} /></TableCell>
    ))}
  </TableRow>
);

// User Detail Dialog — uses only Box, no Grid to avoid MUI v9 grid crashes
const UserDetailDialog: React.FC<{ user: User | null; onClose: () => void }> = ({ user, onClose }) => {
  if (!user) return null;
  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>User Details</Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: avatarBg[user.role], fontSize: '1.5rem', fontWeight: 700 }}>
            {getInitial(user)}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{getDisplayName(user)}</Typography>
            <Typography color="text.secondary" variant="body2">{user.email}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip label={user.role} size="small" color={roleColor[user.role]} icon={getRoleIcon(user.role)} />
              <Chip label={user.isActive ? 'Active' : 'Suspended'} size="small" color={user.isActive ? 'success' : 'error'} />
            </Box>
          </Box>
        </Box>
        {/* Details grid via flex */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 45%', minWidth: 160 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>USER ID</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.72rem', wordBreak: 'break-all', mt: 0.25 }}>{user._id}</Typography>
          </Box>
          <Box sx={{ flex: '1 1 45%', minWidth: 160 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>JOINED</Typography>
            <Typography variant="body2" sx={{ mt: 0.25 }}>
              {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Typography>
          </Box>
          {user.doctorProfile && (
            <>
              <Box sx={{ flex: '1 1 45%', minWidth: 160 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>SPECIALIZATION</Typography>
                <Typography variant="body2" sx={{ mt: 0.25 }}>{user.doctorProfile.specialization || 'N/A'}</Typography>
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: 160 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>VERIFICATION</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={user.doctorProfile.isVerified ? 'Verified' : 'Pending'}
                    size="small"
                    color={user.doctorProfile.isVerified ? 'success' : 'warning'}
                    icon={<Verified sx={{ fontSize: 14 }} />}
                  />
                </Box>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Component
const AdminUsers: React.FC = () => {
  const [users, setUsers]           = useState<User[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(0);
  const rowsPerPage                 = 12;
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, unknown> = { page: page + 1, limit: rowsPerPage };
      if (search)                  params.search   = search;
      if (roleFilter !== 'ALL')    params.role     = roleFilter;
      if (statusFilter !== 'ALL')  params.isActive = statusFilter === 'ACTIVE';
      const res = await adminApi.getUsers(params);
      const resData = res.data.data as any;
      setUsers(resData?.users ?? resData ?? []);
      setTotal(resData?.pagination?.total ?? resData?.length ?? 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminApi.toggleUserStatus(userId);
      setSuccessMsg('User status updated successfully');
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyDoctor = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminApi.verifyDoctor(userId);
      setSuccessMsg('Doctor verified successfully');
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify doctor');
    } finally {
      setActionLoading(null);
    }
  };

  const stats = [
    { label: 'Total Users',   value: total,                                             color: '#1565C0', icon: <People /> },
    { label: 'Patients',      value: users.filter(u => u.role === 'PATIENT').length,    color: '#00897B', icon: <Person /> },
    { label: 'Doctors',       value: users.filter(u => u.role === 'DOCTOR').length,     color: '#7B1FA2', icon: <MedicalServices /> },
    { label: 'Active Users',  value: users.filter(u => u.isActive).length,              color: '#2E7D32', icon: <CheckCircle /> },
  ];

  return (
    <DashboardLayout navItems={navItems} title="User Management">

      {/* Hero */}
      <Box sx={{ mb: 3, p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #1A237E 0%, #283593 60%, #1565C0 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>User Management</Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.75)', maxWidth: 500 }}>
          Manage patient and doctor accounts, verify medical licenses, and control platform access.
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {stats.map((s) => (
          <Box key={s.label} sx={{ flex: '1 1 160px' }}>
            <Card sx={{ transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha(s.color, 0.18)}` } }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{s.label.toUpperCase()}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700,  color: s.color }}>
                      {loading ? <Skeleton width={40} /> : s.value}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: alpha(s.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', '& svg': { color: s.color } }}>
                    {s.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {successMsg && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}
      {error      && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small" placeholder="Search by name or email…" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
              sx={{ flex: 1, minWidth: 220 }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Role</InputLabel>
              <Select value={roleFilter} label="Role" onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
                startAdornment={<InputAdornment position="start"><FilterList sx={{ color: 'text.secondary', fontSize: 18 }} /></InputAdornment>}>
                <MenuItem value="ALL">All Roles</MenuItem>
                <MenuItem value="PATIENT">Patient</MenuItem>
                <MenuItem value="DOCTOR">Doctor</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchUsers} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
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
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Specialization</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                : users.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <People sx={{ fontSize: 48, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                        <Typography color="text.secondary">No users found</Typography>
                      </TableCell>
                    </TableRow>
                  )
                  : users.map((u) => (
                    <TableRow key={u._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Badge
                            badgeContent={u.doctorProfile?.isVerified ? <Verified sx={{ fontSize: 10, color: 'white' }} /> : undefined}
                            color="success" overlap="circular"
                            sx={{ '& .MuiBadge-badge': { width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0 } }}
                          >
                            <Avatar sx={{ width: 36, height: 36, bgcolor: avatarBg[u.role], fontSize: '0.875rem', fontWeight: 700 }}>
                              {getInitial(u)}
                            </Avatar>
                          </Badge>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{getDisplayName(u)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary" noWrap>{u.email}</Typography></TableCell>
                      <TableCell><Typography variant="body2" color="text.secondary">{u.doctorProfile?.specialization || '—'}</Typography></TableCell>
                      <TableCell>
                        <Chip label={u.role} size="small" color={roleColor[u.role]} icon={getRoleIcon(u.role)} sx={{ fontWeight: 600 }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={u.isActive ? 'Active' : 'Suspended'} size="small"
                          color={u.isActive ? 'success' : 'error'} variant={u.isActive ? 'filled' : 'outlined'} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => setDetailUser(u)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {u.role === 'DOCTOR' && !u.doctorProfile?.isVerified && (
                            <Tooltip title="Verify Doctor">
                              <IconButton size="small" color="success" onClick={() => handleVerifyDoctor(u._id)} disabled={actionLoading === u._id}>
                                {actionLoading === u._id ? <CircularProgress size={16} /> : <Verified fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          )}
                          {u.role !== 'ADMIN' && (
                            <Tooltip title={u.isActive ? 'Suspend User' : 'Reactivate User'}>
                              <IconButton size="small" color={u.isActive ? 'error' : 'success'} onClick={() => handleToggleStatus(u._id)} disabled={actionLoading === u._id}>
                                {actionLoading === u._id
                                  ? <CircularProgress size={16} />
                                  : u.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
        </TableContainer>

        {!loading && users.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, total)} of {total} users
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" disabled={page === 0} onClick={() => setPage(p => p - 1)} variant="outlined">Previous</Button>
              <Button size="small" disabled={(page + 1) * rowsPerPage >= total} onClick={() => setPage(p => p + 1)} variant="outlined">Next</Button>
            </Box>
          </Box>
        )}
      </Card>

      <UserDetailDialog user={detailUser} onClose={() => setDetailUser(null)} />
    </DashboardLayout>
  );
};

export default AdminUsers;
