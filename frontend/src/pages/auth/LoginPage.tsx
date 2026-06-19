import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ── Eye icon SVGs ─────────────────────────────────────────────────────────────
const EyeOpen = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeClosed = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ── Input component ───────────────────────────────────────────────────────────
interface InputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  autoComplete?: string;
  placeholder?: string;
  rightElement?: React.ReactNode;
}

const FloatInput: React.FC<InputProps> = ({
  id, label, type = 'text', value, onChange, autoFocus, autoComplete, placeholder, rightElement,
}) => {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  return (
    <div style={{ position: 'relative', marginBottom: 4 }}>
      <label htmlFor={id} style={{
        position: 'absolute', left: 16,
        top: floated ? 8 : '50%',
        transform: floated ? 'translateY(0) scale(0.82)' : 'translateY(-50%) scale(1)',
        transformOrigin: 'left',
        color: focused ? '#1565C0' : '#94A3B8',
        fontSize: '1rem', fontWeight: 500,
        transition: 'all 0.2s ease',
        pointerEvents: 'none', zIndex: 1,
        background: floated ? 'transparent' : 'transparent',
        lineHeight: 1,
      }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        placeholder={focused ? (placeholder || '') : ''}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: floated ? '24px 16px 10px' : '18px 16px',
          paddingRight: rightElement ? 48 : 16,
          border: `2px solid ${focused ? '#1565C0' : '#E2E8F0'}`,
          borderRadius: 12, outline: 'none',
          fontSize: '1rem', fontFamily: 'inherit',
          background: focused ? '#FAFBFF' : 'white',
          color: '#1A2332',
          transition: 'all 0.2s ease',
          boxShadow: focused ? '0 0 0 4px rgba(21,101,192,0.1)' : 'none',
        }}
      />
      {rightElement && (
        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
          {rightElement}
        </div>
      )}
    </div>
  );
};

