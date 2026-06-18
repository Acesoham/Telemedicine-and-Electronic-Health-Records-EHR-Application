import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  CircularProgress,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LocalHospital as MediVaultIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate(from || '/', { replace: true });
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #F0F7FF 0%, #E8F4FD 50%, #EFF8F6 100%)' }}>
      {/* Left Panel */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' }, flex: 1, flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          background: 'linear-gradient(160deg, #1565C0 0%, #0D47A1 60%, #00695C 100%)',
          p: 6, position: 'relative', overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
          <Box sx={{ width: 80, height: 80, borderRadius: '20px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3, border: '1px solid rgba(255,255,255,0.2)' }}>
            <MediVaultIcon sx={{ fontSize: 44, color: 'white' }} />
          </Box>
          <Typography variant="h1" sx={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, mb: 1.5, letterSpacing: '-0.03em' }}>
            MediVault
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', mb: 6, lineHeight: 1.6 }}>
            Secure Telemedicine & Electronic Health Records Platform
          </Typography>
          {[
            { icon: '🔒', text: 'AES-256 encrypted medical records' },
            { icon: '📹', text: 'HD video consultations via WebRTC' },
            { icon: '📋', text: 'Digitally verifiable prescriptions' },
            { icon: '📅', text: 'Smart appointment scheduling' },
          ].map((feature) => (
            <Box key={feature.text} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', textAlign: 'left' }}>
              <Typography sx={{ fontSize: '1.25rem' }}>{feature.icon}</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9375rem' }}>{feature.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right Panel - Login Form */}
      <Box sx={{ flex: { xs: 1, lg: '0 0 480px' }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: { xs: 3, sm: 6 }, backgroundColor: 'white', position: 'relative', zIndex: 1 }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: 'linear-gradient(135deg, #1565C0, #00897B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MediVaultIcon sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>MediVault</Typography>
          </Box>

          <Typography variant="h2" sx={{ mb: 0.75, fontWeight: 700 }}>Welcome back</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
            Sign in to your MediVault account to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                id="login-email"
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                autoFocus
                autoComplete="email"
              />

              <TextField
                id="login-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                autoComplete="current-password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    ),
                  },
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
                <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ fontWeight: 500, color: 'primary.main', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </Box>

              <Button
                id="login-submit"
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
                sx={{ mt: 1, py: 1.5, fontSize: '1rem', fontWeight: 700, background: 'linear-gradient(135deg, #1565C0, #1976D2)', '&:hover': { background: 'linear-gradient(135deg, #0D47A1, #1565C0)' } }}
              >
                {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
              </Button>
            </Box>
          </form>

          <Box sx={{ my: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>New to MediVault?</Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
          </Box>

          <Button component={RouterLink} to="/register" variant="outlined" fullWidth size="large" id="register-link" sx={{ py: 1.5, fontWeight: 600, borderWidth: 1.5 }}>
            Create an account
          </Button>

          <Typography variant="caption" sx={{ mt: 4, display: 'block', textAlign: 'center', lineHeight: 1.6, color: 'text.secondary' }}>
            By signing in, you agree to MediVault's{' '}
            <Link href="#" sx={{ color: 'primary.main' }}>Terms of Service</Link>{' '}
            and <Link href="#" sx={{ color: 'primary.main' }}>Privacy Policy</Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
