import Razorpay from 'razorpay';
import crypto from 'crypto';

// ─── Singleton client ─────────────────────────────────────────
let razorpayInstance: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (razorpayInstance) return razorpayInstance;
  razorpayInstance = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
  return razorpayInstance;
}

export const razorpay = getRazorpay();

// ─── Create Order ─────────────────────────────────────────────
export async function createOrder(
  amount: number,
  receipt: string
): Promise<{ id: string; amount: number; currency: string }> {
  const order = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt:  receipt.slice(0, 40), // Razorpay max 40 chars
  });
  return order as any;
}

// ─── Verify Signature ─────────────────────────────────────────
export function verifySignature(
  orderId:   string,
  paymentId: string,
  signature: string
): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex')
  );
}

// ─── Verify Webhook Signature ──────────────────────────────────
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');
  return expected === signature;
}

// ─── TypeScript shapes ────────────────────────────────────────
export interface PayoutParams {
  upiId:     string;
  amount:    number; // paise
  reference: string;
  name:      string;
  jobId:     string;
}

export interface RazorpayContact {
  id: string;
}

export interface RazorpayFundAccount {
  id: string;
}

export interface RazorpayPayout {
  id:     string;
  status: string;
}

// ─── Create Payout ────────────────────────────────────────────
export async function createPayout(params: PayoutParams): Promise<RazorpayPayout> {
  const rz = getRazorpay();

  // Step 1: Create contact
  const contact = await (rz as any).contacts.create({
    name:         params.name,
    contact_type: 'employee',
    reference_id: `queuepe-stander-${params.reference}`,
  }) as RazorpayContact;

  // Step 2: Create fund account (VPA/UPI)
  const fundAccount = await (rz as any).fundAccount.create({
    contact_id:   contact.id,
    account_type: 'vpa',
    vpa: { address: params.upiId },
  }) as RazorpayFundAccount;

  // Step 3: Create payout with idempotency key
  const idempotencyKey = `queuepe-job-${params.jobId}`;
  const payout = await (rz as any).payouts.create(
    {
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER!,
      fund_account_id: fundAccount.id,
      amount:          params.amount,
      currency:        'INR',
      mode:            'UPI',
      purpose:         'payout',
      reference_id:    idempotencyKey,
      queue_if_low_balance: true,
    },
    { 'X-Razorpay-Idempotency-Key': idempotencyKey }
  ) as RazorpayPayout;

  return payout;
}
