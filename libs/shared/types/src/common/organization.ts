import type { IUser } from './user.js';

export interface IOrg {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  domain?: string;
  website?: string;
  logo?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  settings?: {
    timezone?: string;
    currency?: string;
    locale?: string;
  };
  subscription?: {
    plan?: 'free' | 'basic' | 'premium' | 'enterprise';
    maxUsers?: number;
    features?: Array<string>;
    validUntil?: Date;
  };
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  metaData?: {
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
}

export interface IUserOrgRelation {
  userId: string;
  orgId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions?: Array<string>;
  joinedAt?: Date;
  isActive: boolean;
}

export const defaultOrg: IOrg = {
  id: '',
  name: '',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Organization-related utility types
export interface IUserWithOrgs extends IUser {
  orgRelations?: Array<IUserOrgRelation>;
}

export interface IOrgWithUsers extends IOrg {
  users?: Array<{
    user: IUser;
    relation: IUserOrgRelation;
  }>;
  userCount?: number;
}

export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';

export type OrgSubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';

// Utility functions for organization management
export const createOrgInvite = (orgId: string, inviterUserId: string, inviteeEmail: string, role: OrgRole) => ({
  id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  orgId,
  inviterUserId,
  inviteeEmail,
  role,
  status: 'pending' as const,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
});

export const hasOrgPermission = (userOrgRelation: IUserOrgRelation, permission: string): boolean => {
  // Basic role-based permissions
  const rolePermissions: Record<OrgRole, string[]> = {
    viewer: ['read'],
    member: ['read', 'create'],
    admin: ['read', 'create', 'update', 'delete', 'manage_members'],
    owner: ['read', 'create', 'update', 'delete', 'manage_members', 'manage_org', 'billing']
  };
  
  const hasRolePermission = rolePermissions[userOrgRelation.role]?.includes(permission);
  const hasCustomPermission = userOrgRelation.permissions?.includes(permission);
  
  return hasRolePermission || hasCustomPermission || false;
};

export const getRoleLevel = (role: OrgRole): number => {
  const roleHierarchy: Record<OrgRole, number> = {
    viewer: 1,
    member: 2,
    admin: 3,
    owner: 4
  };
  return roleHierarchy[role] || 0;
};
