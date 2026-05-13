import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/lib/razorpay';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { matchStanderToBooking } from '@/lib/matching';
import { sendWATITemplate } from '@/lib/wati';
import { formatINR } from '@/lib/utils';

export async function POST(req: NextRequest) {
  let body: {
    razorpay_order_id:   string;
    razorpay_payment_id: string;
    razorpay_signature:  string;
    bookingId:           string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  // 1. Verify Signature
  const isValid = verifySignature(
    body.razorpay_order_id,
    body.razorpay_payment_id,
    body.razorpay_signature
  );

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  // 2. Fetch booking and client details
  const { data: booking, error: fetchErr } = await supabaseAdmin
    .from('bookings')
    .select('*, location:locations(name), client:users(phone)')
    .eq('id', body.bookingId)
    .single();

  if (fetchErr || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // 3. Update status to PAID
  const { error: updateErr } = await supabaseAdmin
    .from('bookings')
    .update({
      payment_status:      'PAID',
      razorpay_payment_id: body.razorpay_payment_id,
    })
    .eq('id', body.bookingId);

  if (updateErr) {
    console.error('[Verify] Update error:', updateErr);
    return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
  }

  // 4. Initiate Stander Matching (Fire & Forget)
  matchStanderToBooking(body.bookingId).catch((err) => {
    console.error('[Verify] Matching failed:', err);
  });

  // 5. Send WhatsApp Confirmation
  const clientPhone  = (booking as any).client?.phone;
  const locationName = (booking as any).location?.name ?? 'your location';
  const totalDisplay = formatINR(booking.total_amount);

  if (clientPhone) {
    sendWATITemplate(clientPhone, 'booking_confirmed', [
      { name: 'amount',   value: totalDisplay },
      { name: 'location', value: locationName },
    ]);
  }

  return NextResponse.json({ success: true, bookingId: body.bookingId });
}
