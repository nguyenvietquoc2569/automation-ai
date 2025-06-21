import { Organization, User, UserRole, Role } from '@automation-ai/database';

// Organization API service for teams management
export interface OrganizationListItem {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  isActive: boolean;
  memberCount?: number;
  userRole?: string;
  userPermissions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserOrganizationPermissions {
  canManage: boolean;
  canEdit: boolean;
  canToggleStatus: boolean;
}

export interface OrganizationUpdateRequest {
  name?: string;
  displayName?: string;
  description?: string;
  isActive?: boolean;
}

// Real database service for teams management
export class OrganizationService {
  /**
   * Get all organizations that the user belongs to with their roles and permissions
   */
  static async getUserOrganizations(userId: string, includeInactive = true): Promise<OrganizationListItem[]> {
    try {
      // Get all active user roles for this user
      const userRoles = await UserRole.find({
        userId,
        isActive: true
      }).populate('roleId');

      if (!userRoles.length) {
        return [];
      }

      // Get unique organization IDs from user roles
      const orgIds = [...new Set(userRoles.map(ur => ur.organizationId))];

      // Get organizations the user belongs to through roles
      const orgQuery: { _id: { $in: string[] }; active?: boolean } = { _id: { $in: orgIds } };
      if (!includeInactive) {
        orgQuery.active = true; // Only include active orgs if requested
      }
      
      const organizations = await Organization.find(orgQuery);

      const orgResults: OrganizationListItem[] = [];

      for (const org of organizations) {
        // Get user roles in this specific organization
        const orgUserRoles = userRoles.filter(ur => ur.organizationId === org.id);

        // Extract permissions from all roles
        const allPermissions: string[] = [];
        const roleNames: string[] = [];
        const roleDisplayNames: string[] = [];

        for (const userRole of orgUserRoles) {
          if (userRole.roleId) {
            let role;
            if (typeof userRole.roleId === 'object') {
              // Role is already populated
              role = userRole.roleId as { name: string; displayName?: string; permissions: string[] };
            } else {
              // Role is not populated, fetch it manually
              try {
                const roleDoc = await Role.findById(userRole.roleId);
                if (roleDoc) {
                  role = {
                    name: roleDoc.name || 'Unknown Role',
                    displayName: roleDoc.displayName,
                    permissions: roleDoc.permissions || []
                  };
                } else {
                  role = { name: 'Unknown Role', displayName: 'Unknown Role', permissions: [] };
                }
              } catch {
                role = { name: 'Unknown Role', displayName: 'Unknown Role', permissions: [] };
              }
            }
            
            if (role.permissions && Array.isArray(role.permissions)) {
              allPermissions.push(...role.permissions);
            }
            if (role.name) {
              roleNames.push(role.name);
            }
            if (role.displayName) {
              roleDisplayNames.push(role.displayName);
            }
          }
        }

        // Remove duplicate permissions
        const uniquePermissions = [...new Set(allPermissions)];

        // Get member count for this organization using UserRole
        const orgUserRolesDocs = await UserRole.find({
          organizationId: org.id,
          isActive: true
        }).distinct('userId');
        
        const memberCount = await User.countDocuments({
          _id: { $in: orgUserRolesDocs },
          active: true
        });

        // Determine primary role with more sophisticated logic
        let primaryRole = 'Member';
        
        // Check for owner roles (by name, displayName, or permissions)
        const hasOwnerRole = roleNames.some(name => 
          name.toLowerCase().includes('owner') || name.toLowerCase().includes('founder')
        ) || roleDisplayNames.some(displayName => 
          displayName.toLowerCase().includes('owner') || displayName.toLowerCase().includes('founder')
        ) || uniquePermissions.some(perm => 
          perm.includes('owner') || perm.includes('org.manage') || perm.includes('organization.manage')
        );

        // Check for admin roles
        const hasAdminRole = roleNames.some(name => 
          name.toLowerCase().includes('admin') || name.toLowerCase().includes('administrator')
        ) || roleDisplayNames.some(displayName => 
          displayName.toLowerCase().includes('admin') || displayName.toLowerCase().includes('administrator')
        ) || uniquePermissions.some(perm => 
          perm.includes('admin') || perm.includes('manage')
        );

        if (hasOwnerRole) {
          // Use the actual display name if available, otherwise use a nice label
          primaryRole = roleDisplayNames.find(dn => 
            dn.toLowerCase().includes('owner') || dn.toLowerCase().includes('founder')
          ) || roleNames.find(rn => 
            rn.toLowerCase().includes('owner') || rn.toLowerCase().includes('founder')
          ) || 'Organization Owner';
        } else if (hasAdminRole) {
          primaryRole = roleDisplayNames.find(dn => 
            dn.toLowerCase().includes('admin')
          ) || roleNames.find(rn => 
            rn.toLowerCase().includes('admin')
          ) || 'Administrator';
        } else if (roleDisplayNames.length > 0) {
          primaryRole = roleDisplayNames[0];
        } else if (roleNames.length > 0) {
          primaryRole = roleNames[0];
        }

        orgResults.push({
          id: org.id,
          name: org.name,
          displayName: org.displayName,
          description: org.description,
          isActive: org.active,
          memberCount,
          userRole: primaryRole,
          userPermissions: uniquePermissions,
          createdAt: org.createdAt || new Date(),
          updatedAt: org.updatedAt || new Date(),
        });
      }

      return orgResults;
    } catch (error) {
      console.error('Error fetching user organizations:', error);
      throw new Error('Failed to fetch user organizations');
    }
  }

