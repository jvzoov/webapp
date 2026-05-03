import { auth } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import TopBar from '@/components/shared/TopBar';
import BottomNav from '@/components/shared/BottomNav';
import BookingHistoryCard from '@/components/client/BookingHistoryCard';
import { Toaster } from 'react-hot-toast';
import type { BookingWithDetails } from '@/types/database';

async function getHistory(userId: string): Promise<BookingWithDetails[]> {
  const { data } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      location:locations(*),
      client:users!bookings_client_id_fkey(id, name, avatar_initials, phone),
      stander:users!bookings_stander_id_fkey(id, name, avatar_initials, phone),
      review:reviews(*)
    `)
    .eq('client_id', userId)
    .order('created_at', { ascending: false });

  return (data ?? []) as BookingWithDetails[];
}

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userId   = (session.user as any).id as string;
  const user     = session.user as any;
  const bookings = await getHistory(userId);

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <Toaster position="top-center" />
      <TopBar role="client" userName={user.name} avatarInitials={user.avatarInitials} />

      <div style={{ background: '#1A1612', padding: '14px 16px' }}>
        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '32px', color: '#f5ede0', lineHeight: 1 }}>
          Booking History
        </h1>
      </div>

      <main style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '90px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: '#8A8480' }}>No bookings yet</div>
            <div style={{ fontSize: '14px', color: '#B8B4B0', marginTop: '4px' }}>
              Book your first stander to get started
            </div>
          </div>
        ) : (
          bookings.map((b) => <BookingHistoryCard key={b.id} booking={b} />)
        )}
      </main>

      <BottomNav role="client" />
    </div>
  );
}
