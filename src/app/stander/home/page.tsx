import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import TopBar from '@/components/shared/TopBar';
import BottomNav from '@/components/shared/BottomNav';
import EarningsBar from '@/components/stander/EarningsBar';
import JobCard from '@/components/stander/JobCard';
import type { BookingWithDetails, StanderProfile } from '@/types/database';

async function getStanderData(userId: string) {
  // 1. Profile
  const { data: profile } = await supabaseAdmin
    .from('stander_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  // 2. Today's earnings
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data: todayJobs } = await supabaseAdmin
    .from('bookings')
    .select('stander_payout')
    .eq('stander_id', userId)
    .eq('status', 'COMPLETED')
    .gte('updated_at', startOfDay.toISOString());

  const todayEarnings = todayJobs?.reduce((sum, job) => sum + job.stander_payout, 0) ?? 0;
  const todayCount    = todayJobs?.length ?? 0;

  // 3. Available jobs
  const { data: jobs } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      location:locations(*),
      client:users!bookings_client_id_fkey(name, avatar_initials)
    `)
    .eq('status', 'PENDING_MATCH')
    .eq('payment_status', 'PAID')
    .order('created_at', { ascending: true })
    .limit(10);

  return {
    profile:       profile as StanderProfile,
    todayEarnings: todayEarnings,
    todayCount,
    jobs:          (jobs ?? []) as BookingWithDetails[],
  };
}

export default async function StanderHomePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { user } = session;
  const { profile, todayEarnings, todayCount, jobs } = await getStanderData(user.id);

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#F7F4EE' }}>
      <TopBar role="stander" userName={user.name} avatarInitials={user.avatarInitials} />

      <EarningsBar
        earnings={todayEarnings}
        streak={profile?.current_streak ?? 0}
        jobCount={todayCount}
      />

      <main style={{ flex: 1, padding: '16px', paddingBottom: '90px' }}>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#8A8480', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
          Available Jobs Near You
        </div>

        {jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: '#1A1612' }}>No jobs right now</div>
            <div style={{ fontSize: '14px', color: '#8A8480', marginTop: '4px' }}>
              We&apos;ll notify you when a new job pops up in your area.
            </div>
            <button
              style={{
                marginTop: '20px',
                background: 'transparent',
                border: '1px solid #1A7A4A',
                color: '#1A7A4A',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Enable Notifications
            </button>
          </div>
        ) : (
          jobs.map((job) => (
            <JobCard key={job.id} job={job} onAccept={() => {}} />
          ))
        )}
      </main>

      <BottomNav role="stander" />
    </div>
  );
}
