import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  const variants = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded-[4px]',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-[#D4CFC6]/50',
        variants[variant],
        className
      )}
    />
  );
}
