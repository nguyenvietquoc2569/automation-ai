import { Organization, User, Service } from '@automation-ai/database';
import { IUser, IOrg, IService } from '@automation-ai/types';

export interface RegistrationData {
  user: {
    name: string;
    username: string;
    ename: string;
    password: string;
    emailid: string;
    title?: string;
    avatar?: string;
  };
  service: {
    serviceName: string;
    description: string;
    serviceShortName: string;
    category?: string;
    tags?: string[];
  };
}

export interface RegistrationResult {
  user: IUser;
  organization: IOrg;
  service: IService;
}

/**
 * Complete registration service that handles user registration and creates a personal organization
 * @param registrationData - The user and service data for registration
 * @returns Promise containing the created user, organization, and service
 */
export async function registerUserWithService(registrationData: RegistrationData): Promise<RegistrationResult> {
  const { user: userData, service: serviceData } = registrationData;

  try {
    // 1. Create the user first
    const user = await User.create({
      name: userData.name,
      username: userData.username,
      ename: userData.ename,
      password: userData.password,
      emailid: userData.emailid,
      title: userData.title,
      avatar: userData.avatar,
      active: true,
      permissions: ['user'],
      organizations: [],
      metaData: {}
    });

    // 2. Create personal organization with the format: personal-org-{email}
    const sanitizedEmail = userData.emailid.replace(/[^a-zA-Z0-9]/g, '-');
    const orgName = `personal-org-${sanitizedEmail}`;
    
    const organization = await Organization.create({
      name: orgName,
      displayName: `Personal Organization for ${userData.name}`,
      description: `Personal workspace for ${userData.emailid}`,
      active: true,
      subscription: {
        plan: 'free',
        maxUsers: 5,
        features: ['basic']
      },
      settings: {
        timezone: 'UTC',
        currency: 'USD',
        locale: 'en'
      },
      metaData: {
        createdBy: user.id,
        personalOrg: true
      }
    });

    // 3. Create the service
    const service = await Service.create({
      serviceName: serviceData.serviceName,
      description: serviceData.description,
      serviceShortName: serviceData.serviceShortName,
      category: serviceData.category || 'OTHER',
      tags: serviceData.tags || []
    });

    // 4. Associate user with the organization
    user.organizations = [organization.id];
    user.currentOrgId = organization.id;
    await user.save();

    return {
      user: user.toJSON() as IUser,
      organization: organization.toJSON() as IOrg,
      service: service.toJSON() as IService
    };

  } catch (error) {
    // Clean up any created resources in case of error
    console.error('Registration failed:', error);
    throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Register just a service for an existing user and create personal org if needed
 * @param userEmail - Email of the existing user
 * @param serviceData - Service data to create
 * @returns Promise containing the organization and service
 */
export async function registerServiceForUser(
  userEmail: string, 
  serviceData: RegistrationData['service']
): Promise<{ organization: IOrg; service: IService }> {
  try {
    // Find the user
    const user = await User.findOne({ emailid: userEmail });
    if (!user) {
      throw new Error(`User with email ${userEmail} not found`);
    }

    // Check if user already has a personal organization
    const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '-');
    const orgName = `personal-org-${sanitizedEmail}`;
    
    let organization = await Organization.findOne({ name: orgName });
    
    // Create personal organization if it doesn't exist
    if (!organization) {
      organization = await Organization.create({
        name: orgName,
        displayName: `Personal Organization for ${user.name}`,
        description: `Personal workspace for ${userEmail}`,
        active: true,
        subscription: {
          plan: 'free',
          maxUsers: 5,
          features: ['basic']
        },
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          locale: 'en'
        },
        metaData: {
          createdBy: user.id,
          personalOrg: true
        }
      });

      // Update user's organizations
      if (!user.organizations.includes(organization.id)) {
        user.organizations.push(organization.id);
        if (!user.currentOrgId) {
          user.currentOrgId = organization.id;
        }
        await user.save();
      }
    }

    // Create the service
    const service = await Service.create({
      serviceName: serviceData.serviceName,
      description: serviceData.description,
      serviceShortName: serviceData.serviceShortName,
      category: serviceData.category || 'OTHER',
      tags: serviceData.tags || []
    });

    return {
      organization: organization.toJSON() as IOrg,
      service: service.toJSON() as IService
    };

  } catch (error) {
    console.error('Service registration failed:', error);
    throw new Error(`Service registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get or create personal organization for a user
 * @param userEmail - User's email
 * @returns Promise containing the personal organization
 */
export async function getOrCreatePersonalOrg(userEmail: string): Promise<IOrg> {
  try {
    const user = await User.findOne({ emailid: userEmail });
    if (!user) {
      throw new Error(`User with email ${userEmail} not found`);
    }

    const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '-');
    const orgName = `personal-org-${sanitizedEmail}`;
    
    let organization = await Organization.findOne({ name: orgName });
    
    if (!organization) {
      organization = await Organization.create({
        name: orgName,
        displayName: `Personal Organization for ${user.name}`,
        description: `Personal workspace for ${userEmail}`,
        active: true,
        subscription: {
          plan: 'free',
          maxUsers: 5,
          features: ['basic']
        },
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          locale: 'en'
        },
        metaData: {
          createdBy: user.id,
          personalOrg: true
        }
      });

      // Update user's organizations
      if (!user.organizations.includes(organization.id)) {
        user.organizations.push(organization.id);
        if (!user.currentOrgId) {
          user.currentOrgId = organization.id;
        }
        await user.save();
      }
    }

    return organization.toJSON() as IOrg;
  } catch (error) {
    console.error('Failed to get/create personal organization:', error);
    throw new Error(`Failed to get/create personal organization: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
