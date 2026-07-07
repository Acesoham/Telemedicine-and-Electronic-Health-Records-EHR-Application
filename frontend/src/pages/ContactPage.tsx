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
              color: link.to === '/contact' ? '#1565C0' : '#64748B',
              textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem',
              transition: 'color 0.2s',
              borderBottom: link.to === '/contact' ? '2px solid #1565C0' : '2px solid transparent',
              paddingBottom: 2,
            }}>
              {link.label}
            </RouterLink>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <RouterLink to="/login" style={{ padding: '9px 20px', borderRadius: 8, color: '#111827', border: 'none', background: 'transparent', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Sign in</RouterLink>
            <RouterLink to="/register" style={{ padding: '10px 22px', borderRadius: 8, background: '#1565C0', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>Get Started Free</RouterLink>
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

// ─── Contact Hero ─────────────────────────────────────────────────────────────
const ContactHero: React.FC = () => {
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
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)', top: -100, left: -100, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', bottom: -80, right: -80, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto', opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.8s ease' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'white', border: '1px solid #E5E7EB', borderRadius: 100, padding: '6px 18px', marginBottom: 28,
          color: '#2563EB', fontSize: '0.8125rem', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          We respond within 24 hours
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.75rem)',
          fontWeight: 900, color: '#111827', margin: '0 0 20px',
          lineHeight: 1.1, letterSpacing: '-0.025em',
        }}>
          Get in <span style={{ color: '#2563EB' }}>touch</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
          color: '#6B7280', margin: '0 auto', maxWidth: 520, lineHeight: 1.7,
        }}>
          Have a question, need a demo, or want to partner with us? Our team is here to help you get the most out of MediVault.
        </p>
      </div>
    </section>
  );
};

// ─── Contact Channels ─────────────────────────────────────────────────────────
const contactChannels = [
  { icon: '📧', title: 'Email Us', value: 'hello@medivault.in', sub: 'For general enquiries', color: '#EFF6FF', accent: '#2563EB' },
  { icon: '📞', title: 'Call Us', value: '+91 1800 123 4567', sub: 'Mon–Sat, 9 AM – 7 PM IST', color: '#F0FDF4', accent: '#059669' },
  { icon: '💬', title: 'Live Chat', value: 'Chat with support', sub: 'Available in-app', color: '#F5F3FF', accent: '#7C3AED' },
  { icon: '🏢', title: 'Visit Us', value: 'Bengaluru, Karnataka', sub: 'India 560001', color: '#FFF7ED', accent: '#D97706' },
];

