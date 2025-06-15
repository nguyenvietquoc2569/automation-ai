export interface IService {
  _id?: string;
  serviceName: string;
  description: string;
  category: string;
  serviceShortName: string;
  tags: Array<string>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Agent interface - represents an instance of a service within an organization
export interface IAgent {
  _id?: string;
  agentName: string;
  description?: string;
  serviceId: string; // Reference to the service this agent is an instance of
  organizationId: string; // Reference to the organization that owns this agent
  isActive: boolean;
  configuration: Record<string, unknown>; // Service-specific configuration
  credentials?: Record<string, string | number | boolean>; // Encrypted credentials/secrets
  metadata?: {
    version?: string;
    lastSync?: Date;
    syncInterval?: number; // in minutes
    retryCount?: number;
    maxRetries?: number;
    [key: string]: string | number | boolean | Date | undefined;
  };
  permissions?: Array<string>; // What this agent is allowed to do
  restrictions?: {
    rateLimits?: {
      requestsPerMinute?: number;
      requestsPerHour?: number;
      requestsPerDay?: number;
    };
    allowedOperations?: Array<string>;
    forbiddenOperations?: Array<string>;
    timeConstraints?: {
      startTime?: string; // HH:MM format
      endTime?: string;   // HH:MM format
      timezone?: string;
      allowedDays?: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>;
    };
  };
  status: AgentStatus;
  lastActivity?: Date;
  createdBy?: string; // User ID who created the agent
  createdAt?: Date;
  updatedAt?: Date;
}

// Utility types
export type CreateServiceDto = Omit<IService, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateServiceDto = Partial<Omit<IService, '_id'>> & { _id: string };
export type CreateAgentDto = Omit<IAgent, '_id' | 'createdAt' | 'updatedAt' | 'lastActivity'>;
export type UpdateAgentDto = Partial<Omit<IAgent, '_id'>> & { _id: string };

// Enums
export enum ServiceCategory {
  AUTOMATION = 'automation',
  INTEGRATION = 'integration',
  ANALYTICS = 'analytics',
  MONITORING = 'monitoring',
  SECURITY = 'security',
  COMMUNICATION = 'communication',
  STORAGE = 'storage',
  COMPUTE = 'compute',
  NETWORKING = 'networking',
  DATABASE = 'database',
  OTHER = 'other'
}

export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused',
  ERROR = 'error',
  SYNCING = 'syncing',
  CONFIGURING = 'configuring',
  SUSPENDED = 'suspended'
}
