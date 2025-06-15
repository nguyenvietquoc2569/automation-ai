import { databaseService } from './libs/database/src/lib/database-service';
import { User } from './libs/database/src/lib/models/user.model';
import { Organization } from './libs/database/src/lib/models/organization.model';
import { Service } from './libs/database/src/lib/models/service.model';
import { Agent, AgentStatus } from './libs/database/src/lib/models/agent.model';
import { ServiceCategory } from '@automation-ai/types';

/**
 * Simple test to verify database library functionality
 */
async function testDatabaseLibrary() {
  try {
    console.log('🧪 Testing @automation-ai/database library...');

    // Test 1: Database service initialization
    console.log('1. Testing database service...');
    const isReady = databaseService.isReady();
    console.log(`   Database ready: ${isReady}`);

    // Test 2: Model imports
    console.log('2. Testing model imports...');
    console.log(`   User model: ${typeof User}`);
    console.log(`   Organization model: ${typeof Organization}`);
    console.log(`   Service model: ${typeof Service}`);
    console.log(`   Agent model: ${typeof Agent}`);

    // Test 3: Enum imports
    console.log('3. Testing enum imports...');
    console.log(`   AgentStatus.ACTIVE: ${AgentStatus.ACTIVE}`);
    console.log(`   ServiceCategory.COMMUNICATION: ${ServiceCategory.COMMUNICATION}`);

    // Test 4: Health check without connection (should return unhealthy)
    console.log('4. Testing health check...');
    const health = await databaseService.healthCheck();
    console.log(`   Health status: ${health.status}`);

    console.log('✅ Database library test completed successfully!');
    console.log('📚 Library exports:');
    console.log('   - databaseService (connection management)');
    console.log('   - User, Organization, Service, Agent (models)');
    console.log('   - AgentStatus, ServiceCategory (enums)');
    console.log('   - Type definitions for all models');

  } catch (error) {
    console.error('❌ Database library test failed:', error);
    throw error;
  }
}

// Export for testing
export { testDatabaseLibrary };

// Run test if this file is executed directly
if (require.main === module) {
  testDatabaseLibrary().catch(console.error);
}
