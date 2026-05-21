import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import TopBar from '@/components/shared/TopBar';
import BottomNav from '@/components/shared/BottomNav';
import HistoryClient from '@/components/client/HistoryClient';
import type { BookingWithDetails } from '@/types/database';

/**
 * Booking History Page
 * Server Component fetching all historical bookings for the client.
 */
export default async function HistoryPage() {
  const session = await auth();

  if (!session?.user) redirect('/login');
  if (session.user.role !== 'CLIENT') redirect('/stander/home');

  const { data: bookings, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      location:locations(name, icon),
      stander:users!bookings_stander_id_fkey(name, avatar_initials),
      review:reviews(*)
    `)
    .eq('client_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[History] Fetch error:', error);
  }

  return (
    <div className="max-w-[480px] mx-auto bg-[#F7F4EE] min-h-screen flex flex-col relative overflow-x-hidden">
      
      <TopBar 
        role="client" 
        userName={session.user.name ?? ''} 
        showBack 
        title="Booking History" 
      />

      <main className="flex-1 overflow-y-auto">
        <HistoryClient initialBookings={(bookings as any) || []} />
      </main>

      <BottomNav role="client" />
    </div>
  );
}
