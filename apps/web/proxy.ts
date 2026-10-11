import { NextResponse } from 'next/server';
import { getSecurityHeaders, getCorsHeaders } from '@/lib/security/headers';
import { checkRateLimit, RATE_LIMIT_PRESETS, getRateLimitHeaders } from '@/lib/rate-limit/rate-limiter';
import { auth } from '@/auth';

/**
 * Corridor LMS — Core Next.js Request Middleware
 * Intercepts incoming requests to enforce Section 6 Non-Functional Requirements:
 * - Security Headers (HSTS, CSP, X-Frame-Options, Referrer-Policy)
 * - Redis/In-Memory Rate Limiting (per user & endpoint, AI rate limit enforcement)
 * - CORS & CSRF Protection
 * - Role-Based Route Guarding
 */

export default auth(async function middleware(request) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');
  const method = request.method;

  // 1. Handle CORS Preflight (OPTIONS)
  if (method === 'OPTIONS') {
    const corsHeaders = getCorsHeaders(origin);
    return new NextResponse(null, {
      status: 204,
      headers: { ...corsHeaders, ...getSecurityHeaders() },
    });
  }

  // 2. Determine Rate Limiting Tier
  const isAIEndpoint = pathname.startsWith('/api/v1/ai') || pathname.startsWith('/api/ai');
  const isAuthEndpoint = pathname.startsWith('/api/auth/callback') || pathname.startsWith('/api/auth/signin') || pathname.startsWith('/api/v1/auth');
  
  const rateLimitPreset = isAIEndpoint
    ? RATE_LIMIT_PRESETS.AI_ENDPOINT
    : isAuthEndpoint
    ? RATE_LIMIT_PRESETS.AUTH
    : RATE_LIMIT_PRESETS.STANDARD_API;

  const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const userId = request.auth?.user?.id || clientIp;
  const rateLimitKey = `rl:${userId}:${pathname}`;

  const rateLimitResult = await checkRateLimit(rateLimitKey, rateLimitPreset);
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

  // If Rate Limit Exceeded -> Return HTTP 429
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Rate limit exceeded. Please wait before retrying.',
        },
      },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders,
          ...getSecurityHeaders(),
          ...getCorsHeaders(origin),
        },
      }
    );
  }

  // 3. Role-Based Route Guarding
  const session = request.auth;
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isApiRoute = pathname.startsWith('/api') || pathname.startsWith('/_next');

  if (!session?.user && !isAuthPage && !isApiRoute && !pathname.startsWith('/invite')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session?.user && (session.user as any).status !== 'active' && !isAuthPage && !pathname.startsWith('/api/auth')) {
      if (isApiRoute) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sign in required' } }, { status: 401 });
      return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session?.user && (session.user as any).status === 'active') {
    const role = (session.user as any).role || 'student';
    
    // Redirect from root or auth pages to their respective dashboards
    if (pathname === '/' || isAuthPage) {
      if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
      if (role === 'instructor') return NextResponse.redirect(new URL('/instructor', request.url));
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Role Guarding
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (pathname.startsWith('/instructor') && role !== 'instructor' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 4. Process Request and Apply Headers
  const response = NextResponse.next();

  // Attach Security Headers
  const securityHeaders = getSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Attach CORS Headers
  const corsHeaders = getCorsHeaders(origin);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Attach Rate Limit Diagnostic Headers
  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files (_next/static, _next/image, favicon.ico)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
