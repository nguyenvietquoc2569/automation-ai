'use client';
import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from './session-provider';

interface OrganizationGuardProps {
  children: React.ReactNode;
  errorPath?: string;
  loadingComponent?: React.ReactNode;
  excludePaths?: string[]; // Paths to exclude from organization checking
}

/**
 * Organization Guard Component
 * Ensures user has a valid organization selected
 * Attempts to switch to another available organization if current is missing
 * Redirects to error page if no organizations are available
 */
export function OrganizationGuard({
  children,
  errorPath = '/dashboard/error/none-org',
  loadingComponent = <div>Checking organization...</div>,
  excludePaths = ['/dashboard/error'], // Exclude error pages by default
}: OrganizationGuardProps) {
  const { session, isLoading, isAuthenticated, switchOrganization } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleMissingOrganization = useCallback(async () => {
    if (!session || !isAuthenticated) return;

    // Check if current path should be excluded from organization checking
    const isExcludedPath = excludePaths.some(excludePath => pathname.startsWith(excludePath));
    if (isExcludedPath) {
      console.log('OrganizationGuard: Path is excluded from organization checking:', pathname);
      return;
    }

    // Get available active organizations
    const activeOrgs = session.availableOrgs?.filter(org => org.isActive !== false) || [];

    console.log('OrganizationGuard: Checking organization status', {
      pathname,
      hasCurrentOrg: !!session.currentOrg,
      currentOrgId: session.currentOrgId,
      isCurrentOrgActive: session.currentOrg?.isActive !== false,
      availableOrgsCount: session.availableOrgs?.length || 0,
      activeOrgsCount: activeOrgs.length,
      currentOrg: session.currentOrg?.name,
      availableOrgs: session.availableOrgs?.map(org => `${org.name} (${org.isActive ? 'active' : 'inactive'})`)
    });

    // Check if current organization is disabled
    if (session.currentOrg && session.currentOrg.isActive === false) {
      console.log('OrganizationGuard: Current organization is disabled:', session.currentOrg.name);
      
      // Try to switch to another active organization
      if (activeOrgs.length > 0) {
        try {
          console.log('OrganizationGuard: Switching to active organization:', activeOrgs[0].name);
          await switchOrganization(activeOrgs[0].id);
          return; // Don't redirect, let the session update
        } catch (error) {
          console.error('OrganizationGuard: Failed to auto-switch from disabled organization:', error);
          // Continue to error page if switch fails
        }
      } else {
        console.log('OrganizationGuard: No active organizations available, redirecting to error page');
        router.push(errorPath);
        return;
      }
    }

    // If no current organization but has available active organizations, switch to the first one
    if (!session.currentOrg && activeOrgs.length > 0) {
      try {
        console.log('OrganizationGuard: No current organization found, switching to:', activeOrgs[0].name);
        await switchOrganization(activeOrgs[0].id);
        return; // Don't redirect, let the session update
      } catch (error) {
        console.error('OrganizationGuard: Failed to auto-switch organization:', error);
        // Continue to error page if switch fails
      }
    }

    // If no current organization and no available organizations, redirect to error page
    if (!session.currentOrg && activeOrgs.length === 0) {
      console.log('OrganizationGuard: No active organizations available, redirecting to error page');
      router.push(errorPath);
    }
  }, [session, isAuthenticated, switchOrganization, router, errorPath, pathname, excludePaths]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && session) {
      handleMissingOrganization();
    }
  }, [isLoading, isAuthenticated, session, handleMissingOrganization]);

  // Check if current path should be excluded from organization checking
  const isExcludedPath = excludePaths.some(excludePath => pathname.startsWith(excludePath));
  
  if (isExcludedPath) {
    console.log('OrganizationGuard: Rendering excluded path without organization check:', pathname);
  }

  // Show loading while checking session or switching organization
  if (isLoading) {
    return loadingComponent;
  }

  // If not authenticated, let the ProtectedRoute handle it
  if (!isAuthenticated || !session) {
    return children;
  }

  // If path is excluded from organization checking, render children directly
  if (isExcludedPath) {
    return children;
  }

  // If we have a current organization, render children
  if (session.currentOrg) {
    return children;
  }

  // If we're in the process of switching organizations or no orgs available, show loading
  if (!session.currentOrg) {
    return loadingComponent;
  }

  return children;
}

/**
 * Higher-order component for organization protection
 */
export function withOrganizationGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<OrganizationGuardProps, 'children'> = {}
) {
  return function OrganizationProtectedComponent(props: P) {
    return (
      <OrganizationGuard {...options}>
        <Component {...props} />
      </OrganizationGuard>
    );
  };
}

/**
 * Hook to check organization status and provide utilities
 */
export function useOrganization() {
  const { session, switchOrganization } = useSession();
  
  const activeOrgs = session?.availableOrgs?.filter(org => org.isActive !== false) || [];
  const isCurrentOrganizationActive = session?.currentOrg?.isActive !== false;
  
  return {
    currentOrg: session?.currentOrg || null,
    currentOrgId: session?.currentOrgId || null,
    availableOrgs: session?.availableOrgs || [],
    availableOrgIds: session?.availableOrgIds || [],
    activeOrgs,
    hasOrganization: !!session?.currentOrg,
    hasAvailableOrgs: !!(session?.availableOrgs && session.availableOrgs.length > 0),
    hasActiveOrgs: activeOrgs.length > 0,
    isCurrentOrganizationActive,
    switchOrganization,
  };
}
