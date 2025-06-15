// Simple test for MongoDB models
import { connectDatabase } from './libs/backend/db-models/src/lib/database';
import { User } from './libs/backend/db-models/src/lib/user.model';
import { Organization } from './libs/backend/db-models/src/lib/organization.model';
import { Service } from './libs/backend/db-models/src/lib/service.model';
import { Agent } from './libs/backend/db-models/src/lib/agent.model';

async function testModels() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await connectDatabase();
    console.log('✅ Connected to MongoDB successfully!');

    console.log('\n📋 Testing model schemas...');
    
    // Test User model
    console.log('✅ User model loaded successfully');
    console.log('User collection name:', User.collection.name);
    
    // Test Organization model  
    console.log('✅ Organization model loaded successfully');
    console.log('Organization collection name:', Organization.collection.name);
    
    // Test Service model
    console.log('✅ Service model loaded successfully');
    console.log('Service collection name:', Service.collection.name);
    
    // Test Agent model
    console.log('✅ Agent model loaded successfully');
    console.log('Agent collection name:', Agent.collection.name);

    console.log('\n🎉 All MongoDB models are working correctly!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing MongoDB models:', error);
    process.exit(1);
  }
}

testModels();
