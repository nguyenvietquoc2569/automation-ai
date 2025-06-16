import { NextRequest, NextResponse } from 'next/server';
import { SessionService, DatabaseService } from '@automation-ai/database';
import { ISessionCreateRequest, SessionType } from '@automation-ai/types';

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize database connection if not already connected
    const dbService = DatabaseService.getInstance();
    await dbService.initialize();

    const body = await request.json();
    const { username, emailid, password, organizationId, rememberMe } = body;

    // Validate required fields
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (!username && !emailid) {
      return NextResponse.json(
        { error: 'Username or email is required' },
        { status: 400 }
      );
    }

    // Extract device information from request
    const deviceInfo = {
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
      platform: request.headers.get('sec-ch-ua-platform') || undefined,
    };

    // Prepare session creation request
    const sessionRequest: ISessionCreateRequest = {
      username,
      emailid,
      password,
      organizationId,
      sessionType: SessionType.WEB,
      device: deviceInfo,
      rememberMe: rememberMe || false,
    };

    // Create session using SessionService
    const sessionService = SessionService.getInstance();
    const sessionResponse = await sessionService.createSession(sessionRequest);

    // Set session token as httpOnly cookie for security
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: sessionResponse
    });

    // Set session cookie
    response.cookies.set('sessionToken', sessionResponse.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 24 hours
      path: '/'
    });

    // Set refresh token if provided
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
    console.error('Login failed:', error);
    
    // Handle specific authentication errors
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as Error).message;
      
      if (errorMessage.includes('Invalid credentials') || 
          errorMessage.includes('User not found') ||
          errorMessage.includes('Invalid password')) {
        return NextResponse.json(
          { error: 'Invalid username/email or password' },
          { status: 401 }
        );
      }
      
      if (errorMessage.includes('Account suspended') || 
          errorMessage.includes('User not active')) {
        return NextResponse.json(
          { error: 'Account is suspended or inactive. Please contact support.' },
          { status: 403 }
        );
      }
      
      if (errorMessage.includes('Organization not found') || 
          errorMessage.includes('not have access to')) {
        return NextResponse.json(
          { error: 'Access denied to the specified organization' },
          { status: 403 }
        );
      }
    }
    
    // Generic error response
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/login
 * Health check for login endpoint
 */
export async function GET() {
  return NextResponse.json({
    message: 'Login API is available',
    endpoints: {
      POST: 'Authenticate user and create session',
      GET: 'Health check'
    }
  });
}