  /**
   * Check user permissions for an organization
   */
  static getUserPermissions(userPermissions: string[]): UserOrganizationPermissions {
    const canManage = userPermissions.includes('org.manage') || userPermissions.includes('org.owner');
    
    return {
      canManage,
      canEdit: canManage,
      canToggleStatus: canManage,
    };
  }

  /**
   * Update organization details
   */
  static async updateOrganization(orgId: string, updates: OrganizationUpdateRequest, userId: string): Promise<OrganizationListItem> {
    try {
      // Verify user has permission to update this organization
      const userOrgs = await this.getUserOrganizations(userId, true); // Include inactive orgs for management
      const userOrg = userOrgs.find(o => o.id === orgId);
      
      if (!userOrg) {
        throw new Error('Organization not found or access denied');
      }

      const permissions = this.getUserPermissions(userOrg.userPermissions || []);
      if (!permissions.canEdit) {
        throw new Error('Insufficient permissions to edit organization');
      }

      // Update the organization
      const updateData: Partial<{
        name: string;
        displayName: string;
        description: string;
        active: boolean;
        updatedAt: Date;
      }> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.displayName !== undefined) updateData.displayName = updates.displayName;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.isActive !== undefined) updateData.active = updates.isActive;
      
      updateData.updatedAt = new Date();

      const updatedOrg = await Organization.findByIdAndUpdate(
        orgId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedOrg) {
        throw new Error('Organization not found');
      }

      // Return the updated organization in the expected format
      return {
        id: updatedOrg.id,
        name: updatedOrg.name,
        displayName: updatedOrg.displayName,
        description: updatedOrg.description,
        isActive: updatedOrg.active,
        memberCount: userOrg.memberCount, // Keep the same member count for now
        userRole: userOrg.userRole,
        userPermissions: userOrg.userPermissions,
        createdAt: updatedOrg.createdAt || new Date(),
        updatedAt: updatedOrg.updatedAt || new Date(),
      };
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  }

  /**
   * Toggle organization active status
   */
  static async toggleOrganizationStatus(orgId: string, isActive: boolean, userId: string): Promise<OrganizationListItem> {
    return this.updateOrganization(orgId, { isActive }, userId);
  }

