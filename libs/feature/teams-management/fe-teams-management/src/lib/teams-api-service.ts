// Frontend API service for teams management - only makes HTTP calls, no backend imports

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

export class TeamsApiService {
  /**
   * Get all organizations that the user belongs to with their roles and permissions
   */
  static async getUserOrganizations(userId: string, includeInactive = true): Promise<OrganizationListItem[]> {
    try {
      const url = `/api/teams/organizations${includeInactive ? '?includeInactive=true' : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch organizations: ${response.statusText}`);
      }
      const data = await response.json();
      return data.organizations || [];
    } catch (error) {
      console.error('Error fetching user organizations:', error);
      throw error;
    }
  }

  /**
   * Toggle organization status (active/inactive)
   */
  static async toggleOrganizationStatus(
    organizationId: string,
    newStatus: boolean,
    userId: string
  ): Promise<OrganizationListItem> {
    try {
      const response = await fetch(`/api/teams/organizations/${organizationId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: newStatus,
          userId
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle organization status: ${response.statusText}`);
      }

      const data = await response.json();
      return data.organization;
    } catch (error) {
      console.error('Error toggling organization status:', error);
      throw error;
    }
  }  /**
   * Get user permissions for an organization - this is a client-side utility function
   */
  static getUserPermissions(permissions: string[]): UserOrganizationPermissions {
    const permissionSet = new Set(permissions || []);
    
    return {
      canManage: permissionSet.has('manage') || permissionSet.has('admin') || permissionSet.has('org.manage') || permissionSet.has('organization.manage'),
      canEdit: permissionSet.has('edit') || permissionSet.has('manage') || permissionSet.has('admin') || permissionSet.has('org.manage') || permissionSet.has('org.edit') || permissionSet.has('organization.manage'),
      canToggleStatus: permissionSet.has('manage') || permissionSet.has('admin') || permissionSet.has('org.manage') || permissionSet.has('organization.manage')
    };
  }

  /**
   * Update organization details
   */
  static async updateOrganization(
    organizationId: string,
    updateData: OrganizationUpdateRequest,
    userId: string
  ): Promise<OrganizationListItem> {
    try {
      const response = await fetch(`/api/teams/organizations/${organizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updateData,
          userId
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        // If JSON parsing fails, use status text
        throw new Error(`Failed to update organization: ${response.statusText}`);
      }

      if (!response.ok) {
        // Extract error message from response body if available
        const errorMessage = data.error || `Failed to update organization: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return data.organization;
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  }

  /**
   * Create a new organization
   */
  static async createOrganization(
    orgData: { name: string; description?: string },
    userId: string
  ): Promise<OrganizationListItem> {
    try {
      const response = await fetch('/api/teams/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: orgData.name,
          description: orgData.description,
          userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create organization: ${response.statusText}`);
      }

      const data = await response.json();
      return data.organization;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  }
}
