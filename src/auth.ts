import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyWhatsAppOTP } from '@/lib/wati';
import type { UserRole } from '@/types/database';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // ── Provider 1: WhatsApp OTP ──────────────────────────────
    CredentialsProvider({
      id: 'whatsapp-otp',
      name: 'WhatsApp OTP',
      credentials: {
        phone: { type: 'text' },
        otp:   { type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;

        const valid = await verifyWhatsAppOTP(
          credentials.phone as string,
          credentials.otp as string
        );
        if (!valid) return null;

        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id, email, name, role, avatar_initials, phone')
          .eq('phone', credentials.phone as string)
          .single();

        if (!user) return null;

        return {
          id:             user.id,
          name:           user.name,
          email:          user.email,
          role:           user.role as UserRole,
          avatarInitials: user.avatar_initials ?? user.name.slice(0, 2).toUpperCase(),
          phone:          user.phone,
        };
      },
    }),

    // ── Provider 2: Email + Password ─────────────────────────
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email:    { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id, email, name, role, password_hash, avatar_initials, phone')
          .eq('email', credentials.email as string)
          .single();

        if (!user || !user.password_hash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );
        if (!valid) return null;

        return {
          id:             user.id,
          name:           user.name,
          email:          user.email,
          role:           user.role as UserRole,
          avatarInitials: user.avatar_initials ?? user.name.slice(0, 2).toUpperCase(),
          phone:          user.phone,
        };
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as typeof user & {
          role: UserRole;
          avatarInitials: string;
          phone: string;
        };
        token.id             = u.id as string;
        token.role           = u.role;
        token.avatarInitials = u.avatarInitials;
        token.phone          = u.phone;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id             = token.id as string;
        session.user.role           = token.role as UserRole;
        session.user.avatarInitials = token.avatarInitials as string;
        session.user.phone          = token.phone as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
});
