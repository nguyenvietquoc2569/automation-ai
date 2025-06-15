// Test file to demonstrate organization types usage
import { 
  IUser, 
  IOrg, 
  IUserOrgRelation, 
  IUserWithOrgs,
  IOrgWithUsers,
  hasOrgPermission, 
  createOrgInvite, 
  getRoleLevel,
  defaultStaffUser,
  defaultOrg
} from '@automation-ai/types';

// Test creating a new organization
const testOrg: IOrg = {
  ...defaultOrg,
  id: 'org_test_123',
  name: 'test-company',
  displayName: 'Test Company Inc.',
  description: 'A test organization for demonstration',
  subscription: {
    plan: 'premium',
    maxUsers: 50,
    features: ['analytics', 'integrations']
  }
};

// Test creating a user that belongs to multiple organizations
const testUser: IUser = {
  ...defaultStaffUser,
  id: 'user_test_456',
  name: 'Jane Smith',
  username: 'jane.smith',
  ename: 'Jane',
  emailid: 'jane.smith@test-company.com',
  organizations: ['org_test_123', 'org_test_789'],
  currentOrgId: 'org_test_123',
  title: 'Product Manager'
};

// Test user-organization relationship
const userOrgRelation: IUserOrgRelation = {
  userId: testUser.id!,
  orgId: testOrg.id,
  role: 'admin',
  permissions: ['custom_feature_access'],
  joinedAt: new Date('2024-06-01'),
  isActive: true
};

// Test permission checking
console.log('=== Permission Tests ===');
console.log('Can read:', hasOrgPermission(userOrgRelation, 'read')); // Should be true
console.log('Can delete:', hasOrgPermission(userOrgRelation, 'delete')); // Should be true
console.log('Can manage billing:', hasOrgPermission(userOrgRelation, 'billing')); // Should be false
console.log('Has custom permission:', hasOrgPermission(userOrgRelation, 'custom_feature_access')); // Should be true

// Test role hierarchy
console.log('\n=== Role Hierarchy Tests ===');
console.log('Viewer level:', getRoleLevel('viewer')); // 1
console.log('Member level:', getRoleLevel('member')); // 2
console.log('Admin level:', getRoleLevel('admin')); // 3
console.log('Owner level:', getRoleLevel('owner')); // 4

// Test organization invite creation
console.log('\n=== Invite Creation Test ===');
const invite = createOrgInvite(testOrg.id, testUser.id!, 'newuser@example.com', 'member');
console.log('Created invite:', {
  id: invite.id,
  orgId: invite.orgId,
  role: invite.role,
  status: invite.status
});

// Test extended types
const userWithOrgs: IUserWithOrgs = {
  ...testUser,
  orgRelations: [userOrgRelation]
};

const orgWithUsers: IOrgWithUsers = {
  ...testOrg,
  users: [{
    user: testUser,
    relation: userOrgRelation
  }],
  userCount: 1
};

console.log('\n=== Extended Types Test ===');
console.log('User with organizations:', userWithOrgs.name, 'belongs to', userWithOrgs.organizations?.length, 'organizations');
console.log('Organization with users:', orgWithUsers.name, 'has', orgWithUsers.userCount, 'users');

export {
  testOrg,
  testUser,
  userOrgRelation,
  userWithOrgs,
  orgWithUsers,
  invite
};
