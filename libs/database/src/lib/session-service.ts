import { 
  Session, 
  User, 
  Organization,
  UserRole,
  type ISessionDocument,
  type IUserRoleDocument
} from './models';
import {
  ISessionCreateRequest,
  ISessionResponse,
  ISessionRefreshRequest,
  ISessionValidation,
  IOrgSwitchRequest,
  SessionStatus,
  SessionType,
  LoginMethod
} from '@automation-ai/types';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export class SessionService {
  private static instance: SessionService;
  private readonly JWT_SECRET: string;
  private readonly DEFAULT_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly EXTENDED_SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

  private constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-change-in-production';
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  /**
   * Create a new session (login)
   */
  public async createSession(request: ISessionCreateRequest): Promise<ISessionResponse> {
    const { username, emailid, password, organizationId, sessionType, device, rememberMe, mfaCode } = request;

    // Find user by username or email
    const identifier = username || emailid;
    if (!identifier || !password) {
      throw new Error('Username/email and password are required');
    }

    const user = await User.findOne({
      $or: [
        { username: identifier.toLowerCase() },
        { emailid: identifier.toLowerCase() }
      ],
      active: true
    }).select('+password'); // Explicitly include password field

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Determine the organization to use
    let targetOrgId = organizationId;
    if (!targetOrgId) {
      // Use current org or first available org from user roles
      targetOrgId = user.currentOrgId;
      
      if (!targetOrgId) {
        // Get first organization where user has an active role
        const firstUserRole = await UserRole.findOne({
          userId: user.id,
          isActive: true
        });
        targetOrgId = firstUserRole?.organizationId;
      }
    }

    if (!targetOrgId) {
      throw new Error('No organization found for user');
    }

    // Verify user has access to the organization through UserRole
    const userRoleInOrg = await UserRole.findOne({
      userId: user.id,
      organizationId: targetOrgId,
      isActive: true
    });

    if (!userRoleInOrg) {
      throw new Error('User does not have access to the specified organization');
    }

    // Get organization details
    const organization = await Organization.findById(targetOrgId);
    if (!organization || !organization.active) {
      throw new Error('Organization not found or inactive');
    }

    // Generate session tokens
    const sessionToken = this.generateSessionToken();
    const refreshToken = crypto.randomBytes(32).toString('hex');

    // Get all organizations where user has active roles
    const userOrgRoles = await UserRole.find({
      userId: user.id,
      isActive: true
    }).distinct('organizationId');

    // Calculate expiration
    const duration = rememberMe ? this.EXTENDED_SESSION_DURATION : this.DEFAULT_SESSION_DURATION;
    const expiresAt = new Date(Date.now() + duration);

    // Create session document
    const sessionData = {
      sessionToken,
      refreshToken,
      userId: user.id,
      currentOrgId: targetOrgId,
      availableOrgIds: userOrgRoles, // Store only IDs from UserRole
      status: SessionStatus.ACTIVE,
      type: sessionType || SessionType.WEB,
      expiresAt,
      lastAccessAt: new Date(),
      
      // Cache user data (without sensitive info)
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        ename: user.ename,
        emailid: user.emailid,
        title: user.title,
        avatar: user.avatar,
        permissions: user.permissions
      },
      
      // Set permissions and roles for this session based on user roles in current org
      permissions: await this.getUserPermissionsInOrg(user.id, targetOrgId),
      roles: await this.getUserRolesInOrg(user.id, targetOrgId),
      
      // Security information
      security: {
        loginMethod: LoginMethod.PASSWORD,
        mfaVerified: !!mfaCode, // If MFA code provided, mark as verified
        riskScore: 0, // Could be computed based on device, location, etc.
        lastActivity: new Date(),
        deviceTrusted: false // Could be determined based on device history
      },
      
      // Device information
      device: device || {},
      
      // Session metadata
      metadata: {
        loginTime: new Date(),
        userAgent: device?.userAgent,
        ip: device?.ip
      }
    };

    const session = await Session.create(sessionData);

    // Update user's current organization if it changed
    if (user.currentOrgId !== targetOrgId) {
      user.currentOrgId = targetOrgId;
      await user.save();
    }

    // Return session response
    return await this.buildSessionResponse(session);
  }

  /**
   * Validate and return session information
   */
  public async validateSession(sessionToken: string): Promise<ISessionValidation> {
    try {
      const session = await Session.findByToken(sessionToken);
      
      if (!session) {
        return { isValid: false, reason: 'Session not found or expired' };
      }

      if (session.isExpired()) {
        await session.revokeSession();
        return { isValid: false, reason: 'Session expired' };
      }

      // Update last access time
      await session.updateActivity();

      return { isValid: true, session };
    } catch (error) {
      return { 
        isValid: false, 
        reason: `Session validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Refresh session token
   */
  public async refreshSession(request: ISessionRefreshRequest): Promise<ISessionResponse> {
    const { refreshToken } = request;

    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    const session = await Session.findOne({ 
      refreshToken,
      status: SessionStatus.ACTIVE 
    });

    if (!session || session.isExpired()) {
      throw new Error('Invalid or expired refresh token');
    }

    // Generate new tokens
    const newSessionToken = this.generateSessionToken();
    const newRefreshToken = crypto.randomBytes(32).toString('hex');
    
    // Extend session expiration
    const duration = this.DEFAULT_SESSION_DURATION;
    session.expiresAt = new Date(Date.now() + duration);
    session.sessionToken = newSessionToken;
    session.refreshToken = newRefreshToken;
    
    await session.updateActivity();
    await session.save();

    return await this.buildSessionResponse(session);
  }

  /**
   * Switch organization for current session
   */
  public async switchOrganization(request: IOrgSwitchRequest): Promise<ISessionResponse> {
    const { sessionToken, newOrgId } = request;

    const validation = await this.validateSession(sessionToken);
    if (!validation.isValid || !validation.session) {
      throw new Error('Invalid session');
    }

    const session = validation.session as ISessionDocument;
    const user = await User.findById(session.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Verify user has access to the new organization through UserRole
    const userRoleInNewOrg = await UserRole.findOne({
      userId: user.id,
      organizationId: newOrgId,
      isActive: true
    });

    if (!userRoleInNewOrg) {
      throw new Error('User does not have access to the specified organization');
    }

    // Verify organization exists and is active
    const newOrg = await Organization.findById(newOrgId);
    if (!newOrg || !newOrg.active) {
      throw new Error('Organization not found or inactive');
    }

    // Update session - only store the ID
    session.currentOrgId = newOrgId;

    // Update user's current organization
    user.currentOrgId = newOrgId;
    await user.save();

    await session.updateActivity();
    await session.save();

    return await this.buildSessionResponse(session);
  }

  /**
   * Revoke session (logout)
   */
  public async revokeSession(sessionToken: string): Promise<void> {
    const session = await Session.findOne({ sessionToken });
    if (session) {
      await session.revokeSession();
    }
  }

  /**
   * Revoke all sessions for a user
   */
  public async revokeAllUserSessions(userId: string): Promise<void> {
    await Session.revokeAllByUser(userId);
  }

  /**
   * Clean up expired sessions
   */
  public async cleanupExpiredSessions(): Promise<number> {
    return await Session.revokeExpiredSessions();
  }

  /**
   * Get active sessions for a user
   */
  public async getUserActiveSessions(userId: string): Promise<ISessionDocument[]> {
    return await Session.findActiveByUser(userId);
  }

  /**
   * Generate a JWT session token
   */
  private generateSessionToken(): string {
    const payload = {
      id: crypto.randomBytes(16).toString('hex'),
      iat: Math.floor(Date.now() / 1000)
    };
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: '24h' });
  }

  /**
   * Build session response object - populates organization data from database
   */
  private async buildSessionResponse(session: ISessionDocument): Promise<ISessionResponse> {
    if (!session.user) {
      throw new Error('Session missing required user data');
    }

    // Get fresh organization IDs from UserRole (to ensure we have the latest data)
    const freshAvailableOrgIds = await UserRole.find({
      userId: session.userId,
      isActive: true
    }).distinct('organizationId');

    // Update the session document if the available orgs have changed
    if (JSON.stringify(session.availableOrgIds?.sort()) !== JSON.stringify(freshAvailableOrgIds.sort())) {
      session.availableOrgIds = freshAvailableOrgIds;
      await session.save();
    }

    // Ensure current org is valid and user has access to it
    let validCurrentOrgId: string | null = session.currentOrgId;
    if (validCurrentOrgId && !freshAvailableOrgIds.includes(validCurrentOrgId)) {
      // Current org is not in user's available orgs, switch to first available
      validCurrentOrgId = freshAvailableOrgIds[0] || null;
      if (validCurrentOrgId && validCurrentOrgId !== session.currentOrgId) {
        session.currentOrgId = validCurrentOrgId;
        await session.save();
      } else if (!validCurrentOrgId) {
        // User has no available organizations - this is a problematic state
        // For now, set currentOrgId to empty string to avoid null assignment
        session.currentOrgId = '';
        await session.save();
      }
    }

    // If no current org but user has available orgs, set the first one
    if (!validCurrentOrgId && freshAvailableOrgIds.length > 0) {
      validCurrentOrgId = freshAvailableOrgIds[0];
      session.currentOrgId = validCurrentOrgId;
      await session.save();
    } else if (!validCurrentOrgId) {
      // Edge case: user has no organizations at all
      validCurrentOrgId = '';
      session.currentOrgId = '';
      await session.save();
    }

    // Populate current organization
    let currentOrg = null;
    if (validCurrentOrgId) {
      const org = await Organization.findById(validCurrentOrgId);
      if (org) {
        currentOrg = {
          id: org.id,
          name: org.name,
          displayName: org.displayName,
          logo: org.logo,
          isActive: org.active,
          subscription: org.subscription
        };
      }
    }

    // Populate available organizations using fresh data
    const availableOrgs = [];
    if (freshAvailableOrgIds?.length) {
      const orgs = await Organization.find({
        _id: { $in: freshAvailableOrgIds }
        // Note: Don't filter by active:true here, let frontend handle inactive orgs
      }).select('name displayName logo active');

      availableOrgs.push(...orgs.map(org => ({
        id: org.id,
        name: org.name,
        displayName: org.displayName,
        logo: org.logo,
        isActive: org.active
      })));
    }

    return {
      sessionToken: session.sessionToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
      user: {
        id: session.user.id || '',
        name: session.user.name || '',
        username: session.user.username || '',
        ename: session.user.ename || '',
        emailid: session.user.emailid || '',
        title: session.user.title,
        avatar: session.user.avatar,
        permissions: session.user.permissions || []
      },
      currentOrgId: validCurrentOrgId || '',
      availableOrgIds: freshAvailableOrgIds || [],
      currentOrg,
      availableOrgs,
      permissions: session.permissions || [],
      roles: session.roles || []
    };
  }

  /**
   * Get current session with full response data (including populated organizations)
   */
  public async getCurrentSession(sessionToken: string): Promise<ISessionResponse | null> {
    try {
      const validation = await this.validateSession(sessionToken);
      
      if (!validation.isValid || !validation.session) {
        return null;
      }

      // Find the session document to get full data
      const session = await Session.findByToken(sessionToken);
      if (!session) {
        return null;
      }

      // Return full session response with populated organizations
      return await this.buildSessionResponse(session);
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  /**
   * Get combined permissions from all user roles in a specific organization
   */
  private async getUserPermissionsInOrg(userId: string, organizationId: string): Promise<string[]> {
    try {
      // Get all active user roles in the organization
      const userRoles = await UserRole.find({
        userId,
        organizationId,
        isActive: true
      }).populate('roleId');

      // Extract all permissions from all roles
      const allPermissions: string[] = [];
      for (const userRole of userRoles) {
        if (userRole.roleId && typeof userRole.roleId === 'object' && 'permissions' in userRole.roleId) {
          const role = userRole.roleId as { permissions: string[] }; // Type assertion for populated role
          if (role.permissions && Array.isArray(role.permissions)) {
            allPermissions.push(...role.permissions);
          }
        }
      }

      // Remove duplicates and return
      return [...new Set(allPermissions)];
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  /**
   * Get user roles in a specific organization
   */
  private async getUserRolesInOrg(userId: string, organizationId: string): Promise<string[]> {
    try {
      const userRoles = await UserRole.find({
        userId,
        organizationId,
        isActive: true
      }).populate('roleId');

      return userRoles
        .map((userRole: IUserRoleDocument) => {
          if (userRole.roleId && typeof userRole.roleId === 'object' && 'name' in userRole.roleId) {
            const role = userRole.roleId as { name: string };
            return role.name;
          }
          return null;
        })
        .filter(Boolean) as string[];
    } catch (error) {
      console.error('Error getting user roles:', error);
      return [];
    }
  }
}

// Export singleton instance
export const sessionService = SessionService.getInstance();
