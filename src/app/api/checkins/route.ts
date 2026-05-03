import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const standerId = (session.user as any).id as string;
  const role = (session.user as any).role as string;
  if (role !== 'STANDER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { bookingId, latitude, longitude, selfieUrl, queuePosition, estimatedMinutes } = body;

  if (!bookingId || !latitude || !longitude) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Verify booking belongs to stander and is MATCHED or ACTIVE
  const { data: booking, error: bookingErr } = await supabaseAdmin
    .from('bookings')
    .select('id, status, client_id')
    .eq('id', bookingId)
    .eq('stander_id', standerId)
    .single();

  if (bookingErr || !booking) {
    return NextResponse.json({ error: 'Invalid booking' }, { status: 400 });
  }

  // Insert check-in
  const { data: checkIn, error: insertErr } = await supabaseAdmin
    .from('check_ins')
    .insert({
      booking_id:        bookingId,
      stander_id:        standerId,
      latitude,
      longitude,
      selfie_url:        selfieUrl ?? null,
      queue_position:    queuePosition ? parseInt(queuePosition) : null,
      estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
    })
    .select('id')
    .single();

  if (insertErr || !checkIn) {
    return NextResponse.json({ error: 'Failed to save check-in' }, { status: 500 });
  }

  // Update booking status if first check-in (MATCHED -> ACTIVE)
  if (booking.status === 'MATCHED') {
    await supabaseAdmin
      .from('bookings')
      .update({ status: 'ACTIVE' })
      .eq('id', bookingId);
  }

  // Notify client (optional: every Nth check-in or if wait drops below threshold)
  // For now, just rely on Realtime.

  return NextResponse.json({ success: true, checkInId: checkIn.id });
}
