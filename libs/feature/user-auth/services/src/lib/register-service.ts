import { Organization, User, Role, UserRole } from '@automation-ai/database';
import { IUser, IOrg, ServiceCategory } from '@automation-ai/types';

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
    category?: ServiceCategory;
    tags?: string[];
  };
}

export interface RegistrationResult {
  user: IUser;
  organization: IOrg;
}

/**
 * Complete registration service that handles user registration and creates a personal organization
 * @param registrationData - The user and service data for registration
 * @returns Promise containing the created user, organization, and service
 */
export async function registerUserWithService(registrationData: RegistrationData): Promise<RegistrationResult> {
  const { user: userData } = registrationData;

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

    // 3. Create owner role for the organization
    const ownerRole = await Role.create({
      name: 'owner',
      displayName: 'Organization Owner',
      description: 'Full administrative access to the organization',
      organizationId: organization.id,
      permissions: [
        'org.owner',
        'org.service.subscribe', 
        'org.service.unsubscribe',
        'org.manage',
        'org.delete',
        'org.users.manage',
        'org.roles.manage',
        'org.billing.manage'
      ],
      isActive: true,
      isSystemRole: true
    });

    // 4. Assign owner role to the user
    await UserRole.create({
      userId: user.id,
      roleId: ownerRole.id,
      organizationId: organization.id,
      assignedBy: user.id, // Self-assigned during registration
      isActive: true
    });

    // 5. Set current organization for the user (organization membership is now handled via UserRole)
    user.currentOrgId = organization.id;
    await user.save();

    return {
      user: user.toJSON() as IUser,
      organization: organization.toJSON() as IOrg,
    };

  } catch (error) {
    // Clean up any created resources in case of error
    console.error('Registration failed:', error);
    
    // Handle specific MongoDB errors
    if (error && typeof error === 'object' && 'code' in error) {
      const mongoError = error as { code: number; keyPattern?: Record<string, number> };
      if (mongoError.code === 11000) {
        // Duplicate key error
        const keyPattern = mongoError.keyPattern;
        if (keyPattern?.username) {
          throw new Error('A user with this username already exists. Please choose a different username.');
        }
        if (keyPattern?.emailid) {
          throw new Error('A user with this email already exists. Please use a different email or try logging in.');
        }
        if (keyPattern?.name) {
          throw new Error('An organization with this name already exists.');
        }
        throw new Error('This information is already registered. Please try with different details.');
      }
    }
    
    // Handle validation errors
    if (error && typeof error === 'object' && 'name' in error) {
      const validationError = error as { name: string; message?: string };
      if (validationError.name === 'ValidationError') {
        const validationMessage = validationError.message || 'Validation failed';
        throw new Error(`Registration validation failed: ${validationMessage}`);
      }
    }
    
    // Generic error handling
    throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      // Update user's current organization if not already set (organization membership is now handled via UserRole)
      if (!user.currentOrgId) {
        user.currentOrgId = organization.id;
        await user.save();
      }
    }

    return organization.toJSON() as IOrg;
  } catch (error) {
    console.error('Failed to get/create personal organization:', error);
    throw new Error(`Failed to get/create personal organization: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
