import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps {
  className?: string;
  accentColor?: 'saffron' | 'green' | 'red';
  children: ReactNode;
}

export function Card({ className, accentColor, children }: CardProps) {
  const accentBorder = {
    saffron: 'border-l-[4px] border-l-[#FF6B00]',
    green:   'border-l-[4px] border-l-[#1A7A4A]',
    red:     'border-l-[4px] border-l-[#dc2626]',
  };

  return (
    <div
      className={cn(
        'bg-white border border-[#D4CFC6] rounded-[10px] p-[18px]',
        accentColor && accentBorder[accentColor],
        className
      )}
    >
      {children}
    </div>
  );
}
