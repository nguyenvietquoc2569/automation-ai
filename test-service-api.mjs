#!/usr/bin/env node

// Simple test script to verify service API functionality
import { Service, databaseService } from '../libs/database/src/index.js';

async function testServiceAPI() {
  try {
    console.log('Testing Service API functionality...');
    
    // Initialize database
    if (!databaseService.isReady()) {
      await databaseService.initialize();
    }
    
    console.log('Database connected successfully');
    
    // Test finding a service by various queries
    const testQueries = [
      { _id: 'invalid-id-test' },
      { serviceShortName: 'automation-service' },
    ];
    
    for (const query of testQueries) {
      console.log(`Testing query:`, query);
      try {
        const service = await Service.findOne(query);
        console.log('Query result:', service ? 'Found service' : 'No service found');
      } catch (error) {
        console.log('Query error:', error.message);
      }
    }
    
    console.log('API test completed');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await databaseService.shutdown();
    console.log('Database connection closed');
    process.exit(0);
  }
}

testServiceAPI();
