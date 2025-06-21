export interface SessionUser {
  id: string;
  name: string;
  username: string;
  ename: string;
  emailid: string;
  title?: string;
  avatar?: string;
  permissions: string[];
}

export interface SessionOrganization {
  id: string;
  name: string;
  displayName?: string;
  logo?: string;
  isActive?: boolean;
  subscription?: {
    plan?: 'free' | 'basic' | 'premium' | 'enterprise';
    features?: string[];
  };
}

export interface SessionData {
  sessionToken: string;
  user: SessionUser;
  currentOrgId: string | null; // Changed: Store only the ID
  availableOrgIds: string[]; // Changed: Store only IDs
  currentOrg?: SessionOrganization; // Populated data (optional for backwards compatibility)
  availableOrgs?: SessionOrganization[]; // Populated data (optional for backwards compatibility)
  expiresAt: Date;
  permissions: string[];
  roles: string[];
}

export interface SessionContextValue {
  session: SessionData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
}

export interface SessionProviderProps {
  children: React.ReactNode;
  initialSession?: SessionData | null;
  loginPath?: string;
  onSessionExpired?: () => void;
}
