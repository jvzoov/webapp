import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendWhatsAppOTP } from '@/lib/wati';

const schema = z.object({
  // 10-digit Indian mobile (no +91 prefix — added server-side)
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const phone = `+91${parsed.data.phone}`;
  const result = await sendWhatsAppOTP(phone);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ sent: true });
}
