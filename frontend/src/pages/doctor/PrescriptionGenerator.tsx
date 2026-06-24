import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Grid as Grid,
  IconButton, Alert, CircularProgress, Autocomplete, Divider, Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Description as PrescriptionIcon,
  Dashboard as DashboardIcon,
  People as PatientsIcon,
  EventAvailable as AvailabilityIcon,
  VideoCall as ConsultationsIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import DashboardLayout, { NavItem } from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { appointmentsApi, prescriptionsApi } from '../../services/api';
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

interface MedicationInput {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

const PrescriptionGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [medications, setMedications] = useState<MedicationInput[]>([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ]);
  const [diagnosis, setDiagnosis] = useState('');
  const [generalInstructions, setGeneralInstructions] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await appointmentsApi.getAll({ limit: 100 });
        const data = (res.data?.data as { data?: Appointment[] })?.data || [];
        const validAppts = data.filter(
          (a: Appointment) => a.status === 'CONFIRMED' || a.status === 'COMPLETED',
        );
        setAppointments(validAppts);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAppointments();
  }, []);

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const handleRemoveMedication = (index: number) => {
    if (medications.length > 1) {
      const newMeds = [...medications];
      newMeds.splice(index, 1);
      setMedications(newMeds);
    }
  };

  const handleMedicationChange = (index: number, field: keyof MedicationInput, value: string) => {
    const newMeds = [...medications];
    newMeds[index][field] = value;
    setMedications(newMeds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedAppointment) {
      setError('Please select an appointment/patient');
      return;
    }

    const validMeds = medications.filter((m) => m.name.trim() !== '');
    if (validMeds.length === 0) {
      setError('Please add at least one medication');
      return;
    }

    setLoading(true);
    try {
      const patientObj = selectedAppointment.patientId;
      const patientId =
        typeof patientObj === 'object' ? (patientObj as PatientProfile)._id : patientObj;

      const payload = {
        appointmentId: selectedAppointment._id,
        patientId,
        medications: validMeds,
        diagnosis,
        instructions: generalInstructions,
      };

      await prescriptionsApi.create(payload);
      setSuccess('Prescription created successfully!');

      setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
      setDiagnosis('');
      setGeneralInstructions('');
      setSelectedAppointment(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Prescription Generator">
      {/* Header Banner */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #00695C 0%, #00897B 60%, #1565C0 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Create Prescription
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Write and digitally sign a prescription for your patient
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {/* Patient Selection */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Patient Details
            </Typography>

            <Autocomplete
              options={appointments}
              getOptionLabel={(option) => {
                const p = option.patientId as PatientProfile;
                const d = new Date(option.scheduledAt);
                return `${p.firstName ?? ''} ${p.lastName ?? ''} — ${d.toLocaleDateString()}`;
              }}
              value={selectedAppointment}
              onChange={(_, newValue) => setSelectedAppointment(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Select Patient / Appointment" required />
              )}
              sx={{ mb: 4 }}
            />

            <Divider sx={{ mb: 3 }} />

            {/* Diagnosis */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Diagnosis &amp; Notes
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Diagnosis (Encrypted)"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  multiline
                  rows={2}
                  required
                />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            {/* Medications */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Medications
              </Typography>
              <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAddMedication}>
                Add Medicine
              </Button>
            </Box>

            {medications.map((med, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2, position: 'relative' }}>
                {medications.length > 1 && (
                  <IconButton
                    color="error"
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={() => handleRemoveMedication(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth label="Medicine Name" size="small" required
                      value={med.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth label="Dosage (e.g. 500mg)" size="small" required
                      value={med.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth label="Frequency (e.g. 1-0-1)" size="small" required
                      value={med.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth label="Duration (e.g. 5 days)" size="small" required
                      value={med.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                    />
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth label="Instructions (e.g. After meal)" size="small"
                      value={med.instructions}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Divider sx={{ mb: 3, mt: 4 }} />

            {/* General Instructions */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              General Instructions
            </Typography>
            <TextField
              fullWidth
              label="Additional notes, diet restrictions, follow-up advice..."
              value={generalInstructions}
              onChange={(e) => setGeneralInstructions(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 4 }}
            />

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/doctor/appointments')}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />
                }
                disabled={loading}
              >
                Create Prescription
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PrescriptionGenerator;
