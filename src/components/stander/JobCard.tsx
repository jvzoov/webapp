'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/Avatar';
import { format } from 'date-fns';
import { formatINR } from '@/lib/utils';
import type { BookingWithDetails } from '@/types/database';

interface Props {
  job: BookingWithDetails;
  distance?: string;
  onAccept: (jobId: string) => Promise<void>;
  onSkip: (jobId: string) => void;
  isLoading: boolean;
}

export default function JobCard({ job, distance, onAccept, onSkip, isLoading }: Props) {
  const standerPayout = job.stander_payout;
  const startTime = new Date(job.start_time);

  return (
    <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-[#1A1612] leading-tight">
            {job.location?.name || 'Unknown Location'}
          </h3>
          <p className="font-mono text-[11px] text-[#8A8480] uppercase tracking-wider mt-0.5">
            {distance ? `${distance} · ` : ''}Starts {format(startTime, 'HH:mm')}
          </p>
        </div>
        <div className="font-bebas text-2xl text-[#1A7A4A]">
          {formatINR(standerPayout)}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Duration', value: `${job.estimated_hours} Hours` },
          { label: 'Purpose', value: job.instructions ? 'Specific' : 'General' },
          { label: 'Est. Queue', value: (job as any).location?.avg_wait_hours || '1-2h' },
          { label: 'Payment', value: 'On Completion' },
        ].map((item) => (
          <div key={item.label} className="bg-[#F7F4EE] rounded-lg p-2.5 border border-[#D4CFC6]/30">
            <p className="text-[9px] font-mono uppercase text-[#8A8480] tracking-widest mb-1">{item.label}</p>
            <p className="text-xs font-semibold text-[#5a4030]">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Client Bar */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Avatar 
            initials={job.client?.avatar_initials ?? job.client?.name?.slice(0, 2).toUpperCase() ?? '??'} 
            className="w-8 h-8 text-[11px] bg-blue-600"
          />
          <div>
            <p className="text-xs font-bold text-blue-900">{job.client?.name}</p>
            <p className="text-[10px] text-blue-700/70">Verified Client</p>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 py-0">NEW</Badge>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => onSkip(job.id)}
          disabled={isLoading}
          className="flex-1 py-4 text-xs font-mono tracking-widest text-[#8A8480] border-[#D4CFC6] hover:bg-black/5 uppercase h-auto"
        >
          SKIP
        </Button>
        <Button 
          onClick={() => onAccept(job.id)}
          loading={isLoading}
          disabled={isLoading}
          className="flex-[1.5] py-4 text-xs font-mono tracking-widest bg-[#1A7A4A] hover:bg-[#145d38] border-none uppercase shadow-lg shadow-green-900/10 h-auto"
        >
          ACCEPT
        </Button>
      </div>

      {/* Availability Overlay */}
      {job.status !== 'PENDING_MATCH' && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-10">
          <Badge className="bg-[#1A1612] text-white px-4 py-2 rounded-full text-xs font-bold border-none">
            No longer available
          </Badge>
        </div>
      )}
    </Card>
  );
}
