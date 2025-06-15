# @automation-ai/database

MongoDB database library for the automation-ai workspace, providing models and database management functionality.

## Features

- **MongoDB Integration**: Full MongoDB integration using Mongoose
- **Type Safety**: TypeScript interfaces matching the `@automation-ai/types` definitions
- **Connection Management**: Singleton connection manager with health checks
- **Data Models**: Pre-configured models for Users, Organizations, Services, and Agents
- **Authentication**: Built-in password hashing and comparison for user authentication
- **Validation**: Schema validation with custom validators
- **Indexing**: Optimized database indexes for performance
- **Utilities**: Database service class with health checks and initialization

## Database Connection

The library connects to: `mongodb+srv://admin:QraxcEuwPNFlNRCe@copdi-qa.ljegpbx.mongodb.net/workforce`

## Installation

This library is part of the automation-ai monorepo. Install dependencies:

```bash
npm install mongoose bcrypt dotenv
```

## Quick Start

```typescript
import { databaseService, User, Organization } from '@automation-ai/database';

// Initialize database
await databaseService.initialize();

// Create a new user
const user = new User({
  name: 'John Doe',
  username: 'johndoe',
  ename: 'John',
  password: 'securepassword123',
  emailid: 'john@example.com',
  permissions: ['user_access']
});
await user.save();

// Find user and verify password
const foundUser = await User.findByEmailOrUsername('johndoe');
const isValid = await foundUser?.comparePassword('securepassword123');
```

## Models

### User Model

Based on `IUser` interface with additional MongoDB functionality:

```typescript
const user = new User({
  name: 'John Doe',
  username: 'johndoe',
  ename: 'John',
  password: 'password123', // Automatically hashed
  emailid: 'john@example.com',
  permissions: ['user_access'],
  organizations: ['org-id'],
  currentOrgId: 'org-id'
});

// Instance methods
await user.comparePassword('password123'); // Returns boolean
const resetToken = user.generateResetToken();

// Static methods
const user = await User.findByEmailOrUsername('johndoe');
const orgUsers = await User.findActiveInOrganization('org-id');
```

### Organization Model

Based on `IOrg` interface:

```typescript
const org = new Organization({
  name: 'acme-corp',
  displayName: 'Acme Corporation',
  description: 'Sample organization',
  domain: 'acme.com',
  subscription: {
    plan: 'premium',
    maxUsers: 50,
    features: ['analytics']
  }
});

// Instance methods
const canAdd = org.canAddUsers(5);
await org.upgradeSubscription('enterprise', 100);

// Static methods
const orgs = await Organization.findBySubscriptionPlan('premium');
const org = await Organization.findByDomain('acme.com');
```

### Service Model

Based on `IService` interface:

```typescript
const service = new Service({
  serviceName: 'Email Service',
  description: 'Email automation service',
  category: ServiceCategory.COMMUNICATION,
  serviceShortName: 'email-svc',
  tags: ['email', 'automation']
});

// Instance methods
await service.addTag('marketing');
await service.removeTag('old-tag');

// Static methods
const services = await Service.findByCategory(ServiceCategory.COMMUNICATION);
const services = await Service.findByTags(['email', 'automation']);
const results = await Service.searchByText('email automation');
```

### Agent Model

Based on `IAgent` interface:

```typescript
const agent = new Agent({
  agentName: 'Email Bot',
  serviceId: 'service-id',
  organizationId: 'org-id',
  configuration: { maxEmails: 1000 },
  permissions: ['send_emails'],
  status: AgentStatus.ACTIVE
});

// Instance methods
await agent.activate();
await agent.pause();
await agent.deactivate();
await agent.updateConfiguration({ maxEmails: 1500 });
const canSend = agent.canPerformOperation('send_emails');

// Static methods
const agents = await Agent.findByOrganization('org-id');
const agents = await Agent.findByService('service-id');
const agents = await Agent.findByStatus(AgentStatus.ACTIVE);
```

## Database Service

The `DatabaseService` class provides high-level database management:

```typescript
import { databaseService } from '@automation-ai/database';

// Initialize connection
await databaseService.initialize();

// Health check
const health = await databaseService.healthCheck();
console.log(health.status); // 'healthy' or 'unhealthy'

// Create indexes for performance
await databaseService.createIndexes();

// Seed initial data (only if database is empty)
await databaseService.seedInitialData();

// Check if ready
const isReady = databaseService.isReady();

// Shutdown
await databaseService.shutdown();
```

## Environment Variables

You can override default configuration using environment variables:

```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=workforce
```

## Error Handling

All database operations should be wrapped in try-catch blocks:

```typescript
try {
  await databaseService.initialize();
  const user = await User.findById('user-id');
  // ... database operations
} catch (error) {
  console.error('Database error:', error);
  // Handle error appropriately
}
```

## Development

For development, you can use the example usage file:

```typescript
import './libs/database/src/lib/example-usage';
```

This will demonstrate all the main functionality and create sample data.

## Schema Validation

All models include comprehensive validation:

- **Email validation**: Proper email format checking
- **Username validation**: Alphanumeric with hyphens/underscores
- **Password hashing**: Automatic bcrypt hashing with salt rounds
- **Required fields**: Enforced at schema level
- **String length limits**: Prevents excessively long inputs
- **Enum validation**: Status and category fields are restricted to valid values

## Performance

The library includes optimized indexes for common query patterns:

- Users: username, email, organizations, active status
- Organizations: name, domain, subscription plan
- Services: short name, category, tags, text search
- Agents: service ID, organization ID, status

## Security Features

- **Password hashing**: All passwords are automatically hashed using bcrypt
- **Credential protection**: Agent credentials are excluded from queries by default
- **Input validation**: All inputs are validated and sanitized
- **Connection security**: Uses MongoDB Atlas secure connection string

## TypeScript Support

Full TypeScript support with proper type definitions for all models and operations. The library exports both runtime values and type definitions for use in your application.
