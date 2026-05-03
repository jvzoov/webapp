import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { matchStanderToBooking } from '@/lib/matching';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Find all PENDING_MATCH bookings with payment_status=PAID older than 1 minute
  const oneMinuteAgo = new Date();
  oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

  // Auto-cancel if older than 20 minutes
  const twentyMinsAgo = new Date();
  twentyMinsAgo.setMinutes(twentyMinsAgo.getMinutes() - 20);

  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select('id, created_at')
    .eq('status', 'PENDING_MATCH')
    .eq('payment_status', 'PAID')
    .lte('created_at', oneMinuteAgo.toISOString());

  let processed = 0;
  let matched   = 0;
  let cancelled = 0;

  if (bookings && bookings.length > 0) {
    for (const b of bookings) {
      processed++;
      
      const created = new Date(b.created_at);
      if (created < twentyMinsAgo) {
        // Auto-cancel
        await supabaseAdmin
          .from('bookings')
          .update({ status: 'CANCELLED' })
          .eq('id', b.id);
        
        // TODO: trigger refund via Razorpay API here
        
        cancelled++;
      } else {
        // Retry match
        const result = await matchStanderToBooking(b.id);
        if (result.matched) matched++;
      }
    }
  }

  return NextResponse.json({ processed, matched, cancelled });
}
