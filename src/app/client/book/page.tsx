'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Script from 'next/script';
import toast, { Toaster } from 'react-hot-toast';
import { supabaseAdmin } from '@/lib/supabase/admin';

const schema = z.object({
  locationAddress: z.string().min(5, 'Please enter the specific address'),
  date:            z.string().min(1, 'Select a date'),
  startTime:       z.string().min(1, 'Select a start time'),
  estimatedHours:  z.coerce.number().min(1).max(5),
  instructions:    z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const inputStyle: React.CSSProperties = {
  background:   '#F7F4EE',
  border:       '1px solid #D4CFC6',
  borderRadius: '8px',
  padding:      '10px 12px',
  fontSize:     '14px',
  color:        '#1A1612',
  width:        '100%',
  outline:      'none',
  transition:   'border-color 0.18s',
};
const labelStyle: React.CSSProperties = {
  fontFamily:    'DM Mono, monospace',
  fontSize:      '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color:         '#8A8480',
  marginBottom:  '6px',
  display:       'block',
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BookPage() {
  const { data: session } = useSession();
  const router            = useRouter();
  const searchParams      = useSearchParams();
  const locationId        = searchParams.get('location') ?? '';

  const [locationName, setLocationName]   = useState<string>('');
  const [locationIcon, setLocationIcon]   = useState<string>('📍');
  const [razorpayReady, setRazorpayReady] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date:           tomorrowStr,
      startTime:      '08:00',
      estimatedHours: 2,
    },
  });

  const hours = watch('estimatedHours') ?? 2;
  const totalRupees   = hours * 200 + 49;
  const standerPayout = Math.round(hours * 200 * 0.8);

  // Fetch location name
  useEffect(() => {
    if (!locationId) return;
    fetch(`/api/locations/${locationId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.name) setLocationName(d.name);
        if (d.icon) setLocationIcon(d.icon);
      })
      .catch(() => {});
  }, [locationId]);

  async function onSubmit(values: FormValues) {
    if (!session?.user) { toast.error('Please login first'); return; }

    const startTime = new Date(`${values.date}T${values.startTime}:00`).toISOString();

    // Step 1: Create booking
    const bookRes = await fetch('/api/bookings', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        locationId,
        locationAddress: values.locationAddress,
        startTime,
        estimatedHours:  values.estimatedHours,
        instructions:    values.instructions,
      }),
    });

    const bookData = await bookRes.json();
    if (!bookRes.ok) {
      toast.error(bookData.error ?? 'Failed to create booking');
      return;
    }

    const { bookingId, razorpayOrderId, amount } = bookData;

    // Step 2: Open Razorpay
    if (!razorpayReady) {
      toast.error('Payment system loading, please try again');
      return;
    }

    const rzp = new window.Razorpay({
      key:      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount,
      currency: 'INR',
      order_id: razorpayOrderId,
      name:     'QueuePe',
      description: `${locationName} — ${hours} hr(s)`,
      theme:    { color: '#FF6B00' },
      handler:  async (response: any) => {
        // Step 3: Verify
        const verRes = await fetch('/api/payments/verify', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            bookingId,
          }),
        });
        const verData = await verRes.json();
        if (verData.success) {
          toast.success('Payment confirmed!');
          setTimeout(() => router.push(`/client/track/${bookingId}`), 600);
        } else {
          toast.error('Payment verification failed');
        }
      },
      modal: {
        ondismiss: () => toast.error('Payment cancelled'),
      },
    });
    rzp.open();
  }

  const user = session?.user as any;

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayReady(true)}
      />
      <Toaster position="top-center" />

      <div className="app-shell" style={{ minHeight: '100dvh', background: '#F7F4EE' }}>
        {/* Header */}
        <header
          style={{
            position:   'sticky',
            top:        0,
            zIndex:     40,
            background: '#1A1612',
            padding:    '14px 16px',
            display:    'flex',
            alignItems: 'center',
            gap:        '10px',
          }}
        >
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', color: '#a08060', cursor: 'pointer', fontSize: '20px' }}
          >
            ←
          </button>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', color: '#f5ede0' }}>
            Book a Stander
          </span>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Location (read-only) */}
          <div>
            <label style={labelStyle}>Location</label>
            <div
              style={{
                background:   '#fff',
                border:       '1px solid #D4CFC6',
                borderRadius: '10px',
                padding:      '12px 14px',
                display:      'flex',
                alignItems:   'center',
                gap:          '10px',
              }}
            >
              <span style={{ fontSize: '24px' }}>{locationIcon}</span>
              <span style={{ fontWeight: 600, fontSize: '15px' }}>{locationName || 'Loading…'}</span>
            </div>
          </div>

          {/* Address */}
          <div>
            <label style={labelStyle}>Specific Address</label>
            <input
              {...register('locationAddress')}
              placeholder="e.g. RTO Koramangala, Hosur Road"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#FF6B00')}
              onBlur={(e)  => (e.target.style.borderColor = '#D4CFC6')}
            />
            {errors.locationAddress && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                {errors.locationAddress.message}
              </p>
            )}
          </div>

          {/* Date + Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                {...register('date')}
                min={tomorrowStr}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#FF6B00')}
                onBlur={(e)  => (e.target.style.borderColor = '#D4CFC6')}
              />
            </div>
            <div>
              <label style={labelStyle}>Start Time</label>
              <input
                type="time"
                {...register('startTime')}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#FF6B00')}
                onBlur={(e)  => (e.target.style.borderColor = '#D4CFC6')}
              />
            </div>
          </div>

          {/* Hours */}
          <div>
            <label style={labelStyle}>Estimated Hours</label>
            <select
              {...register('estimatedHours')}
              style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
            >
              {[1, 2, 3, 4, 5].map((h) => (
                <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Pre-filled user info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Your Name</label>
              <input
                readOnly
                value={user?.name ?? ''}
                style={{ ...inputStyle, opacity: 0.7 }}
              />
            </div>
            <div>
              <label style={labelStyle}>Mobile</label>
              <input
                readOnly
                value={user?.phone ?? ''}
                style={{ ...inputStyle, opacity: 0.7 }}
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label style={labelStyle}>Instructions for Stander (optional)</label>
            <textarea
              {...register('instructions')}
              placeholder="e.g. Stand in Counter 3 for DL Renewal"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={(e) => (e.target.style.borderColor = '#FF6B00')}
              onBlur={(e)  => (e.target.style.borderColor = '#D4CFC6')}
            />
          </div>

          {/* Price Preview */}
          <div
            style={{
              background:   'rgba(255,107,0,0.07)',
              border:       '1px solid rgba(255,107,0,0.25)',
              borderRadius: '12px',
              padding:      '18px',
            }}
          >
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#8A8480', marginBottom: '8px' }}>
              ₹200/hr × {hours} hr{hours > 1 ? 's' : ''} + ₹49 booking fee
            </div>
            <div
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize:   '48px',
                color:      '#FF6B00',
                lineHeight: 1,
                marginBottom:'12px',
              }}
            >
              ₹{totalRupees}
            </div>
            <div style={{ fontSize: '12px', color: '#8A8480', lineHeight: 1.8 }}>
              {[
                '✓ Stander stays until your turn or time is up',
                '✓ Geo-verified check-ins every 30 minutes',
                '✓ Instant WhatsApp alert when your turn approaches',
                '✓ Full refund if no Stander matched within 20 min',
              ].map((g) => (
                <div key={g} style={{ color: '#1A7A4A' }}>{g}</div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background:    isSubmitting ? '#D4CFC6' : '#FF6B00',
              color:         '#fff',
              fontFamily:    'Bebas Neue, sans-serif',
              fontSize:      '22px',
              letterSpacing: '0.06em',
              border:        'none',
              borderRadius:  '10px',
              padding:       '16px 0',
              width:         '100%',
              cursor:        isSubmitting ? 'not-allowed' : 'pointer',
              marginBottom:  '32px',
            }}
          >
            {isSubmitting ? 'PROCESSING…' : `PAY ₹${totalRupees} & CONFIRM`}
          </button>
        </form>
      </div>
    </>
  );
}
