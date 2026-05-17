'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function KycPage() {
  const router = useRouter();
  const [step, setStep] = useState(3); // 1 and 2 done, 3 active
  const [note, setNote] = useState('Standers can continue only after Aadhaar KYC and bank verification.');

  const steps = [
    { num: 1, label: 'Aadhaar consent' },
    { num: 2, label: 'OTP auth' },
    { num: 3, label: 'DigiLocker fetch' },
    { num: 4, label: 'Penny drop' },
    { num: 5, label: 'Face match' }
  ];

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
          <div className="font-mono text-[10px] text-[#8A8480] tracking-[0.1em] uppercase">Aadhaar KYC / DigiLocker</div>
          <h1 className="font-bebas text-xl tracking-[0.5px] m-0 text-[#1A1612]">Mandatory stander onboarding</h1>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#1A1612] to-[#2b2520] text-white rounded-xl p-4 mb-3">
        <div className="font-mono text-[11px] text-white/60 mb-1">Trust score</div>
        <div className="font-bebas text-[54px] leading-none text-[#1A7A4A]">86</div>
        <div className="h-2.5 bg-white/10 rounded-full mt-2 overflow-hidden">
          <div className="h-full w-[86%] bg-gradient-to-r from-[#1A7A4A] to-[#58c77e]" />
        </div>
      </div>

      <Card className="mb-3">
        <div className="font-mono text-[10px] text-[#8A8480] tracking-[0.1em] uppercase mb-2.5">5-step verification checklist</div>
        
        <div className="flex justify-between gap-2 my-4 relative">
          {steps.map((s) => {
            const isDone = s.num < step;
            const isActive = s.num === step;
            return (
              <div key={s.num} className="flex-1 text-center relative z-10">
                <div className={cn(
                  "w-7 h-7 rounded-full mx-auto mb-1.5 flex items-center justify-center font-mono text-[11px] border-2 bg-white",
                  isDone ? "border-[#1A7A4A] text-[#1A7A4A] bg-[#1A7A4A]/10" :
                  isActive ? "border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/10" :
                  "border-[#D4CFC6] text-[#8A8480]"
                )}>
                  {isDone ? '✓' : s.num}
                </div>
                <div className="text-[10px] font-mono text-[#8A8480] leading-[1.3]">{s.label}</div>
              </div>
            );
          })}
          {/* Connector lines (simplified visually using absolute block in background) */}
          <div className="absolute top-3.5 left-[10%] right-[10%] h-[2px] bg-[#D4CFC6] z-0" />
        </div>

        <div className="bg-[#D4A017]/10 p-3 rounded-lg text-[13px] text-[#4A4540] mb-3">
          {note}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Button onClick={() => { setStep(4); setNote('DigiLocker connected. Pulling Aadhaar identity attributes...'); }}>
            CONNECT DIGILOCKER
          </Button>
          <Button variant="outline" onClick={() => { setStep(6); setNote('Bank penny-drop verified. Onboarding complete.'); }}>
            RUN PENNY-DROP
          </Button>
        </div>
      </Card>

      <Card>
        <div className="font-mono text-[10px] text-[#8A8480] tracking-[0.1em] uppercase mb-2.5">6-metric trust score grid</div>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { l: 'Aadhaar match', v: '99%' }, { l: 'Checklist', v: '4/5' },
            { l: 'Penny-drop', v: '₹1' }, { l: 'Avg time', v: '2m' },
            { l: 'Fraud risk', v: 'Low' }, { l: 'Session', v: 'Live' }
          ].map(m => (
            <div key={m.l} className="bg-white border border-[#D4CFC6] rounded-lg p-3 flex flex-col gap-1">
              <div className="font-mono text-[11px] text-[#8A8480] uppercase mb-1">{m.l}</div>
              <strong className="text-sm font-semibold">{m.v}</strong>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
