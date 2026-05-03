'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Props {
  bookingId: string;
  payout: number;
  durationHours: number;
  checkInCount: number;
  onClose: () => void;
}

export default function JobCompleteModal({ bookingId, payout, durationHours, checkInCount, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${bookingId}/complete`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to complete job');
        return;
      }

      toast.success('Job marked complete! Payout initiated.');
      router.push('/stander/earnings');
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="animate-slide-up" style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '400px', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ background: '#1A7A4A', padding: '32px 20px', textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '32px', letterSpacing: '0.04em', lineHeight: 1 }}>
            JOB FINISHED!
          </h2>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
            Great work holding the line.
          </p>
        </div>

        {/* Details */}
        <div style={{ padding: '24px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#F7F4EE', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#8A8480', textTransform: 'uppercase' }}>Time Spent</div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#1A1612' }}>{durationHours}h</div>
            </div>
            <div style={{ background: '#F7F4EE', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#8A8480', textTransform: 'uppercase' }}>Check-ins</div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#1A1612' }}>{checkInCount}</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#8A8480', textTransform: 'uppercase', marginBottom: '4px' }}>
              Your Earnings
            </div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '56px', color: '#1A7A4A', lineHeight: 1 }}>
              ₹{payout}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              disabled={loading}
              style={{ flex: 1, background: 'transparent', border: '1px solid #D4CFC6', borderRadius: '8px', color: '#1A1612', fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', padding: '14px 0', cursor: 'pointer' }}
            >
              CANCEL
            </button>
            <button
              onClick={handleComplete}
              disabled={loading}
              style={{ flex: 2, background: '#1A7A4A', border: 'none', borderRadius: '8px', color: '#fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', padding: '14px 0', cursor: 'pointer' }}
            >
              {loading ? 'PROCESSING…' : 'VIEW EARNINGS →'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
