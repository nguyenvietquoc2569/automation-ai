import { SessionProvider } from './session-provider';
import { ServerSessionManager } from './server-session';
import { SessionData } from './types';

interface SessionLayoutWrapperProps {
  children: React.ReactNode;
  loginPath?: string;
  onSessionExpired?: () => void;
}

/**
 * Server Component that fetches session data and provides it to the SessionProvider
 * Use this in your root layout to provide session management throughout your app
 */
export async function SessionLayoutWrapper({
  children,
  loginPath = '/login',
  onSessionExpired,
}: SessionLayoutWrapperProps) {
  let initialSession: SessionData | null = null;

  try {
    // Get session data on the server
    initialSession = await ServerSessionManager.getServerSession();
  } catch (error) {
    console.error('Failed to get server session:', error);
    // Continue with null session - client will handle authentication
  }

  return (
    <SessionProvider
      initialSession={initialSession}
      loginPath={loginPath}
      onSessionExpired={onSessionExpired}
    >
      {children}
    </SessionProvider>
  );
}
