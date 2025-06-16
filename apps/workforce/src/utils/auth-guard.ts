import { NextRequest, NextResponse } from 'next/server';
import { SessionService, DatabaseService } from '@automation-ai/database';
import { ISession } from '@automation-ai/types';

/**
 * Session data interface for type safety - using ISession from types
 */
type SessionData = ISession;

/**
 * Authentication guard utility for API routes
 */
export class AuthGuard {
  /**
   * Validate session and return user session data
   */
  static async validateRequest(request: NextRequest): Promise<
    | { isValid: false; error: string; status: number }
    | { isValid: true; session: SessionData; sessionToken: string }
  > {
    try {
      // Initialize database connection if not already connected
      const dbService = DatabaseService.getInstance();
      await dbService.initialize();

      // Get session token from various sources
      const sessionToken = 
        request.headers.get('x-session-token') || // From middleware
        request.cookies.get('sessionToken')?.value ||
        request.headers.get('Authorization')?.replace('Bearer ', '');

      if (!sessionToken) {
        return {
          isValid: false,
          error: 'No session token provided',
          status: 401
        };
      }

      // Validate session
      const sessionService = SessionService.getInstance();
      const validation = await sessionService.validateSession(sessionToken);

      if (!validation.isValid || !validation.session) {
        return {
          isValid: false,
          error: 'Invalid or expired session',
          status: 401
        };
      }

      return {
        isValid: true,
        session: validation.session as SessionData,
        sessionToken
      };

    } catch (error) {
      console.error('Auth guard validation failed:', error);
      return {
        isValid: false,
        error: 'Authentication validation failed',
        status: 500
      };
    }
  }

  /**
   * Create an authenticated API handler wrapper
   */
  static withAuth(handler: (request: NextRequest, session: SessionData) => Promise<NextResponse>) {
    return async (request: NextRequest) => {
      const authResult = await AuthGuard.validateRequest(request);

      if (!authResult.isValid) {
        return NextResponse.json(
          { error: authResult.error },
          { status: authResult.status }
        );
      }

      // Call the original handler with validated session
      return handler(request, authResult.session);
    };
  }

  /**
   * Check if user has required permissions
   */
  static hasPermission(session: SessionData, requiredPermission: string): boolean {
    if (!session.permissions || !Array.isArray(session.permissions)) {
      return false;
    }
    return session.permissions.includes(requiredPermission);
  }

  /**
   * Check if user has any of the required roles
   */
  static hasRole(session: SessionData, requiredRoles: string | string[]): boolean {
    if (!session.roles || !Array.isArray(session.roles)) {
      return false;
    }

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.some(role => session.roles?.includes(role) ?? false);
  }

  /**
   * Check if user belongs to specific organization
   */
  static belongsToOrganization(session: SessionData, organizationId: string): boolean {
    const isCurrentOrg = session.currentOrg?.id === organizationId;
    const isAvailableOrg = session.availableOrgs?.some((org) => org.id === organizationId) ?? false;
    return isCurrentOrg || isAvailableOrg;
  }

  /**
   * Create permission-based API handler wrapper
   */
  static withPermission(permission: string, handler: (request: NextRequest, session: SessionData) => Promise<NextResponse>) {
    return AuthGuard.withAuth(async (request: NextRequest, session: SessionData) => {
      if (!AuthGuard.hasPermission(session, permission)) {
        return NextResponse.json(
          { error: `Permission required: ${permission}` },
          { status: 403 }
        );
      }
      return handler(request, session);
    });
  }

  /**
   * Create role-based API handler wrapper
   */
  static withRole(roles: string | string[], handler: (request: NextRequest, session: SessionData) => Promise<NextResponse>) {
    return AuthGuard.withAuth(async (request: NextRequest, session: SessionData) => {
      if (!AuthGuard.hasRole(session, roles)) {
        const roleList = Array.isArray(roles) ? roles.join(', ') : roles;
        return NextResponse.json(
          { error: `Role required: ${roleList}` },
          { status: 403 }
        );
      }
      return handler(request, session);
    });
  }

  /**
   * Create organization-scoped API handler wrapper
   */
  static withOrganization(handler: (request: NextRequest, session: SessionData, orgId: string) => Promise<NextResponse>) {
    return AuthGuard.withAuth(async (request: NextRequest, session: SessionData) => {
      const orgId = session.currentOrg?.id;
      if (!orgId) {
        return NextResponse.json(
          { error: 'No organization context available' },
          { status: 400 }
        );
      }
      return handler(request, session, orgId);
    });
  }
}
