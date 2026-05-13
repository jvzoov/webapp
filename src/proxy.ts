import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths — no session required
const PUBLIC_ROUTES = ['/', '/login', '/register'];

function isPublic(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith('/api/auth/'))     return true;
  if (pathname.startsWith('/api/webhooks/')) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const session = await auth();

  // No session → redirect to login
  if (!session?.user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { role } = session.user;

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
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
