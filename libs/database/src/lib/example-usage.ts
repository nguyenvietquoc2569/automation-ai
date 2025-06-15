import { 
  databaseService 
} from './database-service';
import {
  User, 
  Organization, 
  Service, 
  Agent, 
  AgentStatus,
  ServiceCategory 
} from './models';

/**
 * Example usage of the database library
 */
export async function exampleUsage() {
  try {
    // Initialize database connection
    await databaseService.initialize();
    
    // Check database health
    const health = await databaseService.healthCheck();
    console.log('Database health:', health);

    // Create indexes for better performance
    await databaseService.createIndexes();

    // Seed initial data (only if database is empty)
    await databaseService.seedInitialData();

    // Example: Create a new organization
    const newOrg = new Organization({
      name: 'acme-corp',
      displayName: 'Acme Corporation',
      description: 'A sample organization',
      domain: 'acme.com',
      website: 'https://acme.com',
      subscription: {
        plan: 'premium',
        maxUsers: 50,
        features: ['analytics', 'integrations']
      }
    });
    await newOrg.save();
    console.log('Created organization:', newOrg.id);

    // Example: Create a new user
    const newUser = new User({
      name: 'John Doe',
      username: 'johndoe',
      ename: 'John',
      password: 'securepassword123',
      emailid: 'john@acme.com',
      permissions: ['user_access', 'service_manage'],
      organizations: [newOrg.id],
      currentOrgId: newOrg.id,
      title: 'Developer'
    });
    await newUser.save();
    console.log('Created user:', newUser.id);

    // Example: Create a service
    const newService = new Service({
      serviceName: 'Email Automation Service',
      description: 'Automated email marketing and notifications',
      category: ServiceCategory.COMMUNICATION,
      serviceShortName: 'email-auto',
      tags: ['email', 'marketing', 'automation']
    });
    await newService.save();
    console.log('Created service:', newService.id);

    // Example: Create an agent
    const newAgent = new Agent({
      agentName: 'Email Marketing Bot',
      description: 'Handles automated email campaigns',
      serviceId: newService.id,
      organizationId: newOrg.id,
      isActive: true,
      configuration: {
        smtpServer: 'smtp.acme.com',
        maxEmailsPerHour: 1000
      },
      permissions: ['send_emails', 'manage_lists'],
      status: AgentStatus.ACTIVE,
      createdBy: newUser.id
    });
    await newAgent.save();
    console.log('Created agent:', newAgent.id);

    // Example: Query operations
    
    // Find users in organization
    const orgUsers = await User.findActiveInOrganization(newOrg.id);
    console.log('Users in organization:', orgUsers.length);

    // Find agents by service
    const serviceAgents = await Agent.findByService(newService.id);
    console.log('Agents for service:', serviceAgents.length);

    // Find services by category
    const communicationServices = await Service.findByCategory(ServiceCategory.COMMUNICATION);
    console.log('Communication services:', communicationServices.length);

    // Example: Update operations
    
    // Update agent configuration
    await newAgent.updateConfiguration({
      maxEmailsPerHour: 1500,
      retryAttempts: 3
    });
    console.log('Updated agent configuration');

    // Activate/deactivate agent
    await newAgent.pause();
    console.log('Agent paused');
    
    await newAgent.activate();
    console.log('Agent activated');

    // Example: Authentication
    const foundUser = await User.findByEmailOrUsername('johndoe');
    if (foundUser) {
      const isValidPassword = await foundUser.comparePassword('securepassword123');
      console.log('Password valid:', isValidPassword);
    }

    console.log('Database example completed successfully!');

  } catch (error) {
    console.error('Database example failed:', error);
  } finally {
    // Clean up connection
    await databaseService.shutdown();
  }
}

// Run example if this file is executed directly
if (require.main === module) {
  exampleUsage().catch(console.error);
}
