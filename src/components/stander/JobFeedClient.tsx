'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { haversineKm } from '@/lib/utils';
import JobCard from './JobCard';
import toast from 'react-hot-toast';
import type { BookingWithDetails } from '@/types/database';

interface Props {
  initialJobs: BookingWithDetails[];
  standerId: string;
}

export default function JobFeedClient({ initialJobs, standerId }: Props) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);

  // 1. Supabase Realtime for New Jobs
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel('job-feed')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'bookings', 
        filter: 'status=eq.PENDING_MATCH' 
      }, async (payload) => {
        // Fetch full job data with location/client relations
        const { data: newJob } = await supabase
          .from('bookings')
          .select('*, location:locations(name, icon, lat, lng), client:users(name, avatar_initials)')
          .eq('id', payload.new.id)
          .single();

        if (newJob && newJob.payment_status === 'PAID') {
          setJobs(prev => [newJob as BookingWithDetails, ...prev]);
          
          if (Notification.permission === 'granted') {
            new Notification('New job available!', { 
              body: `Job at ${(newJob as any).location?.name}. Payout: ₹${newJob.stander_payout / 100}`,
              icon: '/logo.png'
            });
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
      }, (payload) => {
        // Remove job if someone else took it or it was cancelled
        if (payload.new.status !== 'PENDING_MATCH' || payload.new.stander_id) {
          setJobs(prev => prev.filter(j => j.id !== payload.new.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 2. Geolocation & Distance
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setUserLat(latitude);
      setUserLng(longitude);

      // Heartbeat location to server
      try {
        await fetch('/api/stander/location', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: latitude, lng: longitude })
        });
      } catch (err) {
        console.error('Failed to update stander location:', err);
      }
    }, (err) => console.error('GPS error:', err), { enableHighAccuracy: true });

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleAccept = async (jobId: string) => {
    setIsAccepting(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/accept`, { method: 'POST' });
      const data = await res.json();

      if (res.status === 409) {
        toast.error('Too late — job taken by another stander');
        setJobs(prev => prev.filter(j => j.id !== jobId));
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Failed to accept job');

      toast.success('Job accepted! Head to the location.');
      router.push(`/stander/job/${jobId}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAccepting(null);
    }
  };

  const handleSkip = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-mono text-[10px] text-[#8A8480] uppercase tracking-widest">
          {jobs.length} AVAILABLE JOBS NEAR YOU
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-green-600 uppercase">Live Feed</span>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card className="py-12 flex flex-col items-center justify-center text-center opacity-60 grayscale bg-[#1f180e]/5 border-dashed border-2">
          <span className="text-4xl mb-4">💤</span>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#8A8480]">
            No jobs right now.<br />We&apos;ll notify you when one pops up.
          </p>
        </Card>
      ) : (
        jobs.map((job) => {
          let distStr = '';
          if (userLat && userLng && job.location?.lat && job.location?.lng) {
            const d = haversineKm(userLat, userLng, job.location.lat, job.location.lng);
            distStr = d < 1 ? `${(d * 1000).toFixed(0)}m away` : `${d.toFixed(1)}km away`;
          }

          return (
            <JobCard 
              key={job.id} 
              job={job} 
              distance={distStr}
              onAccept={handleAccept}
              onSkip={handleSkip}
              isLoading={isAccepting === job.id}
            />
          );
        })
      )}
    </div>
  );
}
