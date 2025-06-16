'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from './session-provider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
  loginPath?: string;
  unauthorizedPath?: string;
  loadingComponent?: React.ReactNode;
}

/**
 * Client-side protected route component
 * Redirects to login if not authenticated or shows fallback for insufficient permissions
 */
export function ProtectedRoute({
  children,
  requiredPermissions = [],
  fallback = null,
  loginPath = '/login',
  unauthorizedPath = '/unauthorized',
  loadingComponent = <div>Loading...</div>,
}: ProtectedRouteProps) {
  const { session, isLoading, isAuthenticated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(loginPath);
    }
  }, [isLoading, isAuthenticated, router, loginPath]);

  // Show loading while checking session
  if (isLoading) {
    return loadingComponent;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !session) {
    return null; // Will redirect via useEffect
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
      // Redirect to unauthorized page
      router.push(unauthorizedPath);
      return null;
    }
  }

  return children;
}

/**
 * Higher-order component for protecting routes
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Hook to check if user has specific permission
 */
export function usePermission(permission: string): boolean {
  const { session } = useSession();
  return session?.permissions.includes(permission) ?? false;
}

/**
 * Hook to check if user has any of the specified permissions
 */
export function useAnyPermission(permissions: string[]): boolean {
  const { session } = useSession();
  if (!session) return false;
  return permissions.some(permission => session.permissions.includes(permission));
}

/**
 * Hook to check if user has all of the specified permissions
 */
export function useAllPermissions(permissions: string[]): boolean {
  const { session } = useSession();
  if (!session) return false;
  return permissions.every(permission => session.permissions.includes(permission));
}
