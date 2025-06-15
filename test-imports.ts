// Test script to verify imports work correctly
import { IUser, defaultStaffUser } from '@automation-ai/types';

console.log('✅ Successfully imported IUser interface and defaultStaffUser from @automation-ai/types');
console.log('Default staff user:', defaultStaffUser);

// Type check that the interface works
const testUser: IUser = {
  name: 'Test User',
  username: 'testuser',
  ename: 'Test',
  password: 'password123',
  emailid: 'test@example.com',
  permissions: ['read'],
  active: true
};

console.log('✅ Type checking works correctly');
console.log('Test user:', testUser);
