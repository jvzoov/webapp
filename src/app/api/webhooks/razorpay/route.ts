import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('X-Razorpay-Signature');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  // Verify Signature
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(expectedSig, 'hex'),
    Buffer.from(signature, 'hex')
  );

  if (!isValid) {
    console.error('[Razorpay Webhook] Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  // Process asynchronously to avoid Razorpay timeout
  processWebhookEvent(event).catch((err) => {
    console.error('[Razorpay Webhook] Event processing failed:', err);
  });

  return NextResponse.json({ success: true }, { status: 200 });
}

async function processWebhookEvent(event: any) {
  console.log(`[Razorpay Webhook] Processing event: ${event.event}`);

  switch (event.event) {
    case 'payment.captured': {
      const paymentId = event.payload.payment.entity.id;
      const orderId = event.payload.payment.entity.order_id;
      
      // Idempotent update: mark booking as PAID
      const { error } = await supabaseAdmin
        .from('bookings')
        .update({ 
          payment_status: 'PAID', 
          razorpay_payment_id: paymentId,
          updated_at: new Date().toISOString()
        })
        .eq('razorpay_order_id', orderId)
        .eq('payment_status', 'PENDING');

      if (error) {
        console.error(`[Webhook] Failed to update booking ${orderId}:`, error);
      }
      break;
    }

    case 'payout.processed': {
      const reference = event.payload.payout.entity.reference_id;
      console.log(`[Webhook] Payout successful: ${reference}`);
      // Future: Log to a dedicated audit_logs or transactions table
      break;
    }

    case 'payout.failed': {
      const reference = event.payload.payout.entity.reference_id;
      const reason = event.payload.payout.entity.failure_reason;
      console.error(`[Webhook] PAYOUT FAILED: ${reference}. Reason: ${reason}`);
      
      // Notify Admin
      const { data: adminUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('role', 'ADMIN')
        .limit(1)
        .single();

      if (adminUser) {
        await supabaseAdmin.from('notifications').insert({
          user_id: adminUser.id,
          type: 'ALERT',
          message: `CRITICAL: Payout failed for ${reference}. Reason: ${reason}`
        });
      }
      break;
    }

    default:
      console.log(`[Webhook] Unhandled event: ${event.event}`);
  }
}
