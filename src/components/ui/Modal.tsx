'use client';

import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-md bg-white rounded-t-2xl p-6 shadow-xl",
          "animate-slide-up origin-bottom"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="w-[36px] h-[4px] bg-[#D4CFC6] rounded-full mx-auto mb-5" />

        {title && (
          <h2 className="font-display text-2xl text-[#1A1612] mb-4">{title}</h2>
        )}

        <div className="max-h-[80vh] overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
