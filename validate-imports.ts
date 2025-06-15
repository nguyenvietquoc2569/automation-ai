// Test file to validate TypeScript imports work without .js extensions
import { IAgent, IService, IUser, IOrganization } from '@automation-ai/shared/types';

// Simple validation that types are imported correctly
const testUser: IUser = {
  id: 'test-id',
  email: 'test@example.com',
  name: 'Test User'
};

const testOrg: IOrganization = {
  id: 'org-id',
  name: 'Test Organization'
};

console.log('TypeScript imports working correctly!');
console.log('User:', testUser);
console.log('Organization:', testOrg);

export { testUser, testOrg };
