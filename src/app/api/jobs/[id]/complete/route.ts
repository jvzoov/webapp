import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createPayout } from '@/lib/razorpay';

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

  // 1. Get booking details
  const { data: booking, error: bookingErr } = await supabaseAdmin
    .from('bookings')
    .select('id, status, stander_payout, client_id, start_time')
    .eq('id', bookingId)
    .eq('stander_id', standerId)
    .single();

  if (bookingErr || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // 2. Mark complete
  const { error: updateErr } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'COMPLETED' })
    .eq('id', bookingId);

  if (updateErr) {
    return NextResponse.json({ error: 'Failed to complete job' }, { status: 500 });
  }

  // 3. Update stander profile (increment job count & add earnings)
  // Need to fetch current stats first or use an RPC. For MVP, we fetch then update.
  const { data: profile } = await supabaseAdmin
    .from('stander_profiles')
    .select('total_earnings, job_count, current_streak, upi_id')
    .eq('user_id', standerId)
    .single();

  if (profile) {
    await supabaseAdmin
      .from('stander_profiles')
      .update({
        total_earnings: profile.total_earnings + booking.stander_payout,
        job_count:      profile.job_count + 1,
        // Simple streak logic: just +1 for MVP
        current_streak: profile.current_streak + 1,
      })
      .eq('user_id', standerId);

    // 4. Trigger Razorpay Payout (non-blocking)
    if (profile.upi_id) {
      try {
        await createPayout({
          upiId:     profile.upi_id,
          amount:    booking.stander_payout,
          reference: bookingId,
          name:      (session.user as any).name as string,
          jobId:     bookingId,
        });
        console.log(`Payout initiated for job ${bookingId}`);
      } catch (err) {
        console.error(`Payout failed for job ${bookingId}:`, err);
        // We log it, but don't fail the request. Admin can retry.
      }
    }
  }

  // 5. Notify client
  if (booking.client_id) {
    await supabaseAdmin.from('notifications').insert({
      user_id: booking.client_id,
      type:    'ALERT',
      message: 'Your stander has completed the job! Please leave a review.',
    });
  }

  return NextResponse.json({ success: true });
}
