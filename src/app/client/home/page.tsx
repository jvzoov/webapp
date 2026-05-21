import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import TopBar from '@/components/shared/TopBar';
import BottomNav from '@/components/shared/BottomNav';
import ActiveBookingBanner from '@/components/client/ActiveBookingBanner';
import LocationGrid from '@/components/client/LocationGrid';
import type { BookingWithDetails, Location } from '@/types/database';

/**
 * Client Home Page
 * Displays active booking status and the selection grid for new bookings.
 */
export default async function ClientHomePage() {
  const session = await auth();

  // 1. Auth & Role Guards
  if (!session?.user) redirect('/login');
  if (session.user.role === 'STANDER') redirect('/stander/home');
  if (session.user.role === 'ADMIN') redirect('/admin/dashboard');

  const supabase = await createServerSupabaseClient();
  const userId = session.user.id;

  // 2. Fetch Locations
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .order('category');

  // 3. Fetch Most Recent Active Booking
  const { data: activeBookingData } = await supabase
    .from('bookings')
    .select(`
      *,
      location:locations(name),
      stander:users!bookings_stander_id_fkey(name, avatar_initials, phone)
    `)
    .eq('client_id', userId)
    .in('status', ['PENDING_MATCH', 'MATCHED', 'ACTIVE', 'ALERT'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const activeBooking = activeBookingData as BookingWithDetails | null;

  return (
    <div className="max-w-[480px] mx-auto bg-[#F7F4EE] min-h-screen flex flex-col relative overflow-x-hidden">
      
      {/* ─── TOP BAR ──────────────────────────────────────── */}
      <TopBar 
        role="client" 
        userName={session.user.name ?? 'User'} 
        avatarInitials={session.user.avatarInitials} 
      />

      <main className="flex-1 overflow-y-auto pb-24">
        
        {/* ─── HERO BAND ────────────────────────────────────── */}
        <div className="bg-[#1A1612] text-white px-5 pb-8 pt-4">
          <p className="font-mono text-[10px] text-[#FF6B00] tracking-[.12em] uppercase mb-4">
            India&apos;s Queue Problem, Solved
          </p>
          <h1 className="font-bebas text-5xl leading-none mb-6">
            Skip The <span className="text-[#FF6B00]">LINE.</span>
          </h1>
          <p className="italic text-white/50 text-sm leading-relaxed mb-8 max-w-[90%]">
            &quot;We send a verified Stander to hold your spot at any RTO, hospital, bank or government office — while you carry on with your day.&quot;
          </p>
          
          <div className="flex gap-2 flex-wrap">
            {['₹150/hr', '15min match', '4.8★ rating'].map((stat) => (
              <div key={stat} className="font-mono text-[10px] px-3 py-1.5 border border-white/10 rounded-full bg-white/5 text-white/60">
                {stat}
              </div>
            ))}
          </div>
        </div>

        {/* ─── ACTIVE BOOKING ───────────────────────────────── */}
        {activeBooking && (
          <ActiveBookingBanner initialBooking={activeBooking} />
        )}

        {/* ─── LOCATION SECTION ─────────────────────────────── */}
        <div className="px-4 mt-8">
          <h2 className="font-mono text-[10px] tracking-[.12em] text-[#5a4030] uppercase mb-4 opacity-70">
            SELECT YOUR QUEUE
          </h2>
          
          <LocationGrid locations={locations as Location[] ?? []} />
        </div>

      </main>

      {/* ─── BOTTOM NAV ────────────────────────────────────── */}
      <BottomNav role="client" />

    </div>
  );
}
