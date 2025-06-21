import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@automation-ai/be-teams-management';
import { SessionService, DatabaseService } from '@automation-ai/database';

/**
 * GET /api/teams/organizations/[orgId]/roles
 * Get all roles for an organization (temporary implementation)
 */
export async function GET(
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
    const userId = validation.session.userId;

    // Get organization roles from the database
    const roles = await OrganizationService.getOrganizationRoles(orgId, userId);
   
    return NextResponse.json({
      success: true,
      roles: roles
    });

  } catch (error) {
    console.error('Error fetching organization roles:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
