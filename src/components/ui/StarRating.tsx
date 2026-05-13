'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  className?: string;
}

export function StarRating({ value, onChange, readonly, className }: Props) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className={cn('flex gap-1.5', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          onClick={() => !readonly && onChange?.(star)}
          className={cn(
            'transition-transform active:scale-95 outline-none',
            !readonly && 'cursor-pointer hover:scale-110'
          )}
        >
          <Star
            size={24}
            className={cn(
              'transition-colors',
              (hoverRating || value) >= star
                ? 'fill-[#FF6B00] text-[#FF6B00]'
                : 'text-[#D4CFC6] fill-transparent'
            )}
          />
        </button>
      ))}
    </div>
  );
}
