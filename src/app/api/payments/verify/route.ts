import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/lib/razorpay';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { matchStanderToBooking } from '@/lib/matching';

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Verify HMAC signature
  const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  // Update booking
  const { error } = await supabaseAdmin
    .from('bookings')
    .update({
      payment_status:      'PAID',
      razorpay_payment_id: razorpay_payment_id,
    })
    .eq('id', bookingId);

  if (error) {
    console.error('Booking update error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }

  // Try to match stander
  await matchStanderToBooking(bookingId).catch((err) =>
    console.error('Matching error:', err)
  );

  return NextResponse.json({ success: true, bookingId });
}
