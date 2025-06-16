import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@automation-ai/database';
import { AuthGuard } from '../../../../utils/auth-guard';

/**
 * POST /api/auth/switch-organization
 * Switch user to a different organization
 */
export const POST = AuthGuard.withAuth(async (request: NextRequest, session) => {
  try {
    console.log('Switching organization...');
    
    // Parse request body
    let body: { organizationId?: string } = {};
    try {
      const text = await request.text();
      if (text.trim()) {
        body = JSON.parse(text);
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    const { organizationId } = body;
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Check if user has access to the target organization
    if (!AuthGuard.belongsToOrganization(session, organizationId)) {
      return NextResponse.json(
        { error: 'Access denied to the specified organization' },
        { status: 403 }
      );
    }

    // Get session token from request
    const sessionToken = 
      request.headers.get('x-session-token') ||
      request.cookies.get('sessionToken')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token not found' },
        { status: 401 }
      );
    }

    // Switch organization
    const sessionService = SessionService.getInstance();
    const sessionResponse = await sessionService.switchOrganization({
      sessionToken,
      newOrgId: organizationId
    });

    // Update session token cookie with new organization context
    const response = NextResponse.json({
      success: true,
      message: 'Organization switched successfully',
      data: sessionResponse
    });

    // Update session token cookie
    response.cookies.set('sessionToken', sessionResponse.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    // Update refresh token if provided
    if (sessionResponse.refreshToken) {
      response.cookies.set('refreshToken', sessionResponse.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/api/auth'
      });
    }

    console.log(`Organization switched to: ${organizationId}`);
    return response;

  } catch (error) {
    console.error('Organization switch failed:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message === 'User does not have access to the specified organization') {
        return NextResponse.json(
          { error: 'Access denied to the specified organization' },
          { status: 403 }
        );
      }
      
      if (error.message === 'Organization not found or inactive') {
        return NextResponse.json(
          { error: 'Organization not found or inactive' },
          { status: 404 }
        );
      }
      
      if (error.message === 'User not found') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Organization switch failed' },
      { status: 500 }
    );
  }
});

/**
 * GET /api/auth/switch-organization
 * Get available organizations for the current user
 */
export const GET = AuthGuard.withAuth(async (request: NextRequest, session) => {
  try {
    console.log('Getting available organizations for user:', session.user?.id ?? 'unknown');
    
    return NextResponse.json({
      success: true,
      data: {
        currentOrganization: session.currentOrg,
        availableOrganizations: session.availableOrgs || [],
        canSwitchOrganizations: session.availableOrgs && session.availableOrgs.length > 1
      }
    });

  } catch (error) {
    console.error('Failed to get available organizations:', error);
    
    return NextResponse.json(
      { error: 'Failed to get available organizations' },
      { status: 500 }
    );
  }
});
