/**
 * Session Management Example - Login Flow Demonstration
 * 
 * This example shows how to implement a complete login flow using the session management system:
 * 1. User authentication
 * 2. Session creation
 * 3. Session validation
 * 4. Organization switching
 * 5. Session refresh
 * 6. Logout
 */

import {
  databaseService,
  sessionService,
  User,
  Organization,
  SessionType,
  type ISessionCreateRequest
} from '@automation-ai/database';

import {
  type IDeviceInfo
} from '@automation-ai/types';

/**
 * Complete login flow example
 */
export async function demonstrateLoginFlow() {
  try {
    console.log('🔐 Session Management Demo: Login Flow');
    console.log('=====================================');

    // Step 1: Initialize database
    console.log('\n1. Initializing database connection...');
    await databaseService.initialize();
    console.log('✅ Database connected');

    // Step 2: Create sample data (user and organization)
    console.log('\n2. Setting up test data...');
    const { user, organization } = await createTestData();
    console.log(`✅ Created user: ${user.username}`);
    console.log(`✅ Created organization: ${organization.name}`);

    // Step 3: Simulate login request from client
    console.log('\n3. Simulating login request...');
    const loginRequest: ISessionCreateRequest = {
      username: 'johndoe',
      password: 'securepassword123',
      sessionType: SessionType.WEB,
      device: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        ip: '192.168.1.100',
        platform: 'MacOS',
        browser: 'Chrome',
        version: '120.0.0.0',
        os: 'macOS 14.0',
        deviceId: 'device-123',
        fingerprint: 'fp-456'
      } as IDeviceInfo,
      rememberMe: false
    };

    const sessionResponse = await sessionService.createSession(loginRequest);
    console.log('✅ Login successful!');
    console.log(`📝 Session Token: ${sessionResponse.sessionToken.substring(0, 20)}...`);
    console.log(`👤 User: ${sessionResponse.user.name} (${sessionResponse.user.username})`);
    console.log(`🏢 Organization: ${sessionResponse.currentOrg.displayName}`);
    console.log(`⏰ Expires: ${sessionResponse.expiresAt.toISOString()}`);

    // Step 4: Validate session (as API would do for subsequent requests)
    console.log('\n4. Validating session for API request...');
    const validation = await sessionService.validateSession(sessionResponse.sessionToken);
    console.log(`✅ Session valid: ${validation.isValid}`);
    if (validation.session) {
      console.log(`📍 Last activity: ${validation.session.lastAccessAt?.toISOString()}`);
    }

    // Step 5: Create another organization and switch to it
    console.log('\n5. Creating second organization and switching...');
    const secondOrg = await createSecondOrganization(user.id);
    console.log(`✅ Created second organization: ${secondOrg.name}`);

    const switchResponse = await sessionService.switchOrganization({
      sessionToken: sessionResponse.sessionToken,
      newOrgId: secondOrg.id
    });
    console.log(`✅ Switched to organization: ${switchResponse.currentOrg.displayName}`);
    console.log(`📋 Available orgs: ${switchResponse.availableOrgs?.length || 0}`);

    // Step 6: Demonstrate session refresh
    console.log('\n6. Refreshing session token...');
    if (sessionResponse.refreshToken) {
      const refreshResponse = await sessionService.refreshSession({
        refreshToken: sessionResponse.refreshToken
      });
      console.log('✅ Session refreshed successfully');
      console.log(`📝 New token: ${refreshResponse.sessionToken.substring(0, 20)}...`);
    }

    // Step 7: Check active sessions for user
    console.log('\n7. Checking active sessions for user...');
    const activeSessions = await sessionService.getUserActiveSessions(user.id);
    console.log(`📊 Active sessions: ${activeSessions.length}`);
    for (const session of activeSessions) {
      console.log(`  - Session ${session.sessionToken.substring(0, 10)}... (${session.type})`);
      console.log(`    Created: ${session.createdAt?.toISOString()}`);
      console.log(`    Last Access: ${session.lastAccessAt?.toISOString()}`);
      console.log(`    Device: ${session.device?.platform} ${session.device?.browser}`);
    }

    // Step 8: Demonstrate logout (revoke session)
    console.log('\n8. Logging out (revoking session)...');
    await sessionService.revokeSession(sessionResponse.sessionToken);
    
    const postLogoutValidation = await sessionService.validateSession(sessionResponse.sessionToken);
    console.log(`✅ Session revoked. Valid: ${postLogoutValidation.isValid}`);
    console.log(`ℹ️  Reason: ${postLogoutValidation.reason}`);

    // Step 9: Session cleanup demonstration
    console.log('\n9. Cleaning up expired sessions...');
    const cleanedCount = await sessionService.cleanupExpiredSessions();
    console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);

    console.log('\n🎉 Login flow demonstration completed successfully!');
    console.log('\n📚 Session Management Features Demonstrated:');
    console.log('   ✅ User authentication with password verification');
    console.log('   ✅ Session creation with device tracking');
    console.log('   ✅ Session validation for API requests');
    console.log('   ✅ Organization switching within session');
    console.log('   ✅ Session token refresh');
    console.log('   ✅ Multiple session management');
    console.log('   ✅ Secure logout (session revocation)');
    console.log('   ✅ Automated cleanup of expired sessions');
    console.log('   ✅ Device and security information tracking');

  } catch (error) {
    console.error('❌ Login flow demonstration failed:', error);
    throw error;
  }
}

