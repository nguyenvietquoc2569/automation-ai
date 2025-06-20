import { 
  registerUserWithService, 
  getOrCreatePersonalOrg,
  RegistrationData 
} from './register-service';
import { ServiceCategory } from '@automation-ai/types';

/**
 * Example usage of the registration services
 */

// Example 1: Complete user and service registration
export async function exampleCompleteRegistration() {
  const registrationData: RegistrationData = {
    user: {
      name: 'John Doe',
      username: 'johndoe',
      ename: 'John Doe',
      password: 'securePassword123',
      emailid: 'john.doe@example.com',
      title: 'Software Developer'
    },
    service: {
      serviceName: 'My Automation Service',
      description: 'A service that automates various tasks',
      serviceShortName: 'my-auto-service',
      category: ServiceCategory.AUTOMATION,
      tags: ['automation', 'productivity', 'workflow']
    }
  };

  try {
    const result = await registerUserWithService(registrationData);
    console.log('Registration successful!');
    console.log('User:', result.user.name);
    console.log('Organization:', result.organization.name);
    return result;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

// Example 2: Register a service for an existing user (deprecated)
export async function exampleServiceRegistration() {
  throw new Error('Service registration for existing users is no longer supported. Use registerUserWithService instead.');
}

// Example 3: Get or create personal organization
export async function exampleGetPersonalOrg() {
  const userEmail = 'alice.wilson@example.com';

  try {
    const organization = await getOrCreatePersonalOrg(userEmail);
    console.log('Personal organization:', organization.name);
    console.log('Display name:', organization.displayName);
    return organization;
  } catch (error) {
    console.error('Failed to get personal organization:', error);
    throw error;
  }
}

// Example usage in a web application context
export class RegistrationService {
  /**
   * Handle user registration from a web form
   */
  static async handleUserRegistration(formData: {
    name: string;
    username: string;
    email: string;
    password: string;
    serviceName: string;
    serviceDescription: string;
    serviceShortName: string;
  }) {
    const registrationData: RegistrationData = {
      user: {
        name: formData.name,
        username: formData.username,
        ename: formData.name, // Using name as English name
        password: formData.password,
        emailid: formData.email
      },
      service: {
        serviceName: formData.serviceName,
        description: formData.serviceDescription,
        serviceShortName: formData.serviceShortName,
        category: ServiceCategory.OTHER,
        tags: []
      }
    };

    return await registerUserWithService(registrationData);
  }

  /**
   * Handle service registration for existing user (deprecated)
   */
  static async handleServiceRegistration() {
    throw new Error('Service registration for existing users is no longer supported. Use registerUserWithService instead.');
  }
}
