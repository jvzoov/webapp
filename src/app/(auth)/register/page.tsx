'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';

const baseSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  phone:    z.string().regex(/^\+91[6-9]\d{9}$/, 'Enter valid +91 Indian mobile number'),
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role:     z.enum(['CLIENT', 'STANDER']),
  upi_id:   z.string().optional(),
});

type FormValues = z.infer<typeof baseSchema>;

const inputStyle: React.CSSProperties = {
  background:   '#1f180e',
  border:       '1px solid #362a16',
  borderRadius: '8px',
  padding:      '10px 12px',
  color:        '#f5ede0',
  fontSize:     '14px',
  outline:      'none',
  width:        '100%',
  transition:   'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  fontFamily:    'DM Mono, monospace',
  fontSize:      '10px',
  color:         '#5a4030',
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
};

function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={labelStyle}>{label}</label>
      {children}
      {error && (
        <span style={{ color: '#ef4444', fontSize: '12px' }}>{error}</span>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: { role: 'CLIENT' },
  });

  const role = watch('role');

  async function onSubmit(values: FormValues) {
    if (values.role === 'STANDER' && !values.upi_id?.trim()) {
      toast.error('UPI ID is required for Standers');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Registration failed. Please try again.');
        return;
      }

      toast.success('Account created! Please login.');
      setTimeout(() => router.push('/login'), 1200);
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ background: '#0c0a06', minHeight: '100dvh' }}
      className="flex items-center justify-center px-4 py-12"
    >
      <Toaster position="top-center" />
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#f5ede0', fontSize: '48px' }}>
            Queue
          </span>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#FF6B00', fontSize: '48px' }}>
            Pe
          </span>
          <p style={{ color: '#a08060', fontSize: '13px', marginTop: '4px' }}>
            Create your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Role */}
          <Field label="I want to" error={errors.role?.message}>
            <div
              className="flex rounded-[10px] p-1"
              style={{ background: '#1f180e', border: '1px solid #362a16' }}
            >
              {(['CLIENT', 'STANDER'] as const).map((r) => (
                <label
                  key={r}
                  className="flex-1 text-center py-2 rounded-[8px] cursor-pointer transition-all duration-200"
                  style={{
                    fontFamily:    'DM Mono, monospace',
                    fontSize:      '11px',
                    letterSpacing: '0.12em',
                    background:    role === r ? '#FF6B00' : 'transparent',
                    color:         role === r ? '#fff'    : '#a08060',
                  }}
                >
                  <input
                    type="radio"
                    value={r}
                    {...register('role')}
                    className="sr-only"
                  />
                  {r === 'CLIENT' ? 'Book a Stander' : 'Earn as Stander'}
                </label>
              ))}
            </div>
          </Field>

          <Field label="Full Name" error={errors.name?.message}>
            <input
              {...register('name')}
              placeholder="Rahul Sharma"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#FF6B00')}
              onBlur={(e)  => (e.target.style.borderColor = '#362a16')}
            />
          </Field>

          <Field label="Mobile (+91)" error={errors.phone?.message}>
            <input
              {...register('phone')}
              placeholder="+919876543210"
              type="tel"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#FF6B00')}
              onBlur={(e)  => (e.target.style.borderColor = '#362a16')}
            />
          </Field>

          <Field label="Email Address" error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#FF6B00')}
              onBlur={(e)  => (e.target.style.borderColor = '#362a16')}
            />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <input
              {...register('password')}
              type="password"
              placeholder="Min 8 characters"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#FF6B00')}
              onBlur={(e)  => (e.target.style.borderColor = '#362a16')}
            />
          </Field>

          {/* Stander UPI ID */}
          {role === 'STANDER' && (
            <Field label="UPI ID (for payouts)" error={errors.upi_id?.message}>
              <input
                {...register('upi_id')}
                placeholder="yourname@upi"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#FF6B00')}
                onBlur={(e)  => (e.target.style.borderColor = '#362a16')}
              />
            </Field>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background:    loading ? '#a05030' : '#FF6B00',
              color:         '#fff',
              fontFamily:    'Bebas Neue, sans-serif',
              fontSize:      '20px',
              letterSpacing: '0.08em',
              border:        'none',
              borderRadius:  '10px',
              padding:       '14px 0',
              width:         '100%',
              cursor:        loading ? 'not-allowed' : 'pointer',
              marginTop:     '4px',
            }}
          >
            {loading ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p
          className="text-center mt-6"
          style={{ fontSize: '14px', color: '#a08060' }}
        >
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#FF6B00', textDecoration: 'none', fontWeight: 600 }}>
            Login →
          </Link>
        </p>
      </div>
    </div>
  );
}
