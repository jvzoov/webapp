'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────
type Tab  = 'otp' | 'email';
type Step = 'phone' | 'otp';

// ─── Shared design tokens ─────────────────────────────────────
const BG       = '#0c0a06';
const SURFACE  = '#1a1208';
const BORDER   = '#2e2010';
const BORDER_F = '#FF6B00';
const SAFFRON  = '#FF6B00';
const TEXT      = '#f5ede0';
const MUTED     = '#7a5c3a';

const inputBase: React.CSSProperties = {
  background:   SURFACE,
  border:       `1px solid ${BORDER}`,
  borderRadius: '10px',
  padding:      '11px 14px',
  color:        TEXT,
  fontSize:     '15px',
  outline:      'none',
  width:        '100%',
  transition:   'border-color 0.18s',
  fontFamily:   'inherit',
};

function focusBorder(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = BORDER_F;
}
function blurBorder(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = BORDER;
}

// ─── 6-box OTP Input ─────────────────────────────────────────
function OtpBoxes({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function handleKey(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !refs.current[idx]?.value && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  }

  function handleChange(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const arr = value.split('');
    arr[idx] = digit;
    const next = arr.join('').slice(0, 6);
    onChange(next);
    if (digit && idx < 5) refs.current[idx + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text) {
      onChange(text);
      refs.current[Math.min(text.length, 5)]?.focus();
      e.preventDefault();
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e)  => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => (e.target.style.borderColor = BORDER_F)}
          onBlur={(e)  => (e.target.style.borderColor = value[i] ? BORDER_F : BORDER)}
          style={{
            flex:         '1',
            height:       '52px',
            textAlign:    'center',
            fontSize:     '22px',
            fontWeight:   700,
            fontFamily:   'DM Mono, monospace',
            color:        TEXT,
            background:   SURFACE,
            border:       `1.5px solid ${value[i] ? BORDER_F : BORDER}`,
            borderRadius: '10px',
            outline:      'none',
            transition:   'border-color 0.18s',
          }}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function LoginPage() {
  const router  = useRouter();
  const [tab, setTab]       = useState<Tab>('otp');
  const [step, setStep]     = useState<Step>('phone');
  const [loading, setLoading] = useState(false);

  // OTP tab state
  const [phone, setPhone]   = useState('');
  const [otp, setOtp]       = useState('');
  const [countdown, setCd]  = useState(0);

  // Email tab state
  const [email, setEmail]   = useState('');
  const [password, setPass] = useState('');

  // ── Countdown timer ──
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCd((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Helpers ──
  const redirectByRole = useCallback(async () => {
    const res  = await fetch('/api/auth/session');
    const data = await res.json() as { user?: { role?: string } };
    const role = data?.user?.role;
    if (role === 'CLIENT')  router.push('/client/home');
    else if (role === 'STANDER') router.push('/stander/home');
    else if (role === 'ADMIN')   router.push('/admin/dashboard');
    else router.push('/');
  }, [router]);

  // ── Send OTP ──
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(digits)) {
      toast.error('Enter a valid 10-digit Indian mobile number');
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/send-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: digits }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        toast.error(d.error ?? 'Failed to send OTP');
        return;
      }
      toast.success('OTP sent on WhatsApp! 📲');
      setStep('otp');
      setCd(30);
    } finally {
      setLoading(false);
    }
  }

  // ── Verify OTP ──
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) { toast.error('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const digits = phone.replace(/\D/g, '').slice(-10);
      const result = await signIn('whatsapp-otp', {
        phone:    `+91${digits}`,
        otp,
        redirect: false,
      });
      if (result?.error) { toast.error('Invalid or expired OTP'); return; }
      await redirectByRole();
    } finally {
      setLoading(false);
    }
  }

  // ── Email login ──
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) { toast.error('Invalid email or password'); return; }
      await redirectByRole();
    } finally {
      setLoading(false);
    }
  }

  // ── Resend ──
  async function handleResend() {
    if (countdown > 0) return;
    const digits = phone.replace(/\D/g, '').slice(-10);
    await fetch('/api/auth/send-otp', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ phone: digits }),
    });
    toast.success('OTP resent!');
    setCd(30);
    setOtp('');
  }

  // ── Tab style helper ──
  function tabStyle(t: Tab): React.CSSProperties {
    const active = tab === t;
    return {
      flex:          1,
      padding:       '10px 0',
      borderRadius:  '8px',
      background:    active ? SAFFRON : 'transparent',
      color:         active ? '#fff'   : MUTED,
      border:        'none',
      cursor:        'pointer',
      fontFamily:    'DM Mono, monospace',
      fontSize:      '11px',
      letterSpacing: '0.12em',
      fontWeight:    600,
      transition:    'background 0.2s, color 0.2s',
    };
  }

  return (
    <div style={{ background: BG, minHeight: '100dvh' }}
         className="flex items-center justify-center px-4 py-12">
      <Toaster position="top-center"
               toastOptions={{ style: { background: '#1f180e', color: TEXT, border: `1px solid ${BORDER}` } }} />

      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '52px', color: TEXT, lineHeight: 1 }}>
            Queue
          </span>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '52px', color: SAFFRON, lineHeight: 1 }}>
            Pe
          </span>
          <p style={{ color: MUTED, fontSize: '13px', marginTop: '4px', fontFamily: 'DM Mono, monospace', letterSpacing: '0.06em' }}>
            Skip the line. Earn your time.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background:   '#120d06',
          border:       `1px solid ${BORDER}`,
          borderRadius: '16px',
          padding:      '28px 24px',
        }}>

          {/* Tabs */}
          <div style={{
            display:      'flex',
            background:   SURFACE,
            border:       `1px solid ${BORDER}`,
            borderRadius: '10px',
            padding:      '4px',
            marginBottom: '24px',
          }}>
            <button id="tab-otp"   type="button" style={tabStyle('otp')}   onClick={() => { setTab('otp');   setStep('phone'); }}>
              📲 WhatsApp OTP
            </button>
            <button id="tab-email" type="button" style={tabStyle('email')} onClick={() => setTab('email')}>
              ✉️ Email
            </button>
          </div>

          {/* ── Tab: WhatsApp OTP ── */}
          {tab === 'otp' && (
            <>
              {step === 'phone' ? (
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'DM Mono, monospace', fontSize: '10px', color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Mobile Number
                    </label>
                    {/* +91 prefix pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '10px',
                        padding: '11px 12px', color: MUTED, fontFamily: 'DM Mono, monospace',
                        fontSize: '14px', whiteSpace: 'nowrap',
                      }}>
                        +91
                      </span>
                      <input
                        id="phone-input"
                        type="tel"
                        inputMode="numeric"
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        onFocus={focusBorder}
                        onBlur={blurBorder}
                        style={{ ...inputBase, flex: 1 }}
                        required
                      />
                    </div>
                  </div>
                  <button
                    id="send-otp-btn"
                    type="submit"
                    disabled={loading}
                    style={{
                      background:    loading ? '#7a3d00' : SAFFRON,
                      color:         '#fff',
                      border:        'none',
                      borderRadius:  '10px',
                      padding:       '14px',
                      width:         '100%',
                      fontFamily:    'Bebas Neue, sans-serif',
                      fontSize:      '20px',
                      letterSpacing: '0.1em',
                      cursor:        loading ? 'not-allowed' : 'pointer',
                      transition:    'background 0.2s',
                    }}
                  >
                    {loading ? 'SENDING…' : 'SEND OTP ON WHATSAPP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ color: MUTED, fontSize: '13px', textAlign: 'center', margin: 0 }}>
                    OTP sent to <strong style={{ color: TEXT }}>+91 {phone}</strong>
                  </p>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'DM Mono, monospace', fontSize: '10px', color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '10px' }}>
                      Enter 6-digit OTP
                    </label>
                    <OtpBoxes value={otp} onChange={setOtp} />
                  </div>
                  <button
                    id="verify-otp-btn"
                    type="submit"
                    disabled={loading || otp.length < 6}
                    style={{
                      background:    (loading || otp.length < 6) ? '#7a3d00' : SAFFRON,
                      color:         '#fff',
                      border:        'none',
                      borderRadius:  '10px',
                      padding:       '14px',
                      width:         '100%',
                      fontFamily:    'Bebas Neue, sans-serif',
                      fontSize:      '20px',
                      letterSpacing: '0.1em',
                      cursor:        (loading || otp.length < 6) ? 'not-allowed' : 'pointer',
                      transition:    'background 0.2s',
                    }}
                  >
                    {loading ? 'VERIFYING…' : 'VERIFY OTP'}
                  </button>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button type="button" onClick={() => { setStep('phone'); setOtp(''); }}
                      style={{ background: 'none', border: 'none', color: MUTED, fontSize: '13px', cursor: 'pointer' }}>
                      ← Change number
                    </button>
                    <button
                      id="resend-otp-btn"
                      type="button"
                      onClick={handleResend}
                      disabled={countdown > 0}
                      style={{
                        background: 'none', border: 'none',
                        color:  countdown > 0 ? MUTED : SAFFRON,
                        fontSize: '13px', cursor: countdown > 0 ? 'default' : 'pointer',
                      }}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* ── Tab: Email & Password ── */}
          {tab === 'email' && (
            <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'DM Mono, monospace', fontSize: '10px', color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  id="email-input"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={focusBorder}
                  onBlur={blurBorder}
                  style={inputBase}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'DM Mono, monospace', fontSize: '10px', color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  id="password-input"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPass(e.target.value)}
                  onFocus={focusBorder}
                  onBlur={blurBorder}
                  style={inputBase}
                  required
                />
              </div>
              <button
                id="email-login-btn"
                type="submit"
                disabled={loading}
                style={{
                  background:    loading ? '#7a3d00' : SAFFRON,
                  color:         '#fff',
                  border:        'none',
                  borderRadius:  '10px',
                  padding:       '14px',
                  width:         '100%',
                  fontFamily:    'Bebas Neue, sans-serif',
                  fontSize:      '20px',
                  letterSpacing: '0.1em',
                  cursor:        loading ? 'not-allowed' : 'pointer',
                  transition:    'background 0.2s',
                  marginTop:     '4px',
                }}
              >
                {loading ? 'LOGGING IN…' : 'LOGIN'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: MUTED }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: SAFFRON, textDecoration: 'none', fontWeight: 600 }}>
            Register →
          </Link>
        </p>
      </div>
    </div>
  );
}
