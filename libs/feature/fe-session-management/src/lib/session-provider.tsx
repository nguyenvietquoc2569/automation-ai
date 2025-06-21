'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SessionData, SessionContextValue, SessionProviderProps } from './types';

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

/**
 * Client-side session management API
 */
class ClientSessionAPI {
  private static baseUrl = '/api/auth';

  static async getCurrentSession(): Promise<SessionData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json() as {
        success: boolean;
        data?: {
          user: SessionData['user'];
          currentOrgId: string | null;
          availableOrgIds: string[];
          currentOrg?: SessionData['currentOrg'];
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
        sessionToken: '', // Token is in httpOnly cookie
        user: data.data.user,
        currentOrgId: data.data.currentOrgId,
        availableOrgIds: data.data.availableOrgIds,
        currentOrg: data.data.currentOrg,
        availableOrgs: data.data.availableOrgs || [],
        expiresAt: new Date(data.data.expiresAt),
        permissions: data.data.permissions || [],
        roles: data.data.roles || [],
      };
    } catch (error) {
      console.error('Failed to get current session:', error);
      return null;
    }
  }

  static async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  static async refreshSession(): Promise<SessionData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json() as {
        success: boolean;
        data?: {
          user: SessionData['user'];
          currentOrgId: string | null;
          availableOrgIds: string[];
          currentOrg?: SessionData['currentOrg'];
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
        sessionToken: '',
        user: data.data.user,
        currentOrgId: data.data.currentOrgId,
        availableOrgIds: data.data.availableOrgIds,
        currentOrg: data.data.currentOrg,
        availableOrgs: data.data.availableOrgs || [],
        expiresAt: new Date(data.data.expiresAt),
        permissions: data.data.permissions || [],
        roles: data.data.roles || [],
      };
    } catch (error) {
      console.error('Session refresh failed:', error);
      return null;
    }
  }
}

/**
 * Session Provider Component
 * Manages session state on the client side
 */
export function SessionProvider({ 
  children, 
  initialSession = null, 
  loginPath = '/login',
  onSessionExpired 
}: SessionProviderProps) {
  const [session, setSession] = useState<SessionData | null>(initialSession);
  const [isLoading, setIsLoading] = useState(!!initialSession === false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize session if not provided
  useEffect(() => {
    if (!mounted) return;
    
    if (initialSession === null) {
      // No initial session provided, check for existing session
      const checkSession = async () => {
        setIsLoading(true);
        try {
          const currentSession = await ClientSessionAPI.getCurrentSession();
          setSession(currentSession);
        } catch (error) {
          console.error('Session initialization failed:', error);
          setSession(null);
        } finally {
          setIsLoading(false);
        }
      };
      checkSession();
    } else {
      // Initial session provided from server
      setSession(initialSession);
      setIsLoading(false);
    }
  }, [initialSession, mounted]);

  // Check session expiration
  useEffect(() => {
    if (!session) return;

    const checkExpiration = () => {
      if (new Date() >= new Date(session.expiresAt)) {
        setSession(null);
        if (onSessionExpired) {
          onSessionExpired();
        } else {
          router.push(loginPath);
        }
      }
    };

    // Check immediately
    checkExpiration();

    // Set up interval to check every minute
    const interval = setInterval(checkExpiration, 60000);

    return () => clearInterval(interval);
  }, [session, onSessionExpired, router, loginPath]);

  const logout = useCallback(async () => {
    try {
      await ClientSessionAPI.logout();
      setSession(null);
      router.push(loginPath);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear session locally
      setSession(null);
      router.push(loginPath);
    }
  }, [router, loginPath]);

  const refreshSession = useCallback(async () => {
    try {
      const newSession = await ClientSessionAPI.refreshSession();
      setSession(newSession);
    } catch (error) {
      console.error('Session refresh failed:', error);
      setSession(null);
    }
  }, []);

  const switchOrganization = useCallback(async (orgId: string) => {
    try {
      const response = await fetch('/api/auth/switch-organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ organizationId: orgId }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to switch organization';
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData === 'object' && 'error' in errorData) {
            errorMessage = errorData.error as string || errorMessage;
          }
        } catch {
          // If parsing error response fails, use default message
        }
        throw new Error(errorMessage);
      }

      // Refresh session to get updated organization data
      await refreshSession();
    } catch (error) {
      console.error('Switch organization failed:', error);
      throw error;
    }
  }, [refreshSession]);

  const contextValue: SessionContextValue = {
    session,
    isLoading,
    isAuthenticated: !!session && new Date() < new Date(session.expiresAt),
    logout,
    refreshSession,
    switchOrganization,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

/**
 * Hook to use session context
 */
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
