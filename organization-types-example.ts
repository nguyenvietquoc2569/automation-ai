// Example usage of the organization and user types
import { IUser, IOrg, IUserOrgRelation, hasOrgPermission, createOrgInvite, getRoleLevel } from '@automation-ai/types';

// Example organization
const exampleOrg: IOrg = {
  id: 'org_123',
  name: 'automation-ai',
  displayName: 'Automation AI Corp',
  description: 'Leading automation solutions provider',
  domain: 'automation-ai.com',
  website: 'https://automation-ai.com',
  contactInfo: {
    email: 'contact@automation-ai.com',
    phone: '+1-555-0123'
  },
  settings: {
    timezone: 'UTC',
    currency: 'USD',
    locale: 'en'
  },
  subscription: {
    plan: 'enterprise',
    maxUsers: 100,
    features: ['advanced_analytics', 'custom_integrations', 'priority_support']
  },
  active: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date()
};

// Example user with organization relationships
const exampleUser: IUser = {
  id: 'user_456',
  name: 'John Doe',
  username: 'john.doe',
  ename: 'John',
  password: 'hashed_password',
  emailid: 'john.doe@automation-ai.com',
  permissions: ['user_management', 'project_create'],
  active: true,
  title: 'Senior Developer',
  currentOrgId: 'org_123',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date()
};

// Example user-organization relationship
const userOrgRelation: IUserOrgRelation = {
  userId: 'user_456',
  orgId: 'org_123',
  role: 'admin',
  permissions: ['advanced_features'],
  joinedAt: new Date('2024-01-15'),
  isActive: true
};

// Example usage of utility functions
console.log('User has read permission:', hasOrgPermission(userOrgRelation, 'read')); // true
console.log('User has billing permission:', hasOrgPermission(userOrgRelation, 'billing')); // false
console.log('Admin role level:', getRoleLevel('admin')); // 3

// Create an organization invite
const invite = createOrgInvite('org_123', 'user_456', 'newuser@example.com', 'member');
console.log('Created invite:', invite);

export {
  exampleOrg,
  exampleUser,
  userOrgRelation,
  invite
};
