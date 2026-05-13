'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/Progress';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import MapView from './MapView';
import RatingModal from './RatingModal';
import type { BookingWithDetails, CheckIn, BookingStatus } from '@/types/database';

interface Props {
  initialBooking: BookingWithDetails;
  initialCheckins: CheckIn[];
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const config: Record<BookingStatus, { label: string; bg: string; text: string }> = {
    PENDING_MATCH: { label: 'FINDING STANDER', bg: 'bg-[#FF6B00]/10', text: 'text-[#FF6B00]' },
    MATCHED:       { label: 'STANDER MATCHED', bg: 'bg-blue-100',      text: 'text-blue-600' },
    ACTIVE:        { label: 'STANDER ON-SITE', bg: 'bg-green-100',     text: 'text-green-600' },
    ALERT:         { label: 'YOUR TURN SOON',  bg: 'bg-red-100',       text: 'text-red-600' },
    COMPLETED:     { label: 'COMPLETED',      bg: 'bg-gray-100',      text: 'text-gray-600' },
    CANCELLED:     { label: 'CANCELLED',      bg: 'bg-red-100',       text: 'text-red-600' },
  };
  const { label, bg, text } = config[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600' };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase ${bg} ${text}`}>
      {label}
    </span>
  );
}

function ElapsedTimer({ startTime }: { startTime: string }) {
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, now - start);
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setElapsed(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span className="font-mono">{elapsed}</span>;
}

export default function TrackingClient({ initialBooking, initialCheckins }: Props) {
  const [booking, setBooking] = useState(initialBooking);
  const [checkIns, setCheckIns] = useState(initialCheckins);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`booking-track:${booking.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'check_ins', filter: `booking_id=eq.${booking.id}` },
        (p) => setCheckIns(prev => [...prev, p.new as CheckIn]))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${booking.id}` },
        (p) => {
          const updated = { ...booking, ...p.new };
          setBooking(updated);
          if (p.new.status === 'COMPLETED') setShowRatingModal(true);
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [booking.id]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [checkIns.length]);

  const lastCheckin = checkIns[checkIns.length - 1];
  const progress = Math.min(100, (checkIns.length / (booking.estimated_hours * 2)) * 100);

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* ─── ALERT BANNER ─────────────────────────────────── */}
      {booking.status === 'ALERT' && (
        <Card className="bg-red-600 border-none text-white p-4 animate-pulse-red">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <h3 className="font-bebas text-2xl tracking-wide leading-none mb-1">YOUR TURN IS NEAR!</h3>
              <p className="text-xs opacity-90">
                Head to {booking.location?.name} now — {lastCheckin?.queue_position ?? '?'} people ahead
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ─── STATUS CARD ──────────────────────────────────── */}
      <Card className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-bebas text-3xl text-[#1A1612] leading-none mb-1">{booking.location?.name}</h2>
            <p className="text-xs text-[#8A8480] uppercase tracking-widest font-mono">LIVE STATUS</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid grid-cols-3 gap-4 py-4 border-y border-[#D4CFC6]/30">
          <div className="text-center">
            <p className="font-mono text-[9px] text-[#8A8480] uppercase mb-1">Queue Pos</p>
            <p className="font-bebas text-2xl text-[#1A1612]">{lastCheckin?.queue_position ?? '—'}</p>
          </div>
          <div className="text-center border-x border-[#D4CFC6]/30">
            <p className="font-mono text-[9px] text-[#8A8480] uppercase mb-1">Est. Wait</p>
            <p className="font-bebas text-2xl text-[#1A1612]">{lastCheckin?.estimated_minutes ?? '—'}m</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-[9px] text-[#8A8480] uppercase mb-1">Elapsed</p>
            <p className="font-bebas text-2xl text-[#1A1612]">
              <ElapsedTimer startTime={booking.created_at} />
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-mono text-[#8A8480] uppercase tracking-widest">
            <span>Job Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
        
        {lastCheckin && (
          <div className="text-center">
            <span className="font-bebas text-6xl text-[#FF6B00] leading-none">{lastCheckin.queue_position}</span>
            <p className="font-mono text-[10px] text-[#8A8480] uppercase tracking-widest mt-1">People ahead of you</p>
          </div>
        )}
      </Card>

      {/* ─── STANDER CARD ─────────────────────────────────── */}
      {booking.stander && (
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar initials={booking.stander.avatar_initials ?? '??'} />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm">{booking.stander.name}</h4>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-1.5 py-0">VERIFIED</Badge>
              </div>
              <p className="text-[11px] text-[#8A8480]">
                ★ {booking.stander_profile?.rating ?? 5.0} · {booking.stander_profile?.job_count ?? 0} jobs
              </p>
            </div>
          </div>
          <a 
            href={`tel:${booking.stander.phone}`}
            className="w-10 h-10 bg-[#1f180e] rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
          >
            📞
          </a>
        </Card>
      )}

      {/* ─── MAP ────────────────────────────────────────── */}
      {booking.location?.lat && booking.location?.lng && (
        <MapView 
          lat={booking.location.lat} 
          lng={booking.location.lng} 
          standerLat={lastCheckin?.latitude}
          standerLng={lastCheckin?.longitude}
          standerInitials={booking.stander?.avatar_initials ?? 'S'}
        />
      )}

      {/* ─── CHECK-IN LOG ─────────────────────────────────── */}
      <Card>
        <h5 className="font-mono text-[10px] text-[#8A8480] uppercase tracking-widest mb-3">Live Activity Log</h5>
        <div ref={logRef} className="max-h-[160px] overflow-y-auto space-y-3 pr-2 scrollbar-hide">
          {checkIns.length === 0 ? (
            <p className="text-[12px] text-[#B8B4B0] italic py-4">Waiting for stander to check in...</p>
          ) : (
            checkIns.map((ci, idx) => (
              <div key={ci.id} className="flex gap-3 text-[12px]">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1A7A4A] shrink-0" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#8A8480]">{format(new Date(ci.created_at), 'HH:mm')}</span>
                    <span className="font-semibold text-[#1A1612]">Check-in #{idx + 1}</span>
                  </div>
                  <p className="text-[#8A8480]">
                    Verified at location. Position: {ci.queue_position}. Est. {ci.estimated_minutes}m wait.
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* ─── DEV HELPER ──────────────────────────────────── */}
      {process.env.NODE_ENV === 'development' && (
        <div className="pt-4 space-y-2">
          <p className="font-mono text-[9px] text-[#B8B4B0] text-center uppercase tracking-widest">Dev Simulator</p>
          <div className="flex gap-2">
            {[10, 5, 2, 1].map(pos => (
              <Button 
                key={pos}
                size="sm" 
                variant="outline" 
                className="flex-1 text-[10px]"
                onClick={async () => {
                  const res = await fetch('/api/dev/simulate-checkin', {
                    method: 'POST',
                    body: JSON.stringify({ bookingId: booking.id, position: pos })
                  });
                  if (res.ok) toast.success(`Simulated pos ${pos}`);
                }}
              >
                POS {pos}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* ─── RATING MODAL ────────────────────────────────── */}
      {booking.stander && (
        <RatingModal 
          open={showRatingModal} 
          onClose={() => setShowRatingModal(false)}
          onRated={() => setBooking(prev => ({...prev, status: 'COMPLETED'}))}
          booking={booking}
          stander={{
            name:           booking.stander.name,
            avatarInitials: booking.stander.avatar_initials ?? '??'
          }}
        />
      )}
    </div>
  );
}
