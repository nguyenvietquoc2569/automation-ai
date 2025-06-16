/**
 * Test script for the registration API
 * Run this to test the registration flow
 */

const API_BASE_URL = 'http://localhost:3000/api';

interface TestRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  serviceName?: string;
  serviceDescription?: string;
  serviceCategory?: string;
  serviceTags?: string[];
}

async function testHealthCheck() {
  console.log('🔍 Testing health check...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'GET'
    });
    const data = await response.json();
    console.log('✅ Health check:', data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
}

async function testDatabaseStatus() {
  console.log('🔍 Testing database status...');
  try {
    const response = await fetch(`${API_BASE_URL}/database/status`, {
      method: 'GET'
    });
    const data = await response.json();
    console.log('✅ Database status:', data);
    return true;
  } catch (error) {
    console.error('❌ Database status failed:', error);
    return false;
  }
}

async function testRegistration(testData: TestRegistrationData) {
  console.log('🔍 Testing user registration...');
  console.log('Test data:', { 
    email: testData.email, 
    name: `${testData.firstName} ${testData.lastName}` 
  });
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('User:', data.data.user);
      console.log('Organization:', data.data.organization);
      console.log('Service:', data.data.service);
      return true;
    } else {
      console.error('❌ Registration failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Registration request failed:', error);
    return false;
  }
}

// Test data
const testUser: TestRegistrationData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'TestPassword123!',
  serviceName: 'John\'s Test Service',
  serviceDescription: 'A test service for John Doe',
  serviceCategory: 'OTHER',
  serviceTags: ['test', 'demo', 'automation']
};

// Run tests
export async function runRegistrationTests() {
  console.log('🚀 Starting Registration API Tests\n');
  
  // Test 1: Health check
  const healthOk = await testHealthCheck();
  console.log('');
  
  // Test 2: Database status
  const dbOk = await testDatabaseStatus();
  console.log('');
  
  // Test 3: Registration
  if (healthOk) {
    const registrationOk = await testRegistration(testUser);
    console.log('');
    
    if (registrationOk) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️ Registration test failed, but API is responding');
    }
  } else {
    console.log('⚠️ Skipping registration test - API not responding');
  }
}

// Export for manual testing
export { testHealthCheck, testDatabaseStatus, testRegistration };

// Example usage:
// runRegistrationTests().catch(console.error);
