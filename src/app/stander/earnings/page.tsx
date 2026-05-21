import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import TopBar from '@/components/shared/TopBar';
import BottomNav from '@/components/shared/BottomNav';
import EarningsHero from '@/components/stander/EarningsHero';
import WithdrawCard from '@/components/stander/WithdrawCard';
import PayoutList from '@/components/stander/PayoutList';
import type { BookingWithDetails } from '@/types/database';

/**
 * Stander Earnings Page
 * Server Component fetching financial summaries and payout history.
 */
export default async function StanderEarningsPage() {
  const session = await auth();

  if (!session?.user) redirect('/login');
  if (session.user.role !== 'STANDER') redirect('/client/home');

  const userId = session.user.id;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // 1. Fetch Profile & Balance
  const { data: profile } = await supabaseAdmin
    .from('stander_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  // 2. Fetch This Month's Completed Bookings
  const { data: monthBookings } = await supabaseAdmin
    .from('bookings')
    .select('*, location:locations(name)')
    .eq('stander_id', userId)
    .eq('status', 'COMPLETED')
    .gte('created_at', monthStart.toISOString())
    .order('created_at', { ascending: false });

  const totalEarningsThisMonth = monthBookings?.reduce((sum, b) => sum + b.stander_payout, 0) || 0;
  const jobCount = monthBookings?.length || 0;
  const avgPerJob = jobCount > 0 ? totalEarningsThisMonth / jobCount : 0;

  // 3. Fetch Recent Payouts (Last 10)
  const { data: recentBookings } = await supabaseAdmin
    .from('bookings')
    .select('*, location:locations(name)')
    .eq('stander_id', userId)
    .eq('status', 'COMPLETED')
    .order('created_at', { ascending: false })
    .limit(10);

  // Action helper for UPI update
  async function updateUPI(upi: string) {
    'use server';
    const s = await auth();
    if (!s?.user) return;
    await supabaseAdmin
      .from('stander_profiles')
      .update({ upi_id: upi })
      .eq('user_id', s.user.id);
  }

  return (
    <div className="max-w-[480px] mx-auto bg-[#F7F4EE] min-h-screen flex flex-col relative overflow-x-hidden">
      
      <TopBar 
        role="stander" 
        userName={session.user.name ?? ''} 
        title="My Earnings" 
      />

      <main className="flex-1 overflow-y-auto">
        
        <EarningsHero 
          totalEarningsPaise={totalEarningsThisMonth}
          jobCount={jobCount}
          avgPerJob={avgPerJob}
          rating={profile?.rating ?? 5.0}
          onTimePercent={profile?.on_time_percent ?? 100}
          streak={profile?.current_streak ?? 0}
        />

        <WithdrawCard 
          balance={profile?.total_earnings ?? 0}
          upiId={profile?.upi_id ?? null}
          onUpdateUPI={updateUPI}
        />

        <PayoutList bookings={(recentBookings as any) || []} />

      </main>

      <BottomNav role="stander" />
    </div>
  );
}
