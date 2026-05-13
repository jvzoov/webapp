import { supabaseAdmin } from '@/lib/supabase/admin';
import { haversineKm } from '@/lib/utils';
import { sendStanderMatched, sendJobAcceptedToStander } from '@/lib/wati';

/**
 * Matches an available stander to a booking.
 * 1. Checks eligibility.
 * 2. Filters by distance (< 15km).
 * 3. Assigns top-rated stander.
 */
export async function matchStanderToBooking(
  bookingId: string
): Promise<{ matched: boolean; standerId?: string }> {
  
  // STEP 1: Fetch booking
  const { data: booking, error: bookingErr } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      location:locations(name, lat, lng),
      client:users!client_id(name, phone)
    `)
    .eq('id', bookingId)
    .eq('status', 'PENDING_MATCH')
    .single();

  if (bookingErr || !booking) {
    console.log(`[Match] Booking ${bookingId} not found or not in PENDING_MATCH state.`);
    return { matched: false };
  }

  // STEP 2: Find eligible standers (online, not busy)
  const { data: standers, error: standersErr } = await supabaseAdmin
    .from('stander_profiles')
    .select(`
      *,
      user:users!user_id(id, name, phone, avatar_initials)
    `)
    .eq('is_online', true)
    .not('user_id', 'in', `(
      SELECT stander_id FROM bookings
      WHERE status IN ('MATCHED','ACTIVE','ALERT') AND stander_id IS NOT NULL
    )`)
    .order('rating', { ascending: false })
    .order('job_count', { ascending: false })
    .limit(30); // Higher limit to filter by distance client-side

  if (standersErr || !standers) {
    console.error('[Match] Failed to query standers:', standersErr);
    return { matched: false };
  }

  // Filter by distance < 15km if both have coords
  const eligibleStanders = standers.filter(s => {
    if (booking.location?.lat && booking.location?.lng && s.last_lat && s.last_lng) {
      const dist = haversineKm(booking.location.lat, booking.location.lng, s.last_lat, s.last_lng);
      return dist < 15;
    }
    return true; // Default to true if no coords yet for matching
  });

  if (eligibleStanders.length === 0) {
    console.log(`[Match] No eligible standers within 15km for booking ${bookingId}`);
    return { matched: false };
  }

  // STEP 3: Assign top stander
  const chosen = eligibleStanders[0];
  const { error: updateErr } = await supabaseAdmin
    .from('bookings')
    .update({ 
      stander_id: chosen.user_id, 
      status: 'MATCHED', 
      updated_at: new Date().toISOString() 
    })
    .eq('id', bookingId);

  if (updateErr) {
    console.error('[Match] Assignment failed:', updateErr);
    return { matched: false };
  }

  // Notifications
  const clientPhone = (booking as any).client?.phone;
  const standerPhone = (chosen as any).user?.phone;
  const locationName = (booking as any).location?.name ?? 'your location';
  const standerName = (chosen as any).user?.name ?? 'Your Stander';

  // Client DB Notify
  await supabaseAdmin.from('notifications').insert({
    user_id: booking.client_id,
    type: 'MATCHED',
    message: `${standerName} is heading to ${locationName}`
  });

  // Stander DB Notify
  await supabaseAdmin.from('notifications').insert({
    user_id: chosen.user_id,
    type: 'JOB_AVAILABLE',
    message: `New job matched! ${locationName}`
  });

  // Realtime Broadcast
  try {
    await supabaseAdmin.channel(`booking-track:${bookingId}`).send({
      type: 'broadcast',
      event: 'matched',
      payload: {
        stander: {
          name: standerName,
          avatarInitials: (chosen as any).user?.avatar_initials ?? standerName.slice(0, 2).toUpperCase(),
          rating: chosen.rating
        }
      }
    });
  } catch (e) { /* ignore broadcast errors */ }

  // WhatsApp
  if (clientPhone) {
    sendStanderMatched(clientPhone, {
      standerName,
      locationName,
      startTime: new Date(booking.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    });
  }

  if (standerPhone) {
    sendJobAcceptedToStander(standerPhone, {
      locationAddress: booking.location_address,
      clientName: (booking as any).client?.name ?? 'Client',
      estimatedHours: booking.estimated_hours.toString(),
      payout: `₹${booking.stander_payout / 100}`
    });
  }

  return { matched: true, standerId: chosen.user_id };
}
