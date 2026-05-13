'use client';

import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription } from '@/components/ui/drawer';
import { Avatar } from '@/components/ui/Avatar';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import type { BookingWithDetails } from '@/types/database';

interface Props {
  booking: BookingWithDetails;
  open: boolean;
  onClose: () => void;
  onRated: () => void;
}

export default function RatingModal({ booking, open, onClose, onRated }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const stander = booking.stander;

  async function handleSubmit() {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');

      toast.success('Review submitted! Thank you.');
      onRated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Could not submit review');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="bg-[#F7F4EE] border-none rounded-t-[32px]">
        <DrawerHeader className="items-center pb-0">
          <Avatar 
            initials={stander?.avatar_initials ?? stander?.name?.slice(0, 2).toUpperCase() ?? '??'} 
            className="w-16 h-16 text-2xl mb-4 shadow-lg shadow-[#FF6B00]/20" 
          />
          <DrawerTitle className="font-bebas text-3xl tracking-wide text-[#1A1612]">Rate your Stander</DrawerTitle>
          <DrawerDescription className="text-[#8A8480] text-sm">
            How was your experience with {stander?.name ?? 'your Stander'}?
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 py-8 space-y-8">
          {/* Star Rating */}
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
                className="text-4xl transition-transform hover:scale-110 active:scale-95 outline-none"
              >
                <span className={(hover || rating) >= star ? 'text-[#FF6B00]' : 'text-[#D4CFC6]'}>
                  ★
                </span>
              </button>
            ))}
          </div>

          <Textarea
            label="Feedback"
            placeholder="Any feedback? (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="bg-white border-[#D4CFC6] focus:border-[#FF6B00]"
          />
        </div>

        <DrawerFooter className="pb-10 px-6">
          <Button 
            onClick={handleSubmit} 
            loading={isLoading}
            disabled={isLoading || rating === 0}
            className="w-full py-7 text-2xl tracking-widest bg-[#FF6B00] hover:bg-[#e05e00] border-none"
          >
            SUBMIT RATING
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
