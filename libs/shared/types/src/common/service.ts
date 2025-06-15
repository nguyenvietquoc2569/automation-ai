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

// Service utility types
export type CreateServiceDto = Omit<IService, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateServiceDto = Partial<Omit<IService, '_id'>> & { _id: string };

// Service enums
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
