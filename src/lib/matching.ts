import { supabaseAdmin } from '@/lib/supabase/admin';

export interface MatchResult {
  matched:   boolean;
  standerId?: string;
}

/**
 * Finds the best available online stander and assigns them to the booking.
 * Called after payment is verified.
 */
export async function matchStanderToBooking(bookingId: string): Promise<MatchResult> {
  // 1. Fetch booking details
  const { data: booking, error: bookingErr } = await supabaseAdmin
    .from('bookings')
    .select('id, location_id, start_time, estimated_hours, stander_payout, location:locations(name)')
    .eq('id', bookingId)
    .single();

  if (bookingErr || !booking) {
    console.error('matchStanderToBooking: booking not found', bookingId);
    return { matched: false };
  }

  // 2. Find eligible standers (online, not currently busy)
  const { data: candidates, error: standersErr } = await supabaseAdmin
    .from('users')
    .select(`
      id,
      name,
      stander_profiles!inner(rating, job_count, is_online)
    `)
    .eq('role', 'STANDER')
    .eq('stander_profiles.is_online', true)
    .not('id', 'in', `(
      SELECT stander_id FROM bookings
      WHERE status IN ('MATCHED','ACTIVE','ALERT')
        AND stander_id IS NOT NULL
    )`)
    .order('stander_profiles(rating)', { ascending: false })
    .limit(10);

  if (standersErr) {
    console.error('matchStanderToBooking: standers query error', standersErr);
  }

  if (!candidates || candidates.length === 0) {
    // No standers available
    await supabaseAdmin.from('notifications').insert({
      user_id: (await getClientId(bookingId)),
      type:    'MATCHED',
      message: 'Finding your stander… We\'ll notify you shortly.',
    });
    return { matched: false };
  }

  // 3. Pick top-rated stander
  const stander      = candidates[0] as any;
  const standerName  = stander.name as string;
  const standerId    = stander.id as string;
  const locationName = (booking as any).location?.name ?? 'the location';
  const payoutRupees = Math.round((booking as any).stander_payout / 100);

  const startFormatted = new Date((booking as any).start_time).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  // 4. Update booking
  await supabaseAdmin
    .from('bookings')
    .update({ stander_id: standerId, status: 'MATCHED' })
    .eq('id', bookingId);

  // 5. Notify client
  const clientId = await getClientId(bookingId);
  if (clientId) {
    await supabaseAdmin.from('notifications').insert({
      user_id: clientId,
      type:    'MATCHED',
      message: `Stander matched! ${standerName} is heading to ${locationName}`,
    });
  }

  // 6. Notify stander
  await supabaseAdmin.from('notifications').insert({
    user_id: standerId,
    type:    'JOB_AVAILABLE',
    message: `New job! ${locationName} at ${startFormatted} — ₹${payoutRupees} payout`,
  });

  // 7. Supabase Realtime broadcast (best-effort)
  try {
    await supabaseAdmin.channel(`booking-${bookingId}`).send({
      type:    'broadcast',
      event:   'matched',
      payload: {
        type:   'matched',
        stander: {
          name:           standerName,
          avatar_initials: standerName.slice(0, 2).toUpperCase(),
        },
      },
    });
  } catch {
    // Realtime broadcast is best-effort
  }

  return { matched: true, standerId };
}

async function getClientId(bookingId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('bookings')
    .select('client_id')
    .eq('id', bookingId)
    .single();
  return data?.client_id ?? null;
}
