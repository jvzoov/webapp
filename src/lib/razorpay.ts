import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Razorpay Singleton Client for Order Creation & Signature Verification
 */
export const razorpay = new Razorpay({
  key_id:     process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface PayoutParams {
  upiId:     string;
  amount:    number; // paise
  reference: string;
  name:      string;
  standerId: string;
}

export interface RazorpayPayoutResponse {
  payoutId: string;
  status:   string;
}

/**
 * Creates a Razorpay Order for the checkout flow.
 */
export async function createOrder(amount: number, receipt: string): Promise<RazorpayOrder> {
  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt:  receipt.slice(0, 40),
  });
  return order as RazorpayOrder;
}

/**
 * Verifies the authenticity of a Razorpay payment signature.
 */
export function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex')
  );
}

/**
 * Initiates a real-time payout to a Stander's UPI ID.
 * Uses the Razorpay Payouts API (X-Razorpay-Idempotency-Key recommended).
 */
export async function createPayout(params: PayoutParams): Promise<RazorpayPayoutResponse> {
  const KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;
  const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');

  // Step 1: Create or Fetch Contact
  const contactRes = await fetch('https://api.razorpay.com/v1/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      name:         params.name,
      type:         'vendor',
      reference_id: params.standerId,
    }),
  });
  const contact = await contactRes.json();
  if (!contact.id) throw new Error(`Contact creation failed: ${JSON.stringify(contact)}`);

  // Step 2: Create Fund Account (UPI VPA)
  const faRes = await fetch('https://api.razorpay.com/v1/fund_accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      contact_id:   contact.id,
      account_type: 'vpa',
      vpa: { address: params.upiId },
    }),
  });
  const fundAccount = await faRes.json();
  if (!fundAccount.id) throw new Error(`Fund account creation failed: ${JSON.stringify(fundAccount)}`);

  // Step 3: Create Payout
  const idempotencyKey = `queuepe-${params.reference}`;
  const payoutRes = await fetch('https://api.razorpay.com/v1/payouts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
      'X-Razorpay-Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      account_number:       process.env.RAZORPAY_ACCOUNT_NUMBER,
      fund_account_id:      fundAccount.id,
      amount:               params.amount,
      currency:             'INR',
      mode:                 'UPI',
      purpose:              'payout',
      reference_id:         idempotencyKey,
      queue_if_low_balance: true,
    }),
  });

  const payout = await payoutRes.json();
  if (!payout.id) throw new Error(`Payout initiation failed: ${JSON.stringify(payout)}`);

  return {
    payoutId: payout.id,
    status:   payout.status,
  };
}
