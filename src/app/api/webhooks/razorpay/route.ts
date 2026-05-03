import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const bodyText = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!signature || !verifyWebhookSignature(bodyText, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(bodyText);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Handle events asynchronously
  processEvent(event).catch((err) => console.error('Webhook processing error:', err));

  return NextResponse.json({ received: true });
}

async function processEvent(event: any) {
  const eventType = event.event;

  if (eventType === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;
    
    // Redundant safety check to ensure booking is marked PAID
    await supabaseAdmin
      .from('bookings')
      .update({ payment_status: 'PAID', razorpay_payment_id: payment.id })
      .eq('razorpay_order_id', orderId)
      .eq('payment_status', 'PENDING');
  }

  if (eventType === 'payout.processed') {
    const payout = event.payload.payout.entity;
    const reference = payout.reference_id; // queuepe-job-{bookingId}
    
    if (reference?.startsWith('queuepe-job-')) {
      // In a real app, we might want to log this payout in a transactions table
      console.log(`Payout processed for ${reference}`);
    }
  }

  if (eventType === 'payout.failed' || eventType === 'payout.reversed') {
    const payout = event.payload.payout.entity;
    console.error(`Payout failed/reversed: ${payout.id}`, payout.failure_reason);
    // Real app: Flag for manual intervention
  }
}
