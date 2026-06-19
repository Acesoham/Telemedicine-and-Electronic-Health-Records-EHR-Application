import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';

// ── Floating Label Input ──────────────────────────────────────────────────────
interface InputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  autoComplete?: string;
  rightElement?: React.ReactNode;
  select?: boolean;
  selectOptions?: { value: string; label: string }[];
}

const FloatInput: React.FC<InputProps> = ({
  id, label, type = 'text', value, onChange, required, placeholder, helperText,
  autoComplete, rightElement, select, selectOptions,
}) => {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  if (select && selectOptions) {
    return (
      <div style={{ position: 'relative' }}>
        <label htmlFor={id} style={{
          position: 'absolute', left: 16,
          top: floated ? 8 : '50%',
          transform: floated ? 'translateY(0) scale(0.82)' : 'translateY(-50%) scale(1)',
          transformOrigin: 'left', color: focused ? '#1565C0' : '#94A3B8',
          fontSize: '1rem', fontWeight: 500, transition: 'all 0.2s ease',
          pointerEvents: 'none', zIndex: 1, lineHeight: 1,
        }}>{label}</label>
        <select
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: floated ? '24px 16px 10px' : '18px 16px',
            border: `2px solid ${focused ? '#1565C0' : '#E2E8F0'}`,
            borderRadius: 12, outline: 'none', fontSize: '1rem', fontFamily: 'inherit',
            background: focused ? '#FAFBFF' : 'white', color: '#1A2332',
            transition: 'all 0.2s ease', appearance: 'none',
            boxShadow: focused ? '0 0 0 4px rgba(21,101,192,0.1)' : 'none',
            cursor: 'pointer', boxSizing: 'border-box',
          }}
        >
          {selectOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94A3B8' }}>▾</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <label htmlFor={id} style={{
          position: 'absolute', left: 16,
          top: floated ? 8 : '50%',
          transform: floated ? 'translateY(0) scale(0.82)' : 'translateY(-50%) scale(1)',
          transformOrigin: 'left', color: focused ? '#1565C0' : '#94A3B8',
          fontSize: '1rem', fontWeight: 500, transition: 'all 0.2s ease',
          pointerEvents: 'none', zIndex: 1, lineHeight: 1,
        }}>{label}{required && <span style={{ color: '#EF4444' }}> *</span>}</label>
        <input
          id={id} type={type} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={focused ? (placeholder || '') : ''}
          autoComplete={autoComplete}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: floated ? '24px 16px 10px' : '18px 16px',
            paddingRight: rightElement ? 48 : 16,
            border: `2px solid ${focused ? '#1565C0' : '#E2E8F0'}`,
            borderRadius: 12, outline: 'none', fontSize: '1rem', fontFamily: 'inherit',
            background: focused ? '#FAFBFF' : 'white', color: '#1A2332',
            transition: 'all 0.2s ease',
            boxShadow: focused ? '0 0 0 4px rgba(21,101,192,0.1)' : 'none',
          }}
        />
        {rightElement && (
          <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>{rightElement}</div>
        )}
      </div>
      {helperText && <p style={{ color: '#94A3B8', fontSize: '0.78rem', margin: '6px 0 0 4px' }}>{helperText}</p>}
    </div>
  );
};

// ── Eye Icons ─────────────────────────────────────────────────────────────────
const EyeOpen = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeClosed = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ── Progress Dots ─────────────────────────────────────────────────────────────
const ProgressDots: React.FC<{ step: number; total: number }> = ({ step, total }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
    {Array.from({ length: total }, (_, i) => (
      <React.Fragment key={i}>
        <div style={{
          width: i === step ? 28 : 10, height: 10,
          borderRadius: 100,
          background: i < step ? '#4ADE80' : i === step ? '#1565C0' : '#E2E8F0',
          transition: 'all 0.35s ease',
          boxShadow: i === step ? '0 2px 8px rgba(21,101,192,0.4)' : 'none',
        }} />
        {i < total - 1 && <div style={{ flex: 1, height: 1, background: i < step ? '#4ADE80' : '#E2E8F0', transition: 'background 0.35s ease' }} />}
      </React.Fragment>
    ))}
  </div>
);

