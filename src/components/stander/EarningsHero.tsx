'use client';

import { formatINR } from '@/lib/utils';

interface Props {
  totalEarningsPaise: number;
  jobCount: number;
  avgPerJob: number;
  rating: number;
  onTimePercent: number;
  streak: number;
}

export default function EarningsHero({ 
  totalEarningsPaise, 
  jobCount, 
  avgPerJob, 
  rating, 
  onTimePercent, 
  streak 
}: Props) {
  return (
    <div className="bg-[#1A1612] mx-4 mt-4 rounded-[10px] p-5 text-white">
      <p className="font-mono text-[11px] text-white/50 uppercase tracking-widest mb-2">
        Total Earned (This Month)
      </p>
      
      <div className="font-bebas text-6xl text-[#FF6B00] leading-none mb-2">
        {formatINR(totalEarningsPaise)}
      </div>
      
      <p className="font-mono text-[12px] text-white/40 mb-6">
        {jobCount} jobs · Avg {formatINR(avgPerJob)}/job
      </p>

      <div className="grid grid-cols-3 gap-2">
        {[
          { val: `${rating.toFixed(1)}★`, label: 'Rating' },
          { val: `${onTimePercent}%`, label: 'On-time' },
          { val: `${streak}d`, label: 'Streak' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
            <p className="font-bebas text-2xl text-[#f5ede0] leading-none mb-1">{stat.val}</p>
            <p className="font-mono text-[9px] text-[#8A8480] uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
