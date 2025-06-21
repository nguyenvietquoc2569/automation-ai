import { NextRequest, NextResponse } from 'next/server';
import { OrganizationService } from '@automation-ai/be-teams-management';
import { SessionService, DatabaseService } from '@automation-ai/database';

/**
 * GET /api/teams/organizations
 * Get all organizations that the current user belongs to
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

    const userId = validation.session.userId;

    // Get organizations for the user
    const organizations = await OrganizationService.getUserOrganizations(userId);

    return NextResponse.json({
      success: true,
      organizations
    });

  } catch (error) {
    console.error('Error in GET /api/teams/organizations:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch organizations'
    }, { status: 500 });
  }
}

/**
 * POST /api/teams/organizations
 * Create a new organization
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

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Organization name is required'
      }, { status: 400 });
    }

    if (name.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Organization name must be at least 2 characters'
      }, { status: 400 });
    }

    if (name.trim().length > 100) {
      return NextResponse.json({
        success: false,
        error: 'Organization name must be less than 100 characters'
      }, { status: 400 });
    }

    if (description && (typeof description !== 'string' || description.length > 500)) {
      return NextResponse.json({
        success: false,
        error: 'Description must be a string with less than 500 characters'
      }, { status: 400 });
    }

    const userId = validation.session.userId;

    // Create the organization
    const organization = await OrganizationService.createOrganization(
      {
        name: name.trim(),
        description: description?.trim()
      },
      userId
    );

    return NextResponse.json({
      success: true,
      organization
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/teams/organizations:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create organization'
    }, { status: 500 });
  }
}
