// Database library - MongoDB models and services for automation-ai

// Re-export all database functionality from individual modules
export * from './models/user.model';
export * from './models/organization.model';
export * from './models/service.model';
export * from './models/agent.model';
export * from './models/session.model';
export * from './connection';
export * from './database-service';
export * from './session-service';

// Re-export types from the types library
export { ServiceCategory } from '@automation-ai/types';

/**
 * Database library information
 */
export function getDatabaseInfo() {
  return {
    name: 'Database Library',
    description: 'MongoDB database library for automation-ai',
    version: '0.0.1'
  };
}

export default getDatabaseInfo;
