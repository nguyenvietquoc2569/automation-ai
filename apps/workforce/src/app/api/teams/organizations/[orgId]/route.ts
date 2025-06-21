import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@automation-ai/be-teams-management';
import { SessionService, DatabaseService } from '@automation-ai/database';

/**
 * PUT /api/teams/organizations/[orgId]
 * Update organization details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { orgId: string } }
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

    // Get organization ID from URL params
    const orgId = params.orgId;
    if (!orgId) {
      return NextResponse.json({
        success: false,
        error: 'Organization ID is required'
      }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { name, displayName, description } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Organization name is required'
      }, { status: 400 });
    }

    // Use the session user ID for security
    const requestUserId = validation.session.userId;

    // Update organization
    const updatedOrganization = await OrganizationService.updateOrganization(
      orgId,
      {
        name: name.trim(),
        displayName: displayName?.trim() || undefined,
        description: description?.trim() || undefined,
      },
      requestUserId
    );

    return NextResponse.json({
      success: true,
      organization: updatedOrganization
    });

  } catch (error) {
    console.error('Error in PUT /api/teams/organizations/[orgId]:', error);
    
    // Handle different types of errors
    let errorMessage = 'Failed to update organization';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check if it's a validation error (usually from MongoDB/Mongoose)
      if (error.message.includes('Validation failed') || error.message.includes('validation')) {
        statusCode = 400; // Bad Request for validation errors
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: statusCode });
  }
}
