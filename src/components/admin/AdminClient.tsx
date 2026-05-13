'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/Separator';
import { Switch } from '@/components/ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { formatDistanceToNow } from 'date-fns';
import { formatINR } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { BookingWithDetails, BookingStatus } from '@/types/database';

interface Metrics {
  activeBookings: number;
  pendingMatch: number;
  revenueToday: number;
  payoutsDue: number;
}

interface Props {
  initialMetrics: Metrics;
  initialPendingMatch: BookingWithDetails[];
  initialPipeline: BookingWithDetails[];
  initialStanders: any[];
}

export default function AdminClient({ initialMetrics, initialPendingMatch, initialPipeline, initialStanders }: Props) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [pendingMatch, setPendingMatch] = useState(initialPendingMatch);
  const [pipeline, setPipeline] = useState(initialPipeline);
  const [standers, setStanders] = useState(initialStanders);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);

  // 1. Real-time updates
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel('admin-pipeline')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, async (payload) => {
        // Refresh metrics and pipeline on any change
        refreshAll();
      })
      .subscribe();

    const interval = setInterval(refreshMetrics, 30000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  async function refreshMetrics() {
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) setMetrics(await res.json());
    } catch (e) {}
  }

  async function refreshAll() {
    // In a real app, you'd fetch all specific sections or use a single "refresh" API
    refreshMetrics();
    // Simplified: re-fetch from client or wait for refresh interval
    window.location.reload(); 
  }

  const handleAssign = async (bookingId: string, standerId: string) => {
    setIsAssigning(bookingId);
    try {
      const res = await fetch('/api/admin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, standerId }),
      });
      if (res.ok) {
        toast.success('Stander assigned successfully');
        refreshAll();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Assignment failed');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setIsAssigning(null);
    }
  };

  const toggleOnline = async (standerId: string) => {
    try {
      const res = await fetch(`/api/admin/stander/${standerId}/toggle-online`, { method: 'PATCH' });
      if (res.ok) {
        const { is_online } = await res.json();
        setStanders(prev => prev.map(s => s.user_id === standerId ? { ...s, is_online } : s));
        toast.success(`Stander is now ${is_online ? 'online' : 'offline'}`);
      }
    } catch (e) {
      toast.error('Toggle failed');
    }
  };

  const getPipelineForStatus = (status: BookingStatus) => {
    return pipeline.filter(b => b.status === status);
  };

  return (
    <div className="space-y-8">
      
      {/* 1. METRICS STRIP */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'ACTIVE BOOKINGS', val: metrics.activeBookings, color: 'text-blue-400' },
          { label: 'PENDING MATCH', val: metrics.pendingMatch, color: metrics.pendingMatch > 0 ? 'text-[#FF6B00] animate-pulse' : 'text-[#a08060]' },
          { label: 'REVENUE TODAY', val: formatINR(metrics.revenueToday), color: 'text-green-400' },
          { label: 'PAYOUTS DUE', val: formatINR(metrics.payoutsDue), color: 'text-purple-400' },
        ].map((m) => (
          <Card key={m.label} className="bg-[#1f180e] border-[#362a16] p-4">
            <p className="font-mono text-[10px] text-[#a08060] tracking-widest uppercase mb-1">{m.label}</p>
            <p className={`font-bebas text-4xl ${m.color}`}>{m.val}</p>
          </Card>
        ))}
      </div>

      {/* 2. URGENT: UNMATCHED PANEL */}
      {pendingMatch.length > 0 && (
        <Card className="border-red-900 bg-red-900/10 p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">⚠️</span>
            <h3 className="font-bold text-red-500 uppercase tracking-widest text-sm">
              {pendingMatch.length} UNMATCHED PAID BOOKINGS
            </h3>
          </div>
          <div className="space-y-2">
            {pendingMatch.map((b) => (
              <div key={b.id} className="bg-black/40 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">{(b as any).client?.name} · {(b as any).location?.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Waiting for {formatDistanceToNow(new Date(b.created_at))}</p>
                </div>
                <div className="flex gap-2">
                  <Select onValueChange={(val) => handleAssign(b.id, val)}>
                    <SelectTrigger className="w-[180px] bg-black border-red-900/50 text-xs h-8">
                      <SelectValue placeholder="Manual Assign" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-gray-800">
                      {standers.filter(s => s.is_online).map(s => (
                        <SelectItem key={s.user_id} value={s.user_id}>
                          {s.user?.name} ({s.rating}★)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 3. KANBAN PIPELINE */}
      <div className="grid grid-cols-5 gap-4 h-[500px]">
        {['PENDING_MATCH', 'MATCHED', 'ACTIVE', 'ALERT', 'COMPLETED'].map((status) => {
          const list = getPipelineForStatus(status as BookingStatus);
          return (
            <div key={status} className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-1">
                <span className="font-mono text-[10px] text-[#a08060] uppercase tracking-widest">{status.replace('_', ' ')}</span>
                <Badge className="bg-[#362a16] text-[#a08060] border-none">{list.length}</Badge>
              </div>
              <div className="flex-1 bg-black/40 rounded-xl p-2 space-y-2 overflow-y-auto scrollbar-hide border border-white/5">
                {list.map((b) => {
                  const minutesInStatus = (Date.now() - new Date(b.updated_at).getTime()) / 60000;
                  return (
                    <Card key={b.id} className={`p-2.5 bg-[#1f180e] border-[#362a16] hover:border-[#FF6B00]/50 transition-colors cursor-pointer ${minutesInStatus > 60 ? 'border-red-900/50' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-[11px] font-bold truncate">{(b as any).client?.name}</p>
                        {minutesInStatus > 60 && <span title="Stagnant > 1hr">🚩</span>}
                      </div>
                      <p className="text-[10px] text-[#a08060] truncate">{(b as any).location?.name}</p>
                      <Separator className="my-2 bg-[#362a16]" />
                      <p className="text-[9px] font-mono text-gray-500 uppercase">
                        {(b as any).stander?.name || 'Searching...'}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. STANDER TABLE */}
      <div className="space-y-4">
        <h3 className="font-bebas text-2xl text-[#FF6B00]">STANDER FLEET</h3>
        <Card className="bg-[#1f180e] border-[#362a16] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/40 font-mono text-[#a08060] uppercase tracking-widest">
              <tr>
                <th className="p-4">Stander</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Jobs</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#362a16]">
              {standers.map((s) => (
                <tr key={s.user_id} className="hover:bg-white/5">
                  <td className="p-4">
                    <div className="font-bold">{s.user?.name}</div>
                    <div className="text-[10px] text-gray-500">{s.user?.phone}</div>
                  </td>
                  <td className="p-4 font-mono">{s.rating}★</td>
                  <td className="p-4 font-mono">{s.job_count}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={s.is_online} onCheckedChange={() => toggleOnline(s.user_id)} />
                      <span className={s.is_online ? 'text-green-500' : 'text-gray-500'}>{s.is_online ? 'ONLINE' : 'OFFLINE'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right flex gap-2 justify-end">
                    <Button variant="outline" size="sm" className="text-[9px] h-7 border-[#362a16] uppercase font-mono">View</Button>
                    <Button variant="danger" size="sm" className="text-[9px] h-7 uppercase font-mono">Suspend</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

    </div>
  );
}
