// Role management API service

import { RoleItem } from './role-management';

export interface RoleUpdateRequest {
  name?: string;
  displayName?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface RoleCreateRequest {
  name: string;
  displayName?: string;
  description?: string;
  permissions: string[];
  isActive?: boolean;
}

export class RoleApiService {
  /**
   * Get all roles for an organization
   */
  static async getOrganizationRoles(organizationId: string): Promise<RoleItem[]> {
    try {
      const response = await fetch(`/api/teams/organizations/${organizationId}/roles`);
      if (!response.ok) {
        throw new Error(`Failed to fetch roles: ${response.statusText}`);
      }
      const data = await response.json();
      return data.roles || [];
    } catch (error) {
      console.error('Error fetching organization roles:', error);
      throw error;
    }
  }

  /**
   * Get a specific role by ID
   */
  static async getRole(organizationId: string, roleId: string): Promise<RoleItem> {
    try {
      const response = await fetch(`/api/teams/organizations/${organizationId}/roles/${roleId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch role: ${response.statusText}`);
      }
      const data = await response.json();
      return data.role;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  /**
   * Create a new role
   */
  static async createRole(
    organizationId: string,
    roleData: RoleCreateRequest
  ): Promise<RoleItem> {
    try {
      const response = await fetch(`/api/teams/organizations/${organizationId}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create role: ${response.statusText}`);
      }

      const data = await response.json();
      return data.role;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Update an existing role
   */
  static async updateRole(
    organizationId: string,
    roleId: string,
    updateData: RoleUpdateRequest
  ): Promise<RoleItem> {
    try {
      const response = await fetch(`/api/teams/organizations/${organizationId}/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update role: ${response.statusText}`);
      }

      const data = await response.json();
      return data.role;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  /**
   * Delete a role
   */
  static async deleteRole(organizationId: string, roleId: string): Promise<void> {
    try {
      const response = await fetch(`/api/teams/organizations/${organizationId}/roles/${roleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete role: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  /**
   * Get available permissions for role management
   */
  static async getAvailablePermissions(): Promise<string[]> {
    try {
      const response = await fetch('/api/teams/roles/permissions');
      if (!response.ok) {
        throw new Error(`Failed to fetch permissions: ${response.statusText}`);
      }
      const data = await response.json();
      return data.permissions || [];
    } catch (error) {
      console.error('Error fetching available permissions:', error);
      throw error;
    }
  }

  /**
   * Toggle role status (active/inactive)
   */
  static async toggleRoleStatus(
    organizationId: string,
    roleId: string,
    isActive: boolean
  ): Promise<RoleItem> {
    try {
      const response = await fetch(
        `/api/teams/organizations/${organizationId}/roles/${roleId}/toggle-status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isActive }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to toggle role status: ${response.statusText}`);
      }

      const data = await response.json();
      return data.role;
    } catch (error) {
      console.error('Error toggling role status:', error);
      throw error;
    }
  }
}

export default RoleApiService;
