import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';

// ── Icons ─────────────────────────────────────────────────────────────────────
const EyeOpen = () => (
  <svg width="20" height="20" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);
const EyeClosed = () => (
  <svg width="20" height="20" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
);
const UserIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const MailIcon = () => (
  <svg width="18" height="18" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 9L2 4"/></svg>
);
const ShieldCheckIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#2563EB"/><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

// ── Labeled Input ─────────────────────────────────────────────────────────────
interface InputProps {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; autoComplete?: string;
  rightElement?: React.ReactNode; select?: boolean; selectOptions?: { value: string; label: string }[];
}
const StyledInput: React.FC<InputProps> = ({ id, label, type = 'text', value, onChange, placeholder, autoComplete, rightElement, select, selectOptions }) => {
  const [focused, setFocused] = useState(false);
  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '12px 16px', paddingRight: rightElement || select ? 44 : 16,
    border: `1.5px solid ${focused ? '#2563EB' : '#E5E7EB'}`, borderRadius: 8, outline: 'none', fontSize: '0.9rem', fontFamily: 'inherit',
    background: 'white', color: '#111827', transition: 'border-color 0.2s ease',
  };
  return (
    <div style={{ marginBottom: 4 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {select && selectOptions ? (
          <select id={id} value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
            {selectOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder={placeholder} autoComplete={autoComplete} style={inputStyle} />
        )}
        {rightElement && <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 2, display: 'flex', alignItems: 'center' }}>{rightElement}</div>}
        {select && <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF', fontSize: '0.8rem' }}>▾</div>}
      </div>
    </div>
  );
};

// ── Role Card ─────────────────────────────────────────────────────────────────
const RoleCard: React.FC<{ role: 'PATIENT' | 'DOCTOR'; selected: boolean; onSelect: () => void }> = ({ role, selected, onSelect }) => {
  const isPatient = role === 'PATIENT';
  return (
    <button
      type="button" onClick={onSelect}
      style={{
        flex: 1, padding: '16px', borderRadius: 12, cursor: 'pointer',
        border: `1.5px solid ${selected ? '#2563EB' : '#E5E7EB'}`, background: 'white', transition: 'border-color 0.2s ease',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, fontFamily: 'inherit',
        boxShadow: selected ? '0 4px 12px rgba(37,99,235,0.08)' : 'none',
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{isPatient ? '👤' : '👨‍⚕️'}</div>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>{isPatient ? "I'm a Patient" : "I'm a Doctor"}</div>
      <div style={{ fontSize: '0.75rem', color: '#6B7280', textAlign: 'center', lineHeight: 1.4 }}>{isPatient ? 'Book appointments,\nview records' : 'Manage patients,\nprescriptions'}</div>
    </button>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const GENDERS = [{ value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }, { value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' }];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', dateOfBirth: '', gender: 'PREFER_NOT_TO_SAY', phone: '', specialization: '', licenseNumber: '' });

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const set = (field: string) => (v: string) => { setForm(p => ({ ...p, [field]: v })); setError(''); };

  const validateStep0 = () => {
    if (!form.email) return 'What\'s your email address?';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'That email doesn\'t look quite right.';
    if (!form.password || form.password.length < 8) return 'Password needs to be at least 8 characters.';
    if (form.password !== form.confirmPassword) return 'Those passwords don\'t match — try again.';
    return '';
  };

  const handleNext = () => { const err = validateStep0(); if (err) { setError(err); return; } setStep(1); };

  const handleSubmit = async () => {
    if (!form.firstName) { setError('We\'d love to know your first name!'); return; }
    if (role === 'PATIENT' && !form.dateOfBirth) { setError('Please add your date of birth.'); return; }
    if (role === 'DOCTOR' && (!form.specialization || !form.licenseNumber)) { setError('Specialization and license number are required for doctors.'); return; }
    setIsLoading(true); setError('');
    try {
      const payload: Record<string, string> = {
        email: form.email, password: form.password, role, firstName: form.firstName, lastName: form.lastName, phone: form.phone,
        ...(role === 'PATIENT' ? { dateOfBirth: form.dateOfBirth, gender: form.gender } : {}),
        ...(role === 'DOCTOR' ? { specialization: form.specialization, licenseNumber: form.licenseNumber } : {}),
      };
      const response = await authApi.register(payload);
      if (response.data.success) {
        const { accessToken, refreshToken } = response.data.data as { accessToken: string; refreshToken: string };
        localStorage.setItem('medivault_access_token', accessToken); localStorage.setItem('medivault_refresh_token', refreshToken);
        setSuccess(true); setTimeout(() => navigate('/'), 1800);
      }
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.message || 'Something went wrong. Please try again.');
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
        <div className="register-left-panel" style={{
          flex: '0 0 45%', position: 'relative', borderRadius: 16, overflow: 'hidden',
          background: '#F0F6FF',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Background image behind all the text */}
          <img src="/register_image.png" alt="Register bg" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 'auto', zIndex: 0 }} />

          {/* Text content overlaid */}
          <div style={{ position: 'relative', zIndex: 1, padding: '40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <RouterLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
              <img src="/MediVaultLogo.png" alt="MediVault" style={{ width: 32, height: 32 }} />
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#111827' }}>MediVault</span>
            </RouterLink>

            <h1 style={{ color: '#111827', fontWeight: 900, fontSize: '2.5rem', margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Create your <br/><span style={{ color: '#2563EB' }}>account</span>
            </h1>
            <p style={{ color: '#4B5563', fontSize: '0.95rem', margin: '0 0 32px' }}>
              Join thousands of patients <br/>who trust MediVault
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
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                👤
              </div>
              <div>
                <div style={{ color: '#111827', fontSize: '0.8rem', fontWeight: 600, marginBottom: 2 }}>
                  Already have an account?
                </div>
                <RouterLink to="/login" style={{ color: '#2563EB', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>
                  Sign in here →
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Panel (Form) ──────────────────────────────────────────────── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          background: 'white', padding: '48px 48px', position: 'relative', overflowY: 'auto'
        }}>
          <RouterLink to="/" className="mobile-logo-reg" style={{ display: 'none', alignItems: 'center', gap: 10, textDecoration: 'none', position: 'absolute', top: 24, left: 24 }}>
            <img src="/MediVaultLogo.png" alt="MediVault" style={{ width: 32, height: 32 }} />
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1565C0' }}>MediVault</span>
          </RouterLink>

          <div style={{ width: '100%', maxWidth: 400, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease' }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
                <h2 style={{ fontWeight: 900, fontSize: '1.75rem', color: '#111827', margin: '0 0 12px' }}>You're all set!</h2>
                <p style={{ color: '#6B7280', fontSize: '1rem' }}>Welcome to MediVault. Redirecting you now...</p>
                <div style={{ width: 48, height: 48, border: '4px solid #E5E7EB', borderTopColor: '#2563EB', borderRadius: '50%', margin: '28px auto 0', animation: 'spin-slow 0.8s linear infinite' }} />
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ color: '#2563EB', fontSize: '0.8rem', fontWeight: 700 }}>Step {step + 1} of 2</span>
                    <span style={{ color: '#6B7280', fontSize: '0.8rem' }}>{step === 0 ? 'Account details' : 'Your profile'}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: '#F3F4F6', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 2, background: '#2563EB', width: step === 0 ? '50%' : '100%', transition: 'width 0.4s ease' }} />
                    {step === 0 && <div style={{ position: 'absolute', top: 0, right: 0, height: 4, width: 4, borderRadius: 2, background: '#E5E7EB' }} />}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{step === 0 ? "Let's get you set up! 👋" : `Almost there, ${form.firstName || 'friend'}!`}</h1>
                  <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>{step === 0 ? 'Create your account — it only takes a minute.' : 'Just a few more details to personalise your experience.'}</p>
                </div>

                {error && (
                  <div style={{ background: '#FFF5F5', border: '1.5px solid #FEB2B2', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>⚠️</span><p style={{ color: '#C53030', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>{error}</p>
                    <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#C53030', cursor: 'pointer', fontSize: '1.1rem', padding: 0 }}>×</button>
                  </div>
                )}

                {step === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <p style={{ color: '#6B7280', fontSize: '0.85rem', fontWeight: 500, marginBottom: 12, marginTop: 0 }}>I am signing up as a...</p>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <RoleCard role="PATIENT" selected={role === 'PATIENT'} onSelect={() => setRole('PATIENT')} />
                        <RoleCard role="DOCTOR" selected={role === 'DOCTOR'} onSelect={() => setRole('DOCTOR')} />
                      </div>
                    </div>
                    <StyledInput id="register-full-name" label="Full name" value={form.firstName} onChange={set('firstName')} placeholder="Enter your full name" rightElement={<UserIcon />} />
                    <StyledInput id="register-email" label="Email address" type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@exemple.com" rightElement={<MailIcon />} />
                    <StyledInput id="register-password" label="Create password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="At least 8 characters" rightElement={<button type="button" onClick={() => setShowPassword(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>{showPassword ? <EyeClosed /> : <EyeOpen />}</button>} />
                    <StyledInput id="register-confirm-password" label="Confirm password" type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Confirm your password" rightElement={<button type="button" onClick={() => setShowConfirmPassword(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>{showConfirmPassword ? <EyeClosed /> : <EyeOpen />}</button>} />

                    <button type="button" onClick={handleNext} style={{ marginTop: 8, padding: '14px', borderRadius: 8, border: 'none', background: '#2563EB', color: 'white', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      Continue <span>→</span>
                    </button>
                  </div>
                )}

                {step === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <StyledInput id="register-first-name" label="First name" value={form.firstName} onChange={set('firstName')} placeholder="Priya" />
                      <StyledInput id="register-last-name" label="Last name" value={form.lastName} onChange={set('lastName')} placeholder="Sharma" />
                    </div>
                    <StyledInput id="register-phone" label="Phone number (optional)" value={form.phone} onChange={set('phone')} type="tel" placeholder="+91 98765 43210" autoComplete="tel" />
                    {role === 'PATIENT' && (
                      <>
                        <StyledInput id="register-dob" label="Date of birth" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
                        <StyledInput id="register-gender" label="Gender" value={form.gender} onChange={set('gender')} select selectOptions={GENDERS} />
                      </>
                    )}
                    {role === 'DOCTOR' && (
                      <>
                        <StyledInput id="register-specialization" label="Your specialization" value={form.specialization} onChange={set('specialization')} placeholder="e.g. Cardiology, Pediatrics" />
                        <StyledInput id="register-license" label="Medical license number" value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="License No." />
                      </>
                    )}
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                      <button type="button" onClick={() => setStep(0)} style={{ flex: '0 0 auto', padding: '14px 22px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', color: '#4B5563', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'inherit', cursor: 'pointer' }}>← Back</button>
                      <button type="button" onClick={handleSubmit} disabled={isLoading} style={{ flex: 1, padding: '14px', borderRadius: 8, border: 'none', background: isLoading ? '#93C5FD' : '#2563EB', color: 'white', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'inherit', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {isLoading ? 'Creating account...' : 'Continue'} {!isLoading && <span>→</span>}
                      </button>
                    </div>
                  </div>
                )}

                <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.8rem', marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <ShieldCheckIcon /> Your data is 100% secure and encrypted
                </p>
                <p className="mobile-only-link" style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.875rem', marginTop: 16 }}>
                  Already have an account? <RouterLink to="/login" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>Sign in here</RouterLink>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (min-width: 1024px) { .register-left-panel { display: flex !important; } .mobile-logo-reg { display: none !important; } .mobile-only-link { display: none !important; } }
        @media (max-width: 1023px) { .register-left-panel { display: none !important; } .mobile-logo-reg { display: flex !important; } .mobile-only-link { display: block !important; } }
      `}</style>
    </div>
  );
};
export default RegisterPage;
