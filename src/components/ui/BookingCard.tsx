import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/Avatar';
import { formatDistanceToNow } from 'date-fns';
import { formatINR, cn } from '@/lib/utils';
import type { BookingWithDetails } from '@/types/database';

interface Props {
  booking: BookingWithDetails;
  onRate?: () => void;
  onTrack?: () => void;
  className?: string;
}

export function BookingCard({ booking, onRate, onTrack, className }: Props) {
  const status = booking.status;
  const isCompleted = status === 'COMPLETED';
  const isActive = ['PENDING_MATCH', 'MATCHED', 'ACTIVE', 'ALERT'].includes(status);
  const hasReview = !!booking.review;

  const borderColors: Record<string, string> = {
    PENDING_MATCH: 'border-l-[#FF6B00]',
    MATCHED:       'border-l-blue-500',
    ACTIVE:        'border-l-green-500',
    ALERT:         'border-l-red-500',
    COMPLETED:     'border-l-gray-400',
    CANCELLED:     'border-l-red-800',
  };

  return (
    <Card className={cn('border-l-4 p-4 space-y-4', borderColors[status], className)}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{booking.location?.icon || '📍'}</span>
          <div>
            <h4 className="font-bold text-[#1A1612] leading-tight">{booking.location?.name}</h4>
            <p className="text-[11px] text-[#8A8480] uppercase tracking-wider font-mono">
              {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex items-center justify-between text-xs text-[#8A8480]">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-[#1A1612]">{booking.estimated_hours}h Session</span>
          <span className="truncate max-w-[200px]">{booking.location_address}</span>
        </div>
        {booking.stander && (
          <div className="flex items-center gap-2">
            <Avatar initials={booking.stander.avatar_initials ?? '??'} className="w-7 h-7 text-[10px]" />
            <span className="font-medium text-[#1A1612]">{booking.stander.name}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="font-bebas text-2xl text-[#FF6B00]">{formatINR(booking.total_amount)}</span>
        
        <div className="flex gap-2">
          {isActive && onTrack && (
            <Button size="sm" variant="secondary" onClick={onTrack} className="text-[10px] px-4 font-mono tracking-widest h-8">
              TRACK →
            </Button>
          )}

          {isCompleted && !hasReview && onRate && (
            <Button size="sm" variant="primary" onClick={onRate} className="text-[10px] px-4 font-mono tracking-widest h-8">
              RATE NOW
            </Button>
          )}

          {isCompleted && hasReview && (
            <div className="flex text-[#FF6B00] text-sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < booking.review!.rating ? '★' : '☆'}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
