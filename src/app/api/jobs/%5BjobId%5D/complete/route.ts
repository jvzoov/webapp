import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createPayout } from '@/lib/razorpay';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== 'STANDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Fetch booking to verify
  const { data: booking, error: fetchErr } = await supabaseAdmin
    .from('bookings')
    .select('id, stander_id, status, client_id, location:locations(name)')
    .eq('id', jobId)
    .single();

  if (fetchErr || !booking) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (booking.stander_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
    return NextResponse.json({ error: 'Job already finished' }, { status: 400 });
  }

  // 2. Update status to COMPLETED
  const { error: updateErr } = await supabaseAdmin
    .from('bookings')
    .update({ 
      status: 'COMPLETED', 
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', jobId);

  if (updateErr) {
    return NextResponse.json({ error: 'Failed to complete job' }, { status: 500 });
  }

  // 3. Initiate Payout (Optional, async)
  try {
    const { data: standerProfile } = await supabaseAdmin
      .from('stander_profiles')
      .select('upi_id, users!user_id(name)')
      .eq('user_id', booking.stander_id)
      .single();

    if (standerProfile?.upi_id) {
      const payout = await createPayout({
        upiId:     standerProfile.upi_id,
        amount:    booking.stander_payout,
        reference: `job-${jobId}`,
        name:      (standerProfile as any).users?.name ?? 'Stander',
        standerId: booking.stander_id!
      });
      console.log(`[Complete] Payout initiated: ${payout.payoutId}`);
    } else {
      // Stander will have to withdraw manually from earnings page later
      console.log('[Complete] No UPI ID found, stander must withdraw manually.');
      
      // Update total_earnings in DB so they can withdraw later
      await supabaseAdmin.rpc('increment_stander_earnings', { 
        s_id: booking.stander_id, 
        amount: booking.stander_payout 
      });
    }
  } catch (payoutError) {
    console.error('[Complete] Payout initiation failed:', payoutError);
    // Crucial: We do NOT fail the response here. The job IS completed.
    // The stander can still see the balance in their dashboard.
  }

  // 4. Notify Client
  await supabaseAdmin.from('notifications').insert({
    user_id: booking.client_id,
    type: 'COMPLETED',
    message: `Job at ${booking.location?.name} is complete! Hope you had a great experience.`
  });

  // Realtime Broadcast
  try {
    await supabaseAdmin.channel(`booking-track:${jobId}`).send({
      type: 'broadcast',
      event: 'completed',
      payload: { status: 'COMPLETED' }
    });
  } catch (err) {
    console.error('[Complete] Realtime broadcast failed:', err);
  }

  return NextResponse.json({ success: true });
}
