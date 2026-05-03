import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { createOrder } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { bookingId, amount } = body;
  if (!bookingId || !amount) {
    return NextResponse.json({ error: 'Missing bookingId or amount' }, { status: 400 });
  }

  try {
    const order = await createOrder(amount, bookingId);
    return NextResponse.json({
      orderId: order.id,
      amount:  order.amount,
      key:     process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Payment order creation failed:', err);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
