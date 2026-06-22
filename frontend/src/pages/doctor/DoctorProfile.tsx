import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  Chip, Avatar, Divider, Alert, CircularProgress, IconButton, alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PatientsIcon,
  EventAvailable as AvailabilityIcon,
  VideoCall as ConsultationsIcon,
  Description as PrescriptionIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/doctor/dashboard', icon: <DashboardIcon /> },
  { label: 'My Patients', path: '/doctor/patients', icon: <PatientsIcon /> },
  { label: 'Appointments', path: '/doctor/appointments', icon: <CalendarIcon /> },
  { label: 'Availability', path: '/doctor/availability', icon: <AvailabilityIcon /> },
  { label: 'Consultations', path: '/doctor/consultations', icon: <ConsultationsIcon /> },
  { label: 'Prescriptions', path: '/doctor/prescriptions/new', icon: <PrescriptionIcon /> },
  { label: 'My Profile', path: '/doctor/profile', icon: <PersonIcon /> },
];

const DoctorProfile: React.FC = () => {
  const { profile, login } = useAuth(); // login from context updates state if needed, or we can just fetch fresh profile
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const doctor = profile as any;
  
  const [formData, setFormData] = useState({
    specialization: '',
    bio: '',
    yearsOfExperience: 0,
    consultationDurationMinutes: 30,
    qualifications: [] as string[],
  });
  
  const [newQual, setNewQual] = useState('');

  useEffect(() => {
    if (doctor) {
      setFormData({
        specialization: doctor.specialization || '',
        bio: doctor.bio || '',
        yearsOfExperience: doctor.yearsOfExperience || 0,
        consultationDurationMinutes: doctor.consultationDurationMinutes || 30,
        qualifications: doctor.qualifications || [],
      });
    }
  }, [doctor]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddQual = () => {
    if (newQual.trim() && !formData.qualifications.includes(newQual.trim())) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, newQual.trim()],
      }));
      setNewQual('');
    }
  };

  const handleRemoveQual = (qual: string) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(q => q !== qual),
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await authApi.updateDoctorProfile(formData);
      setSuccess('Profile updated successfully!');
      // Ideally we would trigger a context update here, but a reload or just seeing success is fine
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Doctor Profile">
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Card sx={{ borderRadius: 3, overflow: 'visible' }}>
          <Box
            sx={{
              height: 120,
              background: 'linear-gradient(135deg, #00695C 0%, #00897B 60%, #1565C0 100%)',
              borderRadius: '12px 12px 0 0',
              position: 'relative',
            }}
          >
            <Avatar
              sx={{
                width: 100, height: 100,
                position: 'absolute', bottom: -50, left: 32,
                border: '4px solid white', bgcolor: 'primary.main',
                fontSize: '2.5rem', fontWeight: 700,
              }}
            >
              {(doctor?.firstName || 'D').charAt(0)}
            </Avatar>
          </Box>
          
          <CardContent sx={{ pt: 8, px: 4, pb: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Dr. {doctor?.firstName} {doctor?.lastName}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                License: {doctor?.licenseNumber}
              </Typography>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Specialization"
                  value={formData.specialization}
                  onChange={(e) => handleChange('specialization', e.target.value)}
                  placeholder="e.g. Cardiologist"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Years of Exp."
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleChange('yearsOfExperience', Number(e.target.value))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Session Duration (mins)"
                  value={formData.consultationDurationMinutes}
                  onChange={(e) => handleChange('consultationDurationMinutes', Number(e.target.value))}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Professional Bio"
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell patients about your background, expertise, and approach to care..."
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Degrees & Qualifications
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="e.g. MD - Harvard Medical School"
                    value={newQual}
                    onChange={(e) => setNewQual(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddQual()}
                    sx={{ flex: 1 }}
                  />
                  <Button variant="outlined" onClick={handleAddQual} startIcon={<AddIcon />}>
                    Add
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {formData.qualifications.map((qual, idx) => (
                    <Chip
                      key={idx}
                      label={qual}
                      onDelete={() => handleRemoveQual(qual)}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  ))}
                  {formData.qualifications.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No qualifications added yet.
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={loading}
                    sx={{ px: 4 }}
                  >
                    Save Profile
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default DoctorProfile;
