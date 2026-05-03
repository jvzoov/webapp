'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { BookingWithDetails } from '@/types/database';

interface Props {
  booking: BookingWithDetails;
  onClose:  () => void;
  onRated:  () => void;
}

export default function RatingModal({ booking, onClose, onRated }: Props) {
  const [rating,  setRating]  = useState(0);
  const [hover,   setHover]   = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const stander = booking.stander;

  async function submit() {
    if (!rating) { toast.error('Please select a rating'); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/review`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Failed to submit'); return; }
      toast.success('Rating submitted! Thank you.');
      onRated();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position:   'fixed',
        inset:      0,
        background: 'rgba(0,0,0,0.5)',
        zIndex:     50,
        display:    'flex',
        alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-up"
        style={{
          background:   '#fff',
          borderRadius: '20px 20px 0 0',
          padding:      '24px 20px 40px',
          width:        '100%',
          maxWidth:     '480px',
          margin:       '0 auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: '36px', height: '4px', background: '#D4CFC6', borderRadius: '100px', margin: '0 auto 20px' }} />

        {/* Stander info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width:          '48px',
              height:         '48px',
              borderRadius:   '50%',
              background:     '#FF6B00',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontFamily:     'Bebas Neue, sans-serif',
              fontSize:       '18px',
              color:          '#fff',
              flexShrink:     0,
            }}
          >
            {stander?.avatar_initials ?? stander?.name?.slice(0, 2).toUpperCase() ?? '??'}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{stander?.name ?? 'Stander'}</div>
            <div style={{ fontSize: '12px', color: '#8A8480' }}>
              {booking.location?.name} · {booking.estimated_hours}h
            </div>
          </div>
        </div>

        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#8A8480', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
          How was your experience?
        </div>

        {/* Stars */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setRating(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              style={{
                fontSize:   '32px',
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                color:      s <= (hover || rating) ? '#FF6B00' : '#D4CFC6',
                transition: 'color 0.15s, transform 0.15s',
                transform:  s <= (hover || rating) ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              ★
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Any feedback? (optional)"
          rows={3}
          style={{
            width:        '100%',
            background:   '#F7F4EE',
            border:       '1px solid #D4CFC6',
            borderRadius: '8px',
            padding:      '10px 12px',
            fontSize:     '14px',
            color:        '#1A1612',
            outline:      'none',
            resize:       'none',
            marginBottom: '16px',
          }}
        />

        {/* Submit */}
        <button
          onClick={submit}
          disabled={loading || !rating}
          style={{
            width:         '100%',
            background:    loading || !rating ? '#D4CFC6' : '#FF6B00',
            color:         '#fff',
            fontFamily:    'Bebas Neue, sans-serif',
            fontSize:      '20px',
            letterSpacing: '0.06em',
            border:        'none',
            borderRadius:  '10px',
            padding:       '14px 0',
            cursor:        loading || !rating ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'SUBMITTING…' : 'SUBMIT RATING'}
        </button>
      </div>
    </div>
  );
}
