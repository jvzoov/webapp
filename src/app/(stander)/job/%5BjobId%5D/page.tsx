'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/Separator';
import TopBar from '@/components/shared/TopBar';
import { haversineKm } from '@/lib/utils';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import type { BookingWithDetails, CheckIn, BookingStatus } from '@/types/database';

interface Props {
  params: Promise<{ jobId: string }>;
}

export default function ActiveJobPage({ params }: Props) {
  const { jobId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();

  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'watching' | 'error'>('idle');
  
  const [capturedImageDataURL, setCapturedImageDataURL] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmittingCheckin, setIsSubmittingCheckin] = useState(false);
  
  const [queuePosition, setQueuePosition] = useState<number>(10);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(60);
  const [isCompleting, setIsCompleting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Fetch Job Data
  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) throw new Error('Job not found');
        const data = await res.json();
        setBooking(data);
        setCheckIns(data.check_ins || []);
      } catch (err) {
        toast.error('Could not load job details');
        router.push('/stander/home');
      }
    }
    fetchJob();
  }, [jobId, router]);

  // 2. Start GPS Watch
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setGpsStatus('watching');
      },
      (err) => {
        console.error('GPS Error:', err);
        setGpsStatus('error');
        toast.error('GPS access is required for check-ins');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 3. Heartbeat Location Update
  useEffect(() => {
    const interval = setInterval(async () => {
      if (gpsCoords) {
        try {
          await fetch('/api/stander/location', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: gpsCoords.lat, lng: gpsCoords.lng }),
          });
        } catch (err) {
          console.error('Heartbeat failed');
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [gpsCoords]);

  // 4. Camera Logic
  async function startCamera() {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      toast.error('Camera access denied');
      setIsCapturing(false);
    }
  }

  function capturePhoto() {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        setCapturedImageDataURL(canvasRef.current.toDataURL('image/jpeg', 0.8));
        
        // Stop stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        setIsCapturing(false);
      }
    }
  }

  // 5. Submit Check-in
  async function handleCheckin() {
    if (!gpsCoords) {
      toast.error('Waiting for GPS signal...');
      return;
    }
    if (!capturedImageDataURL) {
      toast.error('Please take a geo-verified selfie first');
      return;
    }

    setIsSubmittingCheckin(true);
    try {
      const isAlert = queuePosition <= 2;
      const res = await fetch(`/api/jobs/${jobId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: gpsCoords.lat,
          longitude: gpsCoords.lng,
          queuePosition,
          estimatedMinutes,
          isAlert,
          photoUrl: capturedImageDataURL, // In real app, upload to storage first
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check-in failed');

      setCheckIns((prev) => [data, ...prev]);
      setCapturedImageDataURL(null);
      toast.success(isAlert ? 'Alert sent to client!' : 'Check-in recorded!');
      
      // Update local booking status if it changed
      if (booking) {
        const newStatus = isAlert ? 'ALERT' : (booking.status === 'MATCHED' ? 'ACTIVE' : booking.status);
        setBooking({ ...booking, status: newStatus as BookingStatus });
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingCheckin(false);
    }
  }

  // 6. Finish Job
  async function handleComplete() {
    if (checkIns.length === 0) {
      toast.error('You must check in at least once before finishing');
      return;
    }

    if (!confirm('Are you sure you want to finish this job?')) return;

    setIsCompleting(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/complete`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to complete job');

      toast.success('Job completed! Redirecting...');
      router.push('/stander/home');
    } catch (err) {
      toast.error('Error completing job');
      setIsCompleting(false);
    }
  }

  if (!booking) return null;

  const distance = gpsCoords && booking.location?.lat && booking.location?.lng
    ? haversineKm(gpsCoords.lat, gpsCoords.lng, booking.location.lat, booking.location.lng)
    : null;

  return (
    <div className="max-w-[480px] mx-auto bg-[#F7F4EE] min-h-screen flex flex-col relative overflow-x-hidden">
      <Toaster position="top-center" />
      <TopBar role="stander" userName={session?.user?.name ?? ''} title="Active Job" />

      <main className="flex-1 p-4 space-y-6 pb-24 overflow-y-auto">
        
        {/* Job Header */}
        <div className="space-y-1">
          <p className="font-mono text-[10px] text-[#8A8480] uppercase tracking-widest">Ongoing Task</p>
          <div className="flex justify-between items-start">
            <h1 className="font-bebas text-3xl text-[#1A1612] leading-none">{booking.location?.name}</h1>
            <Badge className={booking.status === 'ACTIVE' || booking.status === 'ALERT' ? 'bg-green-100 text-green-700 border-none' : 'bg-blue-100 text-blue-700 border-none'}>
              {booking.status}
            </Badge>
          </div>
          <p className="text-xs text-[#8A8480] truncate">{booking.location_address}</p>
        </div>

        {/* Geo Check-in Card */}
        <Card className="border-2 border-[#D4CFC6] p-5 space-y-6">
          
          {/* GPS Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${gpsStatus === 'watching' ? 'bg-green-500 animate-pulse-green' : 'bg-red-500'}`} />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#1A1612] uppercase tracking-tight">
                  {gpsCoords ? `GPS ACTIVE — ${gpsCoords.lat.toFixed(4)}°N ${gpsCoords.lng.toFixed(4)}°E` : 'LOCATING...'}
                </span>
                {gpsCoords && (
                  <span className={`text-[9px] font-mono ${gpsCoords.accuracy > 200 ? 'text-orange-500' : 'text-[#8A8480]'}`}>
                    Accuracy: {gpsCoords.accuracy.toFixed(0)}m {gpsCoords.accuracy > 200 && '(Low Accuracy)'}
                  </span>
                )}
              </div>
            </div>
            {distance !== null && (
              <Badge variant="outline" className="text-[10px] font-mono border-[#D4CFC6] text-[#8A8480]">
                {(distance * 1000).toFixed(0)}m from queue
              </Badge>
            )}
          </div>

          {/* Selfie Capture Box */}
          <div 
            onClick={!isCapturing && !capturedImageDataURL ? startCamera : undefined}
            className={`relative h-[160px] rounded-[10px] border-2 border-dashed flex flex-col items-center justify-center transition-colors
              ${capturedImageDataURL ? 'border-[#1A7A4A] bg-[#1A7A4A]/5' : 'border-[#D4CFC6] hover:border-[#FF6B00] bg-white'}
              ${isCapturing ? 'cursor-default' : 'cursor-pointer'}`}
          >
            {capturedImageDataURL ? (
              <>
                <img src={capturedImageDataURL} alt="Selfie" className="absolute inset-0 w-full h-full object-cover rounded-[8px]" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setCapturedImageDataURL(null); }}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black"
                >
                  ✕
                </button>
              </>
            ) : isCapturing ? (
              <div className="absolute inset-0 w-full h-full bg-black rounded-[8px] overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover grayscale" playsInline />
                <button 
                  onClick={(e) => { e.stopPropagation(); capturePhoto(); }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-4 border-white bg-[#FF6B00] shadow-lg"
                />
              </div>
            ) : (
              <>
                <span className="text-3xl mb-2">📸</span>
                <p className="font-mono text-[10px] text-[#8A8480] uppercase tracking-widest text-center px-4">
                  Tap to take geo-verified selfie
                </p>
              </>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="People Ahead" 
              type="number" 
              value={queuePosition}
              onChange={(e) => setQueuePosition(Number(e.target.value))}
            />
            <Input 
              label="Est. Wait (min)" 
              type="number" 
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            />
          </div>

          <Button 
            onClick={handleCheckin}
            loading={isSubmittingCheckin}
            disabled={isSubmittingCheckin || !gpsCoords || !capturedImageDataURL}
            className="w-full py-6 text-lg tracking-widest bg-[#1A1612] hover:bg-black"
          >
            {queuePosition <= 2 ? '⚠️ SEND ALERT & CHECK-IN' : 'CHECK-IN NOW'}
          </Button>

        </Card>

        <Separator />

        {/* Check-in History */}
        <div className="space-y-4">
          <h3 className="font-mono text-[10px] text-[#8A8480] uppercase tracking-widest">Recent Activity</h3>
          <div className="space-y-3">
            {checkIns.length === 0 ? (
              <p className="text-xs italic text-[#B8B4B0]">No check-ins yet. Please verify your presence.</p>
            ) : (
              checkIns.map((ci) => (
                <div key={ci.id} className="bg-white border border-[#D4CFC6] rounded-lg p-3 flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <div className={`w-2 h-2 rounded-full ${ci.is_alert ? 'bg-red-500' : 'bg-green-500'}`} />
                    <div>
                      <p className="text-xs font-bold text-[#1A1612]">Position: {ci.queue_position}</p>
                      <p className="text-[10px] text-[#8A8480]">{format(new Date(ci.created_at), 'hh:mm a')} · {ci.estimated_minutes}m wait</p>
                    </div>
                  </div>
                  {ci.photo_url && (
                    <div className="w-10 h-10 rounded border border-[#D4CFC6] overflow-hidden bg-gray-100">
                      <img src={ci.photo_url} className="w-full h-full object-cover grayscale" alt="Proof" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Finish Job Button */}
        <div className="pt-8 pb-12">
          <Button 
            onClick={handleComplete}
            loading={isCompleting}
            disabled={isCompleting}
            className="w-full py-7 text-2xl tracking-widest bg-[#1A7A4A] hover:bg-[#145d38] border-none shadow-xl shadow-green-900/20"
          >
            FINISH JOB
          </Button>
          <p className="text-center text-[10px] font-mono text-[#8A8480] uppercase tracking-widest mt-4">
            Payout ₹{booking.stander_payout / 100} processed after client review
          </p>
        </div>

      </main>

      <style jsx global>{`
        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .animate-pulse-green {
          animation: pulse-green 2s infinite;
        }
      `}</style>
    </div>
  );
}
