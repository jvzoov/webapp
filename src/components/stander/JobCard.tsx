'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { BookingWithDetails } from '@/types/database';

interface Props {
  job: BookingWithDetails;
  onAccept: (jobId: string) => void;
}

export default function JobCard({ job, onAccept }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/accept`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to accept job');
        return;
      }

      toast.success(`Job accepted! Head to ${job.location?.name}`);
      onAccept(job.id);
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  }

  const startFormatted = new Date(job.start_time).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

  return (
    <div
      className="animate-slide-down"
      style={{
        background:   '#fff',
        border:       '1px solid #D4CFC6',
        borderRadius: '10px',
        padding:      '18px',
        marginBottom: '12px',
        position:     'relative',
        overflow:     'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '16px' }}>{job.location?.name}</div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#8A8480', marginTop: '2px' }}>
            Starts {startFormatted}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', color: '#1A7A4A', lineHeight: 1 }}>
            ₹{Math.round(job.stander_payout / 100)}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '16px 0', padding: '12px 0', borderTop: '1px dashed #D4CFC6', borderBottom: '1px dashed #D4CFC6' }}>
        <div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#8A8480', textTransform: 'uppercase', marginBottom: '2px' }}>
            Duration
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500 }}>{job.estimated_hours}h max</div>
        </div>
        <div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#8A8480', textTransform: 'uppercase', marginBottom: '2px' }}>
            Est Queue
          </div>
          <div style={{ fontSize: '14px', fontWeight: 500 }}>{job.location?.avg_wait_hours ?? 'Varies'}</div>
        </div>
      </div>

      {/* Client Info */}
      <div style={{ background: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div
          style={{
            width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue, sans-serif', fontSize: '14px'
          }}
        >
          {job.client?.avatar_initials ?? job.client?.name?.slice(0, 2).toUpperCase() ?? 'CL'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>{job.client?.name ?? 'Client'}</div>
          <div style={{ fontSize: '11px', color: '#3b82f6' }}>Verified Client</div>
        </div>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', background: '#22c55e', color: '#fff', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>
          NEW
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          disabled={loading}
          style={{
            flex: 1,
            background: 'transparent',
            border: '1px solid #D4CFC6',
            borderRadius: '8px',
            color: '#1A1612',
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '18px',
            padding: '12px 0',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          SKIP
        </button>
        <button
          onClick={handleAccept}
          disabled={loading}
          style={{
            flex: 2,
            background: '#1A7A4A',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '18px',
            padding: '12px 0',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'ACCEPTING…' : 'ACCEPT JOB'}
        </button>
      </div>

      {/* Overlay if someone else matched it */}
      {job.status !== 'PENDING_MATCH' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <div style={{ background: '#1A1612', color: '#fff', padding: '8px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: 500 }}>
            No longer available
          </div>
        </div>
      )}
    </div>
  );
}
