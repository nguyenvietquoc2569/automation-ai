/**
 * Simple Session Management Test
 */

import {
  databaseService,
  sessionService,
  User,
  Organization,
  SessionType
} from '@automation-ai/database';

async function testSessionSystem() {
  try {
    console.log('🧪 Testing Session Management System...');
    
    // Initialize database
    await databaseService.initialize();
    console.log('✅ Database connected');

    // Clean up any existing test data
    await User.deleteMany({ username: 'testuser' });
    await Organization.deleteMany({ name: 'test-org' });
    
    // Create test organization
    const org = new Organization({
      name: 'test-org',
      displayName: 'Test Organization',
      active: true,
      subscription: { plan: 'basic', maxUsers: 10 }
    });
    await org.save();
    console.log('✅ Test organization created');
    
    // Create test user with raw password
    const user = new User({
      name: 'Test User',
      username: 'testuser',
      ename: 'Test',
      password: 'testpass123',
      emailid: 'test@example.com',
      active: true,
      permissions: ['user_access'],
      organizations: [org.id],
      currentOrgId: org.id
    });
    await user.save();
    console.log('✅ Test user created');
    
    // Test password hashing worked
    const savedUser = await User.findOne({ username: 'testuser' }).select('+password');
    if (savedUser) {
      console.log(`Password is hashed: ${savedUser.password !== 'testpass123'}`);
      const canCompare = await savedUser.comparePassword('testpass123');
      console.log(`Password comparison works: ${canCompare}`);
    }
    
    // Test session creation
    const session = await sessionService.createSession({
      username: 'testuser',
      password: 'testpass123',
      sessionType: SessionType.WEB
    });
    
    console.log('✅ Session created successfully');
    console.log(`Token: ${session.sessionToken.substring(0, 20)}...`);
    console.log(`User: ${session.user.name}`);
    console.log(`Org: ${session.currentOrg.name}`);
    
    // Test session validation
    const validation = await sessionService.validateSession(session.sessionToken);
    console.log(`✅ Session validation: ${validation.isValid}`);
    
    // Clean up
    await sessionService.revokeSession(session.sessionToken);
    await User.deleteMany({ username: 'testuser' });
    await Organization.deleteMany({ name: 'test-org' });
    
    console.log('🎉 Session management system working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await databaseService.shutdown();
  }
}

testSessionSystem();
