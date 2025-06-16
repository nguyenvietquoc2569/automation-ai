import { NextRequest, NextResponse } from 'next/server';
import { SessionService, DatabaseService } from '@automation-ai/database';

/**
 * POST /api/auth/logout
 * Logout user and revoke session
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize database connection if not already connected
    const dbService = DatabaseService.getInstance();
    await dbService.initialize();

    // Get session token from cookie or Authorization header
    const sessionToken = request.cookies.get('sessionToken')?.value ||
                        request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 401 }
      );
    }

    // Revoke session
    const sessionService = SessionService.getInstance();
    await sessionService.revokeSession(sessionToken);

    // Clear cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

    response.cookies.delete('sessionToken');
    response.cookies.delete('refreshToken');

    return response;

  } catch (error) {
    console.error('Logout failed:', error);
    
    // Even if logout fails, clear cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logout completed'
    });

    response.cookies.delete('sessionToken');
    response.cookies.delete('refreshToken');

    return response;
  }
}

/**
 * GET /api/auth/logout
 * Health check for logout endpoint
 */
export async function GET() {
  return NextResponse.json({
    message: 'Logout API is available',
    endpoints: {
      POST: 'Logout user and revoke session'
    }
  });
}
