import { dbConnection } from './connection';
import { User, Organization, Service, Agent } from './models/index'

export class DatabaseService {
  private static instance: DatabaseService;

  // Private constructor to prevent direct instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize the database connection
   */
  public async initialize(): Promise<void> {
    try {
      await dbConnection.connect();
      console.log('Database service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database service:', error);
      throw error;
    }
  }

  /**
   * Close the database connection
   */
  public async shutdown(): Promise<void> {
    try {
      await dbConnection.disconnect();
      console.log('Database service shutdown successfully');
    } catch (error) {
      console.error('Error during database service shutdown:', error);
      throw error;
    }
  }

  /**
   * Check if database is ready for operations
   */
  public isReady(): boolean {
    return dbConnection.isConnectionReady();
  }

  /**
   * Get all model references
   */
  public getModels() {
    return {
      User,
      Organization,
      Service,
      Agent
    };
  }

  /**
   * Create database indexes for better performance
   * This should be called during application startup
   */
  public async createIndexes(): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Database connection is not ready');
    }

    try {
      await Promise.all([
        User.createIndexes(),
        Organization.createIndexes(),
        Service.createIndexes(),
        Agent.createIndexes()
      ]);
      console.log('Database indexes created successfully');
    } catch (error) {
      console.error('Failed to create database indexes:', error);
      throw error;
    }
  }

  /**
   * Seed initial data if needed
   * This is useful for development and testing environments
   */
  public async seedInitialData(): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Database connection is not ready');
    }

    try {
      // Check if data already exists
      const userCount = await User.countDocuments();
      const orgCount = await Organization.countDocuments();
      
      if (userCount > 0 || orgCount > 0) {
        console.log('Database already contains data, skipping seed');
        return;
      }

      // Create default organization
      const defaultOrg = new Organization({
        name: 'default-org',
        displayName: 'Default Organization',
        description: 'Default organization for initial setup',
        subscription: {
          plan: 'enterprise',
          maxUsers: 100,
          features: ['full-access']
        }
      });
      await defaultOrg.save();

      // Create default admin user
      const adminUser = new User({
        name: 'Administrator',
        username: 'admin',
        ename: 'Admin',
        password: 'admin123456', // This will be hashed automatically
        emailid: 'admin@automation-ai.com',
        permissions: ['admin', 'user_management', 'organization_management'],
        active: true,
        organizations: [defaultOrg.id],
        currentOrgId: defaultOrg.id,
        title: 'System Administrator'
      });
      await adminUser.save();

      console.log('Initial data seeded successfully');
      console.log(`Default organization ID: ${defaultOrg.id}`);
      console.log(`Admin user ID: ${adminUser.id}`);
    } catch (error) {
      console.error('Failed to seed initial data:', error);
      throw error;
    }
  }

  /**
   * Health check for the database
   */
  public async healthCheck(): Promise<{ 
    status: string; 
    details: Record<string, unknown> | { error: string } 
  }> {
    try {
      if (!this.isReady()) {
        return {
          status: 'unhealthy',
          details: { error: 'Database connection is not ready' }
        };
      }

      // Test database operations
      const stats = await Promise.all([
        User.countDocuments(),
        Organization.countDocuments(),
        Service.countDocuments(),
        Agent.countDocuments()
      ]);

      return {
        status: 'healthy',
        details: {
          connected: true,
          collections: {
            users: stats[0],
            organizations: stats[1],
            services: stats[2],
            agents: stats[3]
          }
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();
