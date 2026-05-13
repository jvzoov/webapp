import { supabaseAdmin } from '@/lib/supabase/admin';

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
