import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  TablePagination,
} from '@mui/material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';

import { NavItem } from '../../components/layout/DashboardLayout';
import {
  Dashboard as DashboardIcon, People, AdminPanelSettings,
  BarChart, Security, EventNote, HealthAndSafety,
} from '@mui/icons-material';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { label: 'User Management', path: '/admin/users', icon: <People /> },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: <Security /> },
  { label: 'Analytics', path: '/admin/analytics', icon: <BarChart /> },
];

const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/audit?page=${page + 1}&limit=${rowsPerPage}`);
        setLogs(response.data.data.logs);
        setTotal(response.data.data.pagination.total);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch audit logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <DashboardLayout navItems={navItems} title="System Audit Logs">
      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Immutable Audit Trail
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          All critical system actions are logged here and cannot be modified or deleted.
        </Typography>

        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

        <TableContainer sx={{ mt: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell>Timestamp</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>User Role</TableCell>
                <TableCell>User Email</TableCell>
                <TableCell>Resource</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: any) => (
                  <TableRow key={log._id} hover>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip label={log.action} size="small" variant="outlined" color="primary" />
                    </TableCell>
                    <TableCell>{log.role || 'N/A'}</TableCell>
                    <TableCell>{log.userEmail || log.userId || 'System'}</TableCell>
                    <TableCell>{log.resource ? `${log.resource} (${log.resourceId || 'N/A'})` : 'N/A'}</TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.success ? 'SUCCESS' : 'FAILED'}
                        size="small"
                        color={log.success ? 'success' : 'error'}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </DashboardLayout>
  );
};

export default AdminAuditLogs;
