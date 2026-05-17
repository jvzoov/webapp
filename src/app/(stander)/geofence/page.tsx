'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function GeofencePage() {
  const router = useRouter();
  const [isBreach, setIsBreach] = useState(false);
  const [logs, setLogs] = useState([{ time: 'LIVE', msg: 'Awaiting geolocation permission...' }]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setLogs(prev => [{ time: 'ERROR', msg: 'Geolocation is not supported by your browser' }, ...prev]);
      return;
    }

    setLogs(prev => [{ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), msg: 'Geolocation tracking started.' }, ...prev]);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        
        // Mock distance check: in reality we'd compare this to the booking's location.lat/lng
        // For demonstration of native functionality, we'll randomize a breach based on a fake radius
        const distance = Math.random() * 100; // Simulated distance calculation in meters
        const breachNow = distance > 50;

        if (breachNow !== isBreach) {
          setIsBreach(breachNow);
          setLogs(prev => [{
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            msg: breachNow 
              ? `Boundary breach detected at distance ${Math.round(distance)}m; client alerted.`
              : 'Boundary restored to safe state and monitoring resumed.'
          }, ...prev]);

          // Realtime interaction: Push the breach event to Supabase
          const supabase = createClient();
          supabase.from('notifications').insert({
            user_id: 'SYSTEM', // Typically you'd have the Stander ID here
            type: 'ALERT',
            message: breachNow ? 'GEOFENCE BREACH DETECTED' : 'GEOFENCE SAFE RESTORED',
            is_read: false
          });
        }
      },
      (error) => {
        setLogs(prev => [{ time: 'ERROR', msg: error.message }, ...prev]);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isBreach]);

  const toggleBreach = () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setIsBreach(!isBreach);
    setLogs(prev => [{
      time,
      msg: !isBreach 
        ? 'Manual breach simulated; client alerted, booking paused.'
        : 'Manual boundary restored to safe state.'
    }, ...prev]);
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
        <div>
          <div className="font-mono text-[10px] text-[#8A8480] tracking-[0.1em] uppercase">Stander Geo-fencing</div>
          <h1 className="font-bebas text-xl tracking-[0.5px] m-0 text-[#1A1612]">Safe boundary monitoring</h1>
        </div>
      </div>

      <Card className="mb-3">
        <div className="flex items-center justify-center py-2 pb-5 overflow-hidden">
          {/* Animated radar rings mapped from pure CSS variables inside Tailwind */}
          <div className={cn(
            "w-[170px] h-[170px] rounded-full relative border-2 flex items-center justify-center transition-all duration-500",
            isBreach 
              ? "animate-pulse border-[#C0392B]/50 bg-[#C0392B]/10" 
              : "animate-pulse border-[#1A7A4A]/35 bg-[#1A7A4A]/10"
          )}>
            <div className={cn("w-[104px] h-[104px] border-2 border-dashed rounded-full absolute", isBreach ? "border-[#C0392B]/45" : "border-[#1A7A4A]/45")} />
            <div className="w-[18px] h-[18px] bg-[#1A7A4A] rounded-full absolute z-10" />
            <div className={cn(
              "w-3.5 h-3.5 bg-[#FF6B00] rounded-full absolute z-20 transition-all duration-[900ms] ease-in-out",
              isBreach ? "ml-[76px] -mt-[64px] bg-[#C0392B]" : "ml-[24px] -mt-[18px]"
            )} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white border border-[#D4CFC6] rounded-lg p-3 flex flex-col gap-1">
            <div className="font-mono text-[11px] text-[#8A8480] uppercase mb-1">Allowed radius</div>
            <strong className="text-sm font-semibold">50m</strong>
          </div>
          <div className="bg-white border border-[#D4CFC6] rounded-lg p-3 flex flex-col gap-1">
            <div className="font-mono text-[11px] text-[#8A8480] uppercase mb-1">Current state</div>
            <strong className={cn("text-sm font-semibold", isBreach ? "text-[#C0392B]" : "text-[#1A7A4A]")}>
              {isBreach ? 'BREACH' : 'SAFE'}
            </strong>
          </div>
        </div>
        {coords && (
          <div className="mt-3 text-center font-mono text-[10px] text-[#8A8480]">
            Live Native GPS: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
          </div>
        )}
      </Card>

      <Card className="mb-3">
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant={isBreach ? 'primary' : 'danger'} onClick={toggleBreach}>
            {isBreach ? 'RESET SAFE ZONE' : 'SIMULATE BREACH'}
          </Button>
          <Button variant="outline" onClick={() => setLogs([{ time: 'LIVE', msg: 'Logs cleared.' }])}>CLEAR LOGS</Button>
        </div>
      </Card>

      <Card>
        <div className="font-mono text-[10px] text-[#8A8480] tracking-[0.1em] uppercase mb-2.5">Audit Log</div>
        <div className="bg-[#EDE9E0] rounded-lg p-3 max-h-[150px] overflow-y-auto">
          {logs.map((l, i) => (
             <div key={i} className="flex gap-2 items-start mb-1.5 text-xs">
               <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 mt-1", isBreach && i === 0 ? "bg-[#C0392B]" : "bg-[#1A7A4A]")} />
               <span className="font-mono text-[#8A8480] shrink-0">{l.time}</span>
               <span className="text-[#4A4540]">{l.msg}</span>
             </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