/**
 * Create test user and organization data
 */
async function createTestData() {
  // Create organization first
  const organization = new Organization({
    name: 'acme-corp',
    displayName: 'Acme Corporation',
    description: 'Test organization for login demo',
    domain: 'acme.com',
    active: true,
    subscription: {
      plan: 'premium',
      maxUsers: 100,
      features: ['advanced_analytics', 'api_access']
    },
    settings: {
      timezone: 'UTC',
      currency: 'USD',
      locale: 'en-US'
    }
  });
  await organization.save();

  // Create user
  const user = new User({
    name: 'John Doe',
    username: 'johndoe',
    ename: 'John',
    password: 'securepassword123', // Will be automatically hashed
    emailid: 'john.doe@acme.com',
    active: true,
    permissions: ['user_access', 'dashboard_view', 'profile_edit'],
    organizations: [organization.id],
    currentOrgId: organization.id,
    title: 'Software Engineer'
  });
  await user.save();

  return { user, organization };
}

/**
 * Create second organization for switching demo
 */
async function createSecondOrganization(userId: string) {
  const secondOrg = new Organization({
    name: 'tech-startup',
    displayName: 'Tech Startup Inc.',
    description: 'Second organization for demo',
    domain: 'techstartup.com',
    active: true,
    subscription: {
      plan: 'basic',
      maxUsers: 25,
      features: ['basic_analytics']
    }
  });
  await secondOrg.save();

  // Add user to second organization
  const user = await User.findById(userId);
  if (user && user.organizations) {
    user.organizations.push(secondOrg.id);
    await user.save();
  }

  return secondOrg;
}

/**
 * API Request Simulation - how an API endpoint would validate sessions
 */
export async function simulateAPIRequest(sessionToken: string, endpoint: string) {
  console.log(`\n🔍 API Request to ${endpoint}`);
  console.log('=====================================');

  // Step 1: Validate session
  const validation = await sessionService.validateSession(sessionToken);
  
  if (!validation.isValid || !validation.session) {
    console.log('❌ Unauthorized: Invalid or expired session');
    return { status: 401, error: 'Unauthorized', reason: validation.reason };
  }

  const session = validation.session;
  console.log(`✅ Session valid for user: ${session.user?.name}`);
  console.log(`🏢 Current organization: ${session.currentOrg?.name}`);
  console.log(`🔐 Permissions: ${session.permissions?.join(', ')}`);

  // Step 2: Check permissions for endpoint
  const requiredPermissions = getRequiredPermissions(endpoint);
  const hasPermission = requiredPermissions.every(perm => 
    session.permissions?.includes(perm)
  );

  if (!hasPermission) {
    console.log(`❌ Forbidden: Missing required permissions: ${requiredPermissions.join(', ')}`);
    return { status: 403, error: 'Forbidden', missingPermissions: requiredPermissions };
  }

  console.log('✅ Permission check passed');
  
  // Step 3: Update session activity (already done in validateSession)
  console.log('✅ Session activity updated');

  return {
    status: 200,
    data: {
      message: `Access granted to ${endpoint}`,
      user: session.user,
      organization: session.currentOrg,
      timestamp: new Date()
    }
  };
}

/**
 * Helper function to determine required permissions for endpoints
 */
function getRequiredPermissions(endpoint: string): string[] {
  const permissionMap: Record<string, string[]> = {
    '/api/dashboard': ['user_access', 'dashboard_view'],
    '/api/profile': ['user_access', 'profile_edit'],
    '/api/admin/users': ['admin_access', 'user_management'],
    '/api/analytics': ['user_access', 'analytics_view'],
    '/api/settings': ['admin_access', 'settings_edit']
  };

  return permissionMap[endpoint] || ['user_access'];
}

// Export for testing
export { createTestData };

// Run demo if this file is executed directly
if (require.main === module) {
  demonstrateLoginFlow().catch(console.error);
}
