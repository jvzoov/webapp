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

  const userId = (session.user as any).id as string;
  const userName = (session.user as any).name as string;
  const role = (session.user as any).role as string;

  if (role !== 'STANDER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Use a secure update with status check to prevent race conditions
  const { data: booking, error: updateErr } = await supabaseAdmin
    .from('bookings')
    .update({
      stander_id: userId,
      status:     'MATCHED',
    })
    .eq('id', bookingId)
    .eq('status', 'PENDING_MATCH')
    .select('client_id, location:locations(name)')
    .single();

  if (updateErr || !booking) {
    return NextResponse.json({ error: 'Job no longer available' }, { status: 409 });
  }

  // Notify client
  if (booking.client_id) {
    const locName = (booking as any).location?.name ?? 'the location';
    await supabaseAdmin.from('notifications').insert({
      user_id: booking.client_id,
      type:    'MATCHED',
      message: `Stander matched! ${userName} is heading to ${locName}`,
    });
  }

  // Broadcast to client via Realtime
  try {
    await supabaseAdmin.channel(`booking-${bookingId}`).send({
      type:    'broadcast',
      event:   'matched',
      payload: {
        type:   'matched',
        stander: {
          name:            userName,
          avatar_initials: userName.slice(0, 2).toUpperCase(),
        },
      },
    });
  } catch {}

  return NextResponse.json({ success: true, jobId: bookingId });
}
