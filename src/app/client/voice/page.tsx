'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function VoicePage() {
  const router = useRouter();
  const [lang, setLang] = useState('en-IN');
  const [status, setStatus] = useState('Use microphone input if supported; otherwise demo simulation will fill the booking fields.');
  
  const [parsed, setParsed] = useState({
    location: '—', service: '—', time: '—', cost: '—'
  });

  const applyVoiceParse = (text: string) => {
    const lower = text.toLowerCase();
    const location = (/rto|passport|hospital|bank|court/.exec(lower) || ['RTO'])[0];
    const service = (/renewal|registration|passport|account|token/.exec(lower) || ['renewal'])[0];
    const time = (/\b\d{1,2}(?::\d{2})?\s?(am|pm)\b/.exec(lower) || ['8:00 am'])[0];
    const cost = (/₹\s?\d+|rs\.?\s?\d+|\d+ rupees/.exec(lower) || ['₹449'])[0].replace('rs', '₹');
    
    setParsed({ location, service, time, cost });
    setStatus('Parsed spoken text. Please confirm or retry.');
  };

  const simulateDemo = () => {
    const samples: Record<string, string> = {
      'en-IN': 'RTO renewal at 8 am ₹449',
      'hi-IN': 'पासपोर्ट सेवा 9 am ₹449',
      'kn-IN': 'ಬ್ಯಾಂಕ್ ಟೋಕನ್ 10 am ₹449'
    };
    setStatus('Speech API unavailable in this context, demo simulation applied.');
    applyVoiceParse(samples[lang] || samples['en-IN']);
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
        <h1 className="font-bebas text-xl tracking-[0.5px] m-0 text-[#1A1612]">Voice Booking</h1>
      </div>

      <Card className="mb-3">
        <div className="flex gap-2 mb-3">
          {[
            { id: 'en-IN', label: 'English' },
            { id: 'hi-IN', label: 'हिंदी' },
            { id: 'kn-IN', label: 'ಕನ್ನಡ' }
          ].map(l => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              className={`flex-1 p-2.5 border rounded-lg font-mono text-[11px] transition-colors ${
                lang === l.id 
                  ? 'border-[#FF6B00] bg-[#FF6B00]/10 text-[#FF6B00]' 
                  : 'border-[#D4CFC6] bg-white text-[#1A1612]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Animated Waveform */}
        <div className="h-[72px] rounded-xl bg-gradient-to-b from-[#F7F4EE] to-[#EDE9E0] flex items-end justify-center gap-[5px] p-3 mb-3 overflow-hidden">
          {[18,32,24,46,20,54,26,40,22,50].map((h, i) => (
            <div 
              key={i} 
              className="w-1.5 bg-[#FF6B00] rounded-full animate-pulse-saffron"
              style={{ height: `${h}px`, animationDelay: `${(i % 3) * 0.15}s` }}
            />
          ))}
        </div>

        <div className="bg-[#D4A017]/10 text-[#5a4030] rounded-lg p-[18px] text-[13px] mb-3 border border-transparent">
          {status}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Button onClick={simulateDemo}>START BOOKING</Button>
          <Button variant="outline" onClick={() => setParsed({location: '—', service: '—', time: '—', cost: '—'})}>RETRY</Button>
        </div>
      </Card>

      <Card>
        <div className="font-mono text-[10px] text-[#8A8480] tracking-[0.1em] uppercase mb-2.5">Parsed Booking Fields</div>
        
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {Object.entries(parsed).map(([key, val]) => (
            <div key={key} className="bg-white border border-[#D4CFC6] rounded-lg p-3 flex flex-col gap-1">
              <div className="font-mono text-[11px] text-[#8A8480] uppercase mb-1">{key}</div>
              <strong className="text-sm font-semibold capitalize">{val}</strong>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2.5 mt-3">
          <Button variant="success" onClick={() => router.push(`/client/book?loc=${parsed.location}`)}>CONFIRM</Button>
          <Button variant="outline" onClick={simulateDemo}>RETRY PARSING</Button>
        </div>
      </Card>
    </div>
  );
}