  /**
   * Create a new organization and assign the creator as owner
   */
  static async createOrganization(
    orgData: { name: string; description?: string },
    userId: string
  ): Promise<OrganizationListItem> {
    try {
      // Check if user already has maximum number of organizations
      const activeUserOrgs = await this.getUserOrganizations(userId, false); // Only get active orgs for limit check
      const MAX_ORGANIZATIONS = 5;
      
      // Count active organizations toward the limit
      if (activeUserOrgs.length >= MAX_ORGANIZATIONS) {
        throw new Error(`Maximum organization limit reached. You can only belong to ${MAX_ORGANIZATIONS} active organizations.`);
      }

      // Check if organization name already exists (case-insensitive)
      const existingOrg = await Organization.findOne({
        name: { $regex: new RegExp(`^${orgData.name}$`, 'i') }
      });
      
      if (existingOrg) {
        throw new Error('An organization with this name already exists');
      }

      // Create the organization
      const organization = new Organization({
        name: orgData.name,
        displayName: orgData.name, // Default to the same as name
        description: orgData.description,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedOrg = await organization.save();

      // Create owner role for this organization
      const ownerRole = await Role.createOwnerRole(savedOrg.id);

      // Create user role assignment
      const userRole = new UserRole({
        userId,
        roleId: ownerRole.id,
        organizationId: savedOrg.id,
        assignedBy: userId, // Self-assigned since user is creating the org
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await userRole.save();

      // Set as current organization if user doesn't have one (organization membership is now handled via UserRole)
      const user = await User.findById(userId);
      if (!user?.currentOrgId) {
        await User.findByIdAndUpdate(userId, {
          currentOrgId: savedOrg.id,
          updatedAt: new Date()
        });
      }

      // Note: Session availableOrgIds will be automatically updated by the session service
      // when buildSessionResponse is called, as it now queries UserRole for fresh data

      // Return the organization in the expected format
      return {
        id: savedOrg.id,
        name: savedOrg.name,
        displayName: savedOrg.displayName,
        description: savedOrg.description,
        isActive: savedOrg.active,
        memberCount: 1, // Creator is the first member
        userRole: 'Organization Owner',
        userPermissions: ownerRole.permissions,
        createdAt: savedOrg.createdAt || new Date(),
        updatedAt: savedOrg.updatedAt || new Date(),
      };
    } catch (error) {
      console.error('Error creating organization:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create organization');
    }
  }

  /**
   * Get organization by ID with user permissions
   */
  static async getOrganizationById(orgId: string, userId: string): Promise<OrganizationListItem | null> {
    try {
      const userOrgs = await this.getUserOrganizations(userId, true); // Include inactive orgs for management
      return userOrgs.find(o => o.id === orgId) || null;
    } catch (error) {
      console.error('Error fetching organization by ID:', error);
      return null;
    }
  }

  /**
   * Check if user has specific permission in organization
   */
  static async checkUserPermission(userId: string, orgId: string, permission: string): Promise<boolean> {
    try {
      const userOrgs = await this.getUserOrganizations(userId, true); // Include inactive orgs for permission checks
      const userOrg = userOrgs.find(o => o.id === orgId);
      
      if (!userOrg) {
        return false;
      }

      return userOrg.userPermissions?.includes(permission) || false;
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }

  /**
   * Get organization members with their roles
   */
  static async getOrganizationMembers(orgId: string, userId: string): Promise<Array<{
    id: string;
    name: string;
    email: string;
    roles: string[];
    joinedAt: Date;
    isActive: boolean;
  }>> {
    try {
      // First check if user has permission to view members
      const hasPermission = await this.checkUserPermission(userId, orgId, 'org.users.manage') ||
                           await this.checkUserPermission(userId, orgId, 'org.owner');
      
      if (!hasPermission) {
        throw new Error('Insufficient permissions to view organization members');
      }

      // Get all users in this organization
      const users = await User.find({
        organizations: orgId,
        active: true
      }).select('name emailid createdAt');

      const members = [];

      for (const user of users) {
        // Get user roles in this organization
        const userRoles = await UserRole.find({
          userId: user.id,
          organizationId: orgId,
          isActive: true
        }).populate('roleId');

        const roleNames: string[] = [];
        for (const ur of userRoles) {
          if (ur.roleId && typeof ur.roleId === 'object') {
            const role = ur.roleId as { name: string };
            if (role.name) {
              roleNames.push(role.name);
            }
          }
        }

        members.push({
          id: user.id,
          name: user.name,
          email: user.emailid,
          roles: roleNames,
          joinedAt: user.createdAt || new Date(),
          isActive: true
        });
      }

      return members;
    } catch (error) {
      console.error('Error fetching organization members:', error);
      throw error;
    }
  }
}

export default OrganizationService;
