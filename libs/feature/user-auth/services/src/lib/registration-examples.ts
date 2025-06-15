import { 
  registerUserWithService, 
  registerServiceForUser, 
  getOrCreatePersonalOrg,
  RegistrationData 
} from './register-service';

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
      category: 'AUTOMATION',
      tags: ['automation', 'productivity', 'workflow']
    }
  };

  try {
    const result = await registerUserWithService(registrationData);
    console.log('Registration successful!');
    console.log('User:', result.user.name);
    console.log('Organization:', result.organization.name);
    console.log('Service:', result.service.serviceName);
    return result;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

// Example 2: Register a service for an existing user
export async function exampleServiceRegistration() {
  const userEmail = 'jane.smith@example.com';
  const serviceData = {
    serviceName: 'Data Processing Service',
    description: 'Service for processing and analyzing data',
    serviceShortName: 'data-proc-service',
    category: 'DATA_PROCESSING',
    tags: ['data', 'analytics', 'processing']
  };

  try {
    const result = await registerServiceForUser(userEmail, serviceData);
    console.log('Service registration successful!');
    console.log('Organization:', result.organization.name);
    console.log('Service:', result.service.serviceName);
    return result;
  } catch (error) {
    console.error('Service registration failed:', error);
    throw error;
  }
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
        category: 'OTHER',
        tags: []
      }
    };

    return await registerUserWithService(registrationData);
  }

  /**
   * Handle service registration for existing user
   */
  static async handleServiceRegistration(
    userEmail: string,
    serviceFormData: {
      serviceName: string;
      description: string;
      serviceShortName: string;
      category?: string;
      tags?: string[];
    }
  ) {
    return await registerServiceForUser(userEmail, serviceFormData);
  }
}