// ── Role Card ─────────────────────────────────────────────────────────────────
interface RoleCardProps {
  role: 'PATIENT' | 'DOCTOR';
  selected: boolean;
  onSelect: () => void;
}
const RoleCard: React.FC<RoleCardProps> = ({ role, selected, onSelect }) => {
  const isPatient = role === 'PATIENT';
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        flex: 1, padding: '20px 16px', borderRadius: 14, cursor: 'pointer',
        border: `2px solid ${selected ? '#1565C0' : '#E2E8F0'}`,
        background: selected ? '#EFF6FF' : 'white',
        transition: 'all 0.2s ease',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        boxShadow: selected ? '0 4px 16px rgba(21,101,192,0.15)' : 'none',
        transform: selected ? 'translateY(-2px)' : 'none',
        fontFamily: 'inherit',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: selected ? 'linear-gradient(135deg, #1565C0, #00897B)' : '#F1F5F9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.6rem', transition: 'all 0.25s ease',
        boxShadow: selected ? '0 4px 14px rgba(21,101,192,0.35)' : 'none',
      }}>
        {isPatient ? '🧑‍💼' : '🩺'}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: selected ? '#1565C0' : '#1A2332', marginBottom: 3 }}>
          {isPatient ? 'I\'m a Patient' : 'I\'m a Doctor'}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.4 }}>
          {isPatient ? 'Book appointments,\nview records' : 'Manage patients,\nissue prescriptions'}
        </div>
      </div>
      {selected && (
        <div style={{
          width: 22, height: 22, borderRadius: '50%', background: '#1565C0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '0.75rem', fontWeight: 700,
        }}>✓</div>
      )}
    </button>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const GENDERS = [
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', dateOfBirth: '', gender: 'PREFER_NOT_TO_SAY',
    phone: '', specialization: '', licenseNumber: '',
  });

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const set = (field: string) => (v: string) => {
    setForm(p => ({ ...p, [field]: v }));
    setError('');
  };

  const validateStep0 = () => {
    if (!form.email) return 'What\'s your email address?';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'That email doesn\'t look quite right.';
    if (!form.password || form.password.length < 8) return 'Password needs to be at least 8 characters.';
    if (form.password !== form.confirmPassword) return 'Those passwords don\'t match — try again.';
    return '';
  };

  const handleNext = () => {
    const err = validateStep0();
    if (err) { setError(err); return; }
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!form.firstName) { setError('We\'d love to know your first name!'); return; }
    if (role === 'PATIENT' && !form.dateOfBirth) { setError('Please add your date of birth.'); return; }
    if (role === 'DOCTOR' && (!form.specialization || !form.licenseNumber)) {
      setError('Specialization and license number are required for doctors.'); return;
    }
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
        setTimeout(() => navigate('/'), 1800);
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stepLabels = ['Account details', 'Your profile'];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', fontFamily: 'Inter, Segoe UI, sans-serif',
      background: '#F8FAFC',
    }}>
      {/* Left Panel */}
      <div className="register-left-panel" style={{
        flex: '0 0 40%', display: 'none',
        flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        background: 'linear-gradient(160deg, #0A1628 0%, #0D2B4E 55%, #0A3D2B 100%)',
        padding: '60px 48px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(21,101,192,0.25) 0%, transparent 70%)', animation: 'blob-morph 8s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(0,137,123,0.2) 0%, transparent 70%)', animation: 'blob-morph 10s ease-in-out infinite reverse', pointerEvents: 'none' }} />

        <RouterLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56, textDecoration: 'none', position: 'relative' }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: 'linear-gradient(135deg, #1565C0, #00897B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 4px 14px rgba(21,101,192,0.4)' }}>🏥</div>
          <span style={{ fontWeight: 900, fontSize: '1.25rem', color: 'white', letterSpacing: '-0.02em' }}>MediVault</span>
        </RouterLink>

        <div style={{ animation: 'floatY 4s ease-in-out infinite', fontSize: 80, marginBottom: 36 }}>
          {role === 'PATIENT' ? '🧑‍⚕️' : '👨‍⚕️'}
        </div>

        <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem', textAlign: 'center', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
          {role === 'PATIENT' ? 'Your health, your data.' : 'Better care starts here.'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 1.7, fontSize: '0.9375rem', maxWidth: 280, margin: '0 0 40px' }}>
          {role === 'PATIENT'
            ? 'Join thousands of patients who manage their health records securely from anywhere.'
            : 'Verified doctors use MediVault to streamline consultations and spend more time with patients.'}
        </p>

        {/* Checklist */}
        {[
          '✅ 100% encrypted health records',
          '✅ HD video consultations',
          '✅ Digital prescriptions',
          '✅ Appointment reminders',
        ].map(item => (
          <div key={item} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: 10, alignSelf: 'flex-start', marginLeft: 20 }}>
            {item}
          </div>
        ))}
      </div>

      {/* Right: Form */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        background: 'white', padding: '60px 24px',
        minHeight: '100vh',
      }}>
        {/* Mobile logo */}
        <RouterLink to="/" className="mobile-logo-reg" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', position: 'absolute', top: 24, left: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, #1565C0, #00897B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏥</div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1565C0' }}>MediVault</span>
        </RouterLink>

        <div style={{
          width: '100%', maxWidth: 480,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease',
        }}>
          {/* Success screen */}
          {success ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 72, marginBottom: 24, animation: 'floatY 2s ease-in-out infinite' }}>🎉</div>
              <h2 style={{ fontWeight: 900, fontSize: '1.75rem', color: '#1A2332', margin: '0 0 12px' }}>You're all set!</h2>
              <p style={{ color: '#64748B', fontSize: '1rem' }}>Welcome to MediVault. Redirecting you now...</p>
              <div style={{
                width: 48, height: 48, border: '4px solid #E2E8F0', borderTopColor: '#1565C0',
                borderRadius: '50%', margin: '28px auto 0',
                animation: 'spin-slow 0.8s linear infinite',
              }} />
            </div>
          ) : (
            <>
              {/* Step header */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ background: '#EFF6FF', color: '#1565C0', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
                    Step {step + 1} of 2
                  </span>
                  <span style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>{stepLabels[step]}</span>
                </div>
                <ProgressDots step={step} total={2} />
                <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: '#1A2332', margin: '0 0 8px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
                  {step === 0 ? "Let's get you set up 🏥" : `Almost there, ${form.firstName || 'friend'}!`}
                </h1>
                <p style={{ color: '#64748B', fontSize: '0.9375rem', margin: 0 }}>
                  {step === 0
                    ? 'Create your account — it only takes a minute.'
                    : 'Just a few more details to personalise your experience.'}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: '#FFF5F5', border: '1.5px solid #FEB2B2', borderRadius: 12,
                  padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10,
                  animation: 'fadeInUp 0.3s ease',
                }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>⚠️</span>
                  <p style={{ color: '#C53030', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>{error}</p>
                  <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#C53030', cursor: 'pointer', fontSize: '1.1rem', padding: 0 }}>×</button>
                </div>
              )}

              {/* Step 0 */}
              {step === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Role selection */}
                  <div>
                    <p style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 600, marginBottom: 10 }}>I am signing up as a…</p>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <RoleCard role="PATIENT" selected={role === 'PATIENT'} onSelect={() => setRole('PATIENT')} />
                      <RoleCard role="DOCTOR" selected={role === 'DOCTOR'} onSelect={() => setRole('DOCTOR')} />
                    </div>
                  </div>

                  <FloatInput id="register-email" label="Your email address" type="email" value={form.email} onChange={set('email')} required autoComplete="email" placeholder="you@example.com" />

                  <FloatInput
                    id="register-password" label="Choose a strong password" type={showPassword ? 'text' : 'password'}
                    value={form.password} onChange={set('password')} required
                    helperText="At least 8 characters — mix uppercase, numbers & symbols"
                    rightElement={
                      <button type="button" onClick={() => setShowPassword(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 0 }}
                        aria-label={showPassword ? 'Hide' : 'Show'}>
                        {showPassword ? <EyeClosed /> : <EyeOpen />}
                      </button>
                    }
                  />

                  <FloatInput id="register-confirm-password" label="Confirm your password" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required />

                  <button
                    type="button" onClick={handleNext}
                    style={{
                      marginTop: 4, padding: '16px', borderRadius: 12, border: 'none',
                      background: 'linear-gradient(135deg, #1565C0, #1976D2)',
                      color: 'white', fontWeight: 700, fontSize: '1rem', fontFamily: 'inherit',
                      cursor: 'pointer', transition: 'all 0.25s ease',
                      boxShadow: '0 4px 16px rgba(21,101,192,0.4)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(21,101,192,0.5)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(21,101,192,0.4)'; }}
                  >
                    Continue →
                  </button>
                </div>
              )}

              {/* Step 1 */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FloatInput id="register-first-name" label="First name" value={form.firstName} onChange={set('firstName')} required placeholder="Priya" />
                    <FloatInput id="register-last-name" label="Last name" value={form.lastName} onChange={set('lastName')} placeholder="Sharma" />
                  </div>

                  <FloatInput id="register-phone" label="Phone number (optional)" value={form.phone} onChange={set('phone')} type="tel" placeholder="+91 98765 43210" autoComplete="tel" />

                  {role === 'PATIENT' && (
                    <>
                      <FloatInput id="register-dob" label="Date of birth" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} required />
                      <FloatInput
                        id="register-gender" label="Gender" value={form.gender} onChange={set('gender')}
                        select selectOptions={GENDERS}
                      />
                    </>
                  )}

                  {role === 'DOCTOR' && (
                    <>
                      <FloatInput id="register-specialization" label="Your specialization" value={form.specialization} onChange={set('specialization')} required placeholder="e.g. Cardiology, Pediatrics" />
                      <FloatInput id="register-license" label="Medical license number" value={form.licenseNumber} onChange={set('licenseNumber')} required />
                    </>
                  )}

                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <button type="button" onClick={() => setStep(0)} style={{
                      flex: '0 0 auto', padding: '16px 24px', borderRadius: 12,
                      border: '2px solid #E2E8F0', background: 'white',
                      color: '#64748B', fontWeight: 600, fontSize: '0.9375rem', fontFamily: 'inherit',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = 'white'; }}
                    >
                      ← Back
                    </button>
                    <button
                      id="register-submit"
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading}
                      style={{
                        flex: 1, padding: '16px', borderRadius: 12, border: 'none',
                        background: isLoading ? '#CBD5E1' : 'linear-gradient(135deg, #1565C0, #1976D2)',
                        color: 'white', fontWeight: 700, fontSize: '1rem', fontFamily: 'inherit',
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
                            borderTopColor: 'white', borderRadius: '50%', display: 'inline-block',
                            animation: 'spin-slow 0.7s linear infinite',
                          }} />
                          Creating your account...
                        </>
                      ) : 'Create my account 🎉'}
                    </button>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0 20px' }}>
                <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
                <span style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>Already have an account?</span>
                <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
              </div>

              <RouterLink to="/login" style={{
                display: 'block', textAlign: 'center', padding: '14px', borderRadius: 12,
                border: '2px solid #E2E8F0', color: '#1A2332', textDecoration: 'none',
                fontWeight: 700, fontSize: '0.9375rem', transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#1565C0'; e.currentTarget.style.color = '#1565C0'; e.currentTarget.style.background = '#EFF6FF'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#1A2332'; e.currentTarget.style.background = 'transparent'; }}
              >
                Sign in instead
              </RouterLink>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .register-left-panel { display: flex !important; }
          .mobile-logo-reg { display: none !important; }
        }
        @media (max-width: 1023px) {
          .register-left-panel { display: none !important; }
          .mobile-logo-reg { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
