import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in dev' }, { status: 403 });
  }

  const { bookingId, position } = await req.json();

  // Get stander_id from booking
  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('stander_id')
    .eq('id', bookingId)
    .single();

  if (!booking?.stander_id) {
    return NextResponse.json({ error: 'No stander matched yet' }, { status: 400 });
  }

  // Create check-in
  const { data, error } = await supabaseAdmin
    .from('check_ins')
    .insert({
      booking_id: bookingId,
      stander_id: booking.stander_id,
      latitude:   12.9344, // Mock Bangalore Lat
      longitude:  77.6192, // Mock Bangalore Lng
      queue_position: position || 5,
      estimated_minutes: (position || 5) * 10,
      is_alert: (position || 5) <= 2,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If position is low, set booking status to ALERT
  if ((position || 5) <= 2) {
    await supabaseAdmin
      .from('bookings')
      .update({ status: 'ALERT' })
      .eq('id', bookingId);
  }

  return NextResponse.json(data);
}
