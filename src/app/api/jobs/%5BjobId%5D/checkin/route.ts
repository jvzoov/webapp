import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { haversineKm } from '@/lib/utils';
import { z } from 'zod';

const schema = z.object({
  latitude:          z.number(),
  longitude:         z.number(),
  queuePosition:     z.number().min(0),
  estimatedMinutes:  z.number().min(0),
  photoUrl:          z.string().optional(),
  isAlert:           z.boolean().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== 'STANDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { latitude, longitude, queuePosition, estimatedMinutes, photoUrl, isAlert } = parsed.data;

  // 1. Fetch booking to verify
  const { data: booking, error: fetchErr } = await supabaseAdmin
    .from('bookings')
    .select('*, location:locations(lat, lng, name), client:users(name)')
    .eq('id', jobId)
    .single();

  if (fetchErr || !booking) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (booking.stander_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 2. Verify Geo-Fence (Stander must be within 500m of location)
  if (booking.location?.lat && booking.location?.lng) {
    const dist = haversineKm(latitude, longitude, booking.location.lat, booking.location.lng);
    if (dist > 0.5) {
      return NextResponse.json({ error: `Too far from location (${(dist * 1000).toFixed(0)}m). Please head to ${booking.location.name}.` }, { status: 400 });
    }
  }

  // 3. Create Check-in
  const { data: checkIn, error: checkInErr } = await supabaseAdmin
    .from('check_ins')
    .insert({
      booking_id:        jobId,
      stander_id:        session.user.id,
      latitude,
      longitude,
      queue_position:    queuePosition,
      estimated_minutes: estimatedMinutes,
      photo_url:         photoUrl || null,
      is_alert:          isAlert || false,
    })
    .select()
    .single();

  if (checkInErr) {
    return NextResponse.json({ error: 'Failed to record check-in' }, { status: 500 });
  }

  // 4. Update Booking Status
  let newStatus = booking.status;
  if (booking.status === 'MATCHED') newStatus = 'ACTIVE';
  if (isAlert) newStatus = 'ALERT';

  await supabaseAdmin
    .from('bookings')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', jobId);

  // 5. Notify Client (Realtime Broadcast)
  try {
    await supabaseAdmin.channel(`booking-track:${jobId}`).send({
      type: 'broadcast',
      event: 'checkin',
      payload: checkIn
    });
    
    if (newStatus === 'ALERT') {
      await supabaseAdmin.from('notifications').insert({
        user_id: booking.client_id,
        type: 'ALERT',
        message: `Your turn is near! Only ${queuePosition} people ahead at ${booking.location?.name}.`
      });
    }
  } catch (err) {
    console.error('[Checkin] Notification error:', err);
  }

  return NextResponse.json(checkIn);
}
