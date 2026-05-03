'use client';

import { format } from 'date-fns';
import type { BookingWithDetails } from '@/types/database';

interface Props {
  bookings: BookingWithDetails[];
}

export default function PayoutList({ bookings }: Props) {
  if (bookings.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#8A8480', fontSize: '14px' }}>
        No payouts yet. Complete a job to start earning!
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#8A8480', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px', padding: '0 4px' }}>
        Recent Payouts
      </div>
      
      <div style={{ background: '#fff', border: '1px solid #D4CFC6', borderRadius: '10px', overflow: 'hidden' }}>
        {bookings.map((b, i) => (
          <div
            key={b.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              borderBottom: i < bookings.length - 1 ? '1px solid #D4CFC6' : 'none',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#1A1612' }}>
                {b.location?.name ?? 'Unknown Location'}
              </div>
              <div style={{ fontSize: '12px', color: '#8A8480', marginTop: '2px' }}>
                {format(new Date(b.created_at), 'MMM d')} · {b.estimated_hours}h
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px', color: '#1A7A4A', lineHeight: 1 }}>
                ₹{Math.round(b.stander_payout / 100)}
              </div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', background: '#e6f4ea', color: '#1A7A4A', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                PAID
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
