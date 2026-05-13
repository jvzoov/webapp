'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/Separator';
import RatingModal from './RatingModal';
import { formatINR } from '@/lib/utils';
import type { BookingWithDetails, BookingStatus } from '@/types/database';

interface Props {
  initialBookings: BookingWithDetails[];
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const config: Record<BookingStatus, { label: string; bg: string; text: string }> = {
    PENDING_MATCH: { label: 'PENDING', bg: 'bg-[#FF6B00]/10', text: 'text-[#FF6B00]' },
    MATCHED:       { label: 'MATCHED', bg: 'bg-blue-100',      text: 'text-blue-600' },
    ACTIVE:        { label: 'ACTIVE',  bg: 'bg-green-100',     text: 'text-green-600' },
    ALERT:         { label: 'ALERT',   bg: 'bg-red-100',       text: 'text-red-600' },
    COMPLETED:     { label: 'COMPLETED', bg: 'bg-gray-100',      text: 'text-gray-600' },
    CANCELLED:     { label: 'CANCELLED', bg: 'bg-red-100',       text: 'text-red-600' },
  };
  const { label, bg, text } = config[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600' };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase ${bg} ${text}`}>
      {label}
    </span>
  );
}

export default function HistoryClient({ initialBookings }: Props) {
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [showRating, setShowRating] = useState(false);

  const filterBookings = (statusGroup: string) => {
    if (statusGroup === 'ALL') return bookings;
    if (statusGroup === 'ACTIVE') return bookings.filter(b => ['PENDING_MATCH', 'MATCHED', 'ACTIVE', 'ALERT'].includes(b.status));
    if (statusGroup === 'COMPLETED') return bookings.filter(b => b.status === 'COMPLETED');
    if (statusGroup === 'CANCELLED') return bookings.filter(b => b.status === 'CANCELLED');
    return bookings;
  };

  const handleRated = (bookingId: string, rating: number) => {
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, review: { rating } as any } : b
    ));
  };

  const BookingList = ({ list }: { list: BookingWithDetails[] }) => {
    if (list.length === 0) {
      return (
        <Card className="flex flex-col items-center justify-center py-12 text-center opacity-60">
          <span className="text-4xl mb-4">📅</span>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#8A8480]">No bookings found</p>
          <Link href="/client/home" className="mt-4">
            <Button size="sm" className="bg-[#1A1612] border-none text-xs px-6">BOOK NOW</Button>
          </Link>
        </Card>
      );
    }

    return (
      <div className="space-y-4 pb-20">
        {list.map((booking) => {
          const isActive = ['PENDING_MATCH', 'MATCHED', 'ACTIVE', 'ALERT'].includes(booking.status);
          const isCompleted = booking.status === 'COMPLETED';
          const isCancelled = booking.status === 'CANCELLED';
          const hasReview = !!booking.review;

          return (
            <Card 
              key={booking.id} 
              className={`border-l-4 ${isActive ? 'border-l-[#FF6B00]' : isCompleted ? 'border-l-green-600' : 'border-l-red-600'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{booking.location?.icon || '📍'}</span>
                  <div>
                    <h4 className="font-bold text-sm text-[#1A1612]">{booking.location?.name}</h4>
                    <p className="text-[11px] text-[#8A8480] truncate max-w-[200px]">{booking.location_address}</p>
                  </div>
                </div>
                <StatusBadge status={booking.status} />
              </div>

              <div className="flex justify-between items-center text-[12px] text-[#8A8480] mb-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-[#1A1612]">
                    {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
                  </span>
                  <span>{booking.estimated_hours} hr job</span>
                </div>
                {booking.stander && (
                  <div className="flex items-center gap-2">
                    <Avatar initials={booking.stander.avatar_initials ?? '??'} className="w-6 h-6 text-[10px]" />
                    <span className="font-medium text-[#1A1612]">{booking.stander.name}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center">
                <span className="font-bebas text-2xl text-[#FF6B00]">{formatINR(booking.total_amount)}</span>
                
                {isActive && (
                  <Link href={`/client/track/${booking.id}`}>
                    <Button size="sm" className="bg-[#1A1612] border-none text-[10px] tracking-widest font-mono h-8 px-4">
                      TRACK →
                    </Button>
                  </Link>
                )}

                {isCompleted && !hasReview && (
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowRating(true);
                    }}
                    className="bg-[#FF6B00] hover:bg-[#e05e00] border-none text-[10px] tracking-widest font-mono h-8 px-4"
                  >
                    RATE NOW
                  </Button>
                )}

                {isCompleted && hasReview && (
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={s <= booking.review!.rating ? 'text-[#FF6B00]' : 'text-[#D4CFC6]'}>★</span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-6">
      <Tabs defaultValue="ALL" className="w-full">
        <TabsList variant="line" className="w-full bg-[#1f180e]/5 p-1 rounded-lg">
          <TabsTrigger value="ALL" className="flex-1">ALL</TabsTrigger>
          <TabsTrigger value="ACTIVE" className="flex-1">ACTIVE</TabsTrigger>
          <TabsTrigger value="COMPLETED" className="flex-1">DONE</TabsTrigger>
          <TabsTrigger value="CANCELLED" className="flex-1">MISS</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="ALL">
            <BookingList list={filterBookings('ALL')} />
          </TabsContent>
          <TabsContent value="ACTIVE">
            <BookingList list={filterBookings('ACTIVE')} />
          </TabsContent>
          <TabsContent value="COMPLETED">
            <BookingList list={filterBookings('COMPLETED')} />
          </TabsContent>
          <TabsContent value="CANCELLED">
            <BookingList list={filterBookings('CANCELLED')} />
          </TabsContent>
        </div>
      </Tabs>

      {selectedBooking && (
        <RatingModal 
          open={showRating} 
          onClose={() => setShowRating(false)}
          onRated={() => handleRated(selectedBooking.id, 5)} // Optimistic update
          booking={selectedBooking}
          stander={{
            name: selectedBooking.stander?.name ?? 'Stander',
            avatarInitials: selectedBooking.stander?.avatar_initials ?? '??'
          }}
        />
      )}
    </div>
  );
}
