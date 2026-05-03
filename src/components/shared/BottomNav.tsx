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
  const tabs     = role === 'client' ? CLIENT_TABS : STANDER_TABS;

  return (
    <nav
      style={{
        position:      'sticky',
        bottom:        0,
        zIndex:        40,
        background:    '#fff',
        borderTop:     '1px solid #D4CFC6',
        display:       'flex',
        justifyContent:'space-around',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex:          1,
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              padding:       '10px 0 8px',
              textDecoration:'none',
              color:         active ? '#FF6B00' : '#B8B4B0',
              transition:    'color 0.15s',
            }}
          >
            <span style={{ fontSize: '20px', lineHeight: 1 }}>{tab.icon}</span>
            <span
              style={{
                fontFamily:    'DM Mono, monospace',
                fontSize:      '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginTop:     '3px',
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
