import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const standerId = (session.user as any).id as string;
  const role = (session.user as any).role as string;
  if (role !== 'STANDER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Update booking status
  const { data: booking, error: updateErr } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'ALERT' })
    .eq('id', bookingId)
    .eq('stander_id', standerId)
    .select('client_id, location:locations(name)')
    .single();

  if (updateErr || !booking) {
    return NextResponse.json({ error: 'Booking not found or update failed' }, { status: 404 });
  }

  // Notify client
  if (booking.client_id) {
    const locName = (booking as any).location?.name ?? 'the location';
    await supabaseAdmin.from('notifications').insert({
      user_id: booking.client_id,
      type:    'ALERT',
      message: `🔔 Head to ${locName} NOW! Your turn is approaching.`,
    });
  }

  return NextResponse.json({ success: true });
}
