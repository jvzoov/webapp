'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Location } from '@/types/database';

interface Props {
  locations: Location[];
}

export default function LocationGrid({ locations }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  function handleBook() {
    if (!selected) return;
    router.push(`/client/book?location=${selected}`);
  }

  return (
    <>
      {/* Grid */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr',
          gap:                 '10px',
          padding:             '0 16px',
        }}
      >
        {locations.map((loc) => {
          const isSelected = selected === loc.id;
          return (
            <button
              key={loc.id}
              onClick={() => setSelected(isSelected ? null : loc.id)}
              style={{
                background:   isSelected ? 'rgba(255,107,0,0.08)' : '#fff',
                border:       `1.5px solid ${isSelected ? '#FF6B00' : '#D4CFC6'}`,
                borderRadius: '10px',
                padding:      '14px',
                textAlign:    'left',
                cursor:       'pointer',
                transition:   'all 0.18s ease',
                outline:      'none',
              }}
            >
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>{loc.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#1A1612', marginBottom: '2px' }}>
                {loc.name}
              </div>
              <div
                style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize:   '11px',
                  color:      '#B8B4B0',
                  marginBottom:'4px',
                }}
              >
                Avg {loc.avg_wait_hours}
              </div>
              <div style={{ fontSize: '11px', color: '#1A7A4A', fontWeight: 500 }}>
                ● Standers nearby
              </div>
            </button>
          );
        })}
      </div>

      {/* Book CTA */}
      <div style={{ padding: '20px 16px 0' }}>
        <button
          onClick={handleBook}
          disabled={!selected}
          style={{
            width:         '100%',
            background:    selected ? '#FF6B00' : '#D4CFC6',
            color:         '#fff',
            fontFamily:    'Bebas Neue, sans-serif',
            fontSize:      '20px',
            letterSpacing: '0.06em',
            border:        'none',
            borderRadius:  '10px',
            padding:       '14px 0',
            cursor:        selected ? 'pointer' : 'not-allowed',
            transition:    'background 0.2s',
          }}
        >
          BOOK A STANDER →
        </button>
      </div>
    </>
  );
}
