import mongoose from 'mongoose';

interface ConnectionOptions {
  uri?: string;
  dbName?: string;
}

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected = false;

  // Private constructor for singleton pattern
  private constructor() {
    // Initialize any default values if needed
  }

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(options: ConnectionOptions = {}): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      const uri = options.uri || process.env.MONGODB_URI;
      const dbName = options.dbName || process.env.DB_NAME || 'automation-ai';

      if (!uri) {
        throw new Error('MongoDB URI is required. Please set MONGODB_URI environment variable.');
      }

      await mongoose.connect(uri, {
        dbName,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false // Disable mongoose buffering
      });

      this.isConnected = true;
      console.log(`✅ Connected to MongoDB database: ${dbName}`);

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('🔌 Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

export const dbConnection = DatabaseConnection.getInstance();

// Helper function for easy connection
export const connectToDatabase = async (options?: ConnectionOptions): Promise<void> => {
  return dbConnection.connect(options);
};

// Helper function for disconnection
export const disconnectFromDatabase = async (): Promise<void> => {
  return dbConnection.disconnect();
};

// Export mongoose for direct access if needed
export { mongoose };
