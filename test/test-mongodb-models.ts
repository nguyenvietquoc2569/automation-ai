// Test MongoDB models setup
import { 
  initializeModels, 
  User, 
  Organization, 
  Service, 
  Agent 
} from '@automation-ai/db-models';

async function testModels() {
  try {
    console.log('🔌 Initializing MongoDB models...');
    
    // Initialize models (will connect to database)
    await initializeModels();
    
    console.log('✅ MongoDB models initialized successfully!');
    console.log('📊 Available models:');
    console.log('- User:', User.modelName);
    console.log('- Organization:', Organization.modelName);
    console.log('- Service:', Service.modelName);
    console.log('- Agent:', Agent.modelName);
    
    // Test creating a sample organization
    const sampleOrg = new Organization({
      name: 'test-org',
      displayName: 'Test Organization',
      description: 'A test organization for automation-ai',
      createdBy: '507f1f77bcf86cd799439011' // Sample ObjectId
    });
    
    // Validate without saving
    const validationError = sampleOrg.validateSync();
    if (validationError) {
      console.log('❌ Validation failed:', validationError.message);
    } else {
      console.log('✅ Organization model validation passed');
    }
    
    // Test creating a sample service
    const sampleService = new Service({
      serviceName: 'Facebook Automation',
      description: 'Automate Facebook marketing tasks',
      category: 'automation',
      serviceShortName: 'fb-auto',
      tags: ['facebook', 'social-media', 'automation'],
      createdBy: '507f1f77bcf86cd799439011'
    });
    
    const serviceValidation = sampleService.validateSync();
    if (serviceValidation) {
      console.log('❌ Service validation failed:', serviceValidation.message);
    } else {
      console.log('✅ Service model validation passed');
    }
    
    console.log('🎉 All model tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing models:', error);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testModels().catch(console.error);
}

export { testModels };
