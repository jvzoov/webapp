import { supabaseAdmin } from '@/lib/supabase/admin';
import bcrypt from 'bcryptjs';

const WATI_BASE = process.env.WATI_API_ENDPOINT!;
const WATI_TOKEN = process.env.WATI_API_TOKEN!;

/**
 * Low-level WATI Template Sender
 */
export async function sendWATITemplate(
  phone: string,
  templateName: string,
  parameters: { name: string; value: string }[]
): Promise<boolean> {
  const whatsappNumber = phone.replace('+91', '').replace(/\s/g, '');

  try {
    const res = await fetch(`${WATI_BASE}/api/v1/sendTemplateMessage`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WATI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_name: templateName,
        broadcast_name: templateName,
        parameters,
        whatsappNumber,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[WATI] API Error (${templateName}):`, res.status, errorText);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[WATI] Request failed (${templateName}):`, err);
    return false;
  }
}

// ─── Typed Template Functions ─────────────────────────────────

export async function sendBookingConfirmed(phone: string, data: { amount: string; locationName: string }) {
  return sendWATITemplate(phone, 'booking_confirmed', [
    { name: 'amount',   value: data.amount },
    { name: 'location', value: data.locationName },
  ]);
}

export async function sendStanderMatched(phone: string, data: { standerName: string; locationName: string; startTime: string }) {
  return sendWATITemplate(phone, 'stander_matched', [
    { name: 'standerName',  value: data.standerName },
    { name: 'locationName', value: data.locationName },
    { name: 'startTime',    value: data.startTime },
  ]);
}

export async function sendTurnNearAlert(phone: string, data: { locationName: string; queuePosition: number }) {
  return sendWATITemplate(phone, 'turn_near_alert', [
    { name: 'locationName',   value: data.locationName },
    { name: 'queuePosition', value: data.queuePosition.toString() },
  ]);
}

export async function sendJobCompleted(phone: string, data: { standerName: string; locationName: string; duration: string; totalPaid: string }) {
  return sendWATITemplate(phone, 'job_completed', [
    { name: 'standerName',  value: data.standerName },
    { name: 'locationName', value: data.locationName },
    { name: 'duration',     value: data.duration },
    { name: 'totalPaid',    value: data.totalPaid },
  ]);
}

export async function sendBookingCancelledRefund(phone: string, data: { amount: string; locationName: string }) {
  return sendWATITemplate(phone, 'booking_cancelled_refund', [
    { name: 'amount',   value: data.amount },
    { name: 'location', value: data.locationName },
  ]);
}

export async function sendJobAcceptedToStander(phone: string, data: { locationAddress: string; clientName: string; estimatedHours: string; payout: string }) {
  return sendWATITemplate(phone, 'job_accepted', [
    { name: 'locationAddress', value: data.locationAddress },
    { name: 'clientName',      value: data.clientName },
    { name: 'estimatedHours',  value: data.estimatedHours },
    { name: 'payout',          value: data.payout },
  ]);
}
// ─── OTP Helpers ─────────────────────────────────────────────

/**
 * Generates a 6-digit OTP, hashes it, and sends it via WhatsApp.
 */
export async function sendWhatsAppOTP(phone: string): Promise<{ success: boolean; messageId?: string }> {
  // 1. Generate 6-digit OTP
  const plainOTP = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 2. Hash OTP for secure storage
  const otp_hash = await bcrypt.hash(plainOTP, 10);
  const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min

  // 3. Store in Supabase 'otp_sessions'
  const { error } = await supabaseAdmin.from('otp_sessions').insert({
    phone,
    otp_hash,
    expires_at,
    attempts: 0,
  });

  if (error) {
    console.error('[WATI] OTP Session storage failed:', error);
    return { success: false };
  }

  // 4. Send via WATI
  const sent = await sendWATITemplate(phone, 'queuepe_otp', [
    { name: 'otp', value: plainOTP },
  ]);

  return { success: sent };
}

/**
 * Verifies an OTP against the stored hash.
 */
export async function verifyWhatsAppOTP(phone: string, otp: string): Promise<boolean> {
  // 1. Fetch latest valid session
  const { data: session, error } = await supabaseAdmin
    .from('otp_sessions')
    .select('*')
    .eq('phone', phone)
    .gt('expires_at', new Date().toISOString())
    .lt('attempts', 5)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !session) return false;

  // 2. Increment attempts
  await supabaseAdmin
    .from('otp_sessions')
    .update({ attempts: session.attempts + 1 })
    .eq('id', session.id);

  // 3. Verify hash
  const valid = await bcrypt.compare(otp, session.otp_hash);

  // 4. Cleanup on success
  if (valid) {
    await supabaseAdmin.from('otp_sessions').delete().eq('id', session.id);
  }

  return valid;
}

/**
 * Standardized Welcome Message
 */
export async function sendWelcomeMessage(phone: string, name: string) {
  return sendWATITemplate(phone, 'welcome_message', [
    { name: 'name', value: name },
  ]);
}