const ContactChannelsSection: React.FC = () => {
  const { ref, inView } = useInView(0.1);
  return (
    <section ref={ref} style={{ padding: '80px 24px 0', background: 'white' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
        {contactChannels.map((c, i) => (
          <div key={c.title} style={{
            background: c.color,
            border: `1.5px solid ${c.accent}20`,
            borderRadius: 20,
            padding: '32px 24px',
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(28px)',
            transition: `all 0.6s ease ${i * 0.08}s`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{c.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: c.accent, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{c.title}</div>
            <div style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#111827', marginBottom: 6 }}>{c.value}</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>{c.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── Contact Form ─────────────────────────────────────────────────────────────
const departments = [
  'General Enquiry',
  'Technical Support',
  'Sales & Partnerships',
  'Doctor Onboarding',
  'Billing & Payments',
  'Privacy / Legal',
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  department: string;
  subject: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const ContactFormSection: React.FC = () => {
  const { ref, inView } = useInView(0.05);
  const [form, setForm] = useState<FormState>({
    name: '', email: '', phone: '', department: '', subject: '', message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.department) errs.department = 'Please select a department.';
    if (!form.subject.trim()) errs.subject = 'Subject is required.';
    if (!form.message.trim()) errs.message = 'Message cannot be empty.';
    else if (form.message.trim().length < 20) errs.message = 'Message should be at least 20 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [k]: e.target.value }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1500);
  };

  const inputStyle = (field: keyof FormState): React.CSSProperties => ({
    width: '100%',
    padding: '13px 16px',
    borderRadius: 10,
    border: `1.5px solid ${errors[field] ? '#EF4444' : focused === field ? '#2563EB' : '#E2E8F0'}`,
    fontSize: '0.9375rem',
    color: '#111827',
    background: 'white',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'Inter, Segoe UI, sans-serif',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontWeight: 600,
    fontSize: '0.875rem',
    color: '#374151',
    marginBottom: 6,
  };

  const errorStyle: React.CSSProperties = {
    color: '#EF4444',
    fontSize: '0.8125rem',
    marginTop: 4,
    display: 'block',
  };

  if (submitted) {
    return (
      <section style={{ padding: '80px 24px 100px', background: 'white' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669, #10B981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 28px',
            boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
            animation: 'popIn 0.5s ease',
          }}>✓</div>
          <h2 style={{ fontWeight: 900, fontSize: '2rem', color: '#1A2332', margin: '0 0 16px' }}>Message sent! 🎉</h2>
          <p style={{ color: '#64748B', fontSize: '1.0625rem', lineHeight: 1.7, margin: '0 0 36px' }}>
            Thank you, <strong>{form.name}</strong>! We've received your message and will get back to you at <strong>{form.email}</strong> within 24 hours.
          </p>
          <RouterLink to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '13px 28px', borderRadius: 10, background: '#2563EB', color: 'white',
            textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem',
          }}>← Back to Home</RouterLink>
        </div>
        <style>{`@keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      </section>
    );
  }

  return (
    <section ref={ref} style={{ padding: '80px 24px 100px', background: 'white' }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 56, alignItems: 'start',
      }}>
        {/* Left info panel */}
        <div style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateX(0)' : 'translateX(-28px)', transition: 'all 0.7s ease' }}>
          <div style={{
            display: 'inline-block', background: '#EFF6FF', color: '#1D4ED8',
            fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '6px 14px', borderRadius: 100, marginBottom: 20,
          }}>Contact Us</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#1A2332', margin: '0 0 20px', letterSpacing: '-0.025em' }}>
            Let's start a conversation
          </h2>
          <p style={{ color: '#64748B', fontSize: '1.0625rem', lineHeight: 1.7, margin: '0 0 40px' }}>
            Whether you're a patient looking for help, a doctor ready to onboard, or a healthcare organisation exploring a partnership — we'd love to hear from you.
          </p>

          {/* What happens next */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { step: '01', title: 'We read every message', desc: 'Every query is assigned to the right team member within hours.' },
              { step: '02', title: 'You hear back within 24h', desc: 'Typically much sooner. Priority queries are handled same-day.' },
              { step: '03', title: 'We solve the problem together', desc: 'We work collaboratively until you\'re fully satisfied.' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1565C0, #2563EB)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0,
                }}>{s.step}</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9375rem', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Social links */}
          <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid #F1F5F9' }}>
            <div style={{ fontWeight: 700, color: '#374151', fontSize: '0.875rem', marginBottom: 16 }}>Follow us</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'Twitter', icon: '𝕏', href: '#' },
                { label: 'LinkedIn', icon: 'in', href: '#' },
                { label: 'Instagram', icon: '📷', href: '#' },
              ].map(s => (
                <a key={s.label} href={s.href} aria-label={s.label} style={{
                  width: 40, height: 40, borderRadius: 10,
                  border: '1.5px solid #E2E8F0', background: '#F8FAFC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', fontWeight: 700, color: '#374151',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#2563EB'; (e.currentTarget as HTMLAnchorElement).style.color = '#2563EB'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLAnchorElement).style.color = '#374151'; }}
                >{s.icon}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Right form */}
        <div style={{
          background: '#FAFAFA',
          border: '1.5px solid #E2E8F0',
          borderRadius: 24,
          padding: '40px 36px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
          opacity: inView ? 1 : 0, transform: inView ? 'translateX(0)' : 'translateX(28px)',
          transition: 'all 0.7s ease 0.1s',
        }}>
          <form id="contact-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Name + Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-grid-2">
              <div>
                <label htmlFor="contact-name" style={labelStyle}>Full Name *</label>
                <input id="contact-name" type="text" placeholder="Priya Sharma" value={form.name} onChange={handleChange('name')}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                  style={inputStyle('name')} />
                {errors.name && <span style={errorStyle}>{errors.name}</span>}
              </div>
              <div>
                <label htmlFor="contact-email" style={labelStyle}>Email Address *</label>
                <input id="contact-email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange('email')}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  style={inputStyle('email')} />
                {errors.email && <span style={errorStyle}>{errors.email}</span>}
              </div>
            </div>

            {/* Phone + Department */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-grid-2">
              <div>
                <label htmlFor="contact-phone" style={labelStyle}>Phone Number</label>
                <input id="contact-phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange('phone')}
                  onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                  style={inputStyle('phone')} />
              </div>
              <div>
                <label htmlFor="contact-department" style={labelStyle}>Department *</label>
                <select id="contact-department" value={form.department} onChange={handleChange('department')}
                  onFocus={() => setFocused('department')} onBlur={() => setFocused(null)}
                  style={{ ...inputStyle('department'), appearance: 'none', cursor: 'pointer' }}>
                  <option value="">Select a department…</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <span style={errorStyle}>{errors.department}</span>}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="contact-subject" style={labelStyle}>Subject *</label>
              <input id="contact-subject" type="text" placeholder="How can we help?" value={form.subject} onChange={handleChange('subject')}
                onFocus={() => setFocused('subject')} onBlur={() => setFocused(null)}
                style={inputStyle('subject')} />
              {errors.subject && <span style={errorStyle}>{errors.subject}</span>}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="contact-message" style={labelStyle}>Message *</label>
              <textarea id="contact-message" rows={5} placeholder="Tell us more about your query…" value={form.message} onChange={handleChange('message')}
                onFocus={() => setFocused('message')} onBlur={() => setFocused(null)}
                style={{ ...inputStyle('message'), resize: 'vertical', minHeight: 120 }} />
              {errors.message && <span style={errorStyle}>{errors.message}</span>}
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF', marginTop: 4 }}>{form.message.length} chars</div>
            </div>

            {/* Submit */}
            <button id="contact-submit-btn" type="submit" disabled={loading} style={{
              padding: '15px 24px',
              borderRadius: 12,
              background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1565C0, #2563EB)',
              color: 'white',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
              fontFamily: 'Inter, Segoe UI, sans-serif',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.3)',
            }}>
              {loading ? (
                <>
                  <span style={{ width: 18, height: 18, border: '2.5px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Sending…
                </>
              ) : 'Send Message →'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) { .form-grid-2 { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
};

// ─── FAQ Section ─────────────────────────────────────────────────────────────
const faqs = [
  { q: 'Is my health data safe on MediVault?', a: 'Absolutely. All data is encrypted using AES-256 both in transit and at rest. We are fully HIPAA-compliant and undergo regular third-party security audits.' },
  { q: 'How do I get started as a doctor?', a: 'Click "Join as a Doctor" on the Features page and complete your profile. Our team verifies your medical registration certificate within 1–2 business days.' },
  { q: 'Can I use MediVault for free?', a: 'Yes! Patients can create a free account and book unlimited appointments. Doctors have a 30-day free trial with access to all features.' },
  { q: 'What devices does MediVault support?', a: 'MediVault is fully responsive and works on any modern browser — desktop, tablet, or mobile. iOS and Android apps are coming soon.' },
  { q: 'How do digital prescriptions work?', a: 'After your consultation, the doctor generates a prescription digitally. It is signed, timestamped, and delivered to your account instantly. You can download or share it with any pharmacy.' },
  { q: 'What payment methods are supported?', a: 'We support UPI, credit/debit cards, and net banking through our secure payment gateway. All transactions are encrypted.' },
];

const FAQSection: React.FC = () => {
  const { ref, inView } = useInView(0.1);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section ref={ref} style={{ padding: '100px 24px', background: '#F8FAFC' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-block', background: '#F0FDF4', color: '#059669',
            fontWeight: 700, fontSize: '0.8125rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '6px 14px', borderRadius: 100, marginBottom: 16,
          }}>FAQ</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#1A2332', margin: 0, letterSpacing: '-0.025em' }}>
            Frequently asked questions
          </h2>
          <p style={{ color: '#64748B', fontSize: '1.0625rem', marginTop: 16, lineHeight: 1.6 }}>
            Can't find your answer? <RouterLink to="/contact" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>Chat with us</RouterLink>.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{
              background: 'white',
              border: `1.5px solid ${open === i ? '#2563EB40' : '#E2E8F0'}`,
              borderRadius: 14,
              overflow: 'hidden',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s, border-color 0.2s`,
              boxShadow: open === i ? '0 4px 20px rgba(37,99,235,0.08)' : 'none',
            }}>
              <button id={`faq-btn-${i}`} onClick={() => setOpen(open === i ? null : i)} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', gap: 16,
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1A2332' }}>{faq.q}</span>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: open === i ? '#EFF6FF' : '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: open === i ? '#2563EB' : '#64748B',
                  fontSize: '1rem', fontWeight: 700, flexShrink: 0,
                  transition: 'all 0.2s',
                  transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                }}>+</span>
              </button>
              {open === i && (
                <div style={{ padding: '0 24px 20px', color: '#64748B', fontSize: '0.9375rem', lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
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
const ContactPage: React.FC = () => (
  <div style={{ fontFamily: 'Inter, Segoe UI, sans-serif' }}>
    <Navbar />
    <ContactHero />
    <ContactChannelsSection />
    <ContactFormSection />
    <FAQSection />
    <Footer />
  </div>
);

export default ContactPage;
