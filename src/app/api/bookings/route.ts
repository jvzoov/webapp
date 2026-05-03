import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createOrder } from '@/lib/razorpay';

const schema = z.object({
  locationId:      z.string().uuid(),
  locationAddress: z.string().min(5),
  startTime:       z.string().datetime(),
  estimatedHours:  z.coerce.number().min(1).max(8),
  instructions:    z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id as string;
  const userRole = (session.user as any).role as string;
  if (userRole !== 'CLIENT') {
    return NextResponse.json({ error: 'Only clients can create bookings' }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { locationId, locationAddress, startTime, estimatedHours, instructions } = parsed.data;

  // Calculate amounts (in paise)
  const totalRupees    = estimatedHours * 200 + 49;
  const totalAmount    = totalRupees * 100;
  const standerPayout  = Math.round(estimatedHours * 200 * 0.8 * 100);
  const platformFee    = totalAmount - standerPayout;

  // Create booking row
  const { data: booking, error: bookingErr } = await supabaseAdmin
    .from('bookings')
    .insert({
      client_id:        userId,
      location_id:      locationId,
      location_address: locationAddress,
      start_time:       startTime,
      estimated_hours:  estimatedHours,
      total_amount:     totalAmount,
      stander_payout:   standerPayout,
      platform_fee:     platformFee,
      instructions:     instructions ?? null,
      status:           'PENDING_MATCH',
      payment_status:   'PENDING',
    })
    .select('id')
    .single();

  if (bookingErr || !booking) {
    console.error('Booking insert error:', bookingErr);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }

  // Create Razorpay order
  let razorpayOrder: any;
  try {
    razorpayOrder = await createOrder(totalAmount, booking.id);
  } catch (err) {
    console.error('Razorpay order error:', err);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }

  // Store order ID in booking
  await supabaseAdmin
    .from('bookings')
    .update({ razorpay_order_id: razorpayOrder.id })
    .eq('id', booking.id);

  return NextResponse.json({
    bookingId:       booking.id,
    razorpayOrderId: razorpayOrder.id,
    amount:          totalAmount,
  });
}
