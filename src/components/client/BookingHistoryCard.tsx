'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import RatingModal from './RatingModal';
import type { BookingWithDetails, BookingStatus } from '@/types/database';

interface Props {
  booking: BookingWithDetails;
}

function statusConfig(status: BookingStatus) {
  const map: Record<BookingStatus, { label: string; color: string; borderColor: string }> = {
    ACTIVE:        { label: 'ACTIVE',           color: '#FF6B00', borderColor: '#FF6B00' },
    ALERT:         { label: 'ALERT',            color: '#dc2626', borderColor: '#dc2626' },
    MATCHED:       { label: 'MATCHED',          color: '#3b82f6', borderColor: '#3b82f6' },
    PENDING_MATCH: { label: 'FINDING STANDER',  color: '#FF6B00', borderColor: 'transparent' },
    COMPLETED:     { label: 'DONE',             color: '#8A8480', borderColor: 'transparent' },
    CANCELLED:     { label: 'CANCELLED',        color: '#dc2626', borderColor: '#dc2626' },
  };
  return map[status] ?? { label: status, color: '#8A8480', borderColor: 'transparent' };
}

function Stars({ rating }: { rating?: number | null }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: (rating ?? 0) >= s ? '#FF6B00' : '#D4CFC6', fontSize: '14px' }}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function BookingHistoryCard({ booking }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [rated,     setRated]     = useState(!!booking.review);

  const sc      = statusConfig(booking.status);
  const canRate = booking.status === 'COMPLETED' && !rated;

  return (
    <>
      <div
        style={{
          background:   '#fff',
          border:       '1px solid #D4CFC6',
          borderLeft:   `4px solid ${sc.borderColor}`,
          borderRadius: '10px',
          padding:      '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px' }}>{booking.location?.name}</div>
            <div style={{ fontSize: '12px', color: '#8A8480', marginTop: '2px' }}>{booking.location_address}</div>
          </div>
          <span
            style={{
              fontFamily:    'DM Mono, monospace',
              fontSize:      '10px',
              color:         sc.color,
              border:        `1px solid ${sc.color}`,
              borderRadius:  '4px',
              padding:       '2px 7px',
              letterSpacing: '0.1em',
              whiteSpace:    'nowrap',
              marginLeft:    '8px',
            }}
          >
            {sc.label}
          </span>
        </div>

        <div style={{ fontSize: '12px', color: '#8A8480', marginBottom: '10px' }}>
          {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })} ·{' '}
          {booking.estimated_hours}h ·{' '}
          {booking.stander ? `Stander: ${booking.stander.name}` : 'No stander assigned'}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stars rating={booking.review?.rating} />
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', color: '#FF6B00' }}>
            ₹{Math.round(booking.total_amount / 100)}
          </span>
        </div>

        {canRate && (
          <button
            onClick={() => setModalOpen(true)}
            style={{
              marginTop:     '10px',
              width:         '100%',
              background:    '#FF6B00',
              color:         '#fff',
              fontFamily:    'Bebas Neue, sans-serif',
              fontSize:      '16px',
              letterSpacing: '0.06em',
              border:        'none',
              borderRadius:  '8px',
              padding:       '10px',
              cursor:        'pointer',
            }}
          >
            RATE NOW
          </button>
        )}
      </div>

      {modalOpen && (
        <RatingModal
          booking={booking}
          onClose={() => setModalOpen(false)}
          onRated={() => setRated(true)}
        />
      )}
    </>
  );
}
