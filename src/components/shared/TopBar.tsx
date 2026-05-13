'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Props {
  title?: string;
  showBack?: boolean;
  role: 'client' | 'stander' | 'admin';
  userName: string;
  avatarInitials?: string;
}

export default function TopBar({ title, showBack, role, userName, avatarInitials }: Props) {
  const router = useRouter();
  const initials = avatarInitials ?? getInitials(userName);

  return (
    <header className="sticky top-0 z-40 bg-[#1A1612] h-[52px] flex items-center justify-between px-4 border-b border-white/5">
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={() => router.back()}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {title ? (
          <h1 className="font-bebas text-xl text-[#f5ede0] tracking-wide mt-0.5">{title}</h1>
        ) : (
          <Link href={role === 'stander' ? '/stander/home' : '/client/home'} className="flex items-center gap-0.5">
            <span className="font-bebas text-2xl text-[#f5ede0]">Queue</span>
            <span className="font-bebas text-2xl text-[#FF6B00]">Pe</span>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className={`font-mono text-[9px] tracking-[.12em] px-2 py-0.5 rounded border border-current uppercase
          ${role === 'client' ? 'text-[#FF6B00] bg-[#FF6B00]/10 border-[#FF6B00]/30' : 
            role === 'stander' ? 'text-[#1A7A4A] bg-[#1A7A4A]/10 border-[#1A7A4A]/30' : 
            'text-blue-400 bg-blue-400/10 border-blue-400/30'}`}>
          {role}
        </span>
        
        <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center font-bebas text-sm text-white flex-shrink-0">
          {initials}
        </div>
      </div>
    </header>
  );
}
