'use client';

import { useEffect, useRef } from 'react';
import type { CheckIn } from '@/types/database';

interface Props {
  checkIns: CheckIn[];
}

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function msg(ci: CheckIn) {
  if (ci.queue_position !== null && ci.queue_position !== undefined) {
    return `${ci.queue_position} people ahead · Est ${ci.estimated_minutes ?? '?'} min`;
  }
  return 'Check-in recorded';
}

export default function CheckInLog({ checkIns }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [checkIns]);

  return (
    <div
      style={{
        background:   '#F7F4EE',
        border:       '1px solid #D4CFC6',
        borderRadius: '10px',
        padding:      '14px',
        maxHeight:    '140px',
        overflowY:    'auto',
      }}
    >
      <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#8A8480', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>
        Check-in Log
      </p>
      {checkIns.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#B8B4B0', fontStyle: 'italic' }}>
          Waiting for stander to check in…
        </p>
      ) : (
        checkIns.map((ci) => (
          <div key={ci.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div
              style={{
                width:        '8px',
                height:       '8px',
                borderRadius: '50%',
                background:   ci.is_alert ? '#dc2626' : '#1A7A4A',
                flexShrink:   0,
                marginTop:    '4px',
              }}
            />
            <div>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: '#8A8480' }}>
                {fmt(ci.created_at)}{' '}
              </span>
              <span style={{ fontSize: '13px', color: '#1A1612' }}>{msg(ci)}</span>
            </div>
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
