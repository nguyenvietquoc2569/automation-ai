// Test file to verify TypeScript configuration works with Node 21
import { IUser, IOrganization } from '@automation-ai/types';

// Test that imports work without .js extensions
export const testUser: IUser = {
  id: '1',
  name: 'Test User',
  username: 'testuser',
  ename: 'Test User',
  password: 'hashedpassword',
  emailid: 'test@example.com',
  permissions: ['read', 'write'],
  active: true
};

export const testOrg: Partial<IOrganization> = {
  id: '1',
  name: 'Test Org'
};

console.log('TypeScript imports working correctly with Node 21 configuration!');
console.log('No .js extensions needed in import statements.');
