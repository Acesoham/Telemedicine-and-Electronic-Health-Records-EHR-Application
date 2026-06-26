import React, { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Feature {
  icon: string;
  title: string;
  desc: string;
  color: string;
  bg: string;
}

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

interface Step {
  num: string;
  icon: string;
  title: string;
  desc: string;
}

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  quote: string;
  stars: number;
}

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
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      padding: '0 24px',
      background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,0.08)' : 'none',
      transition: 'all 0.35s ease',
      borderBottom: scrolled ? '1px solid rgba(226,232,240,0.8)' : 'none',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/MediVaultLogo.png" alt="MediVault Logo" style={{ width: 38, height: 38 }} />
          <span style={{ fontWeight: 800, fontSize: '1.2rem', color: scrolled ? '#1A2332' : 'white', letterSpacing: '-0.02em' }}>
            MediVault
          </span>
        </div>
          
        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
          {navLinks.map(link => (
            <a key={link.label} href={link.href} style={{
              color: scrolled ? '#64748B' : 'rgba(255,255,255,0.85)',
              textDecoration: 'none', fontWeight: 500, fontSize: '0.9375rem',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = scrolled ? '#1565C0' : 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = scrolled ? '#64748B' : 'rgba(255,255,255,0.85)')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RouterLink to="/login" style={{
            padding: '9px 20px', borderRadius: 8,
            color: scrolled ? '#1565C0' : 'white',
            border: `1.5px solid ${scrolled ? '#1565C0' : 'rgba(255,255,255,0.5)'}`,
            textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = scrolled ? 'rgba(21,101,192,0.08)' : 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            Sign in
          </RouterLink>
          <RouterLink to="/register" style={{
            padding: '9px 22px', borderRadius: 8,
            background: 'linear-gradient(135deg, #1565C0, #1976D2)',
            color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
            boxShadow: '0 4px 14px rgba(21,101,192,0.4)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(21,101,192,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(21,101,192,0.4)'; }}
          >
            Get started free
          </RouterLink>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: scrolled ? '#1A2332' : 'white' }}
            className="hamburger-btn"
            aria-label="Toggle menu"
          >
            <span style={{ fontSize: 24 }}>{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: 'white', borderTop: '1px solid #E2E8F0',
          padding: '16px 24px 24px',
        }}>
          {navLinks.map(link => (
            <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)} style={{
              display: 'block', padding: '12px 0', color: '#1A2332',
              textDecoration: 'none', fontWeight: 500, fontSize: '1rem',
              borderBottom: '1px solid #F1F5F9',
            }}>
              {link.label}
            </a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            <RouterLink to="/login" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', padding: '12px', borderRadius: 8, border: '1.5px solid #1565C0', color: '#1565C0', textDecoration: 'none', fontWeight: 600 }}>Sign in</RouterLink>
            <RouterLink to="/register" onClick={() => setMenuOpen(false)} style={{ textAlign: 'center', padding: '12px', borderRadius: 8, background: 'linear-gradient(135deg, #1565C0, #1976D2)', color: 'white', textDecoration: 'none', fontWeight: 700 }}>Get started free</RouterLink>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: block !important; }
        }
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
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0A1628 0%, #0D2B4E 40%, #0A3D2B 100%)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '120px 24px 80px',
      textAlign: 'center',
    }}>
      {/* Animated background blobs */}
      <div style={{
        position: 'absolute', top: '8%', left: '5%',
        width: 520, height: 520,
        background: 'radial-gradient(circle, rgba(21,101,192,0.25) 0%, transparent 70%)',
        animation: 'blob-morph 8s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '5%', right: '5%',
        width: 440, height: 440,
        background: 'radial-gradient(circle, rgba(0,137,123,0.2) 0%, transparent 70%)',
        animation: 'blob-morph 10s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '15%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(99,179,237,0.12) 0%, transparent 70%)',
        animation: 'floatSlow 7s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Floating icons */}
      {[
        { icon: '🩺', top: '18%', left: '10%', delay: '0s', size: 52 },
        { icon: '💊', top: '25%', right: '12%', delay: '1s', size: 44 },
        { icon: '🧬', bottom: '30%', left: '8%', delay: '2s', size: 40 },
        { icon: '❤️', bottom: '20%', right: '15%', delay: '0.5s', size: 48 },
        { icon: '📋', top: '60%', left: '20%', delay: '1.5s', size: 36 },
        { icon: '🔬', top: '12%', right: '28%', delay: '2.5s', size: 38 },
      ].map(({ icon, delay, size, ...pos }) => (
        <div key={icon} style={{
          position: 'absolute', ...pos,
          width: size, height: size,
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(10px)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.55,
          animation: `floatY 4s ease-in-out infinite`,
          animationDelay: delay,
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}>
          {icon}
        </div>
      ))}

      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 100, padding: '6px 16px', marginBottom: 32,
        color: 'rgba(255,255,255,0.9)', fontSize: '0.8125rem', fontWeight: 500,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.7s ease 0.1s',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block', boxShadow: '0 0 8px #4ADE80' }} />
        Trusted by 10,000+ patients across India
      </div>

      {/* Headline */}
      <h1 style={{
        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
        fontWeight: 900, color: 'white', margin: '0 0 24px',
        lineHeight: 1.1, letterSpacing: '-0.03em',
        maxWidth: 820,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.7s ease 0.2s',
      }}>
        Your health journey,{' '}
        <span style={{
          background: 'linear-gradient(90deg, #63B3ED, #4ADE80, #63B3ED)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          animation: 'gradient-shift 3s linear infinite',
        }}>
          simplified.
        </span>
      </h1>

      {/* Subheadline */}
      <p style={{
        fontSize: 'clamp(1rem, 2vw, 1.25rem)',
        color: 'rgba(255,255,255,0.7)', maxWidth: 580, margin: '0 auto 48px',
        lineHeight: 1.7,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.7s ease 0.35s',
      }}>
        Connect with doctors via HD video, access your encrypted medical records anytime, and manage your entire healthcare journey — all in one place.
      </p>

      {/* CTA Buttons */}
      <div style={{
        display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.7s ease 0.5s',
      }}>
        <RouterLink to="/register" id="hero-get-started" style={{
          padding: '16px 36px', borderRadius: 12,
          background: 'linear-gradient(135deg, #1565C0, #1976D2)',
          color: 'white', textDecoration: 'none', fontWeight: 700,
          fontSize: '1rem', letterSpacing: '-0.01em',
          boxShadow: '0 8px 30px rgba(21,101,192,0.5)',
          transition: 'all 0.25s ease',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(21,101,192,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(21,101,192,0.5)'; }}
        >
          Get started — it's free
          <span>→</span>
        </RouterLink>
        <RouterLink to="/login" id="hero-signin" style={{
          padding: '16px 36px', borderRadius: 12,
          color: 'white', textDecoration: 'none', fontWeight: 600,
          fontSize: '1rem',
          border: '1.5px solid rgba(255,255,255,0.25)',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.25s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none'; }}
        >
          Sign in
        </RouterLink>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        opacity: 0.5,
        animation: 'floatY 2s ease-in-out infinite',
      }}>
        <span style={{ color: 'white', fontSize: '0.75rem', letterSpacing: '0.1em' }}>SCROLL</span>
        <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, white, transparent)' }} />
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
            textAlign: 'center',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(20px)',
            transition: `all 0.6s ease ${i * 0.1}s`,
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

// ─── Features Section ─────────────────────────────────────────────────────────
const features: Feature[] = [
  { icon: '📹', title: 'HD Video Consultations', desc: 'Crystal-clear WebRTC-powered video calls with your doctor from anywhere. No app download needed.', color: '#1565C0', bg: '#EFF6FF' },
  { icon: '🔒', title: 'Encrypted Health Records', desc: 'Your EHR is protected with military-grade AES-256 encryption. Only you and your care team can access it.', color: '#00695C', bg: '#F0FDF4' },
  { icon: '📅', title: 'Smart Scheduling', desc: 'Book, reschedule or cancel appointments in seconds. Get reminders and never miss a consultation.', color: '#7C3AED', bg: '#F5F3FF' },
  { icon: '💊', title: 'Digital Prescriptions', desc: 'Receive digitally signed prescriptions instantly. Download, share with pharmacies, and track refills.', color: '#B45309', bg: '#FFFBEB' },
  { icon: '🛡️', title: 'HIPAA-Aligned Privacy', desc: 'Built with privacy-first architecture. Your data is never sold or shared without explicit consent.', color: '#DC2626', bg: '#FFF5F5' },
  { icon: '🌙', title: '24 / 7 Access', desc: 'Your health records and appointment history are available around the clock, from any device.', color: '#0369A1', bg: '#F0F9FF' },
];

const FeaturesSection: React.FC = () => {
  const { ref, inView } = useInView(0.1);
  return (
    <section id="features" ref={ref} style={{ padding: '100px 24px', background: 'white' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-block', background: '#EFF6FF', color: '#1565C0',
            fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '6px 14px', borderRadius: 100,
            marginBottom: 16,
            opacity: inView ? 1 : 0, transition: 'opacity 0.6s ease',
          }}>
            What we offer
          </div>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900,
            color: '#1A2332', margin: '0 0 16px', letterSpacing: '-0.025em',
            opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.7s ease 0.1s',
          }}>
            Everything your health needs,<br />under one roof
          </h2>
          <p style={{
            color: '#64748B', fontSize: '1.0625rem', maxWidth: 500, margin: '0 auto',
            opacity: inView ? 1 : 0, transition: 'opacity 0.7s ease 0.2s',
          }}>
            From your first appointment to long-term records management, MediVault has you covered.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard: React.FC<{ feature: Feature; index: number; inView: boolean }> = ({ feature, index, inView }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? feature.bg : '#FAFAFA',
        border: `1.5px solid ${hovered ? feature.color + '30' : '#E2E8F0'}`,
        borderRadius: 16, padding: '28px 28px 32px',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-6px)' : inView ? 'translateY(0)' : 'translateY(24px)',
        boxShadow: hovered ? `0 16px 40px ${feature.color}18` : '0 1px 4px rgba(0,0,0,0.04)',
        opacity: inView ? 1 : 0,
        transitionDelay: `${0.05 * index}s`,
        cursor: 'default',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: hovered ? feature.color : feature.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', marginBottom: 18,
        transition: 'all 0.3s ease',
        border: `1.5px solid ${hovered ? feature.color : '#E2E8F0'}`,
      }}>
        {feature.icon}
      </div>
      <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#1A2332', margin: '0 0 10px', letterSpacing: '-0.01em' }}>
        {feature.title}
      </h3>
      <p style={{ color: '#64748B', fontSize: '0.9375rem', lineHeight: 1.65, margin: 0 }}>
        {feature.desc}
      </p>
    </div>
  );
};

