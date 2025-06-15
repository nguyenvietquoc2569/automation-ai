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

// Utility type for creating a new service (without _id)
export type CreateServiceDto = Omit<IService, '_id' | 'createdAt' | 'updatedAt'>;

// Utility type for updating a service (all fields optional except _id)
export type UpdateServiceDto = Partial<Omit<IService, '_id'>> & { _id: string };

// Service category enum for better type safety
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

// Utility functions for service management
export const createService = (serviceData: CreateServiceDto): IService => {
  return {
    ...serviceData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const updateService = (service: IService, updates: Partial<IService>): IService => {
  return {
    ...service,
    ...updates,
    updatedAt: new Date()
  };
};

// Service validation utilities
export const isValidServiceName = (name: string): boolean => {
  return name.length > 0 && name.length <= 100;
};

export const isValidServiceShortName = (shortName: string): boolean => {
  return /^[a-zA-Z0-9-_]{1,20}$/.test(shortName);
};

export const validateService = (service: Partial<IService>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!service.serviceName || !isValidServiceName(service.serviceName)) {
    errors.push('Service name is required and must be 1-100 characters');
  }

  if (!service.serviceShortName || !isValidServiceShortName(service.serviceShortName)) {
    errors.push('Service short name is required and must be 1-20 alphanumeric characters, hyphens, or underscores');
  }

  if (!service.description || service.description.length === 0) {
    errors.push('Description is required');
  }

  if (!service.category || service.category.length === 0) {
    errors.push('Category is required');
  }

  if (!service.tags || !Array.isArray(service.tags)) {
    errors.push('Tags must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
