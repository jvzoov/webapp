import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'green' | 'danger';
  size?: 'default' | 'sm';
  loading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'default',
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-[10px] transition-colors focus:outline-none';
  
  const variants = {
    primary:   'bg-[#FF6B00] text-white hover:bg-[#e05e00] font-display tracking-wide',
    secondary: 'bg-[#1A1612] text-white hover:bg-[#362a16]',
    outline:   'bg-transparent border border-[#D4CFC6] text-[#1A1612] hover:bg-black/5',
    green:     'bg-[#1A7A4A] text-white hover:bg-[#145d38]',
    danger:    'bg-[#dc2626] text-white hover:bg-[#b91c1c]',
  };

  const sizes = {
    default: 'w-full py-3.5 text-xl',
    sm:      'py-2 px-4 text-sm font-body',
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        (disabled || loading) && 'opacity-60 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
