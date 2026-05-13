import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'STANDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { lat, lng } = await req.json();

  const { error } = await supabaseAdmin
    .from('stander_profiles')
    .update({ 
      last_lat: lat, 
      last_lng: lng,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
