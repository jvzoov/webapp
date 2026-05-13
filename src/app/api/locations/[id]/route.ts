import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Location ID is required' }, { status: 400 });
  }

  const { data: location, error } = await supabaseAdmin
    .from('locations')
    .select('id, name, icon, avg_wait_hours')
    .eq('id', id)
    .single();

  if (error || !location) {
    return NextResponse.json({ error: 'Location not found' }, { status: 404 });
  }

  return NextResponse.json(location);
}
