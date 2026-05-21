'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/input';

export default function WhatsAppPage() {
  const router = useRouter();
  
  const [messages, setMessages] = useState([
    { who: 'agent', text: 'Hi! We can verify your QueuePe account using WhatsApp OTP.' }
  ]);
  const [otpCode, setOtpCode] = useState('------');
  const [countdown, setCountdown] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const appendMsg = (text: string, who: 'agent' | 'me' = 'agent') => {
    setMessages((prev) => [...prev, { who, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  };

  const sendOTP = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setOtpCode(code);
    appendMsg(`Your QueuePe verification OTP is ${code}. It is valid for 45 seconds.`);
    
    setCountdown(45);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(intervalRef.current!);
          appendMsg('OTP expired. Tap send again for a new code.');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const verifyOTP = () => {
    if (countdown === 0 || otpCode === '------') {
      appendMsg('Verification failed because the OTP expired.', 'me');
      return;
    }
    if (inputVal === otpCode) {
      appendMsg(`Entered OTP ${inputVal} and completed phone verification.`, 'me');
      appendMsg('Phone number verified successfully. Alerts are now active.');
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCountdown(0);
    } else {
      appendMsg(`Entered OTP ${inputVal || 'empty'} but verification failed.`, 'me');
      appendMsg('That code does not match. Please retry.');
    }
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
        <h1 className="font-bebas text-xl tracking-[0.5px] m-0 text-[#1A1612]">WhatsApp Business</h1>
      </div>

      <Card className="mb-3">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="font-semibold text-[15px] text-[#1A1612]">QueuePe Support</div>
            <div className="font-mono text-[11px] text-[#8A8480]">Business verified thread</div>
          </div>
          <StatusBadge status="ACTIVE" text="LIVE" />
        </div>

        <div className="bg-[#efeae2] rounded-xl p-3 flex flex-col gap-2.5 max-h-[260px] overflow-y-auto mb-3">
          {messages.map((m, i) => (
            <div 
              key={i} 
              className={`max-w-[84%] p-2.5 rounded-xl text-[13px] leading-[1.45] ${
                m.who === 'agent' ? 'bg-white rounded-tl-sm' : 'bg-[#dcf8c6] rounded-tr-sm ml-auto'
              }`}
            >
              {m.text}
              <span className="block text-[10px] text-[#8A8480] mt-1 font-mono">
                {m.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center gap-2.5 my-3">
          <div>
            <div className="font-mono text-[11px] text-[#8A8480] uppercase tracking-[0.06em] mb-1">Generated OTP</div>
            <div className="font-bebas text-[42px] text-[#FF6B00] tracking-[3px] leading-none">{otpCode}</div>
          </div>
          <div className="font-mono text-[11px] px-2.5 py-1.5 rounded-full bg-[#D4A017]/10 text-[#D4A017]">
            {countdown > 0 ? `${countdown}s remaining` : 'Expired / Idle'}
          </div>
        </div>

        <Button onClick={sendOTP} className="mb-4">SEND WHATSAPP OTP</Button>

        <div className="mb-2">
          <Input 
            label="Enter 6-digit OTP" 
            maxLength={6} 
            placeholder="123456" 
            inputMode="numeric"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
        </div>
        <Button variant="secondary" onClick={verifyOTP}>VERIFY OTP</Button>
      </Card>
      
      <Card>
        <div className="font-mono text-[10px] text-[#8A8480] tracking-[0.1em] uppercase mb-2.5">Notification Preferences</div>
        <div className="grid grid-cols-2 gap-2.5">
          {['Queue updates', 'Payment alerts', 'Geo-fence alerts', 'Voice confirms'].map(pref => (
            <div key={pref} className="bg-white border-[1.5px] border-[#D4CFC6] rounded-[10px] p-3 flex flex-col gap-1">
              <strong className="text-sm font-semibold">{pref}</strong>
              <div className="font-mono text-[11px] text-[#8A8480] mb-1">Status active</div>
              <input type="checkbox" defaultChecked className="accent-[#FF6B00] w-4 h-4" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
