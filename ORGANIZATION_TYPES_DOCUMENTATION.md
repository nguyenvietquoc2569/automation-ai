# Organization Types Documentation

## Overview
Added comprehensive organization type definitions to support multi-tenant architecture where users can belong to multiple organizations.

## New Types Added

### Core Types

#### `IOrg`
Defines the structure of an organization entity.

```typescript
interface IOrg {
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
    [key: string]: any;
  };
}
```

#### `IUserOrgRelation`
Defines the relationship between a user and an organization.

```typescript
interface IUserOrgRelation {
  userId: string;
  orgId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions?: Array<string>;
  joinedAt?: Date;
  isActive: boolean;
}
```

### Extended Types

#### `IUserWithOrgs`
User interface with organization relationships populated.

#### `IOrgWithUsers`
Organization interface with user relationships populated.

### Utility Types

- `OrgRole`: `'owner' | 'admin' | 'member' | 'viewer'`
- `OrgSubscriptionPlan`: `'free' | 'basic' | 'premium' | 'enterprise'`

## Updated User Type

The `IUser` interface has been enhanced to support organizations:

```typescript
interface IUser {
  // ...existing fields
  organizations?: Array<string>; // Array of organization IDs
  currentOrgId?: string; // Currently active organization
  // ...
}
```

## Utility Functions

### `hasOrgPermission(userOrgRelation, permission)`
Checks if a user has a specific permission within an organization based on their role and custom permissions.

### `createOrgInvite(orgId, inviterUserId, inviteeEmail, role)`
Creates an organization invitation object.

### `getRoleLevel(role)`
Returns the hierarchical level of a role (1-4, where 4 is highest).

## Role Hierarchy

1. **Viewer** (Level 1): `['read']`
2. **Member** (Level 2): `['read', 'create']`
3. **Admin** (Level 3): `['read', 'create', 'update', 'delete', 'manage_members']`
4. **Owner** (Level 4): `['read', 'create', 'update', 'delete', 'manage_members', 'manage_org', 'billing']`

## Usage Examples

```typescript
import { IOrg, IUser, IUserOrgRelation, hasOrgPermission } from '@automation-ai/types';

// Create organization
const org: IOrg = {
  id: 'org_123',
  name: 'my-company',
  displayName: 'My Company Inc.',
  active: true
};

// User belongs to multiple organizations
const user: IUser = {
  name: 'John Doe',
  username: 'john',
  // ...other fields
  organizations: ['org_123', 'org_456'],
  currentOrgId: 'org_123'
};

// Define user's role in organization
const relation: IUserOrgRelation = {
  userId: user.id!,
  orgId: 'org_123',
  role: 'admin',
  isActive: true
};

// Check permissions
const canDelete = hasOrgPermission(relation, 'delete'); // true
const canManageBilling = hasOrgPermission(relation, 'billing'); // false
```

## Database Schema Considerations

### Organizations Table
- `id` (Primary Key)
- `name` (Unique)
- `display_name`
- `description`
- `domain`
- `settings` (JSON)
- `subscription` (JSON)
- `active`
- `created_at`
- `updated_at`

### User-Organization Relations Table
- `user_id` (Foreign Key to users)
- `org_id` (Foreign Key to organizations)
- `role`
- `permissions` (JSON Array)
- `joined_at`
- `is_active`
- Primary Key: `(user_id, org_id)`

## Benefits

1. **Multi-tenancy**: Users can belong to multiple organizations
2. **Flexible Permissions**: Role-based with custom permission overrides
3. **Scalable**: Supports different subscription plans and feature sets
4. **Audit Trail**: Tracks when users join/leave organizations
5. **Type Safety**: Full TypeScript support with utility functions

## File Locations

- Organization Types: `libs/shared/types/src/common/organization.ts`
- Updated User Types: `libs/shared/types/src/common/user.ts`
- Exports: `libs/shared/types/src/index.ts`
