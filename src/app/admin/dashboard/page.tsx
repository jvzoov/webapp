import { auth } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { BookingWithDetails } from '@/types/database';

async function getAdminData() {
  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      location:locations(name),
      client:users!bookings_client_id_fkey(name, phone),
      stander:users!bookings_stander_id_fkey(name, phone)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  const { data: standers } = await supabaseAdmin
    .from('users')
    .select(`
      id, name, phone,
      stander_profiles(is_online, rating, job_count)
    `)
    .eq('role', 'STANDER');

  return { bookings: (bookings ?? []) as BookingWithDetails[], standers: standers ?? [] };
}

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    redirect('/login');
  }

  const { bookings, standers } = await getAdminData();

  const activeBookings = bookings.filter(b => ['MATCHED', 'ACTIVE', 'ALERT'].includes(b.status));
  const pendingBookings = bookings.filter(b => b.status === 'PENDING_MATCH' && b.payment_status === 'PAID');

  const onlineStanders = standers.filter(s => (s.stander_profiles as any)?.[0]?.is_online);

  return (
    <div className="min-h-screen bg-[#F7F4EE]">
      <header className="bg-[#1A1612] text-white p-4 sticky top-0 z-50">
        <h1 className="font-display text-2xl tracking-wide">QUEUEPE ADMIN</h1>
      </header>

      <main className="p-4 max-w-5xl mx-auto space-y-6 pb-20">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Jobs', val: activeBookings.length, color: 'text-[#1A7A4A]' },
            { label: 'Pending Match', val: pendingBookings.length, color: 'text-[#FF6B00]' },
            { label: 'Online Standers', val: onlineStanders.length, color: 'text-blue-500' },
            { label: 'Total Standers', val: standers.length, color: 'text-white' },
          ].map(s => (
            <Card key={s.label} className="bg-[#1A1612] border-none text-center p-6">
              <div className={`font-display text-4xl ${s.color}`}>{s.val}</div>
              <div className="font-mono text-[10px] text-[#8A8480] uppercase tracking-widest mt-2">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Live Bookings */}
        <div>
          <h2 className="font-mono text-xs text-[#8A8480] uppercase tracking-widest mb-3">Recent Bookings</h2>
          <div className="space-y-3">
            {bookings.slice(0, 15).map(b => (
              <Card key={b.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{b.location?.name}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="text-xs text-[#8A8480]">
                    Client: {b.client?.name} ({b.client?.phone})
                    <br />
                    Stander: {b.stander ? `${b.stander.name} (${b.stander.phone})` : 'Unassigned'}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="font-display text-xl text-[#FF6B00]">₹{Math.round(b.total_amount / 100)}</div>
                    <div className="text-xs text-[#8A8480]">Amount</div>
                  </div>
                  
                  {b.status === 'PENDING_MATCH' && b.payment_status === 'PAID' && (
                    <button className="bg-[#FF6B00] text-white px-3 py-1.5 rounded text-xs font-mono tracking-wide">
                      MANUAL ASSIGN
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
