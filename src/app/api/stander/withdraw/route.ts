import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createPayout } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'STANDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const standerId = session.user.id;
  const standerName = session.user.name ?? 'Stander';

  // 1. Fetch Profile and Balance
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('stander_profiles')
    .select('upi_id, total_earnings')
    .eq('user_id', standerId)
    .single();

  if (profileErr || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  if (!profile.upi_id) {
    return NextResponse.json({ error: 'No UPI ID set. Please update your profile.' }, { status: 400 });
  }

  const amount = profile.total_earnings;
  if (amount < 10000) { // ₹100 minimum
    return NextResponse.json({ error: 'Minimum withdrawal amount is ₹100' }, { status: 400 });
  }

  // 2. Initiate Razorpay Payout
  try {
    const payout = await createPayout({
      upiId:     profile.upi_id,
      amount:    amount,
      reference: `withdraw-${standerId}-${Date.now()}`,
      name:      standerName,
      jobId:     `WID-${standerId}-${Date.now()}`, // Using withdrawal prefix
    });

    // 3. Clear Balance on Success
    // In a real app, you'd move this to a "pending_payouts" table and clear it via webhook
    const { error: updateErr } = await supabaseAdmin
      .from('stander_profiles')
      .update({ total_earnings: 0 })
      .eq('user_id', standerId);

    if (updateErr) {
      console.error('[Withdraw] Balance update failed:', updateErr);
      // Payout was successful, but DB update failed. Log for manual reconciliation.
    }

    return NextResponse.json({ success: true, payoutId: payout.id });
  } catch (err: any) {
    console.error('[Withdraw] Razorpay error:', err);
    return NextResponse.json({ error: 'Failed to initiate payout: ' + (err.description || err.message) }, { status: 500 });
  }
}
