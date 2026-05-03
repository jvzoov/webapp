'use client';

interface Props {
  upiId:   string;
  balance: number; // usually 0 because of auto-payout
  onClose: () => void;
}

export default function WithdrawalModal({ upiId, balance, onClose }: Props) {
  return (
    <div 
      style={{ 
        position:   'fixed', 
        inset:      0, 
        background: 'rgba(0,0,0,0.6)', 
        backdropFilter: 'blur(4px)', 
        zIndex:     50, 
        display:    'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding:    '20px' 
      }}
      onClick={onClose}
    >
      <div 
        className="animate-slide-up"
        style={{ 
          background:   '#fff', 
          borderRadius: '16px', 
          width:        '100%', 
          maxWidth:     '400px', 
          padding:      '24px 20px' 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', color: '#1A1612', marginBottom: '8px' }}>
          PAYOUT SETTINGS
        </h2>
        
        <div style={{ background: '#F7F4EE', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#8A8480', textTransform: 'uppercase', marginBottom: '4px' }}>
            Registered UPI ID
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#1A1612' }}>
            {upiId || 'Not set'}
          </div>
        </div>

        <div style={{ background: 'rgba(26,122,74,0.08)', border: '1px solid rgba(26,122,74,0.2)', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '20px' }}>⚡</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#1A7A4A' }}>Instant Payouts Active</div>
              <div style={{ fontSize: '12px', color: '#1A7A4A', opacity: 0.8, marginTop: '2px', lineHeight: 1.5 }}>
                Your earnings are automatically transferred to your UPI ID immediately after each job is marked complete. No manual withdrawal needed!
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width:         '100%',
            background:    '#1A1612',
            color:         '#fff',
            fontFamily:    'Bebas Neue, sans-serif',
            fontSize:      '20px',
            letterSpacing: '0.06em',
            border:        'none',
            borderRadius:  '10px',
            padding:       '14px 0',
            cursor:        'pointer',
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
