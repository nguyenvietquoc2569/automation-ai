import { redirect } from 'next/navigation';
import { ServerSessionManager } from './server-session';
import { SessionData } from './types';

interface SessionGuardProps {
  children: React.ReactNode;
  loginPath?: string;
  requireAuth?: boolean;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

/**
 * Server Component for session-based authentication guard
 * This component runs on the server and can redirect before the page loads
 */
export async function SessionGuard({
  children,
  loginPath = '/login',
  requireAuth = true,
  requiredPermissions = [],
  fallback = null,
}: SessionGuardProps) {
  if (!requireAuth) {
    return children;
  }

  try {
    const session = await ServerSessionManager.getServerSession();

    // Check if user is authenticated
    if (!session) {
      redirect(loginPath);
    }

    // Check if session is expired
    if (new Date() >= new Date(session.expiresAt)) {
      redirect(loginPath);
    }

    // Check required permissions
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission =>
        session.permissions.includes(permission)
      );

      if (!hasAllPermissions) {
        if (fallback) {
          return fallback;
        }
        redirect('/unauthorized');
      }
    }

    return children;
  } catch (error) {
    console.error('Session guard error:', error);
    redirect(loginPath);
  }
}

/**
 * Server Component that provides session data to child components
 * Use this in your layout to pass session data to client components
 */
export async function SessionLayout({
  children,
  loginPath = '/login',
}: {
  children: (session: SessionData | null) => React.ReactNode;
  loginPath?: string;
}) {
  try {
    const session = await ServerSessionManager.getServerSession();

    // If no session, just return children with null session
    // Let client-side handle redirects for better UX
    return children(session);
  } catch (error) {
    console.error('Session layout error:', error);
    return children(null);
  }
}

/**
 * Server utility to check if user has specific permission
 */
export async function requirePermission(
  permission: string,
  redirectPath = '/unauthorized'
): Promise<void> {
  const hasPermission = await ServerSessionManager.hasPermission(permission);
  if (!hasPermission) {
    redirect(redirectPath);
  }
}

/**
 * Server utility to require authentication
 */
export async function requireAuth(loginPath = '/login'): Promise<SessionData> {
  const session = await ServerSessionManager.getServerSession();
  if (!session) {
    redirect(loginPath);
  }
  return session;
}

/**
 * Server utility to get session or redirect
 */
export async function getSessionOrRedirect(
  loginPath = '/login'
): Promise<SessionData | null> {
  try {
    const session = await ServerSessionManager.getServerSession();
    if (!session) {
      redirect(loginPath);
    }
    return session;
  } catch (error) {
    console.error('Get session error:', error);
    redirect(loginPath);
  }
}
