import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ── Icons ───────────────────────────────────────────────────────────────────────
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
const MailIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#94A3B8" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 4l-10 9L2 4" />
  </svg>
);
const ShieldCheckIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#1565C0"/>
    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const FeatureItem: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      {icon}
    </div>
    <div>
      <div style={{ color: '#111827', fontWeight: 800, fontSize: '0.85rem', marginBottom: 2 }}>{title}</div>
      <div style={{ color: '#4B5563', fontSize: '0.75rem', lineHeight: 1.4 }}>{desc}</div>
    </div>
  </div>
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
const StyledInput: React.FC<InputProps> = ({ id, label, type = 'text', value, onChange, autoFocus, autoComplete, placeholder, rightElement }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 4 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          autoFocus={autoFocus} autoComplete={autoComplete} placeholder={placeholder}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '12px 16px', paddingRight: rightElement ? 44 : 16,
            border: `1.5px solid ${focused ? '#1565C0' : '#E2E8F0'}`, borderRadius: 8, outline: 'none',
            fontSize: '0.9rem', fontFamily: 'inherit', background: 'white', color: '#1A2332', transition: 'border-color 0.2s ease',
          }}
        />
        {rightElement && <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 2, display: 'flex', alignItems: 'center' }}>{rightElement}</div>}
      </div>
    </div>
  );
};

// ── Main Login Page ───────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in both fields to continue.'); return; }
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate(from || '/', { replace: true });
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.message || (err as Error)?.message || 'Hmm, those details don\'t match. Try again?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, Segoe UI, sans-serif', background: '#EAEFF5', padding: '24px'
    }}>
      <div style={{
        display: 'flex', width: '100%', maxWidth: 1100, minHeight: 720,
        background: 'white', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        overflow: 'hidden', padding: '12px'
      }}>
        {/* ── Left Panel with text overlay ────────────────────────────────────── */}
        <div className="login-left-panel" style={{
          flex: '0 0 45%', position: 'relative', borderRadius: 16, overflow: 'hidden',
          background: '#F0F6FF',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Background image behind all the text */}
          <img src="/login_image.png" alt="Login bg" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 'auto', zIndex: 0 }} />

          {/* Text content overlaid */}
          <div style={{ position: 'relative', zIndex: 1, padding: '40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <RouterLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
              <img src="/MediVaultLogo.png" alt="MediVault" style={{ width: 32, height: 32 }} />
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#111827' }}>MediVault</span>
            </RouterLink>

            <h1 style={{ color: '#111827', fontWeight: 900, fontSize: '2.5rem', margin: '0 0 12px', letterSpacing: '-0.03em' }}>
              Welcome <span style={{ color: '#2563EB' }}>back!</span>
            </h1>
            <p style={{ color: '#4B5563', fontSize: '0.95rem', margin: '0 0 32px' }}>
              Sign in to continue your healthcare journey
            </p>

            {/* Features */}
            <div style={{ marginBottom: 'auto' }}>
              <FeatureItem 
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#10B981"/><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>} 
                title="Secure & Encrypted" desc="Your data is protected with end-to-end encryption" 
              />
              <FeatureItem 
                icon={<svg width="18" height="18" fill="none" stroke="#2563EB" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>} 
                title="HD Video Consultations" desc="Connect with doctors from anywhere" 
              />
              <FeatureItem 
                icon={<svg width="18" height="18" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>} 
                title="Digital Health Records" desc="Access your records anytime, anywhere" 
              />
            </div>

            {/* Testimonial Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)',
              borderRadius: 16, padding: '16px', marginTop: 32,
              boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 12
            }}>
              <img src="https://i.pravatar.cc/150?img=32" alt="User" style={{ width: 44, height: 44, borderRadius: '50%' }} />
              <div>
                <div style={{ color: '#111827', fontSize: '0.75rem', fontWeight: 600, fontStyle: 'italic', marginBottom: 4, lineHeight: 1.4 }}>
                  "MediVault has made managing my health so easy and convenient!"
                </div>
                <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ color: '#F59E0B', fontSize: '0.8rem' }}>★</span>)}
                  <span style={{ color: '#6B7280', fontSize: '0.75rem', marginLeft: 4, fontWeight: 500 }}>4.8/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Panel (Form) ──────────────────────────────────────────────── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          background: 'white', padding: '48px', position: 'relative',
        }}>
          <RouterLink to="/" className="mobile-logo" style={{ display: 'none', alignItems: 'center', gap: 10, textDecoration: 'none', position: 'absolute', top: 24, left: 24 }}>
            <img src="/MediVaultLogo.png" alt="MediVault" style={{ width: 32, height: 32 }} />
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#111827' }}>MediVault</span>
          </RouterLink>

          <div style={{ width: '100%', maxWidth: 380 }}>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Sign in to your account</h2>
              <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>Welcome back! Please enter your details.</p>
            </div>

            {error && (
              <div style={{ background: '#FFF5F5', border: '1.5px solid #FEB2B2', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>⚠️</span>
                <p style={{ color: '#C53030', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>{error}</p>
                <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#C53030', cursor: 'pointer', fontSize: '1.1rem', padding: 0, lineHeight: 1 }}>×</button>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <StyledInput id="login-email" label="Email address" type="email" value={email} onChange={setEmail} autoFocus autoComplete="email" placeholder="you@exemple.com" rightElement={<MailIcon />} />
              <StyledInput id="login-password" label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={setPassword} autoComplete="current-password" placeholder="••••••••••" rightElement={<button type="button" onClick={() => setShowPassword(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 0 }}>{showPassword ? <EyeClosed /> : <EyeOpen />}</button>} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2563EB', cursor: 'pointer', borderRadius: 4 }} />
                  <span style={{ color: '#4B5563', fontSize: '0.875rem', fontWeight: 500 }}>Remember me</span>
                </label>
                <RouterLink to="/forgot-password" style={{ color: '#2563EB', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Forgot password?</RouterLink>
              </div>

              <button type="submit" disabled={isLoading} style={{ marginTop: 8, padding: '14px', borderRadius: 8, border: 'none', background: isLoading ? '#93C5FD' : '#2563EB', color: 'white', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'inherit', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {isLoading ? 'Signing you in...' : 'Sign in'} {!isLoading && <span>→</span>}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
              <span style={{ color: '#9CA3AF', fontSize: '0.8125rem' }}>or continue with</span>
              <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <button style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
              <button style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                Continue with Apple
              </button>
            </div>

            <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.875rem', marginTop: 32 }}>
              Don't have an account? <RouterLink to="/register" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>Create account</RouterLink>
            </p>
            <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.8rem', marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <ShieldCheckIcon /> Your data is 100% secure and encrypted
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .login-left-panel { display: none !important; }
          .mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
};
export default LoginPage;
