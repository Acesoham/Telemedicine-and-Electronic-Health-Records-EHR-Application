import React, { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Feature { icon: string; title: string; desc: string; color: string; bg: string; }
interface Stat { value: number; suffix: string; label: string; }
interface Step { num: string; icon: string; title: string; desc: string; }
interface Testimonial { name: string; role: string; avatar: string; quote: string; stars: number; }

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

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimCounter({ value, suffix, active }: { value: number; suffix: string; active: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const duration = 1800;
    const step = 16;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [active, value]);
  return <>{count.toLocaleString()}{suffix}</>;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#', to: null },
    { label: 'Features', href: null, to: '/features' },
    { label: 'How it works', href: '#how-it-works', to: null },
    { label: 'For Doctors', href: '#for-doctors', to: null },
    { label: 'Testimonials', href: '#testimonials', to: null },
    { label: 'Contact', href: null, to: '/contact' },
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
          {navLinks.map((link, i) => (
            link.to
              ? <RouterLink key={link.label} to={link.to} style={{
                  color: '#64748B', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem',
                  transition: 'color 0.2s', borderBottom: '2px solid transparent', paddingBottom: 2,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1565C0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
              >{link.label}</RouterLink>
              : <a key={link.label} href={link.href!} style={{
                  color: i === 0 ? '#1565C0' : '#64748B',
                  textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem',
                  transition: 'color 0.2s',
                  borderBottom: i === 0 ? '2px solid #1565C0' : '2px solid transparent',
                  paddingBottom: 2,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1565C0')}
                onMouseLeave={e => (e.currentTarget.style.color = i === 0 ? '#1565C0' : '#64748B')}
              >{link.label}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <RouterLink to="/login" style={{
              padding: '9px 20px', borderRadius: 8, color: '#111827', border: 'none', background: 'transparent',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
            }}>
              Sign in
            </RouterLink>
            <RouterLink to="/register" style={{
              padding: '10px 22px', borderRadius: 8, background: '#1565C0',
              color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1D4ED8'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1565C0'; }}
            >
              Get Started Free
            </RouterLink>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#1A2332' }} className="hamburger-btn" aria-label="Toggle menu">
            <span style={{ fontSize: 24 }}>{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ background: 'white', borderTop: '1px solid #E2E8F0', padding: '16px 24px 24px' }}>
          {navLinks.map(link => (
            link.to
              ? <RouterLink key={link.label} to={link.to} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '12px 0', color: '#1A2332', textDecoration: 'none', fontWeight: 500, fontSize: '1rem', borderBottom: '1px solid #F1F5F9' }}>{link.label}</RouterLink>
              : <a key={link.label} href={link.href!} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '12px 0', color: '#1A2332', textDecoration: 'none', fontWeight: 500, fontSize: '1rem', borderBottom: '1px solid #F1F5F9' }}>{link.label}</a>
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

// ─── Hero Section ─────────────────────────────────────────────────────────────
const HeroSection: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  return (
    <section style={{
      minHeight: '90vh',
      background: 'linear-gradient(150deg, #F0F6FF 0%, #F5F9FF 50%, #EBFDF8 100%)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center',
      padding: '100px 24px 40px',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, width: '100%' }} className="hero-flex">
        {/* Left Text */}
        <div style={{
          flex: '0 0 45%', maxWidth: 580,
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(-30px)',
          transition: 'all 0.8s ease 0.1s', zIndex: 10,
        }} className="hero-left">
          
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'white', border: '1px solid #E5E7EB', borderRadius: 100, padding: '6px 16px', marginBottom: 24,
            color: '#2563EB', fontSize: '0.8125rem', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Trusted by 10,000+ patients across India
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 4.5vw, 4rem)',
            fontWeight: 900, color: '#111827', margin: '0 0 20px',
            lineHeight: 1.1, letterSpacing: '-0.02em',
          }}>
            Healthcare,<br/>
            <span style={{ color: '#2563EB' }}>simplified</span>{' '}
            for you
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
            color: '#6B7280', maxWidth: 500, margin: '0 0 40px', lineHeight: 1.6,
          }}>
            Connect with top doctors, consult online, access your medical records securely, and manage your health — all in one place.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
            <RouterLink to="/register" style={{
              padding: '14px 28px', borderRadius: 10, background: '#2563EB', color: 'white', textDecoration: 'none', fontWeight: 600,
              fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(37,99,235,0.3)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: '1.2rem' }}>📅</span> Book an Appointment
            </RouterLink>
            <a href="#features" style={{
              padding: '14px 28px', borderRadius: 10, color: '#374151', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem',
              border: '1px solid #D1D5DB', background: 'white', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              Explore Features →
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex' }}>
              {['#2563EB', '#10B981', '#8B5CF6', '#F59E0B'].map((c, i) => (
                <div key={i} style={{
                  width: 38, height: 38, borderRadius: '50%', background: c, border: '2px solid white', marginLeft: i > 0 ? -12 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'white', fontWeight: 700,
                }}>
                  {['P','D','R','A'][i]}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#111827', fontSize: '0.95rem', marginBottom: 2 }}>10K+ <span style={{ color: '#6B7280', fontWeight: 500 }}>Happy Patients</span></div>
              <div style={{ color: '#F59E0B', fontSize: '0.85rem' }}>★★★★★ <span style={{ color: '#6B7280' }}>4.8 (1200+ reviews)</span></div>
            </div>
          </div>
        </div>

        {/* Right Visuals */}
        <div style={{
          flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: 600, opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(-30px)' : 'translateX(30px)',
          transition: 'all 0.8s ease 0.3s', zIndex: 5,
        }} className="hero-right">
          
          <div style={{
            position: 'absolute', width: 600, height: 600, borderRadius: '50%',
            background: 'linear-gradient(135deg, #E0E7FF 0%, #F0FDF4 100%)',
            zIndex: 1, left: '50%', top: '50%', transform: 'translate(-50%, -50%)'
          }} />
          <div style={{ position: 'absolute', width: 450, height: 450, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.8)', zIndex: 1, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />

          <img src="/DRhomepageimage.png" alt="Doctor" style={{ position: 'relative', zIndex: 2, maxHeight: 600, objectFit: 'contain' }} />

          {/* Decor */}
          <div style={{ position: 'absolute', top: 60, right: '20%', zIndex: 3, display: 'grid', gridTemplateColumns: 'repeat(5, 6px)', gap: 8 }}>
            {Array.from({ length: 15 }).map((_, i) => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#93C5FD' }} />)}
          </div>
          <div style={{ position: 'absolute', top: 180, left: '10%', zIndex: 3, color: '#93C5FD', fontSize: '2rem', fontWeight: 900 }}>+</div>
          <div style={{ position: 'absolute', bottom: 120, right: '15%', zIndex: 3, color: '#93C5FD', fontSize: '1.5rem', fontWeight: 900 }}>+</div>

          {/* Floating cards (constrained inside container using % based on center) */}
          <div style={{
            position: 'absolute', top: '15%', left: '2%', zIndex: 10, background: 'white', borderRadius: 16, padding: '14px 18px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.06)', animation: 'floatY 4s ease-in-out infinite'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#111827', fontWeight: 700, marginBottom: 10 }}>Upcoming Appointment</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="https://i.pravatar.cc/100?img=5" alt="Dr" style={{ width: 40, height: 40, borderRadius: '50%' }} />
              <div><div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#111827' }}>Dr. Priya Sharma</div><div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Cardiologist</div></div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 10, fontWeight: 500 }}><span style={{ color: '#2563EB' }}>📅</span> Tomorrow, 10:30 AM</div>
          </div>

          <div style={{
            position: 'absolute', bottom: '25%', left: '8%', zIndex: 10, background: 'white', borderRadius: 16, padding: '14px 18px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.06)', animation: 'floatY 4s ease-in-out infinite', animationDelay: '1s'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#111827', fontWeight: 700, marginBottom: 10 }}>Health Score</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 10 }}>
              <div><div style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 600 }}>Excellent</div><div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}><span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111827', lineHeight: 1 }}>92</span><span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>/100</span></div></div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '4px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', fontWeight: 800, fontSize: '0.85rem' }}>92</div>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: '#F3F4F6' }}><div style={{ height: '100%', width: '92%', borderRadius: 3, background: '#10B981' }} /></div>
          </div>

          <div style={{
            position: 'absolute', top: '25%', right: '12%', zIndex: 10, background: 'white', borderRadius: 16, padding: '12px 16px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.06)', animation: 'floatY 4s ease-in-out infinite', animationDelay: '2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6M9 16h6M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/></svg></div>
              <div><div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#111827' }}>Prescriptions</div><div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 2 }}>2 Active <span style={{ color: '#2563EB', fontWeight: 600, marginLeft: 4 }}>View all →</span></div></div>
            </div>
          </div>

          <div style={{
            position: 'absolute', top: '45%', right: '5%', zIndex: 10, background: 'white', borderRadius: 16, padding: '12px 16px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.06)', animation: 'floatY 4s ease-in-out infinite', animationDelay: '0.5s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
              <div><div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#111827' }}>Medical Records</div><div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 2 }}>12 Documents <span style={{ color: '#2563EB', fontWeight: 600, marginLeft: 4 }}>View all →</span></div></div>
            </div>
          </div>
          
          <div style={{
            position: 'absolute', bottom: '25%', right: '12%', zIndex: 10, background: 'white', borderRadius: 16, padding: '12px 16px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.06)', animation: 'floatY 4s ease-in-out infinite', animationDelay: '1.5s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor"/><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
              <div><div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#111827' }}>100% Secure</div><div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 2 }}>Your data is encrypted</div></div>
            </div>
          </div>
          
        </div>
      </div>
      
      <style>{`
        @keyframes floatY { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @media (max-width: 900px) { .hero-flex { flex-direction: column !important; } .hero-right { display: none !important; } .hero-left { max-width: 100% !important; } }
      `}</style>
    </section>
  );
};

// ─── Features Strip ───────────────────────────────────────────────────────────
const featuresStrip = [
  { icon: <svg width="20" height="20" fill="none" stroke="#2563EB" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>, title: 'HD Video Consultations', desc: 'Crystal clear video calls', color: '#EFF6FF' },
  { icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="#10B981" strokeWidth="2"/></svg>, title: 'Secure Records', desc: 'Your data is 100% encrypted', color: '#ECFDF5' },
  { icon: <svg width="20" height="20" fill="none" stroke="#8B5CF6" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6M9 16h6M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"/></svg>, title: 'Digital Prescriptions', desc: 'Paperless & eco-friendly', color: '#F5F3FF' },
  { icon: <svg width="20" height="20" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>, title: '24/7 Support', desc: "We're here for you always", color: '#FFF7ED' },
  { icon: <svg width="20" height="20" fill="none" stroke="#0D9488" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, title: 'Easy Appointments', desc: 'Book in just a few clicks', color: '#F0FDFA' },
];

const FeaturesStrip: React.FC = () => (
  <section style={{ padding: '0 24px', marginTop: '-40px', position: 'relative', zIndex: 20 }}>
    <div style={{
      maxWidth: 1100, margin: '0 auto', background: 'white', borderRadius: 16, padding: '24px 32px',
      boxShadow: '0 12px 32px rgba(0,0,0,0.04)', display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'center'
    }}>
      {featuresStrip.map(f => (
        <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {f.icon}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#111827' }}>{f.title}</div>
            <div style={{ color: '#6B7280', fontSize: '0.75rem', marginTop: 2 }}>{f.desc}</div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ─── How It Works ─────────────────────────────────────────────────────────────
const steps: Step[] = [
  { num: '01', icon: '📝', title: 'Create your account', desc: 'Sign up as a patient or doctor in under 2 minutes. No paperwork, no hassle.' },
  { num: '02', icon: '🔍', title: 'Find the right doctor', desc: 'Browse verified specialists, check availability, and book a slot that works for you.' },
  { num: '03', icon: '💬', title: 'Connect & get care', desc: 'Join your video consultation, get a digital prescription, and access your records — all in one place.' },
];

const HowItWorksSection: React.FC = () => {
  const { ref, inView } = useInView(0.15);
  return (
    <section id="how-it-works" ref={ref} style={{ padding: '100px 24px', background: '#F8FAFC' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{
            display: 'inline-block', background: '#F0FDF4', color: '#00695C',
            fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '6px 14px', borderRadius: 100, marginBottom: 16,
          }}>
            Simple as 1-2-3
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: '#1A2332', margin: 0, letterSpacing: '-0.025em' }}>
            How MediVault works
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 40, position: 'relative' }}>
          {steps.map((step, i) => (
            <div key={step.num} style={{
              opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(28px)',
              transition: `all 0.7s ease ${i * 0.15}s`, textAlign: 'center',
            }}>
              <div style={{ position: 'relative', marginBottom: 24 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #1565C0, #00897B)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', margin: '0 auto', boxShadow: '0 8px 24px rgba(21,101,192,0.3)',
                }}>{step.icon}</div>
                <div style={{
                  position: 'absolute', top: -6, right: 'calc(50% - 52px)', background: '#1565C0', color: 'white',
                  fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.05em', padding: '2px 8px', borderRadius: 100,
                }}>{step.num}</div>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: '#1A2332', margin: '0 0 12px' }}>{step.title}</h3>
              <p style={{ color: '#64748B', fontSize: '0.9375rem', lineHeight: 1.65, margin: 0, maxWidth: 280, marginInline: 'auto' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Stats Section ────────────────────────────────────────────────────────────
const stats: Stat[] = [
  { value: 10000, suffix: '+', label: 'Patients served' },
  { value: 500, suffix: '+', label: 'Verified doctors' },
  { value: 99, suffix: '.9%', label: 'Uptime SLA' },
  { value: 256, suffix: '-bit', label: 'AES encryption' },
];

const StatsSection: React.FC = () => {
  const { ref, inView } = useInView(0.3);
  return (
    <section ref={ref} style={{
      background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 50%, #00695C 100%)',
      padding: '64px 24px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48 }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{
            textAlign: 'center', opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)', transition: `all 0.6s ease ${i * 0.1}s`,
          }}>
            <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: 'white', lineHeight: 1, marginBottom: 8 }}>
              <AnimCounter value={s.value} suffix={s.suffix} active={inView} />
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials: Testimonial[] = [
  { name: 'Priya Sharma', role: 'Patient, Mumbai', avatar: '👩', quote: "Booking my follow-up after surgery was so easy. I uploaded my discharge summary and my doctor had everything ready before our call.", stars: 5 },
  { name: 'Dr. Arjun Mehta', role: 'Cardiologist, Delhi', avatar: '👨‍⚕️', quote: "MediVault has cut down my admin time by half. Prescriptions are signed digitally, records are always there when I need them.", stars: 5 },
  { name: 'Ravi Krishnan', role: 'Patient, Bangalore', avatar: '🧑', quote: "I was worried about the security of my health data, but the encryption and privacy controls gave me peace of mind.", stars: 5 },
];

const TestimonialsSection: React.FC = () => {
  const { ref, inView } = useInView(0.15);
  return (
    <section id="testimonials" ref={ref} style={{ padding: '100px 24px', background: 'white' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-block', background: '#FFF7ED', color: '#C2410C', fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '6px 14px', borderRadius: 100, marginBottom: 16,
          }}>Real stories</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: '#1A2332', margin: 0, letterSpacing: '-0.025em' }}>
            Loved by patients & doctors
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 24 }}>
          {testimonials.map((t, i) => (
            <div key={t.name} style={{
              background: '#FAFAFA', border: '1.5px solid #E2E8F0', borderRadius: 16, padding: '32px 28px',
              opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: `all 0.7s ease ${i * 0.1}s`,
            }}>
              <div style={{ fontSize: '1.25rem', marginBottom: 16 }}>{'⭐'.repeat(t.stars)}</div>
              <p style={{ color: '#374151', fontSize: '0.9875rem', lineHeight: 1.7, margin: '0 0 24px', fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #1565C020, #00897B20)',
                  border: '2px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                }}>{t.avatar}</div>
                <div><div style={{ fontWeight: 700, color: '#1A2332', fontSize: '0.9375rem' }}>{t.name}</div><div style={{ color: '#64748B', fontSize: '0.8125rem' }}>{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── CTA Section ──────────────────────────────────────────────────────────────
const CTASection: React.FC = () => {
  const { ref, inView } = useInView(0.2);
  return (
    <section ref={ref} style={{
      padding: '100px 24px', background: 'linear-gradient(160deg, #0A1628 0%, #0D2B4E 60%, #0A3D2B 100%)',
      textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
        <h2 style={{
          fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 900, color: 'white', margin: '0 0 20px', letterSpacing: '-0.025em',
          opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.7s ease',
        }}>Your health deserves the best care</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.0625rem', margin: '0 0 40px', lineHeight: 1.7, opacity: inView ? 1 : 0, transition: 'opacity 0.7s ease 0.1s' }}>
          Join thousands of patients and doctors already using MediVault. Sign up today — completely free.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', opacity: inView ? 1 : 0, transition: 'opacity 0.7s ease 0.2s' }}>
          <RouterLink to="/register" style={{
            padding: '16px 40px', borderRadius: 12, background: 'linear-gradient(135deg, #1565C0, #1976D2)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
          }}>Create free account →</RouterLink>
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
            { title: 'Product', links: ['Features', 'Security', 'Pricing'] },
            { title: 'Company', links: ['About', 'Blog', 'Contact'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service'] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', marginBottom: 14 }}>{col.title}</div>
              {col.links.map(link => <div key={link} style={{ marginBottom: 10 }}><a href="#" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: '0.875rem' }}>{link}</a></div>)}
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

// ─── Main Page ────────────────────────────────────────────────────────────────
const HomePage: React.FC = () => {
  return (
    <div style={{ fontFamily: 'Inter, Segoe UI, sans-serif' }}>
      <Navbar />
      <HeroSection />
      <FeaturesStrip />
      <HowItWorksSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default HomePage;
