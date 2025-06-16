'use client';
import { SessionProvider } from '@automation-ai/fe-session-management';

interface ClientSessionWrapperProps {
  children: React.ReactNode;
  loginPath?: string;
}

/**
 * Client-only session wrapper component
 * This provides session management without server-side session fetching
 */
export function ClientSessionWrapper({ 
  children, 
  loginPath = '/login' 
}: ClientSessionWrapperProps) {
  return (
    <SessionProvider 
      initialSession={null} 
      loginPath={loginPath}
    >
      {children}
    </SessionProvider>
  );
}
