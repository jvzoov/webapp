import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get current state
  const { data: profile, error: fetchErr } = await supabaseAdmin
    .from('stander_profiles')
    .select('is_online')
    .eq('user_id', id)
    .single();

  if (fetchErr || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Toggle
  const { error: updateErr } = await supabaseAdmin
    .from('stander_profiles')
    .update({ is_online: !profile.is_online })
    .eq('user_id', id);

  if (updateErr) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }

  return NextResponse.json({ success: true, is_online: !profile.is_online });
}
