import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BookingStatus } from '@/types/database';

interface Props {
  status: BookingStatus;
  className?: string;
}

const statusConfig: Record<BookingStatus, { label: string; className: string; variant: any }> = {
  PENDING_MATCH: { 
    label: 'Finding Stander', 
    className: 'border-saffron text-saffron animate-pulse-saffron font-mono text-[10px] tracking-widest', 
    variant: 'outline' 
  },
  MATCHED: { 
    label: 'Matched', 
    className: 'bg-blue-50 text-blue-700 border-blue-200 border', 
    variant: 'default' 
  },
  ACTIVE: { 
    label: 'In Progress', 
    className: 'bg-green-50 text-green-700 border-green-200 border', 
    variant: 'default' 
  },
  ALERT: { 
    label: 'Your Turn Soon', 
    className: 'bg-red-50 text-red-700 border-red-200 border animate-pulse', 
    variant: 'default' 
  },
  COMPLETED: { 
    label: 'Completed', 
    className: 'bg-gray-100 text-gray-500 border-gray-200 border', 
    variant: 'default' 
  },
  CANCELLED: { 
    label: 'Cancelled', 
    className: 'bg-red-50 text-red-700 border-red-100 border', 
    variant: 'default' 
  },
};

export function StatusBadge({ status, className }: Props) {
  const config = statusConfig[status] || { label: status, className: '', variant: 'default' };

  return (
    <Badge 
      variant={config.variant} 
      className={cn('px-2 py-0.5 rounded uppercase font-bold', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
