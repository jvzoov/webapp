import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendWelcomeMessage } from '@/lib/wati';

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  // 10-digit Indian mobile — +91 added server-side before storage
  phone:    z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role:     z.enum(['CLIENT', 'STANDER']),
  upi_id:   z.string().regex(/^[\w.-]+@[\w]+$/, 'Invalid UPI ID format').optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, phone: rawPhone, email, password, role, upi_id } = parsed.data;

  // Standers must supply UPI ID
  if (role === 'STANDER' && !upi_id?.trim()) {
    return NextResponse.json(
      { error: 'UPI ID is required for Standers' },
      { status: 400 }
    );
  }

  // Normalise phone to E.164
  const phone = `+91${rawPhone}`;

  // Check email uniqueness
  const { data: existingEmail } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingEmail) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  // Check phone uniqueness
  const { data: existingPhone } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('phone', phone)
    .maybeSingle();

  if (existingPhone) {
    return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 });
  }

  // Hash password (cost 12)
  const password_hash = await bcrypt.hash(password, 12);

  // Derive avatar initials from first two words
  const avatar_initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  // Insert user
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .insert({ name, phone, email, role, password_hash, avatar_initials })
    .select('id')
    .single();

  if (userError || !user) {
    console.error('[REGISTER] User insert error:', userError);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }

  // Create stander_profile if STANDER
  if (role === 'STANDER') {
    const { error: profileError } = await supabaseAdmin
      .from('stander_profiles')
      .insert({ user_id: user.id, upi_id: upi_id ?? null });

    if (profileError) {
      console.error('[REGISTER] Stander profile insert error:', profileError);
      // Non-fatal — user row already created
    }
  }

  // Send welcome WhatsApp (non-blocking, don't await to failure)
  sendWelcomeMessage(phone, name).catch(() => {});

  return NextResponse.json({ userId: user.id }, { status: 201 });
}
