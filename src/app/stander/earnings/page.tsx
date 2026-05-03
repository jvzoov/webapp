import { auth } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import TopBar from '@/components/shared/TopBar';
import BottomNav from '@/components/shared/BottomNav';
import EarningsHero from '@/components/stander/EarningsHero';
import PayoutList from '@/components/stander/PayoutList';
import type { BookingWithDetails, StanderProfile } from '@/types/database';

async function getEarningsData(userId: string) {
  // 1. Profile
  const { data: profile } = await supabaseAdmin
    .from('stander_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  // 2. Completed jobs for this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthJobs } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      location:locations(name)
    `)
    .eq('stander_id', userId)
    .eq('status', 'COMPLETED')
    .gte('updated_at', startOfMonth.toISOString())
    .order('created_at', { ascending: false });

  const jobs = monthJobs as BookingWithDetails[] ?? [];
  const monthEarnings = jobs.reduce((sum, job) => sum + job.stander_payout, 0);
  const avg = jobs.length > 0 ? monthEarnings / jobs.length : 0;

  return {
    profile:       profile as StanderProfile,
    monthEarnings: Math.round(monthEarnings / 100),
    avgPerJob:     Math.round(avg / 100),
    jobs,
  };
}

export default async function EarningsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user = session.user as any;
  const { profile, monthEarnings, avgPerJob, jobs } = await getEarningsData(user.id);

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#F7F4EE' }}>
      <TopBar role="stander" userName={user.name} avatarInitials={user.avatarInitials} />

      <main style={{ flex: 1, padding: '16px', paddingBottom: '90px' }}>
        <EarningsHero
          totalEarningsRupees={monthEarnings}
          jobCount={jobs.length}
          avgPerJob={avgPerJob}
          rating={profile?.rating ?? 5.0}
          onTimePercent={profile?.on_time_percent ?? 100}
          streak={profile?.current_streak ?? 0}
          upiId={profile?.upi_id ?? ''}
        />

        <PayoutList bookings={jobs} />
      </main>

      <BottomNav role="stander" />
    </div>
  );
}
