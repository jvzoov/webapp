'use client';

import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { uploadCheckInSelfie } from '@/lib/storage';

interface Props {
  bookingId: string;
  onCheckIn: () => void;
}

export default function GeoCheckinCard({ bookingId, onCheckIn }: Props) {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [acc, setAcc] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState('');

  const [cameraActive, setCameraActive] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [uploading, setUploading]       = useState(false);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ─── 1. GPS Tracking ──────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported by your browser');
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setAcc(pos.coords.accuracy);
        setGpsError('');
      },
      (err) => {
        setGpsError(`GPS Error: ${err.message}`);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ─── 2. Camera Capture ────────────────────────────────────────
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setPhotoDataUrl(null);
    } catch (err: any) {
      toast.error(`Camera error: ${err.message}`);
    }
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Stop tracks
    const stream = video.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);

    // Save as JPEG
    setPhotoDataUrl(canvas.toDataURL('image/jpeg', 0.8));
  }

  // ─── 3. Submit Check-in ───────────────────────────────────────
  async function submitCheckIn() {
    if (!lat || !lng) {
      toast.error('Waiting for GPS coordinates…');
      return;
    }
    setUploading(true);
    try {
      // 1. Upload photo if exists
      let selfieUrl = null;
      if (photoDataUrl) {
        selfieUrl = await uploadCheckInSelfie(bookingId, photoDataUrl);
      }

      // 2. Post to API
      const res = await fetch('/api/checkins', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          bookingId,
          latitude: lat,
          longitude: lng,
          selfieUrl,
          queuePosition: (document.getElementById('queuePos') as HTMLInputElement)?.value || null,
          estimatedMinutes: (document.getElementById('estWait') as HTMLSelectElement)?.value || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Check-in failed');
        return;
      }

      toast.success('Check-in successful!');
      setPhotoDataUrl(null);
      (document.getElementById('queuePos') as HTMLInputElement).value = '';
      onCheckIn();
    } catch {
      toast.error('Network error during check-in');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #D4CFC6', borderRadius: '10px', padding: '16px' }}>

      {/* GPS Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        {lat ? (
          <>
            <div className="animate-gps-glow" style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1A7A4A' }} />
            <div style={{ fontSize: '13px', color: '#1A7A4A', fontWeight: 500 }}>
              GPS Active · Acc: {acc ? Math.round(acc) : '?'}m
            </div>
          </>
        ) : (
          <>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8A8480' }} />
            <div style={{ fontSize: '13px', color: '#8A8480' }}>
              {gpsError || 'Acquiring GPS…'}
            </div>
          </>
        )}
      </div>

      {/* Camera Box */}
      <div style={{ marginBottom: '16px' }}>
        {cameraActive ? (
          <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
            <video ref={videoRef} style={{ width: '100%', display: 'block' }} playsInline />
            <button
              onClick={capturePhoto}
              style={{
                position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
                width: '64px', height: '64px', borderRadius: '50%', background: '#FF6B00',
                border: '4px solid #fff', cursor: 'pointer'
              }}
            />
          </div>
        ) : photoDataUrl ? (
          <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoDataUrl} alt="Captured selfie" style={{ width: '100%', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '6px 12px', fontFamily: 'DM Mono, monospace', fontSize: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{lat?.toFixed(4)}, {lng?.toFixed(4)}</span>
              <span style={{ color: '#22c55e' }}>Verified</span>
            </div>
            <button
              onClick={startCamera}
              style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px' }}
            >
              Retake
            </button>
          </div>
        ) : (
          <button
            onClick={startCamera}
            style={{
              width: '100%', height: '140px', border: '2px dashed #D4CFC6', borderRadius: '8px',
              background: '#F7F4EE', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#8A8480'
            }}
          >
            <span style={{ fontSize: '32px', marginBottom: '8px' }}>📸</span>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Tap to take geo-verified selfie</span>
          </button>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#8A8480', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
            People Ahead
          </label>
          <input
            id="queuePos"
            type="number"
            placeholder="e.g. 15"
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4CFC6', background: '#F7F4EE' }}
          />
        </div>
        <div>
          <label style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#8A8480', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
            Est Wait
          </label>
          <select
            id="estWait"
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4CFC6', background: '#F7F4EE', appearance: 'none' }}
          >
            <option value="">Select…</option>
            <option value="120">2+ hours</option>
            <option value="60">1 hour</option>
            <option value="30">30 min</option>
            <option value="15">15 min</option>
            <option value="5">5 min (ALERT!)</option>
          </select>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={submitCheckIn}
        disabled={uploading || cameraActive}
        style={{
          width: '100%',
          background: '#1A1612',
          color: '#fff',
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '20px',
          letterSpacing: '0.06em',
          border: 'none',
          borderRadius: '8px',
          padding: '14px 0',
          cursor: uploading || cameraActive ? 'not-allowed' : 'pointer',
        }}
      >
        {uploading ? 'UPLOADING…' : 'CHECK IN NOW'}
      </button>
    </div>
  );
}
