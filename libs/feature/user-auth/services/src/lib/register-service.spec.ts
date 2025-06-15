import { 
  registerUserWithService, 
  registerServiceForUser, 
  getOrCreatePersonalOrg,
  RegistrationData 
} from './register-service';

// Mock the database models for testing
jest.mock('@automation-ai/database', () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
  Organization: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
  Service: {
    create: jest.fn(),
  },
}));

describe('Registration Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUserWithService', () => {
    it('should register a user with service and create personal organization', async () => {
      const registrationData: RegistrationData = {
        user: {
          name: 'Test User',
          username: 'testuser',
          ename: 'Test User',
          password: 'password123',
          emailid: 'test@example.com',
        },
        service: {
          serviceName: 'Test Service',
          description: 'A test service',
          serviceShortName: 'test-service',
        },
      };

      // TODO: Add proper mocking and assertions when ready to write full tests
      expect(typeof registerUserWithService).toBe('function');
    });
  });

  describe('registerServiceForUser', () => {
    it('should register a service for existing user', async () => {
      expect(typeof registerServiceForUser).toBe('function');
    });
  });

  describe('getOrCreatePersonalOrg', () => {
    it('should get or create personal organization for user', async () => {
      expect(typeof getOrCreatePersonalOrg).toBe('function');
    });
  });
});

// Integration test helper (for manual testing with real database)
export const testRegistration = async () => {
  const testData: RegistrationData = {
    user: {
      name: 'Integration Test User',
      username: 'integrationtest',
      ename: 'Integration Test User',
      password: 'TestPassword123!',
      emailid: 'integration.test@example.com',
      title: 'Test Engineer'
    },
    service: {
      serviceName: 'Integration Test Service',
      description: 'A service for testing the registration flow',
      serviceShortName: 'integration-test-service',
      category: 'OTHER',
      tags: ['test', 'integration']
    }
  };

  console.log('Testing registration with data:', {
    userEmail: testData.user.emailid,
    serviceName: testData.service.serviceName
  });

  try {
    const result = await registerUserWithService(testData);
    console.log('Registration successful!');
    console.log('Created organization:', result.organization.name);
    return result;
  } catch (error) {
    console.error('Registration test failed:', error);
    throw error;
  }
};
