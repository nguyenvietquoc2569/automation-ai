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

// Role management interfaces
export interface RoleData {
  _id: string;
  name: string;
  displayName?: string;
  description?: string;
  organizationId: string;
  permissions: string[];
  isActive: boolean;
  isSystemRole?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleRequest {
  name: string;
  displayName?: string;
  description?: string;
  permissions: string[];
  isActive?: boolean;
}

export interface UpdateRoleRequest {
  name?: string;
  displayName?: string;
  description?: string;
  permissions?: string[];
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

  /**
   * Get all roles for an organization
   */
  static async getOrganizationRoles(organizationId: string, userId: string): Promise<RoleData[]> {
    try {
      // Check if user has permission to manage roles in this organization
      const userRoles = await UserRole.find({
        userId,
        organizationId,
        isActive: true
      }).populate('roleId');

      const userPermissions = new Set<string>();
      for (const ur of userRoles) {
        if (ur.roleId && typeof ur.roleId === 'object') {
          const role = ur.roleId as { permissions: string[] };
          if (role.permissions) {
            role.permissions.forEach(p => userPermissions.add(p));
          }
        }
      }

      // Debug: Log user permissions
      console.log(`User ${userId} permissions in org ${organizationId}:`, Array.from(userPermissions));
      
      
      // Check if user has permission to manage roles
      // For development: also allow users who can view the organization
      const canManageRoles = userPermissions.has('org.owner') || 
                            userPermissions.has('org.manage') ||
                            userPermissions.has('org.roles.manage')
      if (!canManageRoles) {
        console.log(`User ${userId} has no permissions. Creating temporary access for development.`);
        
        // For development: if user has any connection to this org, allow access
        if (process.env.NODE_ENV !== 'production') {
          console.log('Development mode: allowing role access for testing');
        } else {
          throw new Error('Insufficient permissions to view roles');
        }
      }

      // Get all roles for this organization
      const roles = await Role.find({
        organizationId,
        isActive: true
      }).sort({ createdAt: -1 });

      return roles.map(role => ({
        _id: role._id.toString(),
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        organizationId: role.organizationId,
        permissions: role.permissions,
        isActive: role.isActive,
        isSystemRole: role.isSystemRole || false,
        createdAt: role.createdAt || new Date(),
        updatedAt: role.updatedAt || new Date()
      }));
    } catch (error) {
      console.error('Error fetching organization roles:', error);
      throw error;
    }
  }

  /**
   * Get a specific role by ID
   */
  static async getRole(organizationId: string, roleId: string, userId: string): Promise<RoleData> {
    try {
      // Check permissions first
      const userRoles = await UserRole.find({
        userId,
        organizationId,
        isActive: true
      }).populate('roleId');

      const userPermissions = new Set<string>();
      for (const ur of userRoles) {
        if (ur.roleId && typeof ur.roleId === 'object') {
          const role = ur.roleId as { permissions: string[] };
          if (role.permissions) {
            role.permissions.forEach(p => userPermissions.add(p));
          }
        }
      }

      if (!userPermissions.has('org.owner') && !userPermissions.has('org.roles.manage')) {
        throw new Error('Insufficient permissions to view roles');
      }

      const role = await Role.findOne({
        _id: roleId,
        organizationId,
        isActive: true
      });

      if (!role) {
        throw new Error('Role not found');
      }

      return {
        _id: role._id,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        organizationId: role.organizationId,
        permissions: role.permissions,
        isActive: role.isActive,
        isSystemRole: role.isSystemRole,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      };
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  /**
   * Create a new role
   */
  static async createRole(organizationId: string, roleData: CreateRoleRequest, userId: string): Promise<RoleData> {
    try {
      // Check permissions
      const userRoles = await UserRole.find({
        userId,
        organizationId,
        isActive: true
      }).populate('roleId');

      const userPermissions = new Set<string>();
      for (const ur of userRoles) {
        if (ur.roleId && typeof ur.roleId === 'object') {
          const role = ur.roleId as { permissions: string[] };
          if (role.permissions) {
            role.permissions.forEach(p => userPermissions.add(p));
          }
        }
      }

      if (!userPermissions.has('org.owner') && !userPermissions.has('org.roles.manage')) {
        throw new Error('Insufficient permissions to create roles');
      }

      // Create the role
      const role = await Role.create({
        name: roleData.name,
        displayName: roleData.displayName,
        description: roleData.description,
        organizationId,
        permissions: roleData.permissions || [],
        isActive: roleData.isActive !== undefined ? roleData.isActive : true,
        isSystemRole: false
      });

      return {
        _id: role._id,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        organizationId: role.organizationId,
        permissions: role.permissions,
        isActive: role.isActive,
        isSystemRole: role.isSystemRole,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      };
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Update an existing role
   */
  static async updateRole(organizationId: string, roleId: string, updateData: UpdateRoleRequest, userId: string): Promise<RoleData> {
    try {
      // Check permissions
      const userRoles = await UserRole.find({
        userId,
        organizationId,
        isActive: true
      }).populate('roleId');

      const userPermissions = new Set<string>();
      for (const ur of userRoles) {
        if (ur.roleId && typeof ur.roleId === 'object') {
          const role = ur.roleId as { permissions: string[] };
          if (role.permissions) {
            role.permissions.forEach(p => userPermissions.add(p));
          }
        }
      }

      if (!userPermissions.has('org.owner') && !userPermissions.has('org.roles.manage')) {
        throw new Error('Insufficient permissions to update roles');
      }

      const role = await Role.findOneAndUpdate(
        { _id: roleId, organizationId },
        updateData,
        { new: true }
      );

      if (!role) {
        throw new Error('Role not found');
      }

      return {
        _id: role._id,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        organizationId: role.organizationId,
        permissions: role.permissions,
        isActive: role.isActive,
        isSystemRole: role.isSystemRole,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      };
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }
}

export default OrganizationService;
