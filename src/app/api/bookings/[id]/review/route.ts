import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase/admin';

const schema = z.object({
  rating:  z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const role   = (session.user as any).role as string;
  if (role !== 'CLIENT') return NextResponse.json({ error: 'Clients only' }, { status: 403 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  // Verify booking is COMPLETED and belongs to client
  const { data: booking, error: bookingErr } = await supabaseAdmin
    .from('bookings')
    .select('id, stander_id, status, client_id')
    .eq('id', bookingId)
    .eq('client_id', userId)
    .single();

  if (bookingErr || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  if (booking.status !== 'COMPLETED') {
    return NextResponse.json({ error: 'Booking is not completed yet' }, { status: 400 });
  }

  // Check no review exists
  const { data: existing } = await supabaseAdmin
    .from('reviews')
    .select('id')
    .eq('booking_id', bookingId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Already reviewed' }, { status: 409 });
  }

  // Insert review
  const { error: reviewErr } = await supabaseAdmin
    .from('reviews')
    .insert({
      booking_id: bookingId,
      client_id:  userId,
      stander_id: booking.stander_id,
      rating:     parsed.data.rating,
      comment:    parsed.data.comment ?? null,
    });

  if (reviewErr) {
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }

  // Update stander running average rating
  if (booking.stander_id) {
    const { data: profile } = await supabaseAdmin
      .from('stander_profiles')
      .select('rating, job_count')
      .eq('user_id', booking.stander_id)
      .single();

    if (profile && profile.job_count > 0) {
      const newRating =
        ((profile.rating * (profile.job_count - 1)) + parsed.data.rating) / profile.job_count;

      await supabaseAdmin
        .from('stander_profiles')
        .update({ rating: Math.round(newRating * 10) / 10 })
        .eq('user_id', booking.stander_id);
    }
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
