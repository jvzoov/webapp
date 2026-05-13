'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Tab = { label: string; icon: string; href: string };

const CLIENT_TABS: Tab[] = [
  { label: 'Home',    icon: '🏠', href: '/client/home'    },
  { label: 'Book',    icon: '📋', href: '/client/book'    },
  { label: 'Track',   icon: '📍', href: '/client/track'   },
  { label: 'History', icon: '🕐', href: '/client/history' },
];

const STANDER_TABS: Tab[] = [
  { label: 'Jobs',     icon: '💼', href: '/stander/home'     },
  { label: 'Active',   icon: '▶️',  href: '/stander/job'      },
  { label: 'Earnings', icon: '💰', href: '/stander/earnings' },
];

interface Props {
  role: 'client' | 'stander';
}

export default function BottomNav({ role }: Props) {
  const pathname = usePathname();
  const tabs = role === 'client' ? CLIENT_TABS : STANDER_TABS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#D4CFC6] flex justify-around pb-[env(safe-area-inset-bottom)]">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center pt-2.5 pb-2 transition-colors
              ${active ? 'text-[#FF6B00]' : 'text-[#B8B4B0]'}`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className="font-mono text-[9px] uppercase tracking-[.08em] mt-1">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
