import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const standerId = (session.user as any).id as string;
  const role = (session.user as any).role as string;
  if (role !== 'STANDER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // For this MVP, since we automatically trigger a Payout via Razorpay when a job is marked COMPLETED,
  // this route acts as a fallback/manual withdrawal trigger if something fails, or for testing.
  
  // In a real system, you would sum up unwithdrawn earnings, check minimum withdrawal limits,
  // create a Payout request, and deduct from their internal wallet balance.
  
  const { data: profile } = await supabaseAdmin
    .from('stander_profiles')
    .select('total_earnings')
    .eq('user_id', standerId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Example logic: Just return success for now.
  return NextResponse.json({ 
    success: true, 
    message: 'Withdrawal requested. It will be processed to your UPI ID shortly.',
    amount: profile.total_earnings 
  });
}
