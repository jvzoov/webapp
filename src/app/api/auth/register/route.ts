import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

const schema = z.object({
  name:     z.string().min(2),
  phone:    z.string().regex(/^\+91[6-9]\d{9}$/),
  email:    z.string().email(),
  password: z.string().min(8),
  role:     z.enum(['CLIENT', 'STANDER']),
  upi_id:   z.string().optional(),
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
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { name, phone, email, password, role, upi_id } = parsed.data;

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

  // Hash password
  const password_hash = await bcrypt.hash(password, 12);

  // Derive avatar initials
  const avatar_initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Insert user
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .insert({
      name,
      phone,
      email,
      role,
      password_hash,
      avatar_initials,
    })
    .select('id')
    .single();

  if (userError || !user) {
    console.error('User insert error:', userError);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }

  // Create stander_profile if STANDER
  if (role === 'STANDER') {
    const { error: profileError } = await supabaseAdmin
      .from('stander_profiles')
      .insert({
        user_id: user.id,
        upi_id:  upi_id ?? null,
      });

    if (profileError) {
      console.error('Stander profile insert error:', profileError);
      // Don't fail the request — user is created
    }
  }

  return NextResponse.json({ userId: user.id }, { status: 201 });
}