// ── Main Login Page ───────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || null;

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in both fields to continue.'); return; }
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate(from || '/', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message || 'Hmm, those details don\'t match. Try again?';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const leftPanelQuotes = [
    { text: '"Getting a prescription used to take a whole day. Now it takes a video call."', author: 'Priya S., Patient' },
    { text: '"MediVault has genuinely changed how I manage my patients\' care."', author: 'Dr. Arjun M., Cardiologist' },
    { text: '"I can check my lab reports at 2 AM if I need to. That peace of mind is priceless."', author: 'Ravi K., Patient' },
  ];
  const [quoteIdx] = useState(Math.floor(Math.random() * leftPanelQuotes.length));
  const quote = leftPanelQuotes[quoteIdx];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', fontFamily: 'Inter, Segoe UI, sans-serif',
    }}>
      {/* ── Left Illustration Panel ─────────────────────────────────────────── */}
      <div style={{
        flex: '0 0 44%', display: 'none',
        flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        background: 'linear-gradient(160deg, #0A1628 0%, #0D2B4E 55%, #0A3D2B 100%)',
        padding: '60px 48px', position: 'relative', overflow: 'hidden',
        ...(window.innerWidth >= 1024 ? { display: 'flex' } : {}),
      }} className="login-left-panel">

        {/* Background blobs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(21,101,192,0.25) 0%, transparent 70%)', animation: 'blob-morph 8s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(0,137,123,0.2) 0%, transparent 70%)', animation: 'blob-morph 10s ease-in-out infinite reverse', pointerEvents: 'none' }} />

        {/* Logo */}
        <RouterLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 64, textDecoration: 'none', position: 'relative' }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: 'linear-gradient(135deg, #1565C0, #00897B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 4px 14px rgba(21,101,192,0.4)' }}>🏥</div>
          <span style={{ fontWeight: 900, fontSize: '1.25rem', color: 'white', letterSpacing: '-0.02em' }}>MediVault</span>
        </RouterLink>

        {/* Big illustrative icon */}
        <div style={{
          width: 140, height: 140, borderRadius: 32,
          background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 72, marginBottom: 40,
          animation: 'floatY 4s ease-in-out infinite',
        }}>
          🩺
        </div>

        {/* Quote */}
        <div style={{
          background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
          padding: '24px 28px', maxWidth: 340, position: 'relative',
        }}>
          <div style={{ fontSize: '2rem', lineHeight: 1, marginBottom: 12, opacity: 0.5 }}>"</div>
          <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '0.9875rem', lineHeight: 1.7, margin: '0 0 16px', fontStyle: 'italic' }}>
            {quote.text.replace(/^"|"$/g, '')}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>👤</div>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', fontWeight: 500 }}>{quote.author}</span>
          </div>
        </div>

        {/* Floating badges */}
        {[
          { icon: '🔒', text: 'AES-256 Encrypted', top: '18%', right: '6%' },
          { icon: '📹', text: 'HD Video Calls', bottom: '22%', left: '4%' },
        ].map(b => (
          <div key={b.text} style={{
            position: 'absolute', ...{ top: b.top, bottom: b.bottom, right: b.right, left: b.left },
            background: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.13)', borderRadius: 100,
            padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8,
            animation: 'floatSlow 6s ease-in-out infinite',
          }}>
            <span>{b.icon}</span>
            <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600 }}>{b.text}</span>
          </div>
        ))}
      </div>

      {/* ── Right: Login Form ───────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        background: 'white', padding: '48px 24px',
        minHeight: '100vh',
      }}>
        {/* Mobile logo */}
        <RouterLink to="/" className="mobile-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, textDecoration: 'none', position: 'absolute', top: 24, left: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, #1565C0, #00897B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏥</div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1565C0' }}>MediVault</span>
        </RouterLink>

        <div style={{
          width: '100%', maxWidth: 420,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease',
        }}>
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1A2332', margin: '0 0 8px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              Hey, welcome back 👋
            </h1>
            <p style={{ color: '#64748B', fontSize: '1rem', margin: 0, lineHeight: 1.6 }}>
              Good to see you. Sign in and let's take care of your health.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FFF5F5', border: '1.5px solid #FEB2B2', borderRadius: 12,
              padding: '12px 16px', marginBottom: 20,
              display: 'flex', alignItems: 'flex-start', gap: 10,
              animation: 'fadeInUp 0.3s ease',
            }}>
              <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>⚠️</span>
              <div>
                <p style={{ color: '#C53030', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>{error}</p>
              </div>
              <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#C53030', cursor: 'pointer', fontSize: '1.1rem', padding: 0, lineHeight: 1 }}>×</button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FloatInput
              id="login-email"
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              autoFocus
              autoComplete="email"
              placeholder="you@example.com"
            />

            <FloatInput
              id="login-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              rightElement={
                <button type="button" onClick={() => setShowPassword(s => !s)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#94A3B8', display: 'flex', padding: 0,
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#1565C0')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeClosed /> : <EyeOpen />}
                </button>
              }
            />

            {/* Remember me + Forgot */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#1565C0', cursor: 'pointer' }}
                />
                <span style={{ color: '#64748B', fontSize: '0.875rem' }}>Remember me</span>
              </label>
              <RouterLink to="/forgot-password" style={{ color: '#1565C0', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, transition: 'opacity 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Forgot password?
              </RouterLink>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: 8,
                padding: '16px',
                borderRadius: 12,
                border: 'none',
                background: isLoading ? '#CBD5E1' : 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
                color: 'white',
                fontWeight: 700, fontSize: '1rem', fontFamily: 'inherit',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: isLoading ? 'none' : '0 4px 16px rgba(21,101,192,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
              onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(21,101,192,0.5)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isLoading ? 'none' : '0 4px 16px rgba(21,101,192,0.4)'; }}
            >
              {isLoading ? (
                <>
                  <span style={{
                    width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin-slow 0.7s linear infinite',
                  }} />
                  Signing you in...
                </>
              ) : 'Sign in to MediVault'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
            <span style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>New here?</span>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          </div>

          {/* Register link */}
          <RouterLink to="/register" id="register-link" style={{
            display: 'block', textAlign: 'center',
            padding: '14px', borderRadius: 12,
            border: '2px solid #E2E8F0', color: '#1A2332',
            textDecoration: 'none', fontWeight: 700, fontSize: '0.9375rem',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1565C0'; e.currentTarget.style.color = '#1565C0'; e.currentTarget.style.background = '#EFF6FF'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#1A2332'; e.currentTarget.style.background = 'transparent'; }}
          >
            Create an account →
          </RouterLink>

          <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.78rem', marginTop: 28, lineHeight: 1.6 }}>
            By signing in you agree to our{' '}
            <a href="#" style={{ color: '#64748B', textDecoration: 'underline' }}>Terms</a> and{' '}
            <a href="#" style={{ color: '#64748B', textDecoration: 'underline' }}>Privacy Policy</a>.
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .login-left-panel { display: flex !important; }
          .mobile-logo { display: none !important; }
        }
        @media (max-width: 1023px) {
          .login-left-panel { display: none !important; }
          .mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
