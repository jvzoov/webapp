'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import AlertBanner from './AlertBanner';
import CheckInLog  from './CheckInLog';
import ElapsedTimer from './ElapsedTimer';
import type { BookingWithDetails, CheckIn, BookingStatus } from '@/types/database';

interface Props {
  initialBooking: BookingWithDetails;
}

function StatusBorder(status: BookingStatus): string {
  switch (status) {
    case 'ACTIVE':    return '#FF6B00';
    case 'ALERT':     return '#dc2626';
    case 'COMPLETED': return '#1A7A4A';
    default:          return '#D4CFC6';
  }
}

function StatusLabel(status: BookingStatus) {
  const map: Record<BookingStatus, { label: string; color: string }> = {
    PENDING_MATCH: { label: 'FINDING STANDER', color: '#FF6B00' },
    MATCHED:       { label: 'MATCHED',          color: '#3b82f6' },
    ACTIVE:        { label: 'ACTIVE',           color: '#FF6B00' },
    ALERT:         { label: 'ALERT',            color: '#dc2626' },
    COMPLETED:     { label: 'COMPLETED',        color: '#1A7A4A' },
    CANCELLED:     { label: 'CANCELLED',        color: '#dc2626' },
  };
  return map[status] ?? { label: status, color: '#8A8480' };
}

export default function TrackingCard({ initialBooking }: Props) {
  const supabase = createClient();

  const [booking,   setBooking]   = useState<BookingWithDetails>(initialBooking);
  const [checkIns,  setCheckIns]  = useState<CheckIn[]>(initialBooking.check_ins ?? []);
  const [position,  setPosition]  = useState<number | null>(
    initialBooking.check_ins?.at(-1)?.queue_position ?? null
  );
  const [estMinutes, setEstMinutes] = useState<number | null>(
    initialBooking.check_ins?.at(-1)?.estimated_minutes ?? null
  );

  const maxHours = booking.estimated_hours;
  const maxMins  = maxHours * 60;
  const progressPct = estMinutes !== null
    ? Math.max(0, Math.min(100, Math.round(100 - (estMinutes / maxMins) * 100)))
    : 0;

  useEffect(() => {
    const channel = supabase.channel(`booking-${booking.id}`)
      // New check-ins
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'check_ins', filter: `booking_id=eq.${booking.id}` },
        (payload) => {
          const ci = payload.new as CheckIn;
          setCheckIns((prev) => [...prev, ci]);
          if (ci.queue_position !== null) setPosition(ci.queue_position);
          if (ci.estimated_minutes !== null) setEstMinutes(ci.estimated_minutes);
        }
      )
      // Booking status changes
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${booking.id}` },
        (payload) => {
          setBooking((prev) => ({ ...prev, ...(payload.new as any) }));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [booking.id, supabase]);

  // Dev simulate
  async function simulateLiveUpdate() {
    await fetch('/api/dev/simulate-checkin', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ bookingId: booking.id }),
    });
  }

  const stander    = booking.stander;
  const sl         = StatusLabel(booking.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px' }}>

      {/* Alert Banner */}
      {booking.status === 'ALERT' && (
        <AlertBanner
          location={booking.location?.name}
          queuePosition={position ?? undefined}
        />
      )}

      {/* Booking Card */}
      <div
        style={{
          background:   '#fff',
          border:       '1px solid #D4CFC6',
          borderLeft:   `4px solid ${StatusBorder(booking.status)}`,
          borderRadius: '10px',
          padding:      '16px',
        }}
      >
        {/* Status badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span
            style={{
              fontFamily:    'DM Mono, monospace',
              fontSize:      '10px',
              color:         sl.color,
              border:        `1px solid ${sl.color}`,
              borderRadius:  '4px',
              padding:       '2px 7px',
              letterSpacing: '0.1em',
            }}
          >
            {sl.label}
          </span>
          <ElapsedTimer startTime={booking.start_time} />
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
          {[
            { label: 'Queue Pos', val: position !== null ? `#${position}` : '—' },
            { label: 'Est Wait',  val: estMinutes !== null ? `${estMinutes}min` : '—' },
            { label: 'Hours Booked', val: `${booking.estimated_hours}h` },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', color: '#FF6B00', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', color: '#8A8480', marginTop: '2px', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ background: '#F7F4EE', borderRadius: '100px', height: '6px', overflow: 'hidden', marginBottom: '4px' }}>
          <div
            style={{
              width:        `${progressPct}%`,
              height:       '100%',
              background:   'linear-gradient(90deg, #FF6B00 0%, #FFB060 100%)',
              borderRadius: '100px',
              transition:   'width 0.5s ease',
            }}
          />
        </div>
        <div style={{ textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#8A8480' }}>
          {progressPct}% done
        </div>

        {/* Big position */}
        {position !== null && (
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '72px', color: '#FF6B00', lineHeight: 1 }}>
              {position}
            </div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#8A8480' }}>
              people ahead
            </div>
          </div>
        )}
      </div>

      {/* Stander Info */}
      {stander && (
        <div style={{ background: '#fff', border: '1px solid #D4CFC6', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width:          '44px',
                height:         '44px',
                borderRadius:   '50%',
                background:     '#1A1612',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontFamily:     'Bebas Neue, sans-serif',
                fontSize:       '16px',
                color:          '#fff',
                flexShrink:     0,
              }}
            >
              {stander.avatar_initials ?? stander.name?.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{stander.name}</div>
              <div style={{ fontSize: '12px', color: '#8A8480', marginTop: '2px' }}>
                ★ {(booking as any).stander_profiles?.rating?.toFixed(1) ?? '5.0'} · Verified Stander
              </div>
            </div>
            <span
              style={{
                background:   'rgba(26,122,74,0.1)',
                color:        '#1A7A4A',
                border:       '1px solid rgba(26,122,74,0.2)',
                borderRadius: '4px',
                padding:      '2px 8px',
                fontSize:     '10px',
                fontFamily:   'DM Mono, monospace',
              }}
            >
              VERIFIED
            </span>
          </div>
          {stander.phone && (
            <a
              href={`tel:${stander.phone}`}
              style={{
                display:       'block',
                marginTop:     '10px',
                textAlign:     'center',
                border:        '1px solid #D4CFC6',
                borderRadius:  '8px',
                padding:       '8px',
                fontSize:      '14px',
                color:         '#1A1612',
                textDecoration:'none',
              }}
            >
              📞 Call Stander
            </a>
          )}
        </div>
      )}

      {/* Check-in Log */}
      <CheckInLog checkIns={checkIns} />

      {/* Dev: simulate */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={simulateLiveUpdate}
          style={{
            background:   '#1f180e',
            color:        '#FF6B00',
            border:       '1px dashed #FF6B00',
            borderRadius: '8px',
            padding:      '10px',
            fontSize:     '12px',
            fontFamily:   'DM Mono, monospace',
            cursor:       'pointer',
          }}
        >
          [DEV] Simulate Live Check-in
        </button>
      )}
    </div>
  );
}
