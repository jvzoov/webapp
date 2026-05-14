import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * QueuePe Route Protection Middleware
 * 
 * Enforces:
 * 1. Auth required for /client, /stander, /admin segments.
 * 2. Role-based access control (RBAC).
 * 3. Redirects authenticated users away from /login and /register.
 */
export default auth((req: NextRequest & { auth: any }) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isApiRoute = nextUrl.pathname.startsWith('/api');
  const isPublicRoute = 
    nextUrl.pathname === '/' || 
    nextUrl.pathname === '/login' || 
    nextUrl.pathname === '/register' ||
    nextUrl.pathname.startsWith('/api/auth') ||
    nextUrl.pathname.startsWith('/api/webhooks');

  const isClientRoute  = nextUrl.pathname.startsWith('/client');
  const isStanderRoute = nextUrl.pathname.startsWith('/stander');
  const isAdminRoute   = nextUrl.pathname.startsWith('/admin');

  // 1. Auth required for protected segments
  if (!isLoggedIn && (isClientRoute || isStanderRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // 2. Role-based enforcement
  if (isLoggedIn) {
    // Prevent cross-role access
    if (isClientRoute && userRole !== 'CLIENT') {
      return NextResponse.redirect(new URL(userRole === 'STANDER' ? '/stander/home' : '/admin/dashboard', nextUrl));
    }
    if (isStanderRoute && userRole !== 'STANDER') {
      return NextResponse.redirect(new URL(userRole === 'CLIENT' ? '/client/home' : '/admin/dashboard', nextUrl));
    }
    if (isAdminRoute && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(userRole === 'CLIENT' ? '/client/home' : '/stander/home', nextUrl));
    }

    // Redirect away from login/register if already logged in
    if (nextUrl.pathname === '/login' || nextUrl.pathname === '/register') {
      const target = userRole === 'CLIENT' ? '/client/home' : (userRole === 'STANDER' ? '/stander/home' : '/admin/dashboard');
      return NextResponse.redirect(new URL(target, nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
