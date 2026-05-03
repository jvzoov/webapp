'use client';

interface Props {
  message?: string;
  location?: string;
  queuePosition?: number;
}

export default function AlertBanner({ message, location, queuePosition }: Props) {
  return (
    <div
      className="animate-pulse-red"
      style={{
        background: '#dc2626',
        padding:    '14px 16px',
        display:    'flex',
        alignItems: 'center',
        gap:        '10px',
      }}
    >
      <span style={{ fontSize: '22px' }}>🔔</span>
      <div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px', color: '#fff', letterSpacing: '0.04em' }}>
          YOUR TURN IS NEAR!
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginTop: '2px' }}>
          Head to {location ?? 'your location'} now
          {queuePosition !== undefined && ` — ${queuePosition} people ahead`}
        </div>
      </div>
    </div>
  );
}
