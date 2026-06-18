import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
} from '@mui/material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';

import { NavItem } from '../../components/layout/DashboardLayout';
import {
  CalendarToday as CalendarIcon,
  Assignment as RecordsIcon,
  Description as PrescriptionIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/patient/dashboard', icon: <DashboardIcon /> },
  { label: 'Medical Records', path: '/patient/records', icon: <RecordsIcon /> },
  { label: 'Appointments', path: '/patient/appointments', icon: <CalendarIcon /> },
  { label: 'Prescriptions', path: '/patient/prescriptions', icon: <PrescriptionIcon /> },
];

const PatientRecords: React.FC = () => {
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await api.get('/ehr/my-record');
        setRecord(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch medical records');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, []);

  return (
    <DashboardLayout navItems={navItems} title="My Medical Records">
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : record ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Demographics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {Object.entries(record.demographics || {}).length > 0 ? (
                <List dense>
                  {Object.entries(record.demographics).map(([key, value]) => (
                    <ListItem key={key} disablePadding>
                      <ListItemText
                        primary={key}
                        secondary={String(value)}
                        slotProps={{
                          primary: { sx: { textTransform: 'capitalize', fontWeight: 'bold' } }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">No demographics recorded.</Typography>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Allergies & Medical History
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" gutterBottom>Allergies:</Typography>
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {record.allergies?.length > 0 ? (
                  record.allergies.map((allergy: string, idx: number) => (
                    <Chip key={idx} label={allergy} color="error" variant="outlined" size="small" />
                  ))
                ) : (
                  <Typography color="text.secondary" variant="body2">None</Typography>
                )}
              </Box>

              <Typography variant="subtitle2" gutterBottom>Medical History:</Typography>
              <Typography variant="body2" color="text.secondary">
                {record.medicalHistory || 'No medical history recorded.'}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Diagnoses & Consultation Notes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
                Diagnoses
              </Typography>
              {record.diagnoses?.length > 0 ? (
                <List>
                  {record.diagnoses.map((diag: any, i: number) => (
                    <ListItem key={i}>
                      <ListItemText
                        primary={diag.description}
                        secondary={`Code: ${diag.code || 'N/A'} - Date: ${new Date(diag.diagnosedAt).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ mb: 2 }}>No diagnoses recorded.</Typography>
              )}

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
                Consultation Notes
              </Typography>
              {record.consultationNotes?.length > 0 ? (
                <List>
                  {record.consultationNotes.map((note: any, i: number) => (
                    <ListItem key={i} sx={{ bgcolor: 'action.hover', mb: 1, borderRadius: 1 }}>
                      <ListItemText
                        primary={note.note}
                        secondary={`Date: ${new Date(note.createdAt).toLocaleString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">No consultation notes recorded.</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>No medical records found.</Alert>
      )}
    </DashboardLayout>
  );
};

export default PatientRecords;
