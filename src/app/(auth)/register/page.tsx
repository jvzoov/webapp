'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';

// ─── Zod Schema ───────────────────────────────────────────────
const schema = z
  .object({
    name:     z.string().min(2, 'Name must be at least 2 characters'),
    phone:    z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
    email:    z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role:     z.enum(['CLIENT', 'STANDER']),
    upi_id:   z
      .string()
      .regex(/^[\w.-]+@[\w]+$/, 'Invalid UPI ID (e.g. name@upi)')
      .optional()
      .or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'STANDER' && !data.upi_id?.trim()) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        path:    ['upi_id'],
        message: 'UPI ID is required for Standers',
      });
    }
  });

type FormValues = z.infer<typeof schema>;

// ─── Design tokens ────────────────────────────────────────────
const BG      = '#0c0a06';
const SURFACE = '#1a1208';
const BORDER  = '#2e2010';
const SAFFRON = '#FF6B00';
const TEXT    = '#f5ede0';
const MUTED   = '#7a5c3a';
const ERROR   = '#ef4444';

// ─── Reusable sub-components ─────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontFamily:    'DM Mono, monospace',
  fontSize:      '10px',
  color:         MUTED,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  display:       'block',
  marginBottom:  '6px',
};

const inputStyle: React.CSSProperties = {
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

function Field({
  label,
  error,
  children,
}: {
  label:    string;
  error?:   string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && (
        <span style={{ color: ERROR, fontSize: '12px', marginTop: '5px', fontFamily: 'DM Mono, monospace' }}>
          {error}
        </span>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function RegisterPage() {
  const router              = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver:      zodResolver(schema),
    defaultValues: { role: 'CLIENT' },
  });

  const role = watch('role');

  function onFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = SAFFRON;
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = BORDER;
  }

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(values),
      });
      const data = await res.json() as { error?: string };

      if (!res.ok) {
        toast.error(data.error ?? 'Registration failed. Please try again.');
        return;
      }

      toast.success('Account created! Redirecting to login…');
      setTimeout(() => router.push('/login'), 1200);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: BG, minHeight: '100dvh' }}
         className="flex items-center justify-center px-4 py-10">
      <Toaster position="top-center"
               toastOptions={{ style: { background: '#1f180e', color: TEXT, border: `1px solid ${BORDER}` } }} />

      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '48px', color: TEXT, lineHeight: 1 }}>
            Queue
          </span>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '48px', color: SAFFRON, lineHeight: 1 }}>
            Pe
          </span>
          <p style={{ color: MUTED, fontSize: '13px', marginTop: '4px', fontFamily: 'DM Mono, monospace', letterSpacing: '0.06em' }}>
            Create your account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background:   '#120d06',
          border:       `1px solid ${BORDER}`,
          borderRadius: '16px',
          padding:      '28px 24px',
        }}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* Role toggle */}
            <Field label="I want to" error={errors.role?.message}>
              <div style={{
                display:      'flex',
                background:   SURFACE,
                border:       `1px solid ${BORDER}`,
                borderRadius: '10px',
                padding:      '4px',
              }}>
                {(['CLIENT', 'STANDER'] as const).map((r) => (
                  <label
                    key={r}
                    style={{
                      flex:          1,
                      textAlign:     'center',
                      padding:       '10px 0',
                      borderRadius:  '8px',
                      cursor:        'pointer',
                      background:    role === r ? SAFFRON : 'transparent',
                      color:         role === r ? '#fff'   : MUTED,
                      fontFamily:    'DM Mono, monospace',
                      fontSize:      '11px',
                      letterSpacing: '0.12em',
                      fontWeight:    600,
                      transition:    'background 0.2s, color 0.2s',
                    }}
                  >
                    <input type="radio" value={r} {...register('role')} className="sr-only" />
                    {r === 'CLIENT' ? '📋 Book a Stander' : '💼 Earn as Stander'}
                  </label>
                ))}
              </div>
            </Field>

            {/* Full Name */}
            <Field label="Full Name" error={errors.name?.message}>
              <input
                id="reg-name"
                {...register('name')}
                placeholder="Rahul Sharma"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </Field>

            {/* Phone — 10-digit, +91 shown as decoration */}
            <Field label="Mobile Number" error={errors.phone?.message}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  background: SURFACE, border: `1px solid ${BORDER}`,
                  borderRadius: '10px', padding: '11px 12px',
                  color: MUTED, fontFamily: 'DM Mono, monospace', fontSize: '14px',
                  whiteSpace: 'nowrap',
                }}>
                  +91
                </span>
                <input
                  id="reg-phone"
                  {...register('phone')}
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  style={{ ...inputStyle, flex: 1 }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
            </Field>

            {/* Email */}
            <Field label="Email Address" error={errors.email?.message}>
              <input
                id="reg-email"
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password?.message}>
              <input
                id="reg-password"
                {...register('password')}
                type="password"
                placeholder="Min. 8 characters"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </Field>

            {/* UPI ID — Stander only */}
            {role === 'STANDER' && (
              <Field label="UPI ID (for payouts)" error={errors.upi_id?.message}>
                <input
                  id="reg-upi"
                  {...register('upi_id')}
                  placeholder="yourname@upi"
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </Field>
            )}

            {/* Submit */}
            <button
              id="reg-submit"
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
              {loading ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: MUTED }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: SAFFRON, textDecoration: 'none', fontWeight: 600 }}>
            Login →
          </Link>
        </p>
      </div>
    </div>
  );
}
