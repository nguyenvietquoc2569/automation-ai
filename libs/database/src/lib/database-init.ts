import { databaseService } from './database-service';

let isInitialized = false;

/**
 * Initialize database connection if not already initialized
 */
export async function initializeDatabase() {
  if (!isInitialized) {
    try {
      await databaseService.initialize();
      isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
}

/**
 * Get database connection status
 */
export function getDatabaseStatus() {
  return {
    initialized: isInitialized,
    timestamp: new Date().toISOString()
  };
}
