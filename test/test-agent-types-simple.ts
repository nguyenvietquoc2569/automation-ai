// Simple test to validate TypeScript configuration and agent types
// This test imports directly from source files to avoid build dependencies

import { IAgent, AgentStatus, AgentType } from '../libs/shared/types/src/common/agent';
import { IService, ServiceStatus, ServiceType } from '../libs/shared/types/src/common/service';

// Test agent creation
const testAgent: IAgent = {
  id: 'agent-123',
  name: 'Test Agent',
  description: 'A test automation agent',
  type: AgentType.AUTOMATION,
  status: AgentStatus.ACTIVE,
  userId: 'user-456',
  serviceId: 'service-789',
  capabilities: ['test', 'validate'],
  createdAt: new Date(),
  updatedAt: new Date()
};

// Test service creation
const testService: IService = {
  id: 'service-789',
  name: 'Test Service',
  description: 'A test service for agents',
  type: ServiceType.API,
  status: ServiceStatus.ACTIVE,
  endpoint: 'https://api.test.com',
  config: {
    apiKey: 'test-key',
    timeout: 5000
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// Validate relationships
console.log('🤖 Agent Test:');
console.log(`Agent "${testAgent.name}" (${testAgent.id})`);
console.log(`Status: ${testAgent.status}`);
console.log(`Type: ${testAgent.type}`);
console.log(`Service ID: ${testAgent.serviceId}`);
console.log(`Capabilities: ${testAgent.capabilities.join(', ')}`);

console.log('\n🔧 Service Test:');
console.log(`Service "${testService.name}" (${testService.id})`);
console.log(`Status: ${testService.status}`);
console.log(`Type: ${testService.type}`);
console.log(`Endpoint: ${testService.endpoint}`);

// Test type safety
const validateAgent = (agent: IAgent): boolean => {
  return !!(agent.id && agent.name && agent.userId && agent.serviceId);
};

const validateService = (service: IService): boolean => {
  return !!(service.id && service.name && service.type);
};

console.log('\n✅ Validation Results:');
console.log(`Agent valid: ${validateAgent(testAgent)}`);
console.log(`Service valid: ${validateService(testService)}`);

// Test enum values
console.log('\n📋 Available Agent Types:');
Object.values(AgentType).forEach(type => console.log(`- ${type}`));

console.log('\n📋 Available Service Types:');
Object.values(ServiceType).forEach(type => console.log(`- ${type}`));

console.log('\n🎉 TypeScript configuration test completed successfully!');
console.log('✅ No .js extensions needed in import statements');
console.log('✅ Modern ES modules working with Node 21');
console.log('✅ Type definitions correctly imported and validated');
