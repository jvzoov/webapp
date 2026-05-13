import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendWATITemplate } from '@/lib/wati';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== 'STANDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const standerId = session.user.id;
  const standerName = session.user.name ?? 'A Stander';

  // 1. Check if stander is already busy
  const { data: activeJob } = await supabaseAdmin
    .from('bookings')
    .select('id')
    .eq('stander_id', standerId)
    .in('status', ['MATCHED', 'ACTIVE', 'ALERT'])
    .maybeSingle();

  if (activeJob) {
    return NextResponse.json({ error: 'You already have an active job' }, { status: 400 });
  }

  // 2. Atomic Update: Claim the job
  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .update({ 
      stander_id: standerId, 
      status: 'MATCHED',
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .eq('status', 'PENDING_MATCH')
    .is('stander_id', null)
    .select('*, location:locations(name, icon, lat, lng), client:users(name, phone)')
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: 'Job already taken or no longer available' }, { status: 409 });
  }

  // 3. Notify Client
  await supabaseAdmin.from('notifications').insert({
    user_id: booking.client_id,
    type: 'MATCHED',
    message: `${standerName} is heading to ${booking.location?.name}`
  });

  // Realtime broadcast for client tracking
  try {
    const supabase = supabaseAdmin;
    await supabase.channel(`booking-track:${bookingId}`).send({
      type: 'broadcast',
      event: 'matched',
      payload: {
        stander: {
          name: standerName,
          avatar_initials: session.user.avatarInitials ?? standerName.slice(0,2).toUpperCase()
        }
      }
    });
  } catch (err) {
    console.error('[Accept] Realtime broadcast failed:', err);
  }

  // 4. Send WhatsApp alerts
  const clientPhone = (booking as any).client?.phone;
  const locationName = (booking as any).location?.name ?? 'your location';
  const startTime = new Date(booking.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  if (clientPhone) {
    sendWATITemplate(clientPhone, 'stander_matched', [
      { name: 'standerName', value: standerName },
      { name: 'locationName', value: locationName },
      { name: 'startTime', value: startTime }
    ]);
  }

  // To Stander
  sendWATITemplate(session.user.phone ?? '', 'job_accepted', [
    { name: 'locationAddress', value: booking.location_address },
    { name: 'clientName', value: (booking as any).client?.name ?? 'Client' },
    { name: 'estimatedHours', value: booking.estimated_hours.toString() },
    { name: 'payout', value: `₹${booking.stander_payout / 100}` }
  ]);

  return NextResponse.json({ success: true });
}