// ─── How it Works ─────────────────────────────────────────────────────────────
const steps: Step[] = [
  { num: '01', icon: '✍️', title: 'Create your account', desc: 'Sign up as a patient or doctor in under 2 minutes. No paperwork, no hassle.' },
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
            textTransform: 'uppercase', padding: '6px 14px', borderRadius: 100,
            marginBottom: 16,
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
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(28px)',
              transition: `all 0.7s ease ${i * 0.15}s`,
              textAlign: 'center',
            }}>
              <div style={{ position: 'relative', marginBottom: 24 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1565C0, #00897B)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem', margin: '0 auto',
                  boxShadow: '0 8px 24px rgba(21,101,192,0.3)',
                }}>
                  {step.icon}
                </div>
                <div style={{
                  position: 'absolute', top: -6, right: 'calc(50% - 52px)',
                  background: '#1565C0', color: 'white',
                  fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.05em',
                  padding: '2px 8px', borderRadius: 100,
                }}>
                  {step.num}
                </div>
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

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials: Testimonial[] = [
  {
    name: 'Priya Sharma', role: 'Patient, Mumbai',
    avatar: '👩',
    quote: "Booking my follow-up after surgery was so easy. I uploaded my discharge summary and my doctor had everything ready before our call. This is what healthcare should feel like.",
    stars: 5,
  },
  {
    name: 'Dr. Arjun Mehta', role: 'Cardiologist, Delhi',
    avatar: '👨‍⚕️',
    quote: "MediVault has cut down my admin time by half. Prescriptions are signed digitally, records are always there when I need them, and my patients actually show up on time now.",
    stars: 5,
  },
  {
    name: 'Ravi Krishnan', role: 'Patient, Bangalore',
    avatar: '🧔',
    quote: "I was worried about the security of my health data, but the encryption and privacy controls gave me peace of mind. The video consultations are crystal clear too.",
    stars: 5,
  },
];

