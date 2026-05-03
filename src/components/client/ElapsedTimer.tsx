'use client';

import { useState, useEffect } from 'react';

interface Props {
  startTime: string;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function ElapsedTimer({ startTime }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const tick  = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const mm = Math.floor(elapsed / 60);
  const ss = elapsed % 60;

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize:   '36px',
          color:      '#FF6B00',
          letterSpacing: '0.06em',
        }}
      >
        {pad(mm)}:{pad(ss)}
      </div>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#8A8480', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        Elapsed Time
      </div>
    </div>
  );
}
