import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col w-full">
        {label && (
          <label className="font-mono text-[11px] uppercase tracking-widest text-[#8A8480] mb-1.5 block">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'border border-[#D4CFC6] bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[14px] w-full focus:border-[#FF6B00] outline-none transition',
            error && 'border-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-red-500 text-xs mt-1">{error}</span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
