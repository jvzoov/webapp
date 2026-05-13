import { cn } from '@/lib/utils';

export function Separator({ className }: { className?: string }) {
  return (
    <div className={cn('h-[1px] w-full bg-[#D4CFC6] opacity-30', className)} />
  );
}
