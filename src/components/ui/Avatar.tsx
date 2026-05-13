import { cn } from '@/lib/utils';

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <div
      className={cn(
        'w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center font-bebas text-white text-lg flex-shrink-0',
        className
      )}
    >
      {initials}
    </div>
  );
}
