'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { Location } from '@/types/database';

interface Props {
  locations: Location[];
}

export default function LocationGrid({ locations }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedLoc = locations.find(l => l.id === selectedId);

  const handleBook = () => {
    if (selectedId && selectedLoc) {
      router.push(`/client/book?locationId=${selectedId}&locationName=${encodeURIComponent(selectedLoc.name)}`);
    }
  };

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-3">
        {locations.map((loc) => {
          const isSelected = selectedId === loc.id;
          return (
            <button
              key={loc.id}
              onClick={() => setSelectedId(loc.id)}
              className={`flex flex-col items-center p-5 rounded-[10px] border transition-all text-center
                ${isSelected 
                  ? 'border-[#FF6B00] bg-[#FF6B00]/5 ring-1 ring-[#FF6B00]' 
                  : 'border-[#D4CFC6] bg-white hover:border-[#FF6B00]/50'}`}
            >
              <span className="text-3xl mb-3 grayscale-0 group-hover:scale-110 transition-transform">
                {loc.icon || '📍'}
              </span>
              <span className="font-semibold text-[13px] text-[#1A1612] leading-tight mb-1">
                {loc.name}
              </span>
              <span className="font-mono text-[9px] text-[#8A8480] uppercase tracking-wider">
                {loc.avg_wait_hours || '1-2h'} wait
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 pb-32">
        <Button
          onClick={handleBook}
          disabled={!selectedId}
          className={`w-full py-6 text-xl tracking-[.06em] shadow-lg shadow-[#FF6B00]/20
            ${!selectedId ? 'bg-[#D4CFC6] cursor-not-allowed' : 'bg-[#FF6B00] hover:bg-[#e05e00]'}`}
        >
          {selectedId ? 'BOOK A STANDER' : 'SELECT A LOCATION'}
        </Button>
      </div>
    </div>
  );
}
