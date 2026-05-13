import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import TopBar from '@/components/shared/TopBar';
import BottomNav from '@/components/shared/BottomNav';
import EarningsBar from '@/components/stander/EarningsBar';
import JobFeedClient from '@/components/stander/JobFeedClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { BookingWithDetails } from '@/types/database';

/**
 * Stander Home Page
 * Displays earnings dashboard and a real-time feed of available jobs.
 */
export default async function StanderHomePage() {
  const session = await auth();

  if (!session?.user) redirect('/login');
  if (session.user.role !== 'STANDER') redirect('/client/home');

  const userId = session.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Fetch Profile & Stats
  const { data: profile } = await supabaseAdmin
    .from('stander_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  // 2. Fetch Today's Earnings
  const { data: todayEarningsData } = await supabaseAdmin
    .from('bookings')
    .select('stander_payout')
    .eq('stander_id', userId)
    .eq('status', 'COMPLETED')
    .gte('created_at', today.toISOString());

  const todayEarnings = todayEarningsData?.reduce((sum, b) => sum + b.stander_payout, 0) || 0;
  const todayCount = todayEarningsData?.length || 0;

  // 3. Fetch Available Jobs (Pending Match & Paid)
  const { data: jobs } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      location:locations(*),
      client:users!bookings_client_id_fkey(name, avatar_initials)
    `)
    .eq('status', 'PENDING_MATCH')
    .eq('payment_status', 'PAID')
    .is('stander_id', null)
    .order('start_time', { ascending: true })
    .limit(20);

  // 4. Check for Active Job
  const { data: activeJob } = await supabaseAdmin
    .from('bookings')
    .select('id, location:locations(name), status')
    .eq('stander_id', userId)
    .in('status', ['MATCHED', 'ACTIVE', 'ALERT'])
    .maybeSingle();

  return (
    <div className="max-w-[480px] mx-auto bg-[#F7F4EE] min-h-screen flex flex-col relative overflow-x-hidden">
      
      <TopBar 
        role="stander" 
        userName={session.user.name ?? ''} 
        avatarInitials={session.user.avatarInitials} 
      />

      <EarningsBar 
        earnings={todayEarnings} 
        streak={profile?.streak ?? 0} 
        jobCount={todayCount} 
      />

      <main className="flex-1 overflow-y-auto">
        
        {/* Active Job Banner */}
        {activeJob && (
          <div className="p-4">
            <Card accentColor="saffron" className="bg-[#1A1612] text-white border-none shadow-xl shadow-[#FF6B00]/10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-mono text-[9px] text-[#FF6B00] tracking-widest uppercase mb-1">Current Job</p>
                  <h4 className="font-bold text-sm">{activeJob.location?.name}</h4>
                </div>
                <Link href={`/stander/job/${activeJob.id}`}>
                  <Button size="sm" className="bg-[#FF6B00] hover:bg-[#e05e00] border-none text-[10px] tracking-widest font-mono h-8 px-4">
                    RESUME →
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}

        <JobFeedClient 
          initialJobs={(jobs as any) || []} 
          standerId={userId} 
        />

      </main>

      <BottomNav role="stander" />
    </div>
  );
}