const TestimonialsSection: React.FC = () => {
  const { ref, inView } = useInView(0.15);
  return (
    <section id="testimonials" ref={ref} style={{ padding: '100px 24px', background: 'white' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-block', background: '#FFF7ED', color: '#C2410C',
            fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '6px 14px', borderRadius: 100, marginBottom: 16,
          }}>
            Real stories
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: '#1A2332', margin: 0, letterSpacing: '-0.025em' }}>
            Loved by patients & doctors
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 24 }}>
          {testimonials.map((t, i) => (
            <div key={t.name} style={{
              background: '#FAFAFA', border: '1.5px solid #E2E8F0', borderRadius: 16,
              padding: '32px 28px',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(24px)',
              transition: `all 0.7s ease ${i * 0.1}s`,
            }}>
              <div style={{ fontSize: '1.25rem', marginBottom: 16 }}>
                {'⭐'.repeat(t.stars)}
              </div>
              <p style={{ color: '#374151', fontSize: '0.9875rem', lineHeight: 1.7, margin: '0 0 24px', fontStyle: 'italic' }}>
                "{t.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1565C020, #00897B20)',
                  border: '2px solid #E2E8F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1A2332', fontSize: '0.9375rem' }}>{t.name}</div>
                  <div style={{ color: '#64748B', fontSize: '0.8125rem' }}>{t.role}</div>
                </div>
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
      padding: '100px 24px',
      background: 'linear-gradient(160deg, #0A1628 0%, #0D2B4E 60%, #0A3D2B 100%)',
      textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(21,101,192,0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
        <h2 style={{
          fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 900, color: 'white',
          margin: '0 0 20px', letterSpacing: '-0.025em',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.7s ease',
        }}>
          Your health deserves the best care
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.7)', fontSize: '1.0625rem', margin: '0 0 40px', lineHeight: 1.7,
          opacity: inView ? 1 : 0, transition: 'opacity 0.7s ease 0.1s',
        }}>
          Join thousands of patients and doctors already using MediVault. Sign up today — completely free.
        </p>
        <div style={{
          display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap',
          opacity: inView ? 1 : 0, transition: 'opacity 0.7s ease 0.2s',
        }}>
          <RouterLink to="/register" id="cta-get-started" style={{
            padding: '16px 40px', borderRadius: 12,
            background: 'linear-gradient(135deg, #1565C0, #1976D2)',
            color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
            boxShadow: '0 8px 30px rgba(21,101,192,0.5)',
            transition: 'all 0.25s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          >
            Create free account →
          </RouterLink>
          <RouterLink to="/login" id="cta-signin" style={{
            padding: '16px 36px', borderRadius: 12,
            color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '1rem',
            border: '1.5px solid rgba(255,255,255,0.25)',
            background: 'rgba(255,255,255,0.08)',
            transition: 'all 0.25s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          >
            Sign in
          </RouterLink>
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
          <p style={{ lineHeight: 1.65, fontSize: '0.9rem', margin: 0 }}>
            Secure telemedicine and electronic health records for modern India.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48 }}>
          {[
            { title: 'Product', links: ['Features', 'Security', 'Pricing', 'Changelog'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'HIPAA'] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', marginBottom: 14 }}>{col.title}</div>
              {col.links.map(link => (
                <div key={link} style={{ marginBottom: 10 }}>
                  <a href="#" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                  >
                    {link}
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, textAlign: 'center', fontSize: '0.8125rem' }}>
        © {new Date().getFullYear()} MediVault. All rights reserved. Built with ❤️ for better healthcare.
      </div>
    </div>
  </footer>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const HomePage: React.FC = () => (
  <div style={{ width: '100%' }}>
    <Navbar />
    <HeroSection />
    <StatsSection />
    <FeaturesSection />
    <HowItWorksSection />
    <TestimonialsSection />
    <CTASection />
    <Footer />
  </div>
);

export default HomePage;
