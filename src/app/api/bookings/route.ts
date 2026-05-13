import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { razorpay } from '@/lib/razorpay';

const schema = z.object({
  locationId:      z.string().uuid(),
  locationAddress: z.string().min(10),
  startTime:       z.string().datetime(),
  estimatedHours:  z.coerce.number().min(1).max(8),
  instructions:    z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { locationId, locationAddress, startTime, estimatedHours, instructions } = parsed.data;

  // 1. Calculate Amounts (Paise)
  const basePrice     = estimatedHours * 200;
  const bookingFee    = 49;
  const totalRupees   = basePrice + bookingFee;
  const totalAmount   = totalRupees * 100;
  
  const standerPayout = estimatedHours * 200 * 0.8 * 100;
  const platformFee   = (estimatedHours * 200 * 0.2 + 49) * 100;

  // 2. Create Booking (Pending Payment)
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
    console.error('[Bookings] Insert error:', bookingErr);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }

  // 3. Create Razorpay Order
  try {
    const order = await razorpay.orders.create({
      amount:   totalAmount,
      currency: 'INR',
      receipt:  booking.id,
    });

    // Update booking with Order ID
    await supabaseAdmin
      .from('bookings')
      .update({ razorpay_order_id: order.id })
      .eq('id', booking.id);

    return NextResponse.json({
      bookingId:       booking.id,
      razorpayOrderId: order.id,
      amount:          totalAmount,
    });
  } catch (err) {
    console.error('[Bookings] Razorpay error:', err);
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}
