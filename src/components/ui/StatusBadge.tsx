import { cn } from '@/lib/utils';
import type { BookingStatus } from '@/types/database';

export interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const base = 'font-mono text-[10px] px-2 py-0.5 rounded tracking-widest inline-block';

  const styles: Record<BookingStatus, { label: string; cls: string }> = {
    PENDING_MATCH: {
      label: 'FINDING STANDER',
      cls: 'border border-dashed border-[#FF6B00] text-[#FF6B00] animate-pulse',
    },
    MATCHED: {
      label: 'MATCHED',
      cls: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
    },
    ACTIVE: {
      label: 'ACTIVE',
      cls: 'bg-[#1A7A4A]/10 text-[#1A7A4A] border border-[#1A7A4A]/20',
    },
    ALERT: {
      label: 'ALERT',
      cls: 'bg-red-500/10 text-red-600 border border-red-500/20',
    },
    COMPLETED: {
      label: 'COMPLETED',
      cls: 'bg-[#F7F4EE] text-[#8A8480] border border-[#D4CFC6]',
    },
    CANCELLED: {
      label: 'CANCELLED',
      cls: 'bg-red-500/10 text-red-600',
    },
  };

  const config = styles[status] || { label: status, cls: 'bg-gray-100 text-gray-500' };

  return (
    <span className={cn(base, config.cls, className)}>
      {config.label}
    </span>
  );
}
