import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import AdminClient from '@/components/admin/AdminClient';
import type { BookingWithDetails } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Fetch Metrics
  const { count: activeCount } = await supabaseAdmin
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .in('status', ['MATCHED', 'ACTIVE', 'ALERT']);

  const { data: revenueData } = await supabaseAdmin
    .from('bookings')
    .select('total_amount')
    .eq('payment_status', 'PAID')
    .gte('created_at', today.toISOString());
  
  const revenueToday = revenueData?.reduce((sum, b) => sum + b.total_amount, 0) || 0;

  const { data: payoutsData } = await supabaseAdmin
    .from('bookings')
    .select('stander_payout')
    .eq('status', 'COMPLETED')
    .eq('payment_status', 'PAID');
  
  const payoutsDue = payoutsData?.reduce((sum, b) => sum + b.stander_payout, 0) || 0;

  // 2. Pending Match Bookings (Urgent)
  const { data: pendingMatch } = await supabaseAdmin
    .from('bookings')
    .select('*, location:locations(name), client:users!client_id(name, phone)')
    .eq('status', 'PENDING_MATCH')
    .eq('payment_status', 'PAID')
    .order('created_at', { ascending: true });

  // 3. Pipeline Bookings (Today)
  const { data: pipeline } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      location:locations(name),
      client:users!client_id(name, avatar_initials),
      stander:users!stander_id(name, avatar_initials)
    `)
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false });

  // 4. Standers
  const { data: standers } = await supabaseAdmin
    .from('stander_profiles')
    .select('*, user:users!user_id(id, name, phone, avatar_initials)')
    .order('is_online', { ascending: false });

  return (
    <div className="min-h-screen bg-[#0c0a06] text-[#f5ede0]">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-bebas text-5xl text-[#FF6B00] tracking-wide">COMMAND CENTER</h1>
            <p className="font-mono text-[10px] text-[#a08060] uppercase tracking-[0.2em]">QueuePe Operations Dashboard</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] text-[#a08060] uppercase tracking-widest">{today.toDateString()}</p>
            <p className="text-sm font-bold">Admin: {session.user.name}</p>
          </div>
        </div>

        <AdminClient 
          initialMetrics={{
            activeBookings: activeCount || 0,
            pendingMatch: pendingMatch?.length || 0,
            revenueToday,
            payoutsDue
          }}
          initialPendingMatch={(pendingMatch as any) || []}
          initialPipeline={(pipeline as any) || []}
          initialStanders={(standers as any) || []}
        />
      </div>
    </div>
  );
}
