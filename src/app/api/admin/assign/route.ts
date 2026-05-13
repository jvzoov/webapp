import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendStanderMatched, sendJobAcceptedToStander } from '@/lib/wati';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { bookingId, standerId } = await req.json();

  // 1. Fetch data for notifications
  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('*, location:locations(name), client:users!client_id(name, phone)')
    .eq('id', bookingId)
    .single();

  const { data: stander } = await supabaseAdmin
    .from('users')
    .select('name, phone, avatar_initials')
    .eq('id', standerId)
    .single();

  if (!booking || !stander) {
    return NextResponse.json({ error: 'Booking or Stander not found' }, { status: 404 });
  }

  // 2. Atomic Update
  const { error } = await supabaseAdmin
    .from('bookings')
    .update({ 
      stander_id: standerId, 
      status: 'MATCHED',
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 3. Notifications
  const locationName = (booking as any).location?.name ?? 'your location';
  
  // WATI to Client
  if ((booking as any).client?.phone) {
    sendStanderMatched((booking as any).client.phone, {
      standerName: stander.name,
      locationName,
      startTime: new Date(booking.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    });
  }

  // WATI to Stander
  if (stander.phone) {
    sendJobAcceptedToStander(stander.phone, {
      locationAddress: booking.location_address,
      clientName: (booking as any).client?.name ?? 'Client',
      estimatedHours: booking.estimated_hours.toString(),
      payout: `₹${booking.stander_payout / 100}`
    });
  }

  // Realtime Broadcast
  try {
    await supabaseAdmin.channel(`booking-track:${bookingId}`).send({
      type: 'broadcast',
      event: 'matched',
      payload: {
        stander: {
          name: stander.name,
          avatarInitials: stander.avatar_initials ?? stander.name.slice(0, 2).toUpperCase()
        }
      }
    });
  } catch (err) { console.error('Broadcast failed'); }

  return NextResponse.json({ success: true });
}
