'use client';

interface Props {
  earnings: number; // in rupees
  streak:   number;
  jobCount: number;
}

export default function EarningsBar({ earnings, streak, jobCount }: Props) {
  return (
    <div
      style={{
        position:   'sticky',
        top:        '52px', // below TopBar
        zIndex:     30,
        background: '#1A1612',
        color:      '#fff',
        padding:    '16px',
        display:    'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>
          Today&apos;s Earnings
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '36px', color: '#FF6B00', lineHeight: 1 }}>
            ₹{earnings}
          </div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
            {jobCount} job{jobCount !== 1 ? 's' : ''} completed
          </div>
        </div>
      </div>

      <div
        style={{
          background:   'rgba(255,107,0,0.15)',
          border:       '1px solid rgba(255,107,0,0.3)',
          borderRadius: '100px',
          padding:      '6px 12px',
          display:      'flex',
          alignItems:   'center',
          gap:          '6px',
        }}
      >
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: '#FF6B00', lineHeight: 1 }}>
          {streak}
        </span>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>
          DAY<br />STREAK
        </span>
      </div>
    </div>
  );
}
