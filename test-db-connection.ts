import { DatabaseService } from '@automation-ai/database';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    const dbService = DatabaseService.getInstance();
    await dbService.initialize();
    
    console.log('✅ MongoDB connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    process.exit(1);
  }
}

testConnection();
