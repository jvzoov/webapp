'use client';

import { useState } from 'react';
import WithdrawalModal from './WithdrawalModal';

interface Props {
  totalEarningsRupees: number;
  jobCount: number;
  avgPerJob: number;
  rating: number;
  onTimePercent: number;
  streak: number;
  upiId:  string;
}

export default function EarningsHero({ totalEarningsRupees, jobCount, avgPerJob, rating, onTimePercent, streak, upiId }: Props) {
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  return (
    <div style={{ background: '#1A1612', borderRadius: '10px', padding: '20px', color: '#fff', marginBottom: '24px' }}>
      
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
        Total Earned (This Month)
      </div>
      
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '64px', color: '#FF6B00', lineHeight: 1, marginBottom: '8px' }}>
        ₹{totalEarningsRupees}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
          {jobCount} jobs · Avg ₹{avgPerJob}/job
        </div>
        <button
          onClick={() => setShowWithdrawal(true)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '10px',
            fontFamily: 'DM Mono, monospace',
            padding: '4px 8px',
            cursor: 'pointer'
          }}
        >
          PAYOUT SETTINGS
        </button>
      </div>

      {showWithdrawal && (
        <WithdrawalModal 
          upiId={upiId}
          balance={0}
          onClose={() => setShowWithdrawal(false)}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {[
          { val: `${rating.toFixed(1)}★`, label: 'Rating' },
          { val: `${onTimePercent}%`,      label: 'On-time' },
          { val: `${streak}d`,             label: 'Streak' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: '#f5ede0', lineHeight: 1 }}>
              {s.val}
            </div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '9px', color: '#8A8480', textTransform: 'uppercase', marginTop: '4px' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
