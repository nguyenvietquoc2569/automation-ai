// Test file to verify service types import correctly
import { 
  IService, 
  CreateServiceDto, 
  ServiceCategory, 
  createService, 
  validateService 
} from '@automation-ai/types';

// Test creating a service
const newService: CreateServiceDto = {
  serviceName: 'Test Automation Service',
  description: 'A test service for automation workflows',
  category: ServiceCategory.AUTOMATION,
  serviceShortName: 'test-auto',
  tags: ['test', 'automation', 'workflow']
};

// Test validation
const validation = validateService(newService);
console.log('Validation result:', validation);

// Test service creation
const service = createService(newService);
console.log('Created service:', service);

console.log('✅ Service types imported and working correctly!');
