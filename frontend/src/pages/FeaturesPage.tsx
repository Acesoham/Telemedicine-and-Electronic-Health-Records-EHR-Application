import React, { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// ─── Intersection Observer Hook ───────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Navbar (shared style) ────────────────────────────────────────────────────
const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Features', to: '/features' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      padding: '0 24px',
      background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,1)',
      backdropFilter: 'blur(20px)',
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.05)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        <RouterLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/MediVaultLogo.png" alt="MediVault Logo" style={{ width: 32, height: 32 }} />
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#111827', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#1565C0' }}>Medi</span>Vault
          </span>
        </RouterLink>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="desktop-nav">
          {navLinks.map((link) => (
            <RouterLink key={link.label} to={link.to} style={{
              color: link.to === '/features' ? '#1565C0' : '#64748B',
              textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem',
              transition: 'color 0.2s',
              borderBottom: link.to === '/features' ? '2px solid #1565C0' : '2px solid transparent',
              paddingBottom: 2,
            }}>
              {link.label}
            </RouterLink>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <RouterLink to="/login" style={{
              padding: '9px 20px', borderRadius: 8, color: '#111827', border: 'none', background: 'transparent',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
            }}>Sign in</RouterLink>
            <RouterLink to="/register" style={{
              padding: '10px 22px', borderRadius: 8, background: '#1565C0',
              color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
            }}>Get Started Free</RouterLink>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger-btn" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} aria-label="Toggle menu">
            <span style={{ fontSize: 24 }}>{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ background: 'white', borderTop: '1px solid #E2E8F0', padding: '16px 24px 24px' }}>
          {navLinks.map(link => (
            <RouterLink key={link.label} to={link.to} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '12px 0', color: '#1A2332', textDecoration: 'none', fontWeight: 500, fontSize: '1rem', borderBottom: '1px solid #F1F5F9' }}>{link.label}</RouterLink>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            <RouterLink to="/login" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', padding: '12px', borderRadius: 8, border: '1.5px solid #1565C0', color: '#1565C0', textDecoration: 'none', fontWeight: 600 }}>Sign in</RouterLink>
            <RouterLink to="/register" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', padding: '12px', borderRadius: 8, background: '#1565C0', color: 'white', textDecoration: 'none', fontWeight: 700 }}>Get Started Free</RouterLink>
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 900px) { .desktop-nav { display: none !important; } .hamburger-btn { display: block !important; } }
      `}</style>
    </nav>
  );
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const coreFeatures = [
  {
    icon: '📅',
    title: 'Smart Appointment Booking',
    desc: 'Book, reschedule, or cancel appointments in seconds. Real-time availability, instant confirmation, and automated reminders keep you and your doctor in sync.',
    color: '#EFF6FF',
    accent: '#2563EB',
    pills: ['Real-time slots', 'Reminders', 'Cancellation'],
  },
  {
    icon: '📹',
    title: 'HD Video Consultations',
    desc: 'Crystal-clear, end-to-end encrypted video calls with your doctor. Share your screen, discuss reports, and get a diagnosis — all without leaving home.',
    color: '#F0FDF4',
    accent: '#059669',
    pills: ['E2E Encrypted', 'Screen share', 'HD Quality'],
  },
  {
    icon: '🗂️',
    title: 'Electronic Health Records',
    desc: 'Your complete medical history in one secure place. Upload, organise, and instantly share lab reports, X-rays, prescriptions, and discharge summaries.',
    color: '#F5F3FF',
    accent: '#7C3AED',
    pills: ['Cloud storage', 'Quick share', 'All formats'],
  },
  {
    icon: '💊',
    title: 'Digital Prescriptions',
    desc: 'Doctors generate, sign, and send digital prescriptions the moment your consultation ends. No paper, no misreadings — pharmacy-ready in one tap.',
    color: '#FFF7ED',
    accent: '#D97706',
    pills: ['Instant delivery', 'Legally valid', 'Pharmacy-ready'],
  },
  {
    icon: '🔔',
    title: 'Smart Health Reminders',
    desc: 'Never miss a medication dose or follow-up appointment again. AI-powered reminders adapt to your schedule and send alerts via SMS, email, or push notification.',
    color: '#F0FDFA',
    accent: '#0D9488',
    pills: ['Multi-channel', 'AI-powered', 'Custom schedules'],
  },
  {
    icon: '🛡️',
    title: 'Bank-Grade Security',
    desc: '256-bit AES encryption, HIPAA-compliant storage, role-based access control, and complete audit trails ensure your health data is always safe.',
    color: '#FEF2F2',
    accent: '#DC2626',
    pills: ['AES-256', 'HIPAA', 'Audit logs'],
  },
];

const forDoctors = [
  { icon: '📊', title: 'Practice Analytics', desc: 'View appointment trends, patient retention, and revenue stats at a glance.' },
  { icon: '🕒', title: 'Availability Management', desc: 'Set your working hours, block dates, and let the system handle scheduling conflicts.' },
  { icon: '👥', title: 'Patient Management', desc: 'Access each patient\'s full history, past prescriptions, and uploaded records before every consultation.' },
  { icon: '✍️', title: 'One-Click Prescriptions', desc: 'Use saved templates and quick-fill to generate and send prescriptions in under 30 seconds.' },
];

const securityFeatures = [
  { icon: '🔐', title: 'End-to-End Encryption', desc: 'All data is encrypted in transit and at rest using AES-256.' },
  { icon: '🏥', title: 'HIPAA Compliant', desc: 'Fully compliant with global health data privacy regulations.' },
  { icon: '📋', title: 'Complete Audit Trail', desc: 'Every access and change is logged for transparency and accountability.' },
  { icon: '👤', title: 'Role-Based Access', desc: 'Granular permissions — patients, doctors, and admins see only what they should.' },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────
const FeaturesHero: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  return (
    <section style={{
      background: 'linear-gradient(150deg, #EEF4FF 0%, #F5F9FF 50%, #EDFBF7 100%)',
      padding: '140px 24px 80px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* decorative blobs */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)', top: -100, left: -100, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', bottom: -80, right: -80, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.8s ease' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'white', border: '1px solid #E5E7EB', borderRadius: 100, padding: '6px 18px', marginBottom: 28,
          color: '#2563EB', fontSize: '0.8125rem', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          Everything you need, in one platform
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.75rem)',
          fontWeight: 900, color: '#111827', margin: '0 0 20px',
          lineHeight: 1.1, letterSpacing: '-0.025em',
        }}>
          Powerful features for <br />
          <span style={{ color: '#2563EB' }}>modern healthcare</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
          color: '#6B7280', margin: '0 auto 40px', maxWidth: 580, lineHeight: 1.7,
        }}>
          MediVault brings doctors and patients together with an end-to-end platform that handles appointments, consultations, records, and prescriptions — securely and seamlessly.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <RouterLink to="/register" style={{
            padding: '14px 32px', borderRadius: 10, background: '#2563EB', color: 'white',
            textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem',
            boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
          }}>Start for free →</RouterLink>
          <RouterLink to="/contact" style={{
            padding: '14px 32px', borderRadius: 10, color: '#374151',
            textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem',
            border: '1px solid #D1D5DB', background: 'white',
          }}>Talk to us</RouterLink>
        </div>
      </div>
    </section>
  );
};

// ─── Core Features Grid ───────────────────────────────────────────────────────
const CoreFeaturesSection: React.FC = () => {
  const { ref, inView } = useInView(0.1);
  return (
    <section ref={ref} style={{ padding: '100px 24px', background: 'white' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-block', background: '#EFF6FF', color: '#1D4ED8',
            fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '6px 14px', borderRadius: 100, marginBottom: 16,
          }}>Core Features</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: '#1A2332', margin: 0, letterSpacing: '-0.025em' }}>
            Built for patients & doctors
          </h2>
          <p style={{ color: '#64748B', fontSize: '1.0625rem', marginTop: 16, maxWidth: 540, marginInline: 'auto', lineHeight: 1.6 }}>
            Every feature is designed to reduce friction and put care first.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 28,
        }}>
          {coreFeatures.map((f, i) => (
            <div key={f.title} style={{
              background: '#FAFAFA',
              border: '1.5px solid #E2E8F0',
              borderRadius: 20,
              padding: '32px 28px',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(28px)',
              transition: `all 0.6s ease ${i * 0.08}s`,
              cursor: 'default',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.07)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLDivElement).style.borderColor = f.accent + '40';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.borderColor = '#E2E8F0';
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 16, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', marginBottom: 20 }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '1.125rem', color: '#111827', margin: '0 0 12px' }}>{f.title}</h3>
              <p style={{ color: '#6B7280', fontSize: '0.9375rem', lineHeight: 1.7, margin: '0 0 20px' }}>{f.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {f.pills.map(p => (
                  <span key={p} style={{
                    padding: '4px 12px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600,
                    background: f.color, color: f.accent, border: `1px solid ${f.accent}20`,
                  }}>{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── For Doctors ──────────────────────────────────────────────────────────────
const ForDoctorsSection: React.FC = () => {
  const { ref, inView } = useInView(0.1);
  return (
    <section id="for-doctors" ref={ref} style={{ padding: '100px 24px', background: '#F8FAFC' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 64, flexWrap: 'wrap' }}>
        {/* Left */}
        <div style={{ flex: '1 1 380px', opacity: inView ? 1 : 0, transform: inView ? 'translateX(0)' : 'translateX(-30px)', transition: 'all 0.7s ease' }}>
          <div style={{
            display: 'inline-block', background: '#F0FDF4', color: '#059669',
            fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '6px 14px', borderRadius: 100, marginBottom: 20,
          }}>For Doctors</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: '#1A2332', margin: '0 0 20px', letterSpacing: '-0.025em' }}>
            A smarter way to run your practice
          </h2>
          <p style={{ color: '#64748B', fontSize: '1.0625rem', lineHeight: 1.7, margin: '0 0 36px' }}>
            MediVault's doctor dashboard is designed to eliminate paperwork so you can focus on what matters — your patients. Manage your schedule, patients, and prescriptions all in one place.
          </p>
          <RouterLink to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '13px 28px', borderRadius: 10, background: '#059669', color: 'white',
            textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem',
            boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
          }}>Join as a Doctor →</RouterLink>
        </div>

        {/* Right grid */}
        <div style={{ flex: '1 1 380px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {forDoctors.map((item, i) => (
            <div key={item.title} style={{
              background: 'white', borderRadius: 16, padding: '24px 20px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)',
              transition: `all 0.6s ease ${i * 0.1 + 0.2}s`,
            }}>
              <div style={{ fontSize: '1.75rem', marginBottom: 14 }}>{item.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#111827', marginBottom: 8 }}>{item.title}</div>
              <div style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Security Section ─────────────────────────────────────────────────────────
const SecuritySection: React.FC = () => {
  const { ref, inView } = useInView(0.1);
  return (
    <section ref={ref} style={{
      padding: '100px 24px',
      background: 'linear-gradient(135deg, #0A1628 0%, #0D2B4E 60%, #0A3D2B 100%)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-block', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)',
            fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '6px 14px', borderRadius: 100, marginBottom: 16,
          }}>Security First</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.025em' }}>
            Your data is in safe hands
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.0625rem', marginTop: 16, maxWidth: 520, marginInline: 'auto', lineHeight: 1.6 }}>
            We take health data privacy seriously. Every layer of MediVault is built with security at its core.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {securityFeatures.map((f, i) => (
            <div key={f.title} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: '32px 24px',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(28px)',
              transition: `all 0.6s ease ${i * 0.1}s`,
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'white', marginBottom: 10 }}>{f.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Trust badge bar */}
        <div style={{
          marginTop: 64, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 48,
          display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', alignItems: 'center',
        }}>
          {[
            { label: 'HIPAA Compliant', icon: '✅' },
            { label: '256-bit AES Encryption', icon: '🔐' },
            { label: 'ISO 27001 Ready', icon: '🏆' },
            { label: '99.9% Uptime SLA', icon: '⚡' },
          ].map(b => (
            <div key={b.label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem', fontWeight: 600,
            }}>
              <span style={{ fontSize: '1.25rem' }}>{b.icon}</span>{b.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Comparison Table ─────────────────────────────────────────────────────────
const ComparisonSection: React.FC = () => {
  const { ref, inView } = useInView(0.1);
  const rows = [
    { feature: 'HD Video Consultations', medivault: true, traditional: false },
    { feature: 'Digital Prescriptions', medivault: true, traditional: false },
    { feature: 'Centralised Health Records', medivault: true, traditional: false },
    { feature: 'Real-time Appointment Booking', medivault: true, traditional: '⚠️ Limited' },
    { feature: 'Bank-Grade Data Encryption', medivault: true, traditional: false },
    { feature: 'Smart Reminders & Notifications', medivault: true, traditional: false },
    { feature: 'Doctor-Patient Messaging', medivault: true, traditional: false },
    { feature: 'Practice Analytics', medivault: true, traditional: false },
  ];

  return (
    <section ref={ref} style={{ padding: '100px 24px', background: 'white' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-block', background: '#FEF2F2', color: '#B91C1C',
            fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '6px 14px', borderRadius: 100, marginBottom: 16,
          }}>Why MediVault</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#1A2332', margin: 0, letterSpacing: '-0.025em' }}>
            MediVault vs Traditional Clinics
          </h2>
        </div>

        <div style={{
          border: '1.5px solid #E2E8F0', borderRadius: 20, overflowX: 'auto',
          opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(28px)',
          transition: 'all 0.7s ease',
          boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
        }}>
          <div style={{ minWidth: 600 }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px', background: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
            <div style={{ padding: '16px 24px', fontWeight: 700, fontSize: '0.875rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Feature</div>
            <div style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 800, fontSize: '0.9rem', color: '#2563EB' }}>MediVault</div>
            <div style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 800, fontSize: '0.9rem', color: '#64748B' }}>Traditional</div>
          </div>
          {rows.map((row, i) => (
            <div key={row.feature} style={{
              display: 'grid', gridTemplateColumns: '1fr 160px 160px',
              borderBottom: i < rows.length - 1 ? '1px solid #F1F5F9' : 'none',
              background: i % 2 === 0 ? 'white' : '#FAFAFA',
            }}>
              <div style={{ padding: '16px 24px', fontSize: '0.9375rem', color: '#374151', fontWeight: 500 }}>{row.feature}</div>
              <div style={{ padding: '16px 24px', textAlign: 'center', fontSize: '1.1rem', color: '#059669', fontWeight: 700 }}>
                {row.medivault ? '✓' : '✗'}
              </div>
              <div style={{ padding: '16px 24px', textAlign: 'center', fontSize: row.traditional === false ? '1.1rem' : '0.85rem', color: row.traditional === false ? '#DC2626' : '#D97706', fontWeight: 600 }}>
                {row.traditional === false ? '✗' : row.traditional}
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── CTA ─────────────────────────────────────────────────────────────────────
const FeaturesCTA: React.FC = () => {
  const { ref, inView } = useInView(0.2);
  return (
    <section ref={ref} style={{
      padding: '100px 24px',
      background: 'linear-gradient(150deg, #EEF4FF 0%, #F5F9FF 50%, #EDFBF7 100%)',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto', opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.7s ease' }}>
        <div style={{ fontSize: '3rem', marginBottom: 24 }}>🚀</div>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: '#1A2332', margin: '0 0 20px', letterSpacing: '-0.025em' }}>
          Ready to experience smarter healthcare?
        </h2>
        <p style={{ color: '#64748B', fontSize: '1.0625rem', margin: '0 auto 40px', maxWidth: 480, lineHeight: 1.7 }}>
          Sign up free in under 2 minutes. No credit card required.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <RouterLink to="/register" style={{
            padding: '15px 36px', borderRadius: 12, background: '#2563EB', color: 'white',
            textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
            boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
          }}>Create free account →</RouterLink>
          <RouterLink to="/contact" style={{
            padding: '15px 36px', borderRadius: 12, color: '#374151',
            textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
            border: '1.5px solid #D1D5DB', background: 'white',
          }}>Contact Sales</RouterLink>
        </div>
      </div>
    </section>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer: React.FC = () => (
  <footer style={{ background: '#0F172A', padding: '48px 24px 32px', color: 'rgba(255,255,255,0.5)' }}>
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', marginBottom: 40 }}>
        <div style={{ maxWidth: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <img src="/MediVaultLogo.png" alt="MediVault Logo" style={{ width: 34, height: 34 }} />
            <span style={{ fontWeight: 800, color: 'white', fontSize: '1.1rem' }}>MediVault</span>
          </div>
          <p style={{ lineHeight: 1.65, fontSize: '0.9rem', margin: 0 }}>Secure telemedicine and electronic health records for modern India.</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48 }}>
          {[
            { title: 'Product', links: [{ label: 'Features', href: '/features' }, { label: 'Security', href: '#' }, { label: 'Pricing', href: '#' }] },
            { title: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Blog', href: '#' }, { label: 'Contact', href: '/contact' }] },
            { title: 'Legal', links: [{ label: 'Privacy Policy', href: '#' }, { label: 'Terms of Service', href: '#' }] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', marginBottom: 14 }}>{col.title}</div>
              {col.links.map(link => <div key={link.label} style={{ marginBottom: 10 }}><a href={link.href} style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: '0.875rem' }}>{link.label}</a></div>)}
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, textAlign: 'center', fontSize: '0.8125rem' }}>
        © {new Date().getFullYear()} MediVault. All rights reserved.
      </div>
    </div>
  </footer>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const FeaturesPage: React.FC = () => (
  <div style={{ fontFamily: 'Inter, Segoe UI, sans-serif' }}>
    <Navbar />
    <FeaturesHero />
    <CoreFeaturesSection />
    <ForDoctorsSection />
    <SecuritySection />
    <ComparisonSection />
    <FeaturesCTA />
    <Footer />
  </div>
);

export default FeaturesPage;
