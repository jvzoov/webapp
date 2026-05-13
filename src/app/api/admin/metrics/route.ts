import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Active Bookings
  const { count: activeBookings } = await supabaseAdmin
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .in('status', ['MATCHED', 'ACTIVE', 'ALERT']);

  // 2. Pending Match
  const { count: pendingMatch } = await supabaseAdmin
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING_MATCH')
    .eq('payment_status', 'PAID');

  // 3. Revenue Today
  const { data: revenueData } = await supabaseAdmin
    .from('bookings')
    .select('total_amount')
    .eq('payment_status', 'PAID')
    .gte('created_at', today.toISOString());
  
  const revenueToday = revenueData?.reduce((sum, b) => sum + b.total_amount, 0) || 0;

  // 4. Payouts Due
  const { data: payoutsData } = await supabaseAdmin
    .from('bookings')
    .select('stander_payout')
    .eq('status', 'COMPLETED')
    .eq('payment_status', 'PAID'); // Assuming paid out means payment_status becomes something else or tracked in another table
    // For simplicity, let's say "COMPLETED" and "PAID" means stander hasn't been paid by us yet if we don't have a payout_status.
    // In our app, we auto-payout on complete, but if it fails, it stays.
  
  const payoutsDue = payoutsData?.reduce((sum, b) => sum + b.stander_payout, 0) || 0;

  return NextResponse.json({
    activeBookings: activeBookings || 0,
    pendingMatch: pendingMatch || 0,
    revenueToday,
    payoutsDue
  });
}
