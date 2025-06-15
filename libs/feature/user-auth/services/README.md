# @automation-ai/services

This package provides registration services for the automation-ai platform.

## Features

- Complete user registration with automatic personal organization creation
- Service registration for existing users
- Personal organization management
- Type-safe interfaces and comprehensive error handling

## Usage

### Complete User and Service Registration

```typescript
import { registerUserWithService, RegistrationData } from '@automation-ai/services';

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

const result = await registerUserWithService(registrationData);
// Returns: { user, organization, service }
```

### Register Service for Existing User

```typescript
import { registerServiceForUser } from '@automation-ai/services';

const result = await registerServiceForUser('user@example.com', {
  serviceName: 'Data Processing Service',
  description: 'Service for processing and analyzing data',
  serviceShortName: 'data-proc-service',
  category: 'DATA_PROCESSING',
  tags: ['data', 'analytics', 'processing']
});
// Returns: { organization, service }
```

### Get or Create Personal Organization

```typescript
import { getOrCreatePersonalOrg } from '@automation-ai/services';

const organization = await getOrCreatePersonalOrg('user@example.com');
// Returns: organization with name format "personal-org-{sanitized-email}"
```

## Personal Organization Naming

When a user registers or when a service is created for a user, a personal organization is automatically created with the naming convention:

```
personal-org-{email}
```

Where `{email}` is the user's email address with non-alphanumeric characters replaced by hyphens.

For example:
- `john.doe@example.com` → `personal-org-john-doe-example-com`
- `user+test@domain.co.uk` → `personal-org-user-test-domain-co-uk`

## Error Handling

All functions include comprehensive error handling and will throw descriptive errors if:
- Required fields are missing
- User email is not found (for existing user operations)
- Database operations fail
- Validation constraints are not met

## Dependencies

- `@automation-ai/database` - Database models and connection
- `@automation-ai/types` - Type definitions

## API Reference

### Types

- `RegistrationData` - Interface for complete user and service registration
- `RegistrationResult` - Return type for complete registration

### Functions

- `registerUserWithService(data: RegistrationData): Promise<RegistrationResult>`
- `registerServiceForUser(email: string, serviceData: ServiceData): Promise<{organization, service}>`
- `getOrCreatePersonalOrg(email: string): Promise<IOrg>`

## Running unit tests

Run `nx test @automation-ai/services` to execute the unit tests via [Jest](https://jestjs.io).
