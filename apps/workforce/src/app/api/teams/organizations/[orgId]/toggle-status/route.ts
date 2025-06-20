import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@automation-ai/be-teams-management';
import { SessionService, DatabaseService } from '@automation-ai/database';

/**
 * POST /api/teams/organizations/[orgId]/toggle-status
 * Toggle the active status of an organization
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    // Initialize database connection if not already connected
    const dbService = DatabaseService.getInstance();
    await dbService.initialize();

    // Get session token from cookie or Authorization header
    const sessionToken = request.cookies.get('sessionToken')?.value ||
                        request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - No session token provided'
      }, { status: 401 });
    }

    // Validate session
    const sessionService = SessionService.getInstance();
    const validation = await sessionService.validateSession(sessionToken);

    if (!validation.isValid || !validation.session) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Invalid session'
      }, { status: 401 });
    }

    const { orgId } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (!orgId) {
      return NextResponse.json({
        success: false,
        error: 'Organization ID is required'
      }, { status: 400 });
    }

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'isActive must be a boolean value'
      }, { status: 400 });
    }

    // Use the session user ID for security
    const requestUserId = validation.session.userId;

    // Toggle organization status
    const updatedOrganization = await OrganizationService.toggleOrganizationStatus(
      orgId, 
      isActive, 
      requestUserId
    );

    return NextResponse.json({
      success: true,
      organization: updatedOrganization
    });

  } catch (error) {
    console.error('Error in POST /api/teams/organizations/[orgId]/toggle-status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to toggle organization status'
    }, { status: 500 });
  }
}
