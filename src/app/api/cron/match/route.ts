import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { matchStanderToBooking } from '@/lib/matching';
import { razorpay } from '@/lib/razorpay';
import { sendBookingCancelledRefund } from '@/lib/wati';
import { formatINR } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // 1. Auth Check (Vercel Cron Secret)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Find unmatched paid bookings older than 1 minute
  const { data: unmatched, error } = await supabaseAdmin
    .from('bookings')
    .select('id, created_at, razorpay_payment_id, total_amount, client_id, location_id, location:locations(name), client:users!client_id(phone)')
    .eq('status', 'PENDING_MATCH')
    .eq('payment_status', 'PAID')
    .lt('created_at', new Date(Date.now() - 60 * 1000).toISOString());

  if (error || !unmatched) {
    return NextResponse.json({ processed: 0, error: error?.message });
  }

  const results = {
    processed: unmatched.length,
    matched: 0,
    cancelled: 0
  };

  const now = Date.now();
  const cancelThreshold = 20 * 60 * 1000; // 20 minutes

  // 3. Process Bookings
  for (const b of unmatched) {
    const age = now - new Date(b.created_at).getTime();

    // CASE A: Auto-cancel if older than 20 mins
    if (age > cancelThreshold) {
      console.log(`[Cron] Auto-cancelling booking ${b.id} due to no stander match.`);
      
      // Update status
      await supabaseAdmin.from('bookings').update({ status: 'CANCELLED' }).eq('id', b.id);

      // Trigger Razorpay Refund
      if (b.razorpay_payment_id) {
        try {
          await razorpay.payments.refund(b.razorpay_payment_id, {
            amount: b.total_amount, // Refund full amount (paise)
            speed: 'normal'
          });
          
          await supabaseAdmin.from('bookings').update({ payment_status: 'REFUNDED' }).eq('id', b.id);
          
          // Notify Client via WhatsApp
          const phone = (b as any).client?.phone;
          if (phone) {
            await sendBookingCancelledRefund(phone, {
              amount: formatINR(b.total_amount),
              locationName: (b as any).location?.name ?? 'Unknown'
            });
          }
        } catch (err) {
          console.error(`[Cron] Refund failed for ${b.id}:`, err);
        }
      }
      results.cancelled++;
    } 
    // CASE B: Try to match
    else {
      try {
        const matchResult = await matchStanderToBooking(b.id);
        if (matchResult.matched) results.matched++;
      } catch (err) {
        console.error(`[Cron] Match retry failed for ${b.id}:`, err);
      }
    }
  }

  return NextResponse.json(results);
}
