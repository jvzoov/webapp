import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { z } from 'zod';

const schema = z.object({
  rating:  z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Fetch booking to verify ownership and status
  const { data: booking, error: fetchErr } = await supabaseAdmin
    .from('bookings')
    .select('id, client_id, status, stander_id')
    .eq('id', bookingId)
    .single();

  if (fetchErr || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (booking.client_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (booking.status !== 'COMPLETED') {
    return NextResponse.json({ error: 'Only completed bookings can be reviewed' }, { status: 400 });
  }

  if (!booking.stander_id) {
    return NextResponse.json({ error: 'No stander assigned to this booking' }, { status: 400 });
  }

  // 2. Validate Body
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  // 3. Insert Review
  const { error: insertErr } = await supabaseAdmin
    .from('reviews')
    .insert({
      booking_id: bookingId,
      client_id:  session.user.id,
      stander_id: booking.stander_id,
      rating:     parsed.data.rating,
      comment:    parsed.data.comment || null,
    });

  if (insertErr) {
    // Unique constraint will handle duplicate reviews
    if (insertErr.code === '23505') {
      return NextResponse.json({ error: 'You have already reviewed this booking' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
  }

  // 4. Update Stander Rating (Running Average)
  const { data: allReviews } = await supabaseAdmin
    .from('reviews')
    .select('rating')
    .eq('stander_id', booking.stander_id);

  if (allReviews && allReviews.length > 0) {
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await supabaseAdmin
      .from('stander_profiles')
      .update({ 
        rating:    Number(avgRating.toFixed(1)),
        job_count: allReviews.length 
      })
      .eq('user_id', booking.stander_id);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
