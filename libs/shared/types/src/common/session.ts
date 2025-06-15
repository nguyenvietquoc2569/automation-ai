import type { IUser } from './user.js';
import type { IOrg } from './organization.js';

/**
 * Session status enumeration
 */
export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  SUSPENDED = 'suspended'
}

/**
 * Session type enumeration
 */
export enum SessionType {
  WEB = 'web',
  API = 'api',
  MOBILE = 'mobile',
  SERVICE = 'service'
}

/**
 * Login method enumeration
 */
export enum LoginMethod {
  PASSWORD = 'password',
  SSO = 'sso',
  API_KEY = 'api_key',
  TOKEN = 'token',
  OAUTH = 'oauth'
}

/**
 * Device information interface
 */
export interface IDeviceInfo {
  userAgent?: string;
  ip?: string;
  platform?: string;
  browser?: string;
  version?: string;
  os?: string;
  deviceId?: string;
  fingerprint?: string;
}

/**
 * Session security information interface
 */
export interface ISessionSecurity {
  loginMethod: LoginMethod;
  mfaVerified?: boolean;
  riskScore?: number;
  geoLocation?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  lastActivity?: Date;
  deviceTrusted?: boolean;
}

/**
 * Session interface for user authentication and authorization
 */
export interface ISession {
  id?: string;
  sessionToken: string; // Unique session identifier/JWT token
  refreshToken?: string; // For token refresh
  userId: string; // Reference to the user
  currentOrgId: string; // Currently active organization
  status: SessionStatus;
  type: SessionType;
  
  // Session timing
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt: Date;
  lastAccessAt?: Date;
  
  // User and organization data (denormalized for performance)
  user?: Partial<IUser>; // Cached user data (without sensitive info)
  currentOrg?: Partial<IOrg>; // Cached current organization data
  availableOrgs?: Array<Partial<IOrg>>; // Organizations user has access to
  
  // Security and tracking
  security?: ISessionSecurity;
  device?: IDeviceInfo;
  
  // Permissions and roles for the current session
  permissions?: Array<string>; // Computed permissions for current org
  roles?: Array<string>; // User roles in current organization
  
  // Session metadata
  metadata?: {
    [key: string]: unknown;
  };
}

/**
 * Session creation/login request interface
 */
export interface ISessionCreateRequest {
  username?: string;
  emailid?: string;
  password?: string;
  organizationId?: string; // Optional: specific org to login to
  sessionType?: SessionType;
  device?: IDeviceInfo;
  rememberMe?: boolean; // For extended session duration
  mfaCode?: string; // Multi-factor authentication code
}

/**
 * Session response interface (what gets sent to client)
 */
export interface ISessionResponse {
  sessionToken: string;
  refreshToken?: string;
  expiresAt: Date;
  user: {
    id: string;
    name: string;
    username: string;
    ename: string;
    emailid: string;
    title?: string;
    avatar?: string;
    permissions: Array<string>;
  };
  currentOrg: {
    id: string;
    name: string;
    displayName?: string;
    logo?: string;
    subscription?: {
      plan?: 'free' | 'basic' | 'premium' | 'enterprise';
      features?: Array<string>;
    };
  };
  availableOrgs?: Array<{
    id: string;
    name: string;
    displayName?: string;
    logo?: string;
  }>;
  permissions: Array<string>;
  roles?: Array<string>;
}

/**
 * Session refresh request interface
 */
export interface ISessionRefreshRequest {
  refreshToken: string;
  sessionToken?: string;
}

/**
 * Session validation interface
 */
export interface ISessionValidation {
  isValid: boolean;
  session?: ISession;
  reason?: string; // Reason for invalid session
}

/**
 * Organization switch request interface
 */
export interface IOrgSwitchRequest {
  sessionToken: string;
  newOrgId: string;
}

/**
 * Session query filters interface
 */
export interface ISessionFilters {
  userId?: string;
  organizationId?: string;
  status?: SessionStatus;
  type?: SessionType;
  activeOnly?: boolean;
  expiredSince?: Date;
}
