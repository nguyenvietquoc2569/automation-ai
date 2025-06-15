import mongoose from 'mongoose';

export interface DatabaseConfig {
  mongoUri: string;
  databaseName: string;
  options?: mongoose.ConnectOptions;
}

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected = false;
  private config: DatabaseConfig;

  private constructor() {
    // Default configuration - can be overridden
    this.config = {
      mongoUri: process.env.MONGODB_URI || 'mongodb+srv://admin:QraxcEuwPNFlNRCe@copdi-qa.ljegpbx.mongodb.net/',
      databaseName: process.env.DB_NAME || 'workforce',
      options: {
        retryWrites: true,
        w: 'majority',
      }
    };
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public configure(config: Partial<DatabaseConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      const connectionString = `${this.config.mongoUri}${this.config.databaseName}`;
      await mongoose.connect(connectionString, this.config.options);
      
      this.isConnected = true;
      console.log(`Connected to MongoDB database: ${this.config.databaseName}`);

      // Set up connection event handlers
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getConnection(): mongoose.Connection {
    return mongoose.connection;
  }

  public isConnectionReady(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

// Export a singleton instance for convenience
export const dbConnection = DatabaseConnection.getInstance();
