import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { bookingId, standerId } = body;
  if (!bookingId || !standerId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // Admin bypasses normal matching rules, forces assignment
  const { error } = await supabaseAdmin
    .from('bookings')
    .update({ stander_id: standerId, status: 'MATCHED' })
    .eq('id', bookingId);

  if (error) {
    return NextResponse.json({ error: 'Failed to assign' }, { status: 500 });
  }

  // Try to notify the stander
  await supabaseAdmin.from('notifications').insert({
    user_id: standerId,
    type: 'JOB_AVAILABLE',
    message: 'You have been manually assigned a job by Admin. Please check your active jobs.',
  });

  return NextResponse.json({ success: true });
}
