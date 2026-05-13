'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { BookingWithDetails, BookingStatus } from '@/types/database';

interface Props {
  initialBooking: BookingWithDetails;
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const config: Record<BookingStatus, { label: string; bg: string; text: string }> = {
    PENDING_MATCH: { label: 'FINDING STANDER', bg: 'bg-[#FF6B00]/10', text: 'text-[#FF6B00]' },
    MATCHED:       { label: 'STANDER MATCHED', bg: 'bg-blue-100',      text: 'text-blue-600' },
    ACTIVE:        { label: 'STANDER ON-SITE', bg: 'bg-green-100',     text: 'text-green-600' },
    ALERT:         { label: 'YOUR TURN SOON',  bg: 'bg-red-100',       text: 'text-red-600 animate-pulse' },
    COMPLETED:     { label: 'COMPLETED',      bg: 'bg-gray-100',      text: 'text-gray-600' },
    CANCELLED:     { label: 'CANCELLED',      bg: 'bg-red-100',       text: 'text-red-600' },
  };
  const { label, bg, text } = config[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600' };

  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-mono tracking-widest uppercase ${bg} ${text}`}>
      {label}
    </span>
  );
}

export default function ActiveBookingBanner({ initialBooking }: Props) {
  const [booking, setBooking] = useState(initialBooking);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`booking-home:${booking.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${booking.id}` },
        (payload) => {
          setBooking((prev) => ({ ...prev, ...(payload.new as Partial<BookingWithDetails>) }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [booking.id]);

  if (['COMPLETED', 'CANCELLED'].includes(booking.status)) return null;

  return (
    <div className="mx-4 mt-6">
      <div className="bg-white border-l-4 border-[#FF6B00] rounded-r-xl p-4 shadow-sm border border-[#D4CFC6] border-l-[#FF6B00]">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-mono text-[10px] text-[#8A8480] uppercase tracking-widest">LIVE TRACKING</span>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-[#1A1612] text-sm">{booking.location?.name}</h4>
            <p className="text-[11px] text-[#8A8480] mt-0.5">
              {booking.stander?.name ? `Stander: ${booking.stander.name}` : 'Finding a stander for you...'}
            </p>
          </div>
          <Link href={`/client/track/${booking.id}`}>
            <Button size="sm" className="px-4 py-1.5 h-auto text-[11px] font-mono tracking-widest bg-[#1A1612] hover:bg-black uppercase border-none">
              TRACK →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
