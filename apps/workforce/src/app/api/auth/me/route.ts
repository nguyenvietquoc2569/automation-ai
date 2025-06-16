import { NextRequest, NextResponse } from 'next/server';
import { SessionService, DatabaseService } from '@automation-ai/database';

/**
 * GET /api/auth/me
 * Get current user session information
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize database connection if not already connected
    const dbService = DatabaseService.getInstance();
    await dbService.initialize();

    // Get session token from cookie or Authorization header
    const sessionToken = request.cookies.get('sessionToken')?.value ||
                        request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token provided' },
        { status: 401 }
      );
    }

    // Validate session
    const sessionService = SessionService.getInstance();
    const validation = await sessionService.validateSession(sessionToken);

    if (!validation.isValid || !validation.session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Return session information
    return NextResponse.json({
      success: true,
      data: validation.session
    });

  } catch (error) {
    console.error('Session validation failed:', error);
    
    return NextResponse.json(
      { error: 'Session validation failed' },
      { status: 401 }
    );
  }
}

/**
 * POST /api/auth/me/refresh
 * Refresh session token
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize database connection if not already connected
    const dbService = DatabaseService.getInstance();
    await dbService.initialize();

    const body = await request.json();
    const refreshToken = body.refreshToken || request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // Refresh session
    const sessionService = SessionService.getInstance();
    const sessionResponse = await sessionService.refreshSession({ refreshToken });

    // Update cookies
    const response = NextResponse.json({
      success: true,
      data: sessionResponse
    });

    response.cookies.set('sessionToken', sessionResponse.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    if (sessionResponse.refreshToken) {
      response.cookies.set('refreshToken', sessionResponse.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/api/auth'
      });
    }

    return response;

  } catch (error) {
    console.error('Token refresh failed:', error);
    
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 401 }
    );
  }
}
