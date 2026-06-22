import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Divider, CircularProgress, Alert,
  List, ListItem, ListItemText, Chip, Grid, Button, TextField,
  IconButton, alpha,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Assignment as RecordsIcon,
  Description as PrescriptionIcon,
  Dashboard as DashboardIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CancelIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import { ehrApi } from '../../services/api';

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
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    demographics: {} as Record<string, string>,
    allergies: [] as string[],
    medicalHistory: '',
  });
  const [newAllergy, setNewAllergy] = useState('');

  const fetchRecord = async () => {
    setLoading(true);
    try {
      const response = await ehrApi.getMyRecord();
      const data = response.data?.data as any;
      setRecord(data);
      if (data) {
        setEditForm({
          demographics: data.demographics || {},
          allergies: data.allergies || [],
          medicalHistory: data.medicalHistory || '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch medical records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await ehrApi.updateMyRecord({
        demographics: editForm.demographics,
        allergies: editForm.allergies,
        medicalHistory: editForm.medicalHistory,
      });
      setIsEditing(false);
      fetchRecord();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update records');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (record) {
      setEditForm({
        demographics: record.demographics || {},
        allergies: record.allergies || [],
        medicalHistory: record.medicalHistory || '',
      });
    }
    setIsEditing(false);
    setError('');
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !editForm.allergies.includes(newAllergy.trim())) {
      setEditForm(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()],
      }));
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    setEditForm(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy),
    }));
  };

  const handleDemographicChange = (key: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      demographics: { ...prev.demographics, [key]: value },
    }));
  };

  const demographicFields = ['bloodGroup', 'height', 'weight', 'emergencyContactName', 'emergencyContactPhone'];

  return (
    <DashboardLayout navItems={navItems} title="My Medical Records">
      {/* Header with Edit Action */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Health Profile</Typography>
          <Typography color="text.secondary">
            Manage your personal health information and view medical history
          </Typography>
        </Box>
        {!loading && !error && (
          isEditing ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                Save Changes
              </Button>
            </Box>
          ) : (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Update Info
            </Button>
          )
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : record ? (
        <Grid container spacing={3}>
          {/* Top Row: Demographics & Allergies */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Demographics & Vitals
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {isEditing ? (
                <Grid container spacing={2}>
                  {demographicFields.map(field => (
                    <Grid size={{ xs: 12, sm: 6 }} key={field}>
                      <TextField
                        fullWidth
                        size="small"
                        label={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        value={editForm.demographics[field] || ''}
                        onChange={(e) => handleDemographicChange(field, e.target.value)}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                Object.keys(record.demographics || {}).length > 0 ? (
                  <List dense disablePadding>
                    {Object.entries(record.demographics).map(([key, value]) => (
                      <ListItem key={key} disablePadding sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <ListItemText
                          primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          secondary={String(value)}
                          slotProps={{
                            primary: { sx: { color: 'text.secondary', fontSize: '0.875rem' } },
                            secondary: { sx: { color: 'text.primary', fontWeight: 600, fontSize: '1rem', mt: 0.5 } }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">No demographics recorded. Click 'Update Info' to add.</Typography>
                )
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Known Allergies
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {isEditing ? (
                <Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Add an allergy..."
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddAllergy()}
                    />
                    <IconButton onClick={handleAddAllergy} color="primary" sx={{ bgcolor: alpha('#1565C0', 0.1) }}>
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {editForm.allergies.map((allergy, idx) => (
                      <Chip
                        key={idx}
                        label={allergy}
                        color="error"
                        variant="outlined"
                        onDelete={() => handleRemoveAllergy(allergy)}
                      />
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {record.allergies?.length > 0 ? (
                    record.allergies.map((allergy: string, idx: number) => (
                      <Chip key={idx} label={allergy} color="error" sx={{ fontWeight: 600 }} />
                    ))
                  ) : (
                    <Typography color="text.secondary">No known allergies recorded.</Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Full Width: Medical History */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Personal Medical History
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Describe your medical history, past surgeries, chronic conditions, etc..."
                  value={editForm.medicalHistory}
                  onChange={(e) => setEditForm(prev => ({ ...prev, medicalHistory: e.target.value }))}
                />
              ) : (
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {record.medicalHistory || <span style={{ color: 'gray' }}>No medical history recorded.</span>}
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Doctor-controlled sections (View Only) */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: alpha('#1565C0', 0.02) }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Doctor's Notes & Diagnoses
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These records are maintained by your healthcare providers and cannot be edited.
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                    Diagnoses
                  </Typography>
                  {record.diagnoses?.length > 0 ? (
                    <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                      {record.diagnoses.map((diag: any, i: number) => (
                        <ListItem key={i} sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                          <ListItemText
                            primary={diag.description}
                            secondary={`Code: ${diag.code || 'N/A'} • Diagnosed: ${new Date(diag.diagnosedAt).toLocaleDateString()}`}
                            slotProps={{ primary: { sx: { fontWeight: 600 } } }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="text.secondary">No diagnoses recorded.</Typography>
                  )}
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                    Consultation Notes
                  </Typography>
                  {record.consultationNotes?.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {record.consultationNotes.map((note: any, i: number) => (
                        <Box key={i} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>{note.note}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Date: {new Date(note.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No consultation notes recorded.</Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="info">Your medical profile is currently empty.</Alert>
      )}
    </DashboardLayout>
  );
};

export default PatientRecords;
