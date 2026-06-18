import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Alert, IconButton, CircularProgress,
  ToggleButton, ToggleButtonGroup, MenuItem, Link, Stepper, Step, StepLabel,
} from '@mui/material';
import {
  Visibility, VisibilityOff, LocalHospital as MediVaultIcon,
  MedicalServices as DoctorIcon, PersonOutlined as PatientIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';

const GENDERS = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'];
const GENDER_LABELS: Record<string, string> = {
  MALE: 'Male', FEMALE: 'Female', OTHER: 'Other', PREFER_NOT_TO_SAY: 'Prefer not to say',
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', dateOfBirth: '', gender: 'PREFER_NOT_TO_SAY', phone: '', specialization: '', licenseNumber: '' });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const validateStep0 = () => {
    if (!form.email) return 'Email is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Invalid email format.';
    if (!form.password || form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const handleNext = () => {
    const err = validateStep0();
    if (err) { setError(err); return; }
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!form.firstName) { setError('First name is required.'); return; }
    if (role === 'PATIENT' && !form.dateOfBirth) { setError('Date of birth is required.'); return; }
    if (role === 'DOCTOR' && (!form.specialization || !form.licenseNumber)) { setError('Specialization and license number are required.'); return; }

    setIsLoading(true);
    setError('');
    try {
      const payload: Record<string, string> = {
        email: form.email, password: form.password, role,
        firstName: form.firstName, lastName: form.lastName, phone: form.phone,
        ...(role === 'PATIENT' ? { dateOfBirth: form.dateOfBirth, gender: form.gender } : {}),
        ...(role === 'DOCTOR' ? { specialization: form.specialization, licenseNumber: form.licenseNumber } : {}),
      };

      const response = await authApi.register(payload);
      if (response.data.success) {
        const { accessToken, refreshToken } = response.data.data as { accessToken: string; refreshToken: string };
        localStorage.setItem('medivault_access_token', accessToken);
        localStorage.setItem('medivault_refresh_token', refreshToken);
        setSuccess(true);
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #F0F7FF 0%, #E8F4FD 50%, #EFF8F6 100%)', alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 520 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 5, justifyContent: 'center' }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #1565C0, #00897B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MediVaultIcon sx={{ fontSize: 26, color: 'white' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>MediVault</Typography>
        </Box>

        <Box sx={{ backgroundColor: 'white', borderRadius: 3, p: { xs: 3, sm: 5 }, boxShadow: '0px 8px 40px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}>
          <Typography variant="h2" sx={{ mb: 0.5, fontWeight: 700 }}>Create account</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>Join MediVault — your secure healthcare platform</Typography>

          <Stepper activeStep={step} sx={{ mb: 4 }}>
            <Step><StepLabel>Account</StepLabel></Step>
            <Step><StepLabel>Profile</StepLabel></Step>
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>Account created! Redirecting...</Alert>}

          {step === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1 }}>I am a</Typography>
                <ToggleButtonGroup value={role} exclusive onChange={(_, val) => val && setRole(val)} fullWidth sx={{ gap: 1 }}>
                  {(['PATIENT', 'DOCTOR'] as const).map((r) => (
                    <ToggleButton key={r} value={r} sx={{ flex: 1, py: 1.5, borderRadius: '8px !important', border: '1.5px solid #E2E8F0 !important', fontWeight: 600, gap: 1, '&.Mui-selected': { backgroundColor: 'primary.main', color: 'white', borderColor: 'primary.main !important', '&:hover': { backgroundColor: 'primary.dark' } } }}>
                      {r === 'PATIENT' ? <PatientIcon /> : <DoctorIcon />}
                      {r === 'PATIENT' ? 'Patient' : 'Doctor'}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              <TextField id="register-email" label="Email address" type="email" value={form.email} onChange={handleChange('email')} fullWidth required />

              <TextField
                id="register-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange('password')}
                fullWidth
                required
                helperText="Min 8 characters with uppercase, number, and symbol"
                slotProps={{
                  input: {
                    endAdornment: (
                      <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  },
                }}
              />

              <TextField id="register-confirm-password" label="Confirm password" type="password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} fullWidth required />

              <Button variant="contained" size="large" fullWidth onClick={handleNext} sx={{ mt: 1, py: 1.5, fontWeight: 700 }}>Continue</Button>
            </Box>
          )}

          {step === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField id="register-first-name" label="First name" value={form.firstName} onChange={handleChange('firstName')} fullWidth required />
                <TextField id="register-last-name" label="Last name" value={form.lastName} onChange={handleChange('lastName')} fullWidth required />
              </Box>

              <TextField id="register-phone" label="Phone number" value={form.phone} onChange={handleChange('phone')} fullWidth />

              {role === 'PATIENT' && (
                <>
                  <TextField
                    id="register-dob"
                    label="Date of birth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={handleChange('dateOfBirth')}
                    fullWidth
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <TextField id="register-gender" label="Gender" select value={form.gender} onChange={handleChange('gender')} fullWidth>
                    {GENDERS.map((g) => <MenuItem key={g} value={g}>{GENDER_LABELS[g]}</MenuItem>)}
                  </TextField>
                </>
              )}

              {role === 'DOCTOR' && (
                <>
                  <TextField id="register-specialization" label="Specialization" value={form.specialization} onChange={handleChange('specialization')} fullWidth required placeholder="e.g. Cardiology, Pediatrics" />
                  <TextField id="register-license" label="Medical License Number" value={form.licenseNumber} onChange={handleChange('licenseNumber')} fullWidth required />
                </>
              )}

              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Button variant="outlined" size="large" onClick={() => setStep(0)} sx={{ flex: 1, py: 1.5, fontWeight: 600 }}>Back</Button>
                <Button
                  id="register-submit"
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  sx={{ flex: 2, py: 1.5, fontWeight: 700, background: 'linear-gradient(135deg, #1565C0, #1976D2)' }}
                >
                  {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
                </Button>
              </Box>
            </Box>
          )}

          <Box sx={{ my: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Already have an account?</Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none' }}>Sign in instead</Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
