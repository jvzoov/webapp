import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { UserRole } from '@/types/database';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('id, email, name, role, password_hash, avatar_initials, phone')
          .eq('email', credentials.email as string)
          .single();

        if (error || !user || !user.password_hash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );
        if (!valid) return null;

        return {
          id:             user.id,
          email:          user.email,
          name:           user.name,
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
        token.id             = user.id as string;
        token.role           = (user as any).role as UserRole;
        token.avatarInitials = (user as any).avatarInitials as string;
        token.phone          = (user as any).phone as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id             = token.id as string;
        (session.user as any).role           = token.role as UserRole;
        (session.user as any).avatarInitials = token.avatarInitials as string;
        (session.user as any).phone          = token.phone as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export const { GET, POST } = handlers;
