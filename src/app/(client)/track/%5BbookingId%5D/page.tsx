import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import TopBar from '@/components/shared/TopBar';
import BottomNav from '@/components/shared/BottomNav';
import TrackingClient from '@/components/client/TrackingClient';
import type { BookingWithDetails } from '@/types/database';

interface Props {
  params: Promise<{ bookingId: string }>;
}

/**
 * Live Tracking Page
 * Server Component fetching initial state for the client to take over.
 */
export default async function TrackingPage({ params }: Props) {
  const { bookingId } = await params;
  const session = await auth();

  if (!session?.user) redirect('/login');
  if (session.user.role !== 'CLIENT') redirect('/stander/home');

  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      location:locations(*),
      stander:users!bookings_stander_id_fkey(*),
      stander_profile:stander_profiles!bookings_stander_id_fkey(*),
      check_ins(*)
    `)
    .eq('id', bookingId)
    .single();

  if (error || !booking) {
    redirect('/client/home');
  }

  // Security: Only the client who booked it can track it
  if (booking.client_id !== session.user.id) {
    redirect('/client/home');
  }

  const checkIns = (booking as any).check_ins || [];

  return (
    <div className="max-w-[480px] mx-auto bg-[#F7F4EE] min-h-screen flex flex-col relative overflow-x-hidden">
      
      <TopBar 
        role="client" 
        userName={session.user.name ?? ''} 
        showBack 
        title="Live Tracking" 
      />

      <main className="flex-1 overflow-y-auto">
        <TrackingClient 
          initialBooking={booking as BookingWithDetails} 
          initialCheckins={checkIns}
        />
      </main>

      <BottomNav role="client" />
    </div>
  );
}
