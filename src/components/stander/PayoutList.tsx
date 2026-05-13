import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/Separator';
import { formatINR } from '@/lib/utils';
import type { BookingWithDetails } from '@/types/database';

interface Props {
  bookings: BookingWithDetails[];
}

export default function PayoutList({ bookings }: Props) {
  if (bookings.length === 0) {
    return (
      <div className="mx-4 mt-8 py-12 text-center border-2 border-dashed border-[#D4CFC6] rounded-xl opacity-60">
        <span className="text-4xl mb-4 block">💰</span>
        <p className="font-mono text-[10px] text-[#8A8480] uppercase tracking-widest">
          No payouts yet this month
        </p>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-8 space-y-4 pb-24">
      <h3 className="font-mono text-[10px] text-[#8A8480] uppercase tracking-widest px-1">
        RECENT PAYOUTS
      </h3>
      
      <div className="bg-white border border-[#D4CFC6] rounded-xl overflow-hidden">
        {bookings.map((booking, idx) => (
          <div key={booking.id}>
            <div className="p-4 flex justify-between items-center bg-white hover:bg-[#F7F4EE]/30 transition-colors">
              <div>
                <h4 className="font-bold text-sm text-[#1A1612]">
                  {booking.location?.name || 'Queue Standing'}
                </h4>
                <p className="text-[10px] text-[#8A8480] mt-0.5">
                  {format(new Date(booking.created_at), 'dd MMM')} · {booking.estimated_hours}hr job
                </p>
              </div>
              
              <div className="text-right flex flex-col items-end gap-1.5">
                <span className="font-bebas text-xl text-[#1A7A4A]">
                  {formatINR(booking.stander_payout)}
                </span>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-1.5 py-0 text-[9px]">
                  PAID
                </Badge>
              </div>
            </div>
            {idx < bookings.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </div>
  );
}
