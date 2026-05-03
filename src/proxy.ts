import { auth } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes — no session required
const PUBLIC_ROUTES = ['/', '/login', '/register'];
const PUBLIC_PREFIXES = ['/api/', '/_next/', '/favicon'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and Next.js internals
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  const session = await auth();

  // No session → redirect to login
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (session.user as any)?.role as string | undefined;

  // /client/* — CLIENT only
  if (pathname.startsWith('/client') && role !== 'CLIENT') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // /stander/* — STANDER only
  if (pathname.startsWith('/stander') && role !== 'STANDER') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // /admin/* — ADMIN only
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
