import { formatINR, cn } from '@/lib/utils';

interface Props {
  paise: number;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

export function MoneyDisplay({ paise, size = 'md', className }: Props) {
  const sizeClasses = {
    sm:   'text-base font-body text-[#1A1612]',
    md:   'text-2xl font-bebas text-[#1A1612]',
    lg:   'text-4xl font-bebas text-[#FF6B00]',
    hero: 'text-5xl font-bebas text-[#FF6B00] leading-none',
  };

  return (
    <span className={cn(sizeClasses[size], className)}>
      {formatINR(paise)}
    </span>
  );
}
