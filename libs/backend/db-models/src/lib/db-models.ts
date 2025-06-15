// Database connection utilities
export * from './database.js';

// Model exports
export * from './user.model.js';
export * from './organization.model.js';
export * from './service.model.js';
export * from './agent.model.js';

// Re-export mongoose for convenience
export { mongoose } from './database.js';

// Helper function to initialize all models
export const initializeModels = async (mongoUri?: string, dbName?: string) => {
  const { connectToDatabase } = await import('./database.js');
  await connectToDatabase({ uri: mongoUri, dbName });
  
  // Import all models to ensure they're registered
  await Promise.all([
    import('./user.model.js'),
    import('./organization.model.js'),
    import('./service.model.js'),
    import('./agent.model.js')
  ]);
  
  console.log('✅ All MongoDB models initialized');
};

// Helper function to cleanup database connection
export const cleanupDatabase = async () => {
  const { disconnectFromDatabase } = await import('./database.js');
  await disconnectFromDatabase();
};
