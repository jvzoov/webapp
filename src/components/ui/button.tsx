import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-[10px] transition-colors focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:   'bg-[#FF6B00] text-white hover:bg-[#e05e00] font-display tracking-wide',
        secondary: 'bg-[#1A1612] text-white hover:bg-[#362a16]',
        outline:   'bg-transparent border border-[#D4CFC6] text-[#1A1612] hover:bg-black/5',
        success:   'bg-[#1A7A4A] text-white hover:bg-[#145d38]',
        danger:    'bg-[#dc2626] text-white hover:bg-[#b91c1c]',
        saffron:   'bg-[#FF6B00] text-white font-display text-xl tracking-wide py-3.5 rounded-[10px]',
      },
      size: {
        default: 'w-full py-3.5 text-xl',
        sm:      'py-2 px-4 text-sm font-body',
        icon:    'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {size === 'sm' ? '' : 'Processing...'}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export { buttonVariants };
