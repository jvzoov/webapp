import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role as string;
  if (role !== 'STANDER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      location:locations(*),
      client:users!bookings_client_id_fkey(name, avatar_initials)
    `)
    .eq('status', 'PENDING_MATCH')
    .eq('payment_status', 'PAID')
    .order('created_at', { ascending: true })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }

  return NextResponse.json({ jobs: data });
}
