'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole]       = useState<'CLIENT' | 'STANDER'>('CLIENT');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password. Please try again.');
        return;
      }

      // Fetch session to get role
      const res = await fetch('/api/auth/session');
      const session = await res.json();
      const userRole = session?.user?.role;

      if (userRole === 'CLIENT')  router.push('/client/home');
      else if (userRole === 'STANDER') router.push('/stander/home');
      else if (userRole === 'ADMIN')   router.push('/admin/dashboard');
      else router.push('/');
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
          <span
            className="text-5xl"
            style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#f5ede0' }}
          >
            Queue
          </span>
          <span
            className="text-5xl"
            style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#FF6B00' }}
          >
            Pe
          </span>
        </div>

        {/* Role Switcher */}
        <div
          className="flex rounded-[10px] p-1 mb-7"
          style={{ background: '#1f180e', border: '1px solid #362a16' }}
        >
          {(['CLIENT', 'STANDER'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className="flex-1 py-2 rounded-[8px] transition-all duration-200"
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '11px',
                letterSpacing: '0.12em',
                fontWeight: 500,
                background: role === r ? '#FF6B00' : 'transparent',
                color:      role === r ? '#fff'    : '#a08060',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              style={{
                fontFamily:    'DM Mono, monospace',
                fontSize:      '10px',
                color:         '#5a4030',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                background:  '#1f180e',
                border:      '1px solid #362a16',
                borderRadius:'8px',
                padding:     '10px 12px',
                color:       '#f5ede0',
                fontSize:    '14px',
                outline:     'none',
                width:       '100%',
                transition:  'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#FF6B00')}
              onBlur={(e)  => (e.target.style.borderColor = '#362a16')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              style={{
                fontFamily:    'DM Mono, monospace',
                fontSize:      '10px',
                color:         '#5a4030',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
              }}
            >
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPass(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                background:  '#1f180e',
                border:      '1px solid #362a16',
                borderRadius:'8px',
                padding:     '10px 12px',
                color:       '#f5ede0',
                fontSize:    '14px',
                outline:     'none',
                width:       '100%',
                transition:  'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#FF6B00')}
              onBlur={(e)  => (e.target.style.borderColor = '#362a16')}
            />
          </div>

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
              transition:    'background 0.2s',
              marginTop:     '4px',
            }}
          >
            {loading ? 'LOGGING IN…' : 'LOGIN'}
          </button>
        </form>

        <p
          className="text-center mt-6"
          style={{ fontFamily: 'Noto Sans, sans-serif', fontSize: '14px', color: '#a08060' }}
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            style={{ color: '#FF6B00', textDecoration: 'none', fontWeight: 600 }}
          >
            Register →
          </Link>
        </p>
      </div>
    </div>
  );
}
