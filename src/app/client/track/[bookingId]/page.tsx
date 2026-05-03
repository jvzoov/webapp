import { auth } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { notFound, redirect } from 'next/navigation';
import TopBar from '@/components/shared/TopBar';
import BottomNav from '@/components/shared/BottomNav';
import TrackingCard from '@/components/client/TrackingCard';
import type { BookingWithDetails } from '@/types/database';

interface Props {
  params: Promise<{ bookingId: string }>;
}

async function getBooking(bookingId: string, userId: string): Promise<BookingWithDetails | null> {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      location:locations(*),
      client:users!bookings_client_id_fkey(id, name, avatar_initials, phone),
      stander:users!bookings_stander_id_fkey(id, name, avatar_initials, phone),
      review:reviews(*)
    `)
    .eq('id', bookingId)
    .eq('client_id', userId)
    .single();

  if (error || !data) return null;

  // Also fetch check-ins
  const { data: checkIns } = await supabaseAdmin
    .from('check_ins')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true });

  return { ...data, check_ins: checkIns ?? [] } as BookingWithDetails;
}

export default async function TrackPage({ params }: Props) {
  const { bookingId } = await params;
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userId = (session.user as any).id as string;
  const booking = await getBooking(bookingId, userId);

  if (!booking) notFound();

  const user = session.user as any;

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <TopBar
        role="client"
        userName={user.name}
        avatarInitials={user.avatarInitials}
      />

      {/* Booking header */}
      <div style={{ background: '#1A1612', padding: '14px 16px' }}>
        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#FF6B00', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Live Tracking
        </p>
        <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', color: '#f5ede0', lineHeight: 1, marginTop: '2px' }}>
          {booking.location?.name ?? 'Your Booking'}
        </h2>
        <p style={{ fontSize: '12px', color: '#a08060', marginTop: '4px' }}>{booking.location_address}</p>
      </div>

      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        <TrackingCard initialBooking={booking} />
      </main>

      <BottomNav role="client" />
    </div>
  );
}
