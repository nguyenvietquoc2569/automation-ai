import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to handle authentication for API routes
 * This runs before API route handlers and can redirect or modify requests
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for non-API routes and public API routes
  if (!pathname.startsWith('/api/') || isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  // Get session token from cookies or Authorization header
  const sessionToken = request.cookies.get('sessionToken')?.value ||
                      request.headers.get('Authorization')?.replace('Bearer ', '');

  // For protected API routes, check if session token exists
  if (isProtectedApiRoute(pathname)) {
    if (!sessionToken) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'MISSING_SESSION_TOKEN'
        },
        { status: 401 }
      );
    }

    // Add session token to request headers for the API route to use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-session-token', sessionToken);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

/**
 * Check if the API route is public (doesn't require authentication)
 */
function isPublicApiRoute(pathname: string): boolean {
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register', 
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/health',
    '/api/status'
  ];

  return publicRoutes.some(route => pathname.startsWith(route));
}

/**
 * Check if the API route requires authentication
 */
function isProtectedApiRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/api/auth/me',
    '/api/auth/logout',
    '/api/auth/switch-organization',
    '/api/user',
    '/api/organization',
    '/api/admin'
  ];

  return protectedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
