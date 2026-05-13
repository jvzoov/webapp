import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: standerId } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch current status
  const { data: profile } = await supabaseAdmin
    .from('stander_profiles')
    .select('is_online')
    .eq('user_id', standerId)
    .single();

  if (!profile) return NextResponse.json({ error: 'Stander not found' }, { status: 404 });

  const newValue = !profile.is_online;

  // Update
  const { error } = await supabaseAdmin
    .from('stander_profiles')
    .update({ is_online: newValue })
    .eq('user_id', standerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ is_online: newValue });
}
