import { formatINR } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Props {
  earnings: number; // in paise
  streak:   number;
  jobCount: number;
}

export default function EarningsBar({ earnings, streak, jobCount }: Props) {
  return (
    <div className="sticky top-[52px] z-30 bg-[#1A1612] text-white p-4 flex justify-between items-center border-b border-white/5">
      <div>
        <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-1">
          Today&apos;s Earnings
        </p>
        <div className="flex items-baseline gap-2">
          <span className="font-bebas text-4xl text-[#FF6B00] leading-none">
            {formatINR(earnings)}
          </span>
          <span className="font-mono text-[10px] text-white/30 uppercase tracking-tight">
            {jobCount} job{jobCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/30 rounded-full px-3 py-1.5 flex items-center gap-2">
        <span className="font-bebas text-2xl leading-none pt-0.5">🔥 {streak}</span>
        <span className="font-mono text-[8px] uppercase tracking-tighter leading-tight">
          DAY<br />STREAK
        </span>
      </Badge>
    </div>
  );
}
