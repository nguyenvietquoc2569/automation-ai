import { cookies } from 'next/headers';
import { SessionData } from './types';

/**
 * Server-side session validation utility
 * This runs on the server and validates the session token
 */
export class ServerSessionManager {
  private static apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  /**
   * Get session data from server-side cookies
   * This is a server component function - only use in server components
   */
  static async getServerSession(): Promise<SessionData | null> {
    try {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get('sessionToken')?.value;

      if (!sessionToken) {
        return null;
      }

      // Validate session with backend API
      const response = await fetch(`${this.apiBaseUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Cookie': `sessionToken=${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json() as {
        success: boolean;
        data?: {
          user: SessionData['user'];
          currentOrg: SessionData['currentOrg'];
          availableOrgs?: SessionData['availableOrgs'];
          expiresAt: string;
          permissions?: string[];
          roles?: string[];
        };
      };
      
      if (!data.success || !data.data) {
        return null;
      }

      return {
        sessionToken,
        user: data.data.user,
        currentOrg: data.data.currentOrg,
        currentOrgId: data.data.currentOrg?.id || null,
        availableOrgs: data.data.availableOrgs || [],
        availableOrgIds: (data.data.availableOrgs || []).map(org => org.id),
        expiresAt: new Date(data.data.expiresAt),
        permissions: data.data.permissions || [],
        roles: data.data.roles || [],
      };

    } catch (error) {
      console.error('Server session validation failed:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated on server-side
   */
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getServerSession();
    return session !== null && new Date() < new Date(session.expiresAt);
  }

  /**
   * Get user permissions from server session
   */
  static async getUserPermissions(): Promise<string[]> {
    const session = await this.getServerSession();
    return session?.permissions || [];
  }

  /**
   * Check if user has specific permission
   */
  static async hasPermission(permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions();
    return permissions.includes(permission);
  }

  /**
   * Get current organization from server session
   */
  static async getCurrentOrganization(): Promise<SessionData['currentOrg'] | null> {
    const session = await this.getServerSession();
    return session?.currentOrg || null;
  }
}
