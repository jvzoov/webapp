'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import type { CheckIn, BookingWithDetails } from '@/types/database';

export default function MapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [mode, setMode] = useState('street');
  
  const [gpsData, setGpsData] = useState({
    coords: 'Locating...',
    km: '...',
    pos: '...',
    eta: '...'
  });

  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [latestCheckin, setLatestCheckin] = useState<CheckIn | null>(null);

  useEffect(() => {
    if (!bookingId) return;

    const supabase = createClient();
    
    // Fetch initial data
    supabase.from('bookings').select('*, location:locations(*)').eq('id', bookingId).single().then(({ data }) => {
      if (data) setBooking(data as any);
    });

    supabase.from('check_ins').select('*').eq('booking_id', bookingId).order('created_at', { ascending: false }).limit(1).then(({ data }) => {
      if (data && data.length > 0) {
        setLatestCheckin(data[0]);
        updateGpsDisplay(data[0]);
      }
    });

    // Realtime subscription
    const channel = supabase.channel(`map-track:${bookingId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'check_ins', filter: `booking_id=eq.${bookingId}` },
        (p) => {
          setLatestCheckin(p.new as CheckIn);
          updateGpsDisplay(p.new as CheckIn);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [bookingId]);

  const updateGpsDisplay = (checkin: CheckIn) => {
    setGpsData({
      coords: `${checkin.latitude.toFixed(4)}, ${checkin.longitude.toFixed(4)}`,
      km: 'Live tracking',
      pos: `#${checkin.queue_position ?? '?'}`,
      eta: `${checkin.estimated_minutes ?? '?'} min`
    });
  };

  const getMapUrl = () => {
    // If we have actual coordinates, we can center the map there
    const lat = latestCheckin?.latitude || booking?.location?.lat || 12.9352;
    const lng = latestCheckin?.longitude || booking?.location?.lng || 77.6245;
    
    if (mode === 'satellite') return `https://www.google.com/maps?q=${lat},${lng}&t=k&output=embed`;
    return `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
  };

  return (
    <div className="p-4 pt-5 pb-24 animate-fade-in max-w-[480px] mx-auto bg-[#F7F4EE] min-h-screen">
      <div className="flex items-center gap-2.5 mb-5">
        <button 
          onClick={() => router.back()}
          className="bg-[#EDE9E0] border-none rounded-lg w-9 h-9 cursor-pointer text-lg flex items-center justify-center text-[#1A1612]"
        >
          ←
        </button>
        <h1 className="font-bebas text-xl tracking-[0.5px] m-0 text-[#1A1612]">Map & ETA</h1>
      </div>

      <Card className="mb-3">
        <div className="flex gap-2 mb-3">
          {[
            { id: 'street', label: 'Street' },
            { id: 'satellite', label: 'Satellite' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex-1 p-2.5 border rounded-lg font-mono text-[11px] transition-colors ${
                mode === m.id 
                  ? 'border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00]' 
                  : 'border-[#D4CFC6] bg-white text-[#1A1612]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <iframe 
          className="w-full h-[220px] border-none rounded-xl bg-[#EDE9E0]" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade" 
          allowFullScreen 
          src={getMapUrl()} 
        />

        <div className="flex justify-between items-center gap-2.5 bg-[#1A1612] text-white rounded-xl p-3 my-3">
          <div>
            <strong className="text-sm">Supabase Realtime Sync Active</strong>
            <small className="block text-white/55 font-mono text-[10px] mt-0.5">{gpsData.coords}</small>
          </div>
          <Button size="sm" onClick={() => router.refresh()}>Refresh Map</Button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white border border-[#D4CFC6] rounded-lg p-3 flex flex-col gap-1">
            <div className="font-mono text-[11px] text-[#8A8480] uppercase mb-1">Queue pos</div>
            <strong className="text-sm font-semibold">{gpsData.pos}</strong>
          </div>
          <div className="bg-white border border-[#D4CFC6] rounded-lg p-3 flex flex-col gap-1">
            <div className="font-mono text-[11px] text-[#8A8480] uppercase mb-1">ETA</div>
            <strong className="text-sm font-semibold">{gpsData.eta}</strong>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="font-mono text-[10px] text-[#8A8480] tracking-[0.1em] uppercase mb-2.5">Realtime Connection Status</div>
        <div className="text-xs text-[#4A4540]">
          <ul className="list-disc pl-4 space-y-1">
            <li className="text-[#1A7A4A]">Connected to Supabase Channel: <strong>map-track:{bookingId?.slice(0,6)}...</strong></li>
            <li>Receiving Postgres INSERT events on `check_ins` table.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
